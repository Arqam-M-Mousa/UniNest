const express = require("express");
const router = express.Router();
const {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../middleware/upload");
const { authenticate } = require("../middleware/auth");
const { User } = require("../models");
const {
  HTTP_STATUS,
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responses");

/**
 * Upload/Update Profile Picture
 * POST /api/uploads/profile-picture
 */
router.post(
  "/profile-picture",
  authenticate,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return sendValidationError(res, ["No file uploaded"]);
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        return sendError(res, "User not found", HTTP_STATUS.NOT_FOUND);
      }

      // If user has an existing profile picture, delete it from Cloudinary
      if (user.profilePicturePublicId) {
        await deleteFromCloudinary(user.profilePicturePublicId);
      }

      // Upload new image to Cloudinary
      const result = await uploadToCloudinary(
        req.file.buffer,
        "uninest/profile_pictures",
        {
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
          ],
        }
      );

      // Update user with new profile picture URL and public ID
      await user.update({
        profilePictureUrl: result.secure_url,
        profilePicturePublicId: result.public_id,
      });

      return sendSuccess(
        res,
        {
          url: result.secure_url,
          publicId: result.public_id,
        },
        "Profile picture uploaded successfully"
      );
    } catch (error) {
      console.error("Profile picture upload error:", error);
      return sendError(
        res,
        "Failed to upload profile picture",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

/**
 * Delete Profile Picture
 * DELETE /api/uploads/profile-picture
 */
router.delete("/profile-picture", authenticate, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return sendError(res, "User not found", HTTP_STATUS.NOT_FOUND);
    }

    if (!user.profilePicturePublicId) {
      return sendError(
        res,
        "No profile picture to delete",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(user.profilePicturePublicId);

    // Update user
    await user.update({
      profilePictureUrl: null,
      profilePicturePublicId: null,
    });

    return sendSuccess(res, null, "Profile picture deleted successfully");
  } catch (error) {
    console.error("Profile picture deletion error:", error);
    return sendError(
      res,
      "Failed to delete profile picture",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

/**
 * Upload Listing Images (multiple)
 * POST /api/uploads/listing-images
 */
router.post(
  "/listing-images",
  authenticate,
  upload.array("images", 10), // Max 10 images
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return sendValidationError(res, ["No files uploaded"]);
      }

      const uploadPromises = req.files.map((file) =>
        uploadToCloudinary(file.buffer, "uninest/listings", {
          transformation: [
            { width: 1200, height: 800, crop: "limit" },
            { quality: "auto" },
          ],
        })
      );

      const results = await Promise.all(uploadPromises);

      const uploadedImages = results.map((result) => ({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
      }));

      return sendSuccess(
        res,
        uploadedImages,
        `${uploadedImages.length} image(s) uploaded successfully`
      );
    } catch (error) {
      console.error("Listing images upload error:", error);
      return sendError(
        res,
        "Failed to upload listing images",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

/**
 * Delete a specific image from Cloudinary
 * DELETE /api/uploads/image/:publicId
 */
router.delete("/image/:publicId(*)", authenticate, async (req, res) => {
  try {
    const publicId = req.params.publicId;

    if (!publicId) {
      return sendValidationError(res, ["Public ID is required"]);
    }

    const result = await deleteFromCloudinary(publicId);

    return sendSuccess(res, result, "Image deleted successfully");
  } catch (error) {
    console.error("Image deletion error:", error);
    return sendError(
      res,
      "Failed to delete image",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

router.post(
  "/verification-document",
  authenticate,
  upload.single("document"),
  async (req, res) => {
    try {
      if (!req.file) {
        return sendValidationError(res, ["No file uploaded"]);
      }

      // Upload to Cloudinary in verification_documents folder
      const result = await uploadToCloudinary(
        req.file.buffer,
        "uninest/verification_documents",
        {
          transformation: [
            { width: 1500, height: 1500, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        }
      );

      return sendSuccess(
        res,
        {
          url: result.secure_url,
          publicId: result.public_id,
        },
        "Verification document uploaded successfully"
      );
    } catch (error) {
      console.error("Verification document upload error:", error);
      return sendError(
        res,
        "Failed to upload verification document",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

module.exports = router;
