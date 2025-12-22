const cron = require("node-cron");
const { Op } = require("sequelize");
const { PropertyListing, Listing, User, Notification } = require("../models");

/**
 * Check for properties expiring soon and send notifications to landlords
 * Runs daily at midnight
 */
const checkExpiringProperties = async () => {
    try {
        const now = new Date();

        // Calculate dates for 7 days and 1 day from now
        const sevenDaysFromNow = new Date(now);
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        sevenDaysFromNow.setHours(23, 59, 59, 999);

        const sevenDaysStart = new Date(sevenDaysFromNow);
        sevenDaysStart.setHours(0, 0, 0, 0);

        const oneDayFromNow = new Date(now);
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
        oneDayFromNow.setHours(23, 59, 59, 999);

        const oneDayStart = new Date(oneDayFromNow);
        oneDayStart.setHours(0, 0, 0, 0);

        // Find properties expiring in 7 days
        const propertiesExpiring7Days = await PropertyListing.findAll({
            where: {
                expiresAt: {
                    [Op.between]: [sevenDaysStart, sevenDaysFromNow]
                },
                isVisible: true
            },
            include: [
                {
                    model: Listing,
                    as: "listing",
                    attributes: ["id", "title", "ownerId"],
                    where: {
                        isActive: true,
                        isPublished: true
                    }
                }
            ]
        });

        // Find properties expiring in 1 day
        const propertiesExpiring1Day = await PropertyListing.findAll({
            where: {
                expiresAt: {
                    [Op.between]: [oneDayStart, oneDayFromNow]
                },
                isVisible: true
            },
            include: [
                {
                    model: Listing,
                    as: "listing",
                    attributes: ["id", "title", "ownerId"],
                    where: {
                        isActive: true,
                        isPublished: true
                    }
                }
            ]
        });

        // Send 7-day notifications
        for (const property of propertiesExpiring7Days) {
            if (!property.listing) continue;

            await Notification.create({
                userId: property.listing.ownerId,
                title: "Listing Expiring Soon",
                message: `Your listing "${property.listing.title}" will expire in 7 days. Renew it to keep it active.`,
                relatedEntityType: "property_listing",
                relatedEntityId: property.id,
                actionUrl: `/properties/${property.id}`,
                isRead: false
            });
        }

        // Send 1-day notifications  
        for (const property of propertiesExpiring1Day) {
            if (!property.listing) continue;

            await Notification.create({
                userId: property.listing.ownerId,
                title: "Listing Expires Tomorrow",
                message: `Your listing "${property.listing.title}" will expire tomorrow! Renew it now to avoid losing visibility.`,
                relatedEntityType: "property_listing",
                relatedEntityId: property.id,
                actionUrl: `/properties/${property.id}`,
                isRead: false
            });
        }

        console.log(`Expiration check complete: ${propertiesExpiring7Days.length} properties expiring in 7 days, ${propertiesExpiring1Day.length} expiring in 1 day`);
    } catch (error) {
        console.error("Error checking expiring properties:", error);
    }
};

/**
 * Initialize the scheduler
 */
const initScheduler = () => {
    // Run daily at midnight (00:00)
    cron.schedule("0 0 * * *", () => {
        console.log("Running daily property expiration check...");
        checkExpiringProperties();
    });

    console.log("Property expiration scheduler initialized");
};

module.exports = {
    initScheduler,
    checkExpiringProperties // Export for manual testing
};
