const express = require("express");
const { Op } = require("sequelize");
const {
  Listing,
  PropertyListing,
  ListingImage,
  User,
  University,
  Favorite,
} = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");
const { deleteFromCloudinary } = require("../middleware/upload");

const router = express.Router();

// GET /api/property-listings - List all property listings with filters
router.get("/", async (req, res) => {
  try {
    const {
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      universityId,
      city,
      minSquareFeet,
      maxSquareFeet,
      acceptsPartners,
      sortBy = "createdAt",
      sortOrder = "DESC",
      limit = 50,
      offset = 0,
    } = req.query;

    // Build PropertyListing where clause
    const propertyWhere = {};

    if (propertyType) {
      propertyWhere.propertyType = propertyType;
    }

    if (minPrice || maxPrice) {
      propertyWhere.pricePerMonth = {};
      if (minPrice) propertyWhere.pricePerMonth[Op.gte] = parseFloat(minPrice);
      if (maxPrice) propertyWhere.pricePerMonth[Op.lte] = parseFloat(maxPrice);
    }

    if (bedrooms) {
      propertyWhere.bedrooms = parseInt(bedrooms, 10);
    }

    if (bathrooms) {
      propertyWhere.bathrooms = parseInt(bathrooms, 10);
    }

    if (universityId) {
      propertyWhere.universityId = universityId;
    }

    if (city) {
      propertyWhere.city = { [Op.iLike]: `%${city}%` };
    }

    if (minSquareFeet || maxSquareFeet) {
      propertyWhere.squareFeet = {};
      if (minSquareFeet)
        propertyWhere.squareFeet[Op.gte] = parseInt(minSquareFeet, 10);
      if (maxSquareFeet)
        propertyWhere.squareFeet[Op.lte] = parseInt(maxSquareFeet, 10);
    }

    // Filter by accepts partners/roommates
    if (acceptsPartners === 'true' || acceptsPartners === true) {
      propertyWhere.amenitiesJson = {
        partner: true
      };
    }

    // Determine sort field - use PropertyListing fields for sorting to avoid subquery issues
    const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // First get the count
    const total = await PropertyListing.count({
      where: propertyWhere,
      include: [
        {
          model: Listing,
          as: "listing",
          where: { isActive: true, isPublished: true },
          required: true,
        },
      ],
    });

    // Then get the data with simpler query structure
    const properties = await PropertyListing.findAll({
      where: propertyWhere,
      include: [
        {
          model: Listing,
          as: "listing",
          where: { isActive: true, isPublished: true },
          required: true,
          include: [
            {
              model: ListingImage,
              as: "images",
              required: false,
              separate: true,
            },
            {
              model: User,
              as: "owner",
              attributes: ["id", "firstName", "lastName", "avatarUrl", "role"],
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
      order: [[sortBy === "createdAt" ? "createdAt" : sortBy, order]],
      limit: Math.min(parseInt(limit, 10), 100),
      offset: parseInt(offset, 10),
      subQuery: false, // Disable subquery to fix the FROM clause issue
    });

    // Transform response - handle potential null values safely
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
        availableFrom: prop.availableFrom,
        availableUntil: prop.availableUntil,
        images: listing.images || [],
        owner: listing.owner || null,
        university: prop.University || null,
        viewCount: listing.viewCount || 0,
        createdAt: listing.createdAt || prop.createdAt,
        updatedAt: listing.updatedAt || prop.updatedAt,
      };
    });

    return sendSuccess(res, {
      listings,
      total,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
  } catch (error) {
    console.error("Failed to fetch property listings", error);
    return sendError(
      res,
      "Failed to fetch property listings",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// GET /api/property-listings/filters/options - Get available filter options
// IMPORTANT: This route must come before /:id to avoid "filters" being treated as an ID
router.get("/filters/options", async (req, res) => {
  try {
    // Default values if no listings exist
    const defaultOptions = {
      propertyTypes: ["Apartment", "House", "Room", "Studio"],
      priceRange: { min: 0, max: 10000 },
      bedrooms: [1, 2, 3, 4, 5],
      bathrooms: [1, 2, 3],
      cities: [],
    };

    // Check if any listings exist
    const count = await PropertyListing.count();
    if (count === 0) {
      return sendSuccess(res, defaultOptions);
    }

    // Get distinct property types
    const propertyTypes = await PropertyListing.findAll({
      attributes: [[PropertyListing.sequelize.fn("DISTINCT", PropertyListing.sequelize.col("property_type")), "propertyType"]],
      raw: true,
    });

    // Get price range
    const priceRange = await PropertyListing.findOne({
      attributes: [
        [PropertyListing.sequelize.fn("MIN", PropertyListing.sequelize.col("price_per_month")), "minPrice"],
        [PropertyListing.sequelize.fn("MAX", PropertyListing.sequelize.col("price_per_month")), "maxPrice"],
      ],
      raw: true,
    });

    // Get bedroom options
    const bedroomOptions = await PropertyListing.findAll({
      attributes: [[PropertyListing.sequelize.fn("DISTINCT", PropertyListing.sequelize.col("bedrooms")), "bedrooms"]],
      order: [["bedrooms", "ASC"]],
      raw: true,
    });

    // Get bathroom options
    const bathroomOptions = await PropertyListing.findAll({
      attributes: [[PropertyListing.sequelize.fn("DISTINCT", PropertyListing.sequelize.col("bathrooms")), "bathrooms"]],
      order: [["bathrooms", "ASC"]],
      raw: true,
    });

    // Get cities
    const cities = await PropertyListing.findAll({
      attributes: [[PropertyListing.sequelize.fn("DISTINCT", PropertyListing.sequelize.col("city")), "city"]],
      where: { city: { [Op.and]: [{ [Op.ne]: "" }, { [Op.ne]: null }] } },
      raw: true,
    });

    return sendSuccess(res, {
      propertyTypes: propertyTypes.map((p) => p.propertyType).filter(Boolean).length
        ? propertyTypes.map((p) => p.propertyType).filter(Boolean)
        : defaultOptions.propertyTypes,
      priceRange: {
        min: parseFloat(priceRange?.minPrice) || 0,
        max: parseFloat(priceRange?.maxPrice) || 10000,
      },
      bedrooms: bedroomOptions.map((b) => b.bedrooms).filter((v) => v != null).length
        ? bedroomOptions.map((b) => b.bedrooms).filter((v) => v != null)
        : defaultOptions.bedrooms,
      bathrooms: bathroomOptions.map((b) => b.bathrooms).filter((v) => v != null).length
        ? bathroomOptions.map((b) => b.bathrooms).filter((v) => v != null)
        : defaultOptions.bathrooms,
      cities: cities.map((c) => c.city).filter(Boolean),
    });
  } catch (error) {
    console.error("Failed to fetch filter options", error);
    return sendError(
      res,
      "Failed to fetch filter options",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// GET /api/property-listings/my-listings - Get current user's listings
// IMPORTANT: This route must come before /:id to avoid "my-listings" being treated as an ID
router.get(
  "/my-listings",
  authenticate,
  authorize(["SuperAdmin", "Landlord"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const isSuperAdmin = req.user.role === "SuperAdmin";

      // Build where clause for Listing
      const listingWhere = { ownerId: userId };

      // SuperAdmins can see all listings
      if (isSuperAdmin) {
        delete listingWhere.ownerId;
      }

      const properties = await PropertyListing.findAll({
        include: [
          {
            model: Listing,
            as: "listing",
            where: listingWhere,
            required: true,
            include: [
              {
                model: ListingImage,
                as: "images",
                required: false,
                separate: true,
              },
              {
                model: User,
                as: "owner",
                attributes: ["id", "firstName", "lastName", "avatarUrl", "role"],
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
        order: [["createdAt", "DESC"]],
      });

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
          availableFrom: prop.availableFrom,
          availableUntil: prop.availableUntil,
          images: listing.images || [],
          owner: listing.owner || null,
          university: prop.University || null,
          isActive: listing.isActive,
          isPublished: listing.isPublished,
          viewCount: listing.viewCount || 0,
          createdAt: listing.createdAt || prop.createdAt,
          updatedAt: listing.updatedAt || prop.updatedAt,
        };
      });

      return sendSuccess(res, { listings, total: listings.length });
    } catch (error) {
      console.error("Failed to fetch user listings", error);
      return sendError(
        res,
        "Failed to fetch your listings",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

// GET /api/property-listings/:id - Get single property listing
// Optional authentication to check if viewer is the owner
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Try to get user from token if present (optional auth)
    let currentUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1];
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        currentUserId = decoded.id;
      } catch (err) {
        // Token invalid or expired - continue without user
      }
    }

    const property = await PropertyListing.findByPk(id, {
      include: [
        {
          model: Listing,
          as: "listing",
          include: [
            {
              model: ListingImage,
              as: "images",
            },
            {
              model: User,
              as: "owner",
              attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role", "phoneNumber"],
            },
          ],
        },
        {
          model: University,
          attributes: ["id", "name", "city"],
        },
      ],
    });

    if (!property) {
      return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
    }

    // Only increment view count if viewer is NOT the owner
    const isOwner = currentUserId && property.listing.ownerId === currentUserId;
    if (!isOwner) {
      await Listing.increment("viewCount", {
        where: { id: property.listingId },
      });
    }

    const result = {
      id: property.id,
      listingId: property.listingId,
      title: property.listing.title,
      description: property.listing.description,
      propertyType: property.propertyType,
      pricePerMonth: parseFloat(property.pricePerMonth),
      currency: property.currency,
      city: property.city,
      latitude: property.latitude,
      longitude: property.longitude,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      squareFeet: property.squareFeet,
      amenitiesJson: property.amenitiesJson,
      distanceToUniversity: property.distanceToUniversity,
      leaseDuration: property.leaseDuration,
      availableFrom: property.availableFrom,
      availableUntil: property.availableUntil,
      images: property.listing.images || [],
      owner: property.listing.owner,
      university: property.University,
      viewCount: property.listing.viewCount + (isOwner ? 0 : 1),
      createdAt: property.listing.createdAt,
      updatedAt: property.listing.updatedAt,
    };

    return sendSuccess(res, result);
  } catch (error) {
    console.error("Failed to fetch property listing", error);
    return sendError(
      res,
      "Failed to fetch property listing",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
});

// PUT /api/property-listings/:id - Update a property listing
router.put(
  "/:id",
  authenticate,
  authorize(["SuperAdmin", "Landlord"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isSuperAdmin = req.user.role === "SuperAdmin";

      const property = await PropertyListing.findByPk(id, {
        include: [{ model: Listing, as: "listing" }],
      });

      if (!property) {
        return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
      }

      // Check ownership (superadmins can edit any)
      if (!isSuperAdmin && property.listing.ownerId !== userId) {
        return sendError(res, "Not authorized to edit this listing", HTTP_STATUS.FORBIDDEN);
      }

      const {
        title,
        description,
        propertyType,
        pricePerMonth,
        currency,
        bedrooms,
        bathrooms,
        squareFeet,
        amenitiesJson,
        distanceToUniversity,
        availableFrom,
        availableUntil,
        leaseDuration,
        images,
      } = req.body;

      const transaction = await Listing.sequelize.transaction();

      try {
        // Update Listing
        if (title || description) {
          await Listing.update(
            {
              ...(title && { title }),
              ...(description && { description }),
            },
            { where: { id: property.listingId }, transaction }
          );
        }

        // Update PropertyListing
        const propertyUpdates = {};
        if (propertyType) propertyUpdates.propertyType = propertyType;
        if (pricePerMonth) propertyUpdates.pricePerMonth = pricePerMonth;
        if (currency) propertyUpdates.currency = currency;
        if (bedrooms) propertyUpdates.bedrooms = bedrooms;
        if (bathrooms) propertyUpdates.bathrooms = bathrooms;
        if (squareFeet) propertyUpdates.squareFeet = squareFeet;
        if (amenitiesJson !== undefined) propertyUpdates.amenitiesJson = amenitiesJson;
        if (distanceToUniversity) propertyUpdates.distanceToUniversity = distanceToUniversity;
        if (availableFrom) propertyUpdates.availableFrom = availableFrom;
        if (availableUntil !== undefined) propertyUpdates.availableUntil = availableUntil;
        if (leaseDuration) propertyUpdates.leaseDuration = leaseDuration;

        if (Object.keys(propertyUpdates).length > 0) {
          await PropertyListing.update(propertyUpdates, {
            where: { id },
            transaction,
          });
        }

        // Update images if provided
        if (Array.isArray(images)) {
          // Delete existing images
          await ListingImage.destroy({
            where: { listingId: property.listingId },
            transaction,
          });

          // Create new images
          if (images.length > 0) {
            const filteredImages = images.filter(
              (url) => typeof url === "string" && url.trim()
            ).slice(0, 10);

            const payload = filteredImages.map((url, index) => ({
              url: url.trim(),
              isPrimary: index === 0,
              displayOrder: index,
              listingId: property.listingId,
            }));

            if (payload.length) {
              await ListingImage.bulkCreate(payload, { transaction });
            }
          }
        }

        await transaction.commit();

        return sendSuccess(res, { message: "Listing updated successfully" });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error("Failed to update property listing", error);
      return sendError(
        res,
        "Failed to update listing",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

// PATCH /api/property-listings/:id/toggle-visibility - Toggle listing visibility
router.patch(
  "/:id/toggle-visibility",
  authenticate,
  authorize(["SuperAdmin", "Landlord"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isSuperAdmin = req.user.role === "SuperAdmin";

      const property = await PropertyListing.findByPk(id, {
        include: [{ model: Listing, as: "listing" }],
      });

      if (!property) {
        return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
      }

      // Check ownership
      if (!isSuperAdmin && property.listing.ownerId !== userId) {
        return sendError(res, "Not authorized", HTTP_STATUS.FORBIDDEN);
      }

      // Toggle isPublished
      const newStatus = !property.listing.isPublished;
      await Listing.update(
        { isPublished: newStatus },
        { where: { id: property.listingId } }
      );

      return sendSuccess(res, {
        message: newStatus ? "Listing is now visible" : "Listing is now hidden",
        isPublished: newStatus,
      });
    } catch (error) {
      console.error("Failed to toggle listing visibility", error);
      return sendError(
        res,
        "Failed to toggle visibility",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

// DELETE /api/property-listings/:id - Delete a property listing
router.delete(
  "/:id",
  authenticate,
  authorize(["SuperAdmin", "Landlord"]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const isSuperAdmin = req.user.role === "SuperAdmin";

      const property = await PropertyListing.findByPk(id, {
        include: [{ model: Listing, as: "listing" }],
      });

      if (!property) {
        return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
      }

      // Check ownership
      if (!isSuperAdmin && property.listing.ownerId !== userId) {
        return sendError(res, "Not authorized to delete this listing", HTTP_STATUS.FORBIDDEN);
      }

      const transaction = await Listing.sequelize.transaction();

      try {
        // Get all images before deletion to delete from Cloudinary
        const images = await ListingImage.findAll({
          where: { listingId: property.listingId },
          attributes: ['url', 'publicId'],
        });

        // Delete images from Cloudinary
        for (const image of images) {
          try {
            let publicId = image.publicId;

            if (!publicId && image.url) {
              // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{filename}.{ext}
              const url = image.url;
              const uploadIndex = url.indexOf('/upload/');
              if (uploadIndex !== -1) {
                let pathAfterUpload = url.substring(uploadIndex + 8);
                pathAfterUpload = pathAfterUpload.replace(/^v\d+\//, '');
                publicId = pathAfterUpload.substring(0, pathAfterUpload.lastIndexOf('.'));
              }
            }

            if (!publicId) {
              console.warn(`No publicId for image, skipping Cloudinary deletion: ${image.url}`);
              continue;
            }

            console.log(`Attempting to delete from Cloudinary: ${publicId}`);
            const result = await deleteFromCloudinary(publicId);
            console.log(`✅ Deleted image from Cloudinary: ${publicId}`, result);
          } catch (cloudinaryError) {
            console.error('❌ Failed to delete image from Cloudinary:', cloudinaryError.message);
            // Continue with deletion even if Cloudinary fails
          }
        }

        // Delete image records from database
        await ListingImage.destroy({
          where: { listingId: property.listingId },
          transaction,
        });

        // Delete favorites
        await Favorite.destroy({
          where: { listingId: property.listingId },
          transaction,
        });

        // Delete property listing
        await PropertyListing.destroy({
          where: { id },
          transaction,
        });

        // Delete base listing
        await Listing.destroy({
          where: { id: property.listingId },
          transaction,
        });

        await transaction.commit();

        return sendSuccess(res, { message: "Listing deleted successfully" });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error("Failed to delete property listing", error);
      return sendError(
        res,
        "Failed to delete listing",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

router.post(
  "/",
  authenticate,
  authorize(["SuperAdmin", "Landlord"]),
  async (req, res) => {
    const {
      title,
      description,
      propertyType,
      pricePerMonth,
      currency = "NIS",
      latitude,
      longitude,
      bedrooms,
      bathrooms,
      squareFeet,
      amenitiesJson,
      distanceToUniversity,
      availableFrom,
      availableUntil,
      leaseDuration,
      universityId,
      images,
    } = req.body;

    const allowedCurrencies = ["NIS", "JOD"];
    const normalizedCurrency = (currency || "NIS").toString().toUpperCase();

    if (!allowedCurrencies.includes(normalizedCurrency)) {
      return sendError(
        res,
        "Currency must be JOD or NIS",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (
      !title ||
      !description ||
      !propertyType ||
      !pricePerMonth ||
      !bedrooms ||
      !bathrooms ||
      !squareFeet ||
      !distanceToUniversity ||
      !leaseDuration ||
      !universityId
    ) {
      return sendError(res, "Missing required fields", HTTP_STATUS.BAD_REQUEST);
    }

    if (Array.isArray(images) && images.length > 10) {
      return sendError(
        res,
        "Maximum 10 images per listing",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const transaction = await Listing.sequelize.transaction();

    try {
      const university = await require("../models").University.findByPk(
        universityId
      );
      if (!university) {
        throw new Error("University not found");
      }

      const listing = await Listing.create(
        {
          type: "Property",
          title,
          description,
          ownerId: req.user.id,
          isPublished: true,
          isActive: true,
        },
        { transaction }
      );

      const property = await PropertyListing.create(
        {
          listingId: listing.id,
          propertyType,
          pricePerMonth,
          currency: normalizedCurrency,
          city: university.city || "",
          latitude,
          longitude,
          bedrooms,
          bathrooms,
          squareFeet,
          amenitiesJson,
          distanceToUniversity,
          availableFrom,
          availableUntil,
          leaseDuration,
          universityId,
        },
        { transaction }
      );

      let createdImages = [];
      if (Array.isArray(images) && images.length > 0) {
        // Filter valid images - accept both strings and objects with url property
        const filteredRaw = images.filter((img) => {
          if (typeof img === "string") return img.trim();
          if (typeof img === "object" && img.url) return img.url.trim();
          return false;
        });

        if (filteredRaw.length > 10) {
          throw new Error("Maximum 10 images per listing");
        }

        const payload = filteredRaw.map((imgData, index) => {
          const url = typeof imgData === 'string' ? imgData : imgData.url;
          const is360 = typeof imgData === 'object' && imgData.is360 === true;
          const publicId = typeof imgData === 'object' ? imgData.publicId : null;

          return {
            url: url.trim(),
            is360: is360,
            publicId: publicId,
            isPrimary: index === 0,
            displayOrder: index,
            listingId: listing.id,
          };
        });

        if (payload.length) {
          createdImages = await ListingImage.bulkCreate(payload, {
            transaction,
          });
        }
      }

      await transaction.commit();

      return sendSuccess(
        res,
        { listing, property, images: createdImages },
        "Property listing created",
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      await transaction.rollback();
      console.error("Failed to create property listing", error);
      return sendError(
        res,
        "Failed to create property listing",
        HTTP_STATUS.SERVER_ERROR,
        error
      );
    }
  }
);

module.exports = router;
