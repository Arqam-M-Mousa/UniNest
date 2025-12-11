const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { authenticate, authorize } = require("../middleware/auth");
const { User } = require("../models");
const { sendSuccess, sendError } = require("../utils/responses");

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
        const { email, password, firstName, lastName, role } = req.body;

        // Validate required fields
        if (!email || !password || !firstName || !lastName) {
            return sendError(res, "Email, password, first name, and last name are required", 400);
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

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

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

        // Return user without password hash
        const adminData = {
            id: newAdmin.id,
            email: newAdmin.email,
            firstName: newAdmin.firstName,
            lastName: newAdmin.lastName,
            role: newAdmin.role,
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
