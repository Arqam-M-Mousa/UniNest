const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");
const { User, PropertyListing, Review, MessageReport, VerificationRequest, ForumPost, RoommateProfile, PropertyViewing, Listing, Message, AIReportAnalysis } = require("../models");
const { sendSuccess, sendError } = require("../utils/responses");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

/**
 * GET /api/admin/dashboard/stats
 * Get comprehensive dashboard statistics
 */
router.get("/dashboard/stats", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get user statistics
        const [totalUsers, newUsersThisMonth, studentCount, landlordCount] = await Promise.all([
            User.count(),
            User.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } }),
            User.count({ where: { role: 'Student' } }),
            User.count({ where: { role: 'Landlord' } })
        ]);

        // Get property statistics
        const [totalProperties, newPropertiesThisMonth] = await Promise.all([
            PropertyListing.count(),
            PropertyListing.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } })
        ]);
        const activeProperties = totalProperties;

        // Get engagement statistics
        const [totalReviews, totalReports, pendingReports, totalViewings] = await Promise.all([
            Review.count(),
            MessageReport.count(),
            MessageReport.count({ where: { status: 'pending' } }),
            PropertyViewing.count()
        ]);

        // Get verification statistics
        const [pendingVerifications, approvedVerifications, rejectedVerifications] = await Promise.all([
            VerificationRequest.count({ where: { status: 'pending' } }),
            VerificationRequest.count({ where: { status: 'approved' } }),
            VerificationRequest.count({ where: { status: 'rejected' } })
        ]);

        // Get forum statistics
        const [totalForumPosts, forumPostsThisMonth] = await Promise.all([
            ForumPost.count(),
            ForumPost.count({ where: { created_at: { [Op.gte]: thirtyDaysAgo } } })
        ]);

        // Get roommate statistics
        const totalRoommateProfiles = await RoommateProfile.count();

        const stats = {
            users: {
                total: totalUsers,
                newThisMonth: newUsersThisMonth,
                students: studentCount,
                landlords: landlordCount
            },
            properties: {
                total: totalProperties,
                active: activeProperties,
                newThisMonth: newPropertiesThisMonth
            },
            engagement: {
                reviews: totalReviews,
                viewings: totalViewings,
                forumPosts: totalForumPosts,
                forumPostsThisMonth: forumPostsThisMonth
            },
            reports: {
                total: totalReports,
                pending: pendingReports
            },
            verifications: {
                pending: pendingVerifications,
                approved: approvedVerifications,
                rejected: rejectedVerifications
            },
            roommates: {
                total: totalRoommateProfiles
            }
        };

        return sendSuccess(res, stats, "Dashboard statistics retrieved successfully");
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        return sendError(res, error.message || "Failed to fetch dashboard statistics", 500);
    }
});

/**
 * GET /api/admin/dashboard/trends
 * Get user registration and activity trends over time
 */
router.get("/dashboard/trends", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get daily user registrations
        const userTrends = await User.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: thirtyDaysAgo }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Get daily property listings
        const propertyTrends = await PropertyListing.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: thirtyDaysAgo }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        // Get daily forum posts
        const forumTrends = await ForumPost.findAll({
            attributes: [
                [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            where: {
                created_at: { [Op.gte]: thirtyDaysAgo }
            },
            group: [sequelize.fn('DATE', sequelize.col('created_at'))],
            order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
            raw: true
        });

        return sendSuccess(res, {
            users: userTrends,
            properties: propertyTrends,
            forumPosts: forumTrends
        }, "Trends retrieved successfully");
    } catch (error) {
        console.error("Error fetching trends:", error);
        return sendError(res, error.message || "Failed to fetch trends", 500);
    }
});

/**
 * GET /api/admin/users/all
 * Get all users with pagination and filtering
 */
router.get("/users/all", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { page = 1, limit = 20, role, search } = req.query;
        const offset = (page - 1) * limit;

        const where = {};
        if (role && role !== 'all') {
            where.role = role;
        }
        if (search) {
            where[Op.or] = [
                { first_name: { [Op.iLike]: `%${search}%` } },
                { last_name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: [
                "id",
                "email",
                "first_name",
                "last_name",
                "role",
                "avatar_url",
                "profile_picture_url",
                "is_verified",
                "is_active",
                "banned_at",
                "is_messaging_suspended",
                "messaging_suspended_at",
                "created_at",
                "updated_at",
            ],
            order: [["created_at", "DESC"]],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        return sendSuccess(res, {
            users,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit)
            }
        }, "Users retrieved successfully");
    } catch (error) {
        console.error("Error fetching users:", error);
        return sendError(res, error.message || "Failed to fetch users", 500);
    }
});

