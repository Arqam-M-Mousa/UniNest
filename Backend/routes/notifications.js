const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { Notification } = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

// GET /api/notifications
router.get("/", authenticate, async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;

    const { rows, count } = await Notification.findAndCountAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false },
    });

    return sendSuccess(res, { items: rows, total: count, unreadCount });
  } catch (error) {
    return sendError(
      res,
      "Failed to load notifications",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// PATCH /api/notifications/:id/read
router.patch("/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!notification) {
      return sendError(res, "Notification not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    return sendSuccess(res, notification, "Notification marked as read");
  } catch (error) {
    return sendError(
      res,
      "Failed to update notification",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// PATCH /api/notifications/read-all
router.patch("/read-all", authenticate, async (req, res) => {
  try {
    const [updated] = await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    return sendSuccess(res, { updated }, "Notifications marked as read");
  } catch (error) {
    return sendError(
      res,
      "Failed to update notifications",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

module.exports = router;
