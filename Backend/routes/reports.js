const express = require("express");
const router = express.Router();
const { Op } = require("sequelize");
const { authenticate, authorize } = require("../middleware/auth");
const { MessageReport, User, Conversation, Message } = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

/**
 * POST /api/reports/message
 * Create a new message report
 */
router.post("/message", authenticate, async (req, res) => {
  try {
    const { conversationId, messageId, reportedUserId, reason, description } = req.body;
    const reporterId = req.user.id;

    if (!conversationId || !reportedUserId || !reason) {
      return sendError(res, "Missing required fields", HTTP_STATUS.BAD_REQUEST);
    }

    // Validate reason
    const validReasons = ["spam", "harassment", "inappropriate_content", "scam", "hate_speech", "threats", "other"];
    if (!validReasons.includes(reason)) {
      return sendError(res, "Invalid report reason", HTTP_STATUS.BAD_REQUEST);
    }

    // Verify the conversation exists and user is part of it
    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return sendError(res, "Conversation not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if user is part of the conversation
    if (conversation.studentId !== reporterId && conversation.landlordId !== reporterId) {
      return sendError(res, "You are not part of this conversation", HTTP_STATUS.FORBIDDEN);
    }

    // Prevent self-reporting
    if (reporterId === reportedUserId) {
      return sendError(res, "You cannot report yourself", HTTP_STATUS.BAD_REQUEST);
    }

    // Check if message exists if messageId is provided
    if (messageId) {
      const message = await Message.findByPk(messageId);
      if (!message || message.conversationId !== conversationId) {
        return sendError(res, "Message not found in this conversation", HTTP_STATUS.NOT_FOUND);
      }
    }

    // Check for duplicate pending report
    const existingReport = await MessageReport.findOne({
      where: {
        reporterId,
        reportedUserId,
        conversationId,
        status: "pending",
      },
    });

    if (existingReport) {
      return sendError(res, "You already have a pending report for this user in this conversation", HTTP_STATUS.CONFLICT);
    }

    const report = await MessageReport.create({
      reporterId,
      reportedUserId,
      conversationId,
      messageId: messageId || null,
      reason,
      description: description || null,
      status: "pending",
    });

    return sendSuccess(res, report, "Report submitted successfully", HTTP_STATUS.CREATED);
  } catch (error) {
    console.error("Failed to create report:", error);
    return sendError(res, "Failed to submit report", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * GET /api/reports
 * Get all reports (Admin only)
 */
router.get("/", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const { count, rows: reports } = await MessageReport.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName", "email", "profilePictureUrl"],
        },
        {
          model: User,
          as: "reportedUser",
          attributes: ["id", "firstName", "lastName", "email", "profilePictureUrl", "role"],
        },
        {
          model: Message,
          as: "message",
          attributes: ["id", "content", "createdAt"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
    });

    return sendSuccess(res, { reports, total: count });
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return sendError(res, "Failed to fetch reports", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * GET /api/reports/:id
 * Get single report details (Admin only)
 */
router.get("/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { id } = req.params;

    const report = await MessageReport.findByPk(id, {
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName", "email", "profilePictureUrl"],
        },
        {
          model: User,
          as: "reportedUser",
          attributes: ["id", "firstName", "lastName", "email", "profilePictureUrl", "role"],
        },
        {
          model: Conversation,
          as: "conversation",
        },
        {
          model: Message,
          as: "message",
          attributes: ["id", "content", "createdAt"],
        },
        {
          model: User,
          as: "reviewer",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    if (!report) {
      return sendError(res, "Report not found", HTTP_STATUS.NOT_FOUND);
    }

    // Get recent messages from the conversation for context
    const recentMessages = await Message.findAll({
      where: { conversationId: report.conversationId },
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 20,
    });

    return sendSuccess(res, { report, recentMessages: recentMessages.reverse() });
  } catch (error) {
    console.error("Failed to fetch report:", error);
    return sendError(res, "Failed to fetch report", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * PUT /api/reports/:id
 * Review and take action on a report (Admin only)
 */
router.put("/:id", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, action, adminNotes, warningMessage } = req.body;
    const reviewerId = req.user.id;

    const report = await MessageReport.findByPk(id, {
      include: [
        {
          model: User,
          as: "reportedUser",
        },
      ],
    });

    if (!report) {
      return sendError(res, "Report not found", HTTP_STATUS.NOT_FOUND);
    }

    // Validate status
    const validStatuses = ["pending", "reviewed", "resolved", "dismissed"];
    if (status && !validStatuses.includes(status)) {
      return sendError(res, "Invalid status", HTTP_STATUS.BAD_REQUEST);
    }

    // Validate action
    const validActions = ["none", "warning", "suspended", "banned"];
    if (action && !validActions.includes(action)) {
      return sendError(res, "Invalid action", HTTP_STATUS.BAD_REQUEST);
    }

    // Update report
    await report.update({
      status: status || report.status,
      action: action || report.action,
      adminNotes: adminNotes || report.adminNotes,
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
    });

    // Take action on the reported user if needed
    if (action === "suspended") {
      await User.update(
        { isMessagingSuspended: true, messagingSuspendedAt: new Date() },
        { where: { id: report.reportedUserId } }
      );
    } else if (action === "banned") {
      await User.update(
        { isActive: false, bannedAt: new Date() },
        { where: { id: report.reportedUserId } }
      );
    }

    // Send warning notification if action is warning and warningMessage provided
    if (action === "warning" && warningMessage) {
      const { Notification } = require("../models");
      await Notification.create({
        userId: report.reportedUserId,
        title: "Warning from Admin",
        message: warningMessage,
        relatedEntityType: "report",
        relatedEntityId: report.id,
        actionUrl: null,
        isRead: false,
      });
    }

    return sendSuccess(res, report, "Report updated successfully");
  } catch (error) {
    console.error("Failed to update report:", error);
    return sendError(res, "Failed to update report", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * GET /api/reports/user/:userId/history
 * Get report history for a specific user (Admin only)
 */
router.get("/user/:userId/history", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { userId } = req.params;

    const reportsAgainst = await MessageReport.findAll({
      where: { reportedUserId: userId },
      include: [
        {
          model: User,
          as: "reporter",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const reportsFiled = await MessageReport.findAll({
      where: { reporterId: userId },
      include: [
        {
          model: User,
          as: "reportedUser",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return sendSuccess(res, {
      reportsAgainst,
      reportsFiled,
      totalReportsAgainst: reportsAgainst.length,
      totalReportsFiled: reportsFiled.length,
    });
  } catch (error) {
    console.error("Failed to fetch user report history:", error);
    return sendError(res, "Failed to fetch report history", HTTP_STATUS.SERVER_ERROR, error);
  }
});

/**
 * POST /api/reports/user/:userId/unsuspend
 * Unsuspend a user's messaging (Admin only)
 */
router.post("/user/:userId/unsuspend", authenticate, authorize(["SuperAdmin", "Admin"]), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      return sendError(res, "User not found", HTTP_STATUS.NOT_FOUND);
    }

    await user.update({
      isMessagingSuspended: false,
      messagingSuspendedAt: null,
    });

    return sendSuccess(res, null, "User messaging unsuspended successfully");
  } catch (error) {
    console.error("Failed to unsuspend user:", error);
    return sendError(res, "Failed to unsuspend user", HTTP_STATUS.SERVER_ERROR, error);
  }
});

module.exports = router;
