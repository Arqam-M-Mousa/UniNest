const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth").authenticate;
const { User } = require("../models");
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
    if (studentId !== undefined) user.studentId = studentId;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    return sendSuccess(res, user, "Profile updated successfully", 200);
  } catch (error) {
    console.error("Error updating profile:", error);
    return sendError(res, error.message, 500);
  }
});

module.exports = router;
