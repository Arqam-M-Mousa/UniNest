const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { Conversation, Message, User, PropertyListing } = require("../models");
const {
  sendSuccess,
  sendError,
  sendValidationError,
  HTTP_STATUS,
} = require("../utils/responses");

// GET /api/conversations - list user's conversations with last message + unread count
router.get("/", authenticate, async (req, res) => {
  try {
    const conversations = await Conversation.findAll({
      where: {
        [Op.or]: [{ studentId: req.user.id }, { landlordId: req.user.id }],
      },
      include: [
        {
          model: User,
          as: "student",
          attributes: ["id", "firstName", "lastName", "avatarUrl"],
        },
        {
          model: User,
          as: "landlord",
          attributes: ["id", "firstName", "lastName", "avatarUrl"],
        },
        { model: PropertyListing, as: "property", attributes: ["id", "title"] },
      ],
      order: [["updatedAt", "DESC"]],
    });

    const result = [];
    for (const convo of conversations) {
      const lastMessage = await Message.findOne({
        where: { conversationId: convo.id },
        order: [["createdAt", "DESC"]],
      });

      // Determine which last-read field to use
      const lastReadAt =
        convo.studentId === req.user.id
          ? convo.studentLastReadAt
          : convo.landlordLastReadAt;

      const unreadCount = await Message.count({
        where: {
          conversationId: convo.id,
          senderId: { [Op.ne]: req.user.id },
          ...(lastReadAt ? { createdAt: { [Op.gt]: lastReadAt } } : {}),
        },
      });

      result.push({
        ...convo.toJSON(),
        lastMessage,
        unreadCount,
      });
    }

    return sendSuccess(res, result);
  } catch (error) {
    return sendError(
      res,
      "Failed to load conversations",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// POST /api/conversations - create or fetch a conversation
router.post("/", authenticate, async (req, res) => {
  try {
    const { studentId, landlordId, propertyId } = req.body || {};
    if (!studentId || !landlordId || !propertyId) {
      return sendValidationError(res, [
        "studentId, landlordId, propertyId are required",
      ]);
    }

    // Ensure requester is part of the conversation
    if (![studentId, landlordId].includes(req.user.id)) {
      return sendError(res, "You must be a participant", HTTP_STATUS.FORBIDDEN);
    }

    let convo = await Conversation.findOne({
      where: { studentId, landlordId, propertyId },
    });

    if (!convo) {
      convo = await Conversation.create({ studentId, landlordId, propertyId });
    }

    return sendSuccess(res, convo, "Conversation ready");
  } catch (error) {
    return sendError(
      res,
      "Failed to start conversation",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// GET /api/conversations/:id/messages - list messages
router.get("/:id/messages", authenticate, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const offset = Number(req.query.offset) || 0;

    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return sendError(res, "Conversation not found", HTTP_STATUS.NOT_FOUND);
    }
    if (
      ![conversation.studentId, conversation.landlordId].includes(req.user.id)
    ) {
      return sendError(res, "Access denied", HTTP_STATUS.FORBIDDEN);
    }

    const messages = await Message.findAll({
      where: { conversationId: conversation.id },
      order: [["createdAt", "ASC"]],
      limit,
      offset,
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName", "avatarUrl"],
        },
      ],
    });

    return sendSuccess(res, messages);
  } catch (error) {
    return sendError(
      res,
      "Failed to load messages",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// POST /api/conversations/:id/messages - send a message
router.post("/:id/messages", authenticate, async (req, res) => {
  try {
    const { content, attachmentsJson } = req.body || {};
    if (!content || !content.trim()) {
      return sendValidationError(res, ["Message content is required"]);
    }

    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return sendError(res, "Conversation not found", HTTP_STATUS.NOT_FOUND);
    }
    if (
      ![conversation.studentId, conversation.landlordId].includes(req.user.id)
    ) {
      return sendError(res, "Access denied", HTTP_STATUS.FORBIDDEN);
    }

    const message = await Message.create({
      content: content.trim(),
      attachmentsJson: attachmentsJson || null,
      conversationId: conversation.id,
      senderId: req.user.id,
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return sendSuccess(res, message, "Message sent", HTTP_STATUS.CREATED);
  } catch (error) {
    return sendError(
      res,
      "Failed to send message",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// PATCH /api/conversations/:id/read - mark as read for the current user
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const conversation = await Conversation.findByPk(req.params.id);
    if (!conversation) {
      return sendError(res, "Conversation not found", HTTP_STATUS.NOT_FOUND);
    }
    if (
      ![conversation.studentId, conversation.landlordId].includes(req.user.id)
    ) {
      return sendError(res, "Access denied", HTTP_STATUS.FORBIDDEN);
    }

    const now = new Date();
    if (conversation.studentId === req.user.id) {
      conversation.studentLastReadAt = now;
    } else {
      conversation.landlordLastReadAt = now;
    }
    await conversation.save();

    return sendSuccess(res, conversation, "Conversation marked as read");
  } catch (error) {
    return sendError(
      res,
      "Failed to update conversation",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

module.exports = router;
