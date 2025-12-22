const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { User, Notification } = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");
const { Op } = require("sequelize");

/**
 * POST /api/announcements
 * Send system announcement to specific user groups
 * Admin/SuperAdmin only
 */
router.post("/", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { title, message, targetType, targetValue } = req.body;

        if (!title || !message) {
            return sendError(res, "Title and message are required", HTTP_STATUS.BAD_REQUEST);
        }

        if (!targetType || !["all", "role", "university", "specific"].includes(targetType)) {
            return sendError(res, "Invalid target type. Must be: all, role, university, or specific", HTTP_STATUS.BAD_REQUEST);
        }

        let targetUsers = [];

        switch (targetType) {
            case "all":
                // Send to all users
                targetUsers = await User.findAll({
                    attributes: ["id"]
                });
                break;

            case "role":
                // Send to users with specific role (Student, Landlord, Admin, SuperAdmin)
                if (!targetValue) {
                    return sendError(res, "Target role is required", HTTP_STATUS.BAD_REQUEST);
                }
                targetUsers = await User.findAll({
                    where: { role: targetValue },
                    attributes: ["id"]
                });
                break;

            case "university":
                // Send to users from specific university
                if (!targetValue) {
                    return sendError(res, "Target university ID is required", HTTP_STATUS.BAD_REQUEST);
                }
                targetUsers = await User.findAll({
                    where: { universityId: targetValue },
                    attributes: ["id"]
                });
                break;

            case "specific":
                // Send to specific user IDs
                if (!Array.isArray(targetValue) || targetValue.length === 0) {
                    return sendError(res, "Target user IDs array is required", HTTP_STATUS.BAD_REQUEST);
                }
                targetUsers = await User.findAll({
                    where: {
                        id: { [Op.in]: targetValue }
                    },
                    attributes: ["id"]
                });
                break;
        }

        if (targetUsers.length === 0) {
            return sendError(res, "No users found matching the target criteria", HTTP_STATUS.NOT_FOUND);
        }

        // Create notifications for all target users
        const notifications = targetUsers.map(user => ({
            userId: user.id,
            title,
            message,
            relatedEntityType: "system_announcement",
            relatedEntityId: req.user.id, // Track which admin sent it
            actionUrl: null,
            isRead: false
        }));

        await Notification.bulkCreate(notifications);

        // Broadcast via Socket.io if available
        const io = req.app.get("io");
        if (io) {
            targetUsers.forEach(user => {
                io.to(`user:${user.id}`).emit("notification:new", {
                    title,
                    message,
                    relatedEntityType: "system_announcement",
                    createdAt: new Date()
                });
            });
        }

        return sendSuccess(res, {
            recipientCount: targetUsers.length,
            targetType,
            targetValue
        }, `Announcement sent to ${targetUsers.length} users`);

    } catch (error) {
        console.error("Error sending announcement:", error);
        return sendError(
            res,
            "Failed to send announcement",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

module.exports = router;
