const express = require("express");
const { Op } = require("sequelize");
const {
    Review,
    ReviewHelpful,
    User,
    PropertyListing,
    Listing,
} = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

// GET /api/reviews/property/:propertyId - Get all reviews for a property
router.get("/property/:propertyId", async (req, res) => {
    try {
        const { propertyId } = req.params;
        const { sortBy = "createdAt", sortOrder = "DESC" } = req.query;

        // First get the listing ID from property
        const property = await PropertyListing.findByPk(propertyId);
        if (!property) {
            return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
        }

        const reviews = await Review.findAll({
            where: {
                listingId: property.listingId,
                targetType: "Listing",
            },
            include: [
                {
                    model: User,
                    as: "student",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl"],
                },
                {
                    model: ReviewHelpful,
                    as: "helpfulVotes",
                    attributes: ["id", "userId"],
                },
            ],
            order: [[sortBy, sortOrder.toUpperCase()]],
        });

        const reviewsWithCounts = reviews.map((review) => ({
            ...review.toJSON(),
            helpfulCount: review.helpfulVotes ? review.helpfulVotes.length : 0,
        }));

        return sendSuccess(res, { reviews: reviewsWithCounts });
    } catch (error) {
        console.error("Failed to fetch property reviews", error);
        return sendError(
            res,
            "Failed to fetch property reviews",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// GET /api/reviews/landlord/:landlordId - Get all reviews for a landlord
router.get("/landlord/:landlordId", async (req, res) => {
    try {
        const { landlordId } = req.params;
        const { sortBy = "createdAt", sortOrder = "DESC" } = req.query;

        const reviews = await Review.findAll({
            where: {
                landlordId,
                targetType: "Landlord",
            },
            include: [
                {
                    model: User,
                    as: "student",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl"],
                },
                {
                    model: ReviewHelpful,
                    as: "helpfulVotes",
                    attributes: ["id", "userId"],
                },
            ],
            order: [[sortBy, sortOrder.toUpperCase()]],
        });

        const reviewsWithCounts = reviews.map((review) => ({
            ...review.toJSON(),
            helpfulCount: review.helpfulVotes ? review.helpfulVotes.length : 0,
        }));

        return sendSuccess(res, { reviews: reviewsWithCounts });
    } catch (error) {
        console.error("Failed to fetch landlord reviews", error);
        return sendError(
            res,
            "Failed to fetch landlord reviews",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// GET /api/reviews/stats/:targetType/:targetId - Get review statistics
router.get("/stats/:targetType/:targetId", async (req, res) => {
    try {
        const { targetType, targetId } = req.params;

        let where = { targetType };

        if (targetType === "Listing") {
            // Get property and then its listing ID
            const property = await PropertyListing.findByPk(targetId);
            if (!property) {
                return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
            }
            where.listingId = property.listingId;
        } else if (targetType === "Landlord") {
            where.landlordId = targetId;
        } else {
            return sendError(res, "Invalid target type", HTTP_STATUS.BAD_REQUEST);
        }

        const reviews = await Review.findAll({ where, attributes: ["rating"] });

        if (reviews.length === 0) {
            return sendSuccess(res, {
                count: 0,
                averageRating: 0,
                distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        }

        const total = reviews.reduce((sum, r) => sum + r.rating, 0);
        const averageRating = (total / reviews.length).toFixed(1);

        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((r) => {
            distribution[r.rating]++;
        });

        return sendSuccess(res, {
            count: reviews.length,
            averageRating: parseFloat(averageRating),
            distribution,
        });
    } catch (error) {
        console.error("Failed to fetch review stats", error);
        return sendError(
            res,
            "Failed to fetch review stats",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/reviews - Create new review
router.post("/", authenticate, authorize(["Student"]), async (req, res) => {
    try {
        const {
            targetType,
            targetId, // propertyId or landlordId
            rating,
            title,
            comment,
            pros,
            cons,
        } = req.body;
        const studentId = req.user.id;

        if (!targetType || !rating || !comment) {
            return sendError(
                res,
                "Target type, rating, and comment are required",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        if (rating < 1 || rating > 5) {
            return sendError(
                res,
                "Rating must be between 1 and 5",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        let reviewData = {
            studentId,
            targetType,
            rating,
            title,
            comment,
            pros,
            cons,
        };

        if (targetType === "Listing") {
            // Get property and then its listing ID
            const property = await PropertyListing.findByPk(targetId);
            if (!property) {
                return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
            }
            reviewData.listingId = property.listingId;
            reviewData.landlordId = null;
        } else if (targetType === "Landlord") {
            reviewData.landlordId = targetId;
            reviewData.listingId = null;
        } else {
            return sendError(res, "Invalid target type", HTTP_STATUS.BAD_REQUEST);
        }

        // Check if user already reviewed this target
        const existingReview = await Review.findOne({
            where: {
                studentId,
                targetType,
                ...(targetType === "Listing" && { listingId: reviewData.listingId }),
                ...(targetType === "Landlord" && { landlordId: reviewData.landlordId }),
            },
        });

        if (existingReview) {
            return sendError(
                res,
                "You have already reviewed this",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const review = await Review.create(reviewData);

        const fullReview = await Review.findByPk(review.id, {
            include: [
                {
                    model: User,
                    as: "student",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl"],
                },
            ],
        });

        return sendSuccess(res, fullReview, HTTP_STATUS.CREATED);
    } catch (error) {
        console.error("Failed to create review", error);
        return sendError(
            res,
            "Failed to create review",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// PUT /api/reviews/:id - Update own review
router.put("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, title, comment, pros, cons } = req.body;
        const userId = req.user.id;

        const review = await Review.findByPk(id);

        if (!review) {
            return sendError(res, "Review not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user is the author
        if (review.studentId !== userId) {
            return sendError(
                res,
                "Not authorized to edit this review",
                HTTP_STATUS.FORBIDDEN
            );
        }

        await review.update({
            ...(rating && { rating }),
            ...(title !== undefined && { title }),
            ...(comment && { comment }),
            ...(pros !== undefined && { pros }),
            ...(cons !== undefined && { cons }),
        });

        const updatedReview = await Review.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "student",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl"],
                },
            ],
        });

        return sendSuccess(res, updatedReview);
    } catch (error) {
        console.error("Failed to update review", error);
        return sendError(
            res,
            "Failed to update review",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// DELETE /api/reviews/:id - Delete own review or admin delete
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);

        const review = await Review.findByPk(id);

        if (!review) {
            return sendError(res, "Review not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user is author or admin
        if (review.studentId !== userId && !isAdmin) {
            return sendError(
                res,
                "Not authorized to delete this review",
                HTTP_STATUS.FORBIDDEN
            );
        }

        await review.destroy();

        return sendSuccess(res, { message: "Review deleted successfully" });
    } catch (error) {
        console.error("Failed to delete review", error);
        return sendError(
            res,
            "Failed to delete review",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/reviews/:id/helpful - Toggle helpful vote on review
router.post("/:id/helpful", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const review = await Review.findByPk(id);

        if (!review) {
            return sendError(res, "Review not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user already voted helpful
        const existingVote = await ReviewHelpful.findOne({
            where: { reviewId: id, userId },
        });

        let voted = false;
        if (existingVote) {
            // Remove vote
            await existingVote.destroy();
            voted = false;
        } else {
            // Add vote
            await ReviewHelpful.create({ reviewId: id, userId });
            voted = true;
        }

        // Get updated count
        const helpfulCount = await ReviewHelpful.count({ where: { reviewId: id } });

        return sendSuccess(res, { voted, helpfulCount });
    } catch (error) {
        console.error("Failed to toggle helpful vote", error);
        return sendError(
            res,
            "Failed to toggle helpful vote",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

module.exports = router;
