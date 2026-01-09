const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require("../middleware/auth");
const {
    PropertyViewing,
    LandlordAvailability,
    User,
    PropertyListing,
    Notification,
    Listing,
} = require("../models");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");
const { Op } = require("sequelize");

// GET /api/viewings/availability/:landl ordId - Get landlord's available time slots
router.get("/availability/:landlordId", async (req, res) => {
    try {
        const { landlordId } = req.params;

        const availability = await LandlordAvailability.findAll({
            where: { landlordId, isActive: true },
            order: [["dayOfWeek", "ASC"], ["startTime", "ASC"]],
        });

        return sendSuccess(res, availability);
    } catch (error) {
        return sendError(
            res,
            "Failed to fetch availability",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/viewings/availability - Set/update availability (landlord only)
router.post(
    "/availability",
    authenticate,
    authorize(["Landlord", "SuperAdmin"]),
    async (req, res) => {
        try {
            const { slots } = req.body; // Array of {dayOfWeek, startTime, endTime}

            if (!Array.isArray(slots)) {
                return sendError(res, "Slots must be an array", HTTP_STATUS.BAD_REQUEST);
            }

            // Delete existing availability for this landlord
            await LandlordAvailability.destroy({
                where: { landlordId: req.user.id },
            });

            // Create new availability slots
            const newSlots = slots.map((slot) => ({
                landlordId: req.user.id,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: true,
            }));

            const created = await LandlordAvailability.bulkCreate(newSlots);

            return sendSuccess(res, created, "Availability updated successfully");
        } catch (error) {
            return sendError(
                res,
                "Failed to update availability",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// POST /api/viewings/book - Book a viewing (student only)
router.post(
    "/book",
    authenticate,
    authorize(["Student", "SuperAdmin", "Admin"]),
    async (req, res) => {
        try {
            const { propertyId, scheduledDate, scheduledTime, studentNotes } = req.body;

            if (!propertyId || !scheduledDate || !scheduledTime) {
                return sendError(
                    res,
                    "Property ID, date, and time are required",
                    HTTP_STATUS.BAD_REQUEST
                );
            }

            // Get property to find landlord
            const property = await PropertyListing.findByPk(propertyId, {
                include: [
                    {
                        model: Listing,
                        as: "listing",
                        attributes: ["ownerId"],
                    },
                ],
            });

            if (!property) {
                return sendError(res, "Property not found", HTTP_STATUS.NOT_FOUND);
            }

            const landlordId = property.listing.ownerId;

            // Check for double-booking
            const existing = await PropertyViewing.findOne({
                where: {
                    landlordId,
                    scheduledDate,
                    scheduledTime,
                    status: {
                        [Op.notIn]: ["cancelled", "completed"],
                    },
                },
            });

            if (existing) {
                return sendError(
                    res,
                    "This time slot is already booked",
                    HTTP_STATUS.CONFLICT
                );
            }

            // Create viewing
            const viewing = await PropertyViewing.create({
                propertyId,
                studentId: req.user.id,
                landlordId,
                scheduledDate,
                scheduledTime,
                studentNotes,
                status: "pending",
            });

            // Send notification to landlord
            await Notification.create({
                userId: landlordId,
                title: "New Viewing Request",
                message: `A student has requested to view your property on ${scheduledDate} at ${scheduledTime}`,
                relatedEntityType: "viewing",
                relatedEntityId: viewing.id,
                actionUrl: `/landlord/dashboard`,
                isRead: false,
            });

            return sendSuccess(res, viewing, "Viewing booked successfully");
        } catch (error) {
            console.error("Booking error:", error);
            return sendError(
                res,
                "Failed to book viewing",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// GET /api/viewings/my-bookings - Get user's viewing bookings
router.get("/my-bookings", authenticate, async (req, res) => {
    try {
        const isLandlord =
            req.user.role === "Landlord" || req.user.role === "SuperAdmin";

        const where = isLandlord
            ? { landlordId: req.user.id }
            : { studentId: req.user.id };

        const viewings = await PropertyViewing.findAll({
            where,
            include: [
                {
                    model: PropertyListing,
                    as: "property",
                    attributes: ["id", "city"],
                    include: [
                        {
                            model: Listing,
                            as: "listing",
                            attributes: ["title"],
                        },
                    ],
                },
                {
                    model: User,
                    as: "student",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "avatarUrl", "profilePictureUrl"],
                },
                {
                    model: User,
                    as: "landlord",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber", "avatarUrl", "profilePictureUrl"],
                },
            ],
            order: [["scheduledDate", "DESC"], ["scheduledTime", "DESC"]],
        });

        return sendSuccess(res, viewings);
    } catch (error) {
        return sendError(
            res,
            "Failed to fetch bookings",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// PUT /api/viewings/:id/status - Update viewing status (landlord or student)
router.put("/:id/status", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["confirmed", "cancelled", "completed", "no_show"].includes(status)) {
            return sendError(res, "Invalid status", HTTP_STATUS.BAD_REQUEST);
        }

        const viewing = await PropertyViewing.findByPk(id);

        if (!viewing) {
            return sendError(res, "Viewing not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check authorization
        if (
            viewing.landlordId !== req.user.id &&
            viewing.studentId !== req.user.id &&
            req.user.role !== "SuperAdmin"
        ) {
            return sendError(res, "Unauthorized", HTTP_STATUS.FORBIDDEN);
        }

        viewing.status = status;
        await viewing.save();

        // Send notification
        const recipientId =
            viewing.landlordId === req.user.id
                ? viewing.studentId
                : viewing.landlordId;

        const statusMessages = {
            confirmed: "Your viewing has been confirmed",
            cancelled: "Your viewing has been cancelled",
            completed: "The viewing has been marked as completed",
            no_show: "You were marked as no-show for the viewing",
        };

        await Notification.create({
            userId: recipientId,
            title: "Viewing Status Updated",
            message: statusMessages[status],
            relatedEntityType: "viewing",
            relatedEntityId: viewing.id,
            actionUrl: `/messages`,
            isRead: false,
        });

        return sendSuccess(res, viewing, "Viewing status updated");
    } catch (error) {
        return sendError(
            res,
            "Failed to update viewing",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// DELETE /api/viewings/:id - Cancel viewing
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        const viewing = await PropertyViewing.findByPk(id);

        if (!viewing) {
            return sendError(res, "Viewing not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check authorization
        if (
            viewing.landlordId !== req.user.id &&
            viewing.studentId !== req.user.id &&
            req.user.role !== "SuperAdmin"
        ) {
            return sendError(res, "Unauthorized", HTTP_STATUS.FORBIDDEN);
        }

        viewing.status = "cancelled";
        await viewing.save();

        // Send notification
        const recipientId =
            viewing.landlordId === req.user.id
                ? viewing.studentId
                : viewing.landlordId;

        await Notification.create({
            userId: recipientId,
            title: "Viewing Cancelled",
            message: `The viewing scheduled for ${viewing.scheduledDate} at ${viewing.scheduledTime} has been cancelled`,
            relatedEntityType: "viewing",
            relatedEntityId: viewing.id,
            actionUrl: `/messages`,
            isRead: false,
        });

        return sendSuccess(res, null, "Viewing cancelled");
    } catch (error) {
        return sendError(
            res,
            "Failed to cancel viewing",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

module.exports = router;