/**
 * GET /api/admin/reports/recent
 * Get recent reports
 */
router.get("/reports/recent", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const reports = await MessageReport.findAll({
            include: [
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                },
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'first_name', 'last_name', 'email']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        return sendSuccess(res, reports, "Recent reports retrieved successfully");
    } catch (error) {
        console.error("Error fetching recent reports:", error);
        return sendError(res, error.message || "Failed to fetch recent reports", 500);
    }
});

/**
 * GET /api/admin/verifications/recent
 * Get recent verification requests
 */
router.get("/verifications/recent", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        const verifications = await VerificationRequest.findAll({
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name', 'email', 'role']
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        return sendSuccess(res, verifications, "Recent verifications retrieved successfully");
    } catch (error) {
        console.error("Error fetching recent verifications:", error);
        return sendError(res, error.message || "Failed to fetch recent verifications", 500);
    }
});

/**
 * GET /api/admin/users
 * List all admin users (SuperAdmin only)
 */
router.get("/users", authenticate, authorize("SuperAdmin"), async (req, res) => {
    try {
        const admins = await User.findAll({
            where: {
                role: ["Admin", "SuperAdmin"],
            },
            attributes: [
                "id",
                "email",
                "firstName",
                "lastName",
                "role",
                "avatarUrl",
                "profilePictureUrl",
                "isVerified",
                "createdAt",
                "updatedAt",
            ],
            order: [["createdAt", "DESC"]],
        });

        return sendSuccess(res, admins, "Admin users retrieved successfully");
    } catch (error) {
        console.error("Error fetching admin users:", error);
        return sendError(res, error.message || "Failed to fetch admin users", 500);
    }
});

/**
 * POST /api/admin/users
 * Create a new admin user (SuperAdmin only)
 */
router.post("/users", authenticate, authorize("SuperAdmin"), async (req, res) => {
    try {
        const { email, firstName, lastName, role } = req.body;

        // Validate required fields (password is no longer required)
        if (!email || !firstName || !lastName) {
            return sendError(res, "Email, first name, and last name are required", 400);
        }

        // Validate role - only Admin or SuperAdmin can be created
        if (!role || !["Admin", "SuperAdmin"].includes(role)) {
            return sendError(res, "Role must be either Admin or SuperAdmin", 400);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return sendError(res, "User with this email already exists", 409);
        }

        // Auto-generate secure password
        const { generateSecurePassword } = require("../utils/passwordUtils");
        const generatedPassword = generateSecurePassword(12);

        // Hash password
        const passwordHash = await bcrypt.hash(generatedPassword, 10);

        // Create admin user
        const newAdmin = await User.create({
            email,
            passwordHash,
            firstName,
            lastName,
            role,
            gender: req.body.gender || null,
            preferredLanguage: req.body.preferredLanguage || "en",
            isVerified: true, // Auto-verify admin users
        });

        // Send email with generated password
        const { sendAdminCreationEmail } = require("../services/emailService");
        try {
            await sendAdminCreationEmail(email, generatedPassword, firstName, role);
        } catch (emailError) {
            console.error("Failed to send admin creation email:", emailError);
            // Don't fail the request if email fails, but log it
        }

        // Return user without password hash
        const adminData = {
            id: newAdmin.id,
            email: newAdmin.email,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            role: newAdmin.role,
            avatarUrl: newAdmin.avatarUrl,
            profilePictureUrl: newAdmin.profilePictureUrl,
            isVerified: newAdmin.isVerified,
            createdAt: newAdmin.createdAt,
        };

        return sendSuccess(res, adminData, "Admin user created successfully", 201);
    } catch (error) {
        console.error("Error creating admin user:", error);
        return sendError(res, error.message || "Failed to create admin user", 500);
    }
});

/**
 * DELETE /api/admin/users/:id
 * Delete an admin user (SuperAdmin only)
 */
router.delete("/users/:id", authenticate, authorize("SuperAdmin"), async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting yourself
        if (id === req.user.id) {
            return sendError(res, "Cannot delete your own account", 400);
        }

        const user = await User.findByPk(id);

        if (!user) {
            return sendError(res, "User not found", 404);
        }

        // Only allow deleting Admin or SuperAdmin users
        if (!["Admin", "SuperAdmin"].includes(user.role)) {
            return sendError(res, "Can only delete Admin or SuperAdmin users", 400);
        }

        await user.destroy();

        return sendSuccess(res, null, "Admin user deleted successfully", 200);
    } catch (error) {
        console.error("Error deleting admin user:", error);
        return sendError(res, error.message || "Failed to delete admin user", 500);
    }
});

/**
 * POST /api/admin/reports/ai-analyze
 * Analyze reports using AI with caching
 */
