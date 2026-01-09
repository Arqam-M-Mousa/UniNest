const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const { PropertyListing, PriceHistory, Listing } = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// GET /api/analytics/market/city/:city - Get average prices by city
router.get(
    "/city/:city",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            const { city } = req.params;

            // Get visible properties in this city
            const properties = await PropertyListing.findAll({
                where: {
                    city: { [Op.iLike]: city },
                },
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        where: { isVisible: true },
                        attributes: [],
                    },
                ],
                attributes: [
                    "propertyType",
                    [sequelize.fn("AVG", sequelize.col("price_per_month")), "avgPrice"],
                    [sequelize.fn("COUNT", sequelize.col("PropertyListing.id")), "count"],
                ],
                group: ["propertyType", "PropertyListing.id"],
                raw: true,
            });

            // Calculate overall average
            const overallAvg = await PropertyListing.findAll({
                where: { city: { [Op.iLike]: city } },
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        where: { isVisible: true },
                        attributes: [],
                    },
                ],
                attributes: [
                    [sequelize.fn("AVG", sequelize.col("price_per_month")), "avgPrice"],
                    [sequelize.fn("COUNT", sequelize.col("PropertyListing.id")), "count"],
                ],
                raw: true,
            });

            return sendSuccess(res, {
                city,
                byPropertyType: properties,
                overall: overallAvg[0],
            });
        } catch (error) {
            return sendError(
                res,
                "Failed to fetch city analytics",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// GET /api/analytics/market/university/:id - Get prices near university
router.get(
    "/university/:id",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const properties = await PropertyListing.findAll({
                where: { universityId: id },
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        where: { isVisible: true },
                        attributes: [],
                    },
                ],
                attributes: [
                    "propertyType",
                    [sequelize.fn("AVG", sequelize.col("price_per_month")), "avgPrice"],
                    [
                        sequelize.fn("AVG", sequelize.col("distance_to_university")),
                        "avgDistance",
                    ],
                    [sequelize.fn("COUNT", sequelize.col("PropertyListing.id")), "count"],
                ],
                group: ["propertyType", "PropertyListing.id"],
                raw: true,
            });

            return sendSuccess(res, properties);
        } catch (error) {
            return sendError(
                res,
                "Failed to fetch university analytics",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// GET /api/analytics/market/trends - Get overall market trends
router.get(
    "/trends",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            // Get price changes from last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            const priceHistory = await PriceHistory.findAll({
                where: {
                    recordedAt: { [Op.gte]: sixMonthsAgo },
                },
                attributes: [
                    [
                        sequelize.fn(
                            "DATE_TRUNC",
                            "month",
                            sequelize.col("recorded_at")
                        ),
                        "month",
                    ],
                    [sequelize.fn("AVG", sequelize.col("price")), "avgPrice"],
                    [sequelize.fn("COUNT", sequelize.col("id")), "priceChanges"],
                ],
                group: [
                    sequelize.fn("DATE_TRUNC", "month", sequelize.col("recorded_at")),
                ],
                order: [
                    [
                        sequelize.fn("DATE_TRUNC", "month", sequelize.col("recorded_at")),
                        "ASC",
                    ],
                ],
                raw: true,
            });

            return sendSuccess(res, priceHistory);
        } catch (error) {
            return sendError(
                res,
                "Failed to fetch market trends",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

module.exports = router;
