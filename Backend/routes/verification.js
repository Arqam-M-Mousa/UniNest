const express = require("express");
const router = express.Router();
const { VerificationRequest, User, Notification } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");

// Submit a verification request
router.post("/submit", authenticate, async (req, res) => {
    try {
        const { documentType, documentUrl } = req.body;
        const userId = req.user.id;

        const pendingRequest = await VerificationRequest.findOne({
            where: { userId, status: "pending" },
        });

        if (pendingRequest) {
            return res.status(400).json({ message: "You already have a pending verification request." });
        }

        const request = await VerificationRequest.create({
            userId,
            documentType,
            documentUrl,
        });

        await User.update(
            { verificationStatus: "pending" },
            { where: { id: userId } }
        );

        const admins = await User.findAll({
            where: { role: ["Admin", "SuperAdmin"] },
            attributes: ["id"]
        });

        const user = await User.findByPk(userId, {
            attributes: ["firstName", "lastName"]
        });
        const adminNotifications = admins.map(admin => ({
            userId: admin.id,
            title: "New Verification Request",
            message: `${user.firstName} ${user.lastName} has submitted a verification request`,
            relatedEntityType: "verification_request",
            relatedEntityId: request.id,
            actionUrl: "/admin/verification",
            isRead: false
        }));

        if (adminNotifications.length > 0) {
            await Notification.bulkCreate(adminNotifications);
        }

        res.status(201).json(request);
    } catch (error) {
        console.error("Error submitting verification request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Get status of current user
router.get("/status", authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            attributes: ["verificationStatus", "isIdentityVerified", "verificationDocumentUrl"],
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const latestRequest = await VerificationRequest.findOne({
            where: { userId },
            order: [["createdAt", "DESC"]],
        });

        res.json({
            verificationStatus: user.verificationStatus,
            isIdentityVerified: user.isIdentityVerified,
            latestRequest,
        });
    } catch (error) {
        console.error("Error fetching verification status:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Admin: List all requests (filtered by status)
router.get("/requests", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { status } = req.query;

        const whereClause = status ? { status } : {};

        const requests = await VerificationRequest.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });

        res.json(requests);
    } catch (error) {
        console.error("Error fetching verification requests:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Admin: Approve or Reject
router.put("/requests/:id", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body; // status: 'approved' or 'rejected'

        if (!["approved", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const request = await VerificationRequest.findByPk(id);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        // Update request
        request.status = status;
        request.reviewedBy = req.user.id;
        request.reviewNotes = reviewNotes;
        request.reviewedAt = new Date();
        await request.save();

        // Update User
        if (status === "approved") {
            await User.update(
                {
                    isIdentityVerified: true,
                    identityVerifiedAt: new Date(),
                    verificationStatus: "approved",
                },
                { where: { id: request.userId } }
            );
        } else {
            await User.update(
                {
                    verificationStatus: "rejected",
                    isIdentityVerified: false,
                },
                { where: { id: request.userId } }
            );
        }

        const user = await User.findByPk(request.userId, {
            attributes: ["firstName", "lastName"]
        });

        if (status === "approved") {
            await Notification.create({
                userId: request.userId,
                title: "Verification Approved",
                message: "Congratulations! Your identity verification has been approved. You now have the verified badge.",
                relatedEntityType: "verification_request",
                relatedEntityId: request.id,
                actionUrl: "/profile",
                isRead: false
            });
            console.log("Created approval notification for user");
        } else {
            const message = reviewNotes
                ? `Your verification request has been rejected. Reason: ${reviewNotes}`
                : "Your verification request has been rejected. Please review the requirements and try again.";

            await Notification.create({
                userId: request.userId,
                title: "Verification Rejected",
                message,
                relatedEntityType: "verification_request",
                relatedEntityId: request.id,
                actionUrl: "/profile/verification",
                isRead: false
            });
            console.log("Created rejection notification for user");
        }

        res.json({ message: `Verification request ${status}`, request });
    } catch (error) {
        console.error("Error updating verification request:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;