router.post("/reports/ai-analyze", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { status = "pending", limit = 50, forceRefresh = false } = req.body;
        const aiService = require("../services/aiService");

        const where = {};
        if (status && status !== "all") {
            where.status = status;
        }

        // Fetch current reports
        const reports = await MessageReport.findAll({
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
            ],
            order: [["createdAt", "DESC"]],
            limit: Math.min(parseInt(limit, 10), 100),
        });

        if (reports.length === 0) {
            return sendSuccess(res, {
                analysis: null,
                message: "No reports found to analyze",
                totalReports: 0,
                cached: false,
            });
        }

        // Get current report IDs and latest report date
        const currentReportIds = reports.map(r => r.id).sort();
        const latestReportDate = reports.reduce((latest, r) => {
            const reportDate = new Date(r.createdAt);
            return reportDate > latest ? reportDate : latest;
        }, new Date(0));

        // Check for valid cached analysis
        if (!forceRefresh) {
            const cachedAnalysis = await AIReportAnalysis.findOne({
                where: {
                    status,
                    expiresAt: { [Op.gt]: new Date() },
                },
                order: [["createdAt", "DESC"]],
            });

            if (cachedAnalysis) {
                const cachedReportIds = cachedAnalysis.reportIds.sort();
                const cachedLastReportDate = new Date(cachedAnalysis.lastReportDate);

                // Check if reports are the same (no new reports)
                const reportsMatch = JSON.stringify(currentReportIds) === JSON.stringify(cachedReportIds);
                const noNewReports = latestReportDate <= cachedLastReportDate;

                if (reportsMatch || noNewReports) {
                    return sendSuccess(res, {
                        analysis: {
                            recommendations: cachedAnalysis.recommendations,
                            patterns: cachedAnalysis.patterns,
                            summary: cachedAnalysis.summary,
                        },
                        totalReports: cachedAnalysis.reportCount,
                        timestamp: cachedAnalysis.createdAt,
                        cached: true,
                        cacheId: cachedAnalysis.id,
                        expiresAt: cachedAnalysis.expiresAt,
                    }, "Cached AI analysis retrieved");
                }
            }
        }

        // Add report count for each reported user
        for (const report of reports) {
            const reportCount = await MessageReport.count({
                where: { reportedUserId: report.reportedUserId },
            });
            if (report.reportedUser) {
                report.reportedUser.reportCount = reportCount;
            }
        }

        // Call AI for fresh analysis
        const analysis = await aiService.analyzeReportsWithAI(reports, {
            adminId: req.user.id,
            adminName: `${req.user.firstName} ${req.user.lastName}`,
        });

        // Cache the results (expires in 1 hour)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);

        const savedAnalysis = await AIReportAnalysis.create({
            status,
            reportIds: currentReportIds,
            reportCount: reports.length,
            lastReportDate: latestReportDate,
            recommendations: analysis.recommendations || [],
            patterns: analysis.patterns || [],
            summary: analysis.summary || "",
            analyzedBy: req.user.id,
            expiresAt,
        });

        return sendSuccess(res, {
            analysis,
            totalReports: reports.length,
            timestamp: new Date().toISOString(),
            cached: false,
            cacheId: savedAnalysis.id,
            expiresAt,
        }, "AI analysis completed and cached");
    } catch (error) {
        console.error("Error in AI report analysis:", error);
        return sendError(res, error.message || "Failed to analyze reports with AI", 500);
    }
});

/**
 * POST /api/admin/reports/:id/apply-recommendation
 * Apply AI recommendation to a specific report
 */
router.post("/reports/:id/apply-recommendation", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { action, reasoning, adminNotes } = req.body;
        const reviewerId = req.user.id;

        if (!action) {
            return sendError(res, "Action is required", 400);
        }

        const validActions = ["none", "warning", "suspended", "banned"];
        if (!validActions.includes(action)) {
            return sendError(res, "Invalid action", 400);
        }

        const report = await MessageReport.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "reportedUser",
                },
            ],
        });

        if (!report) {
            return sendError(res, "Report not found", 404);
        }

        const finalAdminNotes = adminNotes || `AI Recommendation Applied: ${reasoning || "No reasoning provided"}`;

        await report.update({
            status: "resolved",
            action: action,
            adminNotes: finalAdminNotes,
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
        });

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

        if (action === "warning") {
            const { Notification } = require("../models");
            await Notification.create({
                userId: report.reportedUserId,
                title: "Warning from Admin",
                message: reasoning || "You have received a warning for violating platform rules.",
                relatedEntityType: "report",
                relatedEntityId: report.id,
                actionUrl: null,
                isRead: false,
            });
        }

        return sendSuccess(res, report, "Recommendation applied successfully");
    } catch (error) {
        console.error("Error applying recommendation:", error);
        return sendError(res, error.message || "Failed to apply recommendation", 500);
    }
});

