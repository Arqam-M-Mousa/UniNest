const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth").authenticate;
const { User, University } = require("../models");
const { sendSuccess, sendError } = require("../utils/responses");

/**
 * GET /api/users/profile
 * Get current authenticated user's profile
 */
router.get("/profile", authenticate, async (req, res) => {
  try {
    console.log("Fetching profile for user ID:", req.user.id);
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "email",
        "firstName",
        "lastName",
        "role",
        "phoneNumber",
        "avatarUrl",
        "profilePictureUrl",
        "profilePicturePublicId",
        "studentId",
        "gender",
        "preferredLanguage",
        "isVerified",
        "averageRating",
        "totalReviewsCount",
        "createdAt",
        "updatedAt",
        "universityId",
      ],
      include: [
        {
          model: University,
          as: "university",
          attributes: ["id", "name", "city", "domain", "latitude", "longitude"],
        },
      ],
    });

    if (!user) {
      console.error("User not found in database for ID:", req.user.id);
      return sendError(res, "User not found", 404);
    }

    console.log("Profile fetched successfully for user:", user.email);
    return sendSuccess(res, user, "Profile retrieved successfully");
  } catch (error) {
    console.error("Error fetching profile:", error);
    return sendError(res, error.message || "Failed to fetch profile", 500);
  }
});

/**
 * PUT /api/users/profile
 * Update current authenticated user's profile
 */
router.put("/profile", authenticate, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNumber,
      gender,
      preferredLanguage,
      studentId,
      avatarUrl,
    } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Update allowed fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    if (gender !== undefined) user.gender = gender;
    if (preferredLanguage !== undefined)
      user.preferredLanguage = preferredLanguage;

    // Lock studentId edits for students; allow for other roles if present
    if (user.role !== "Student" && studentId !== undefined) {
      user.studentId = studentId;
    }

    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    return sendSuccess(res, user, "Profile updated successfully", 200);
  } catch (error) {
    console.error("Error updating profile:", error);
    return sendError(res, error.message, 500);
  }
});

/**
 * DELETE /api/users/profile
 * Delete current authenticated user's account
 */
router.delete("/profile", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    await user.destroy();
    return sendSuccess(res, null, "Account deleted successfully", 200);
  } catch (error) {
    console.error("Error deleting account:", error);
    return sendError(res, error.message || "Failed to delete account", 500);
  }
});

/**
 * POST /api/users/change-password/send-code
 * Send verification code to user's email for password change
 */
router.post("/change-password/send-code", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Generate verification code
    const { VerificationCode } = require("../models");
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused codes for this email
    await VerificationCode.destroy({
      where: { email: user.email, isUsed: false },
    });

    // Create new verification code
    await VerificationCode.create({
      email: user.email,
      code,
      expiresAt,
    });

    // Send email
    const { sendVerificationEmail } = require("../services/emailService");
    try {
      await sendVerificationEmail(user.email, code);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Continue anyway - code is saved in DB for development
    }

    return sendSuccess(res, { email: user.email }, "Verification code sent to your email");
  } catch (error) {
    console.error("Error sending password change code:", error);
    return sendError(res, error.message || "Failed to send verification code", 500);
  }
});

/**
 * POST /api/users/change-password
 * Change password after code verification
 */
router.post("/change-password", authenticate, async (req, res) => {
  try {
    const { code, newPassword } = req.body;

    if (!code || !newPassword) {
      return sendError(res, "Verification code and new password are required", 400);
    }

    // Validate password length
    if (newPassword.length < 6) {
      return sendError(res, "Password must be at least 6 characters long", 400);
    }

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return sendError(res, "User not found", 404);
    }

    // Verify the code
    const { VerificationCode } = require("../models");
    const verification = await VerificationCode.findOne({
      where: {
        email: user.email,
        code,
        isUsed: false,
      },
    });

    if (!verification) {
      return sendError(res, "Invalid or expired verification code", 400);
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return sendError(res, "Verification code has expired", 400);
    }

    // Update password
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash });

    // Mark code as used
    await verification.update({ isUsed: true });

    return sendSuccess(res, {}, "Password changed successfully", 200);
  } catch (error) {
    console.error("Error changing password:", error);
    return sendError(res, error.message || "Failed to change password", 500);
  }
});

module.exports = router;
