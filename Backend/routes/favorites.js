const express = require("express");
const { Op } = require("sequelize");
const {
  Favorite,
  PropertyListing,
  Listing,
  ListingImage,
  User,
  University,
  PropertyAnalytics,
} = require("../models");
const { authenticate } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

// GET /api/favorites - Get user's favorites list
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all favorite listing IDs for this user
    const favorites = await Favorite.findAll({
      where: { studentId: userId },
      attributes: ["listingId", "createdAt"],
      order: [["createdAt", "DESC"]],
    });

    if (favorites.length === 0) {
      return sendSuccess(res, { listings: [], total: 0 });
    }

    const listingIds = favorites.map((f) => f.listingId);

    // Get property listings that match these listing IDs
    const properties = await PropertyListing.findAll({
      include: [
        {
          model: Listing,
          as: "listing",
          where: {
            id: { [Op.in]: listingIds },
            isActive: true,
            isPublished: true,
          },
          required: true,
          include: [
            {
              model: ListingImage,
              as: "images",
              attributes: ["id", "url", "isPrimary", "displayOrder"],
              required: false,
              separate: true,
            },
            {
              model: User,
              as: "owner",
              attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role"],
              required: false,
            },
          ],
        },
        {
          model: University,
          required: false,
          attributes: ["id", "name", "city"],
        },
      ],
    });

    // Transform response
    const listings = properties.map((prop) => {
      const listing = prop.listing || {};
      return {
        id: prop.id,
        listingId: prop.listingId,
        title: listing.title || "",
        description: listing.description || "",
        propertyType: prop.propertyType,
        pricePerMonth: parseFloat(prop.pricePerMonth) || 0,
        currency: prop.currency || "NIS",
        city: prop.city || "",
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        squareFeet: prop.squareFeet,
        distanceToUniversity: prop.distanceToUniversity,
        leaseDuration: prop.leaseDuration,
        listingDuration: prop.listingDuration,
        expiresAt: prop.expiresAt,
        isVisible: prop.isVisible,
        latitude: prop.latitude,
        longitude: prop.longitude,
        images: listing.images || [],
        owner: listing.owner || null,
        university: prop.University || null,
        viewCount: listing.viewCount || 0,
        createdAt: listing.createdAt || prop.createdAt,
        updatedAt: listing.updatedAt || prop.updatedAt,
        isFavorite: true,
      };
    });

    return sendSuccess(res, { listings, total: listings.length });
  } catch (error) {
    console.error("Failed to fetch favorites", error);
    return sendError(
      res,
      "Failed to fetch favorites",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// GET /api/favorites/ids - Get list of favorite listing IDs for current user
router.get("/ids", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: { studentId: userId },
      attributes: ["listingId"],
    });

    const ids = favorites.map((fav) => fav.listingId);

    return sendSuccess(res, { ids });
  } catch (error) {
    console.error("Failed to fetch favorite IDs", error);
    return sendError(
      res,
      "Failed to fetch favorite IDs",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// POST /api/favorites/:listingId - Add a listing to favorites (listingId is the Listing.id, not PropertyListing.id)
router.post("/:listingId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    // Check if listing exists
    const listing = await Listing.findByPk(listingId);
    if (!listing) {
      return sendError(res, "Listing not found", HTTP_STATUS.NOT_FOUND);
    }

    // Check if already favorited
    const existing = await Favorite.findOne({
      where: { studentId: userId, listingId },
    });

    if (existing) {
      return sendSuccess(res, { id: existing.id }, "Already in favorites");
    }

    // Create favorite
    const favorite = await Favorite.create({
      studentId: userId,
      listingId,
    });

    // Track favorite in analytics (find property by listingId)
    const property = await PropertyListing.findOne({
      where: { listingId },
      attributes: ["id"],
    });

    if (property) {
      const today = new Date().toISOString().split("T")[0];
      const [analytics, created] = await PropertyAnalytics.findOrCreate({
        where: { propertyId: property.id, date: today },
        defaults: { views: 0, uniqueViews: 0, favorites: 1, inquiries: 0 },
      });
      // Only increment if record already existed (not newly created)
      if (!created) {
        await PropertyAnalytics.increment("favorites", {
          where: { propertyId: property.id, date: today },
        });
      }
    }

    return sendSuccess(
      res,
      { id: favorite.id },
      "Added to favorites",
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    console.error("Failed to add favorite", error);
    return sendError(
      res,
      "Failed to add favorite",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// DELETE /api/favorites/:listingId - Remove a listing from favorites
router.delete("/:listingId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    const deleted = await Favorite.destroy({
      where: { studentId: userId, listingId },
    });

    if (deleted === 0) {
      return sendError(res, "Favorite not found", HTTP_STATUS.NOT_FOUND);
    }

    return sendSuccess(res, null, "Removed from favorites");
  } catch (error) {
    console.error("Failed to remove favorite", error);
    return sendError(
      res,
      "Failed to remove favorite",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// GET /api/favorites/check/:listingId - Check if a listing is favorited
router.get("/check/:listingId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listingId } = req.params;

    const favorite = await Favorite.findOne({
      where: { studentId: userId, listingId },
    });

    return sendSuccess(res, { isFavorite: !!favorite });
  } catch (error) {
    console.error("Failed to check favorite", error);
    return sendError(
      res,
      "Failed to check favorite",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

module.exports = router;