/**
 * POST /api/admin/users/:userId/unban
 * Unban a user (Admin only)
 */
router.post("/users/:userId/unban", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        await user.update({
            isActive: true,
            bannedAt: null,
        });

        return sendSuccess(res, null, "User unbanned successfully");
    } catch (error) {
        console.error("Error unbanning user:", error);
        return sendError(res, error.message || "Failed to unban user", 500);
    }
});

/**
 * POST /api/admin/users/:userId/unsuspend
 * Unsuspend a user's messaging (Admin only)
 */
router.post("/users/:userId/unsuspend", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        await user.update({
            isMessagingSuspended: false,
            messagingSuspendedAt: null,
        });

        return sendSuccess(res, null, "User messaging unsuspended successfully");
    } catch (error) {
        console.error("Error unsuspending user:", error);
        return sendError(res, error.message || "Failed to unsuspend user", 500);
    }
});

/**
 * POST /api/admin/users/:userId/suspend
 * Suspend a user's messaging (Admin only)
 */
router.post("/users/:userId/suspend", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        await user.update({
            isMessagingSuspended: true,
            messagingSuspendedAt: new Date(),
        });

        return sendSuccess(res, null, "User messaging suspended successfully");
    } catch (error) {
        console.error("Error suspending user:", error);
        return sendError(res, error.message || "Failed to suspend user", 500);
    }
});

/**
 * POST /api/admin/users/:userId/ban
 * Ban a user completely (Admin only)
 */
router.post("/users/:userId/ban", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findByPk(userId);
        if (!user) {
            return sendError(res, "User not found", 404);
        }

        if (["Admin", "SuperAdmin"].includes(user.role)) {
            return sendError(res, "Cannot ban admin users", 403);
        }

        await user.update({
            isActive: false,
            bannedAt: new Date(),
        });

        return sendSuccess(res, null, "User banned successfully");
    } catch (error) {
        console.error("Error banning user:", error);
        return sendError(res, error.message || "Failed to ban user", 500);
    }
});

/**
 * POST /api/admin/reports/bulk-apply
 * Apply action to multiple reports at once
 */
router.post("/reports/bulk-apply", authenticate, authorize(["Admin", "SuperAdmin"]), async (req, res) => {
    try {
        const { reportIds, action, reasoning } = req.body;
        const reviewerId = req.user.id;

        if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
            return sendError(res, "Report IDs array is required", 400);
        }

        if (!action) {
            return sendError(res, "Action is required", 400);
        }

        const validActions = ["none", "warning", "suspended", "banned"];
        if (!validActions.includes(action)) {
            return sendError(res, "Invalid action", 400);
        }

        const reports = await MessageReport.findAll({
            where: { id: reportIds },
            include: [
                {
                    model: User,
                    as: "reportedUser",
                },
            ],
        });

        if (reports.length === 0) {
            return sendError(res, "No reports found", 404);
        }

        const results = [];
        const affectedUserIds = new Set();

        for (const report of reports) {
            try {
                await report.update({
                    status: "resolved",
                    action: action,
                    adminNotes: `Bulk Action Applied: ${reasoning || "No reasoning provided"}`,
                    reviewedBy: reviewerId,
                    reviewedAt: new Date(),
                });

                affectedUserIds.add(report.reportedUserId);
                results.push({ reportId: report.id, success: true });
            } catch (error) {
                results.push({ reportId: report.id, success: false, error: error.message });
            }
        }

        for (const userId of affectedUserIds) {
            if (action === "suspended") {
                await User.update(
                    { isMessagingSuspended: true, messagingSuspendedAt: new Date() },
                    { where: { id: userId } }
                );
            } else if (action === "banned") {
                await User.update(
                    { isActive: false, bannedAt: new Date() },
                    { where: { id: userId } }
                );
            }

            if (action === "warning") {
                const { Notification } = require("../models");
                await Notification.create({
                    userId: userId,
                    title: "Warning from Admin",
                    message: reasoning || "You have received a warning for violating platform rules.",
                    relatedEntityType: "report",
                    relatedEntityId: null,
                    actionUrl: null,
                    isRead: false,
                });
            }
        }

        return sendSuccess(res, {
            results,
            totalProcessed: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            affectedUsers: affectedUserIds.size,
        }, "Bulk action applied successfully");
    } catch (error) {
        console.error("Error applying bulk action:", error);
        return sendError(res, error.message || "Failed to apply bulk action", 500);
    }
});

module.exports = router;
