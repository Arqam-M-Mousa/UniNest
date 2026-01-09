const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
    PropertyListing,
    PropertyAnalytics,
    PropertyViewing,
    Conversation,
    Listing,
} = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// GET /api/analytics/landlord/overview - Get landlord's overall analytics summary
router.get(
    "/overview",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            // Get all landlord's properties
            const properties = await PropertyListing.findAll({
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        where: { ownerId: req.user.id },
                        attributes: ["id"],
                    },
                ],
                attributes: ["id"],
            });

            const propertyIds = properties.map((p) => p.id);

            if (propertyIds.length === 0) {
                return sendSuccess(res, {
                    totalViews: 0,
                    totalFavorites: 0,
                    totalInquiries: 0,
                    upcomingViewings: 0,
                    propertiesCount: 0,
                });
            }

            // Get analytics for last 30 days
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const analytics = await PropertyAnalytics.findAll({
                where: {
                    propertyId: { [Op.in]: propertyIds },
                    date: { [Op.gte]: last30Days },
                },
                attributes: [
                    [sequelize.fn("SUM", sequelize.col("views")), "totalViews"],
                    [sequelize.fn("SUM", sequelize.col("favorites")), "totalFavorites"],
                    [sequelize.fn("SUM", sequelize.col("inquiries")), "totalInquiries"],
                ],
                raw: true,
            });

            // Get upcoming viewings count
            const upcomingViewings = await PropertyViewing.count({
                where: {
                    landlordId: req.user.id,
                    scheduledDate: { [Op.gte]: new Date() },
                    status: { [Op.in]: ["pending", "confirmed"] },
                },
            });

            return sendSuccess(res, {
                totalViews: parseInt(analytics[0]?.totalViews || 0),
                totalFavorites: parseInt(analytics[0]?.totalFavorites || 0),
                totalInquiries: parseInt(analytics[0]?.totalInquiries || 0),
                upcomingViewings,
                propertiesCount: propertyIds.length,
            });
        } catch (error) {
            console.error("Analytics overview error:", error);
            return sendError(
                res,
                "Failed to fetch analytics",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// GET /api/analytics/landlord/property/:id - Get property-specific analytics
router.get(
    "/property/:id",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            const { id } = req.params;

            // Verify ownership
            const property = await PropertyListing.findOne({
                where: { id },
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        where: { ownerId: req.user.id },
                        attributes: ["id", "title"],
                    },
                ],
            });

            if (!property) {
                return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
            }

            // Get analytics for last 30 days
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const analytics = await PropertyAnalytics.findAll({
                where: {
                    propertyId: id,
                    date: { [Op.gte]: last30Days },
                },
                order: [["date", "ASC"]],
            });

            // Get totals
            const totals = await PropertyAnalytics.findAll({
                where: {
                    propertyId: id,
                    date: { [Op.gte]: last30Days },
                },
                attributes: [
                    [sequelize.fn("SUM", sequelize.col("views")), "totalViews"],
                    [sequelize.fn("SUM", sequelize.col("favorites")), "totalFavorites"],
                    [sequelize.fn("SUM", sequelize.col("inquiries")), "totalInquiries"],
                ],
                raw: true,
            });

            return sendSuccess(res, {
                property: {
                    id: property.id,
                    title: property.listing.title,
                },
                daily: analytics,
                totals: {
                    views: parseInt(totals[0]?.totalViews || 0),
                    favorites: parseInt(totals[0]?.totalFavorites || 0),
                    inquiries: parseInt(totals[0]?.totalInquiries || 0),
                },
            });
        } catch (error) {
            return sendError(
                res,
                "Failed to fetch property analytics",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// GET /api/analytics/landlord/trends - Get time-series data for charts
router.get(
    "/trends",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            // Get all landlord's properties
            const properties = await PropertyListing.findAll({
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        where: { ownerId: req.user.id },
                        attributes: ["id"],
                    },
                ],
                attributes: ["id"],
            });

            const propertyIds = properties.map((p) => p.id);

            if (propertyIds.length === 0) {
                return sendSuccess(res, []);
            }

            // Get analytics for last 30 days, grouped by date
            const last30Days = new Date();
            last30Days.setDate(last30Days.getDate() - 30);

            const analytics = await PropertyAnalytics.findAll({
                where: {
                    propertyId: { [Op.in]: propertyIds },
                    date: { [Op.gte]: last30Days },
                },
                attributes: [
                    "date",
                    [sequelize.fn("SUM", sequelize.col("views")), "views"],
                    [sequelize.fn("SUM", sequelize.col("favorites")), "favorites"],
                    [sequelize.fn("SUM", sequelize.col("inquiries")), "inquiries"],
                ],
                group: ["date"],
                order: [["date", "ASC"]],
                raw: true,
            });

            return sendSuccess(res, analytics);
        } catch (error) {
            return sendError(
                res,
                "Failed to fetch trends",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

module.exports = router;
