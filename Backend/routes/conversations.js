const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { Conversation, Message, User, PropertyListing, Listing } = require("../models");
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
          attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl"],
        },
        {
          model: User,
          as: "landlord",
          attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl"],
        },
        {
          model: PropertyListing,
          as: "property",
          attributes: ["id", "city", "propertyType"],
          required: false,
          include: [
            {
              model: Listing,
              as: "listing",
              attributes: ["title", "description"],
            }
          ]
        },
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
    console.error('Error loading conversations:', error.message);
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
    const { studentId, landlordId, propertyId, targetUserId } = req.body || {};

    // For direct/roommate conversations (no property)
    if (targetUserId && !propertyId) {
      if (targetUserId === req.user.id) {
        return sendError(res, "Cannot start conversation with yourself", HTTP_STATUS.BAD_REQUEST);
      }

      // For direct conversations, use a consistent ordering for participant lookup
      const [user1Id, user2Id] = [req.user.id, targetUserId].sort();

      // Look for existing direct conversation (no propertyId)
      let convo = await Conversation.findOne({
        where: {
          [Op.or]: [
            { studentId: user1Id, landlordId: user2Id, propertyId: { [Op.is]: null } },
            { studentId: user2Id, landlordId: user1Id, propertyId: { [Op.is]: null } },
          ],
        },
      });

      if (!convo) {
        convo = await Conversation.create({
          studentId: req.user.id,
          landlordId: targetUserId,
          propertyId: null, // Direct conversation
        });
      }

      return sendSuccess(res, convo, "Direct conversation ready");
    }

    // Original property-based conversation logic
    if (!studentId || !landlordId || !propertyId) {
      return sendValidationError(res, [
        "studentId, landlordId, propertyId are required (or use targetUserId for direct conversations)",
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

    // Broadcast new message via Socket.io
    const io = req.app.get("io");
    if (io) {
      const messageData = {
        ...message.toJSON(),
        sender: {
          id: req.user.id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          avatarUrl: req.user.avatarUrl,
        },
      };

      // Emit to conversation room (for users actively viewing the conversation)
      io.to(`conversation:${conversation.id}`).emit("message:new", messageData);

      // Also emit to recipient's personal room (for header notifications)
      // But only if they're NOT already in the conversation room (to prevent duplicates)
      const recipientId = conversation.studentId === req.user.id
        ? conversation.landlordId
        : conversation.studentId;

      // Get sockets in the conversation room
      const conversationRoom = io.sockets.adapter.rooms.get(`conversation:${conversation.id}`);
      const userRoom = io.sockets.adapter.rooms.get(`user:${recipientId}`);

      // Only emit to user room if they're not in the conversation room
      if (userRoom) {
        let recipientInConversation = false;
        if (conversationRoom) {
          for (const socketId of userRoom) {
            if (conversationRoom.has(socketId)) {
              recipientInConversation = true;
              break;
            }
          }
        }
        if (!recipientInConversation) {
          io.to(`user:${recipientId}`).emit("message:new", messageData);
        }
      }
    }

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

    // Emit Socket.io event to notify the other user
    const io = req.app.get("io");
    if (io) {
      const otherUserId = conversation.studentId === req.user.id
        ? conversation.landlordId
        : conversation.studentId;

      io.to(`user:${otherUserId}`).emit("conversation:read", {
        conversationId: conversation.id,
        studentLastReadAt: conversation.studentLastReadAt,
        landlordLastReadAt: conversation.landlordLastReadAt,
      });
    }

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

// DELETE /api/conversations/:conversationId/messages/:messageId
router.delete("/:conversationId/messages/:messageId", authenticate, async (req, res) => {
  try {
    const { conversationId, messageId } = req.params;

    const message = await Message.findOne({
      where: {
        id: messageId,
        conversationId: conversationId,
        senderId: req.user.id, // Only allow deleting own messages
      },
    });

    if (!message) {
      return sendError(res, "Message not found or access denied", HTTP_STATUS.NOT_FOUND);
    }

    await message.destroy();

    return sendSuccess(res, null, "Message deleted successfully");
  } catch (error) {
    return sendError(
      res,
      "Failed to delete message",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

module.exports = router;
