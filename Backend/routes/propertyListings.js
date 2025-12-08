const express = require("express");
const { Listing, PropertyListing, ListingImage } = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize(["Admin", "Landlord"]),
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
        const filteredRaw = images.filter(
          (url) => typeof url === "string" && url.trim()
        );

        if (filteredRaw.length > 10) {
          throw new Error("Maximum 10 images per listing");
        }

        const payload = filteredRaw.map((url, index) => ({
          url: url.trim(),
          isPrimary: index === 0,
          displayOrder: index,
          listingId: listing.id,
        }));

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
