const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");
const { User, PropertyListing, Review, MessageReport, VerificationRequest, ForumPost, RoommateProfile, PropertyViewing, Listing } = require("../models");
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

module.exports = router;
