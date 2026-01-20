const { User, Listing, Notification } = require("../models");

/**
 * Seed notifications for users
 */
const seedNotifications = async () => {
    try {
        // Get all users
        const users = await User.findAll();

        if (users.length === 0) {
            console.log("No users found. Please run user seeds first.");
            return;
        }

        // Get listings for reference
        const listings = await Listing.findAll();

        const notificationTemplates = [
            // Message notifications
            {
                title: "New Message",
                message: "You have a new message from a potential tenant interested in your property.",
                relatedEntityType: "Message",
            },
            {
                title: "New Message",
                message: "The landlord has responded to your inquiry about the apartment.",
                relatedEntityType: "Message",
            },
            // Review notifications
            {
                title: "New Review",
                message: "Someone left a review on your property listing. Check it out!",
                relatedEntityType: "Review",
            },
            {
                title: "Review Response",
                message: "The landlord has responded to your review.",
                relatedEntityType: "Review",
            },
            // Listing notifications
            {
                title: "Listing Expiring Soon",
                message: "Your property listing will expire in 3 days. Renew it to keep it visible.",
                relatedEntityType: "Listing",
            },
            {
                title: "Price Drop Alert",
                message: "A property you favorited has reduced its price!",
                relatedEntityType: "Listing",
            },
            {
                title: "New Listing Match",
                message: "A new property matching your preferences has been listed.",
                relatedEntityType: "Listing",
            },
            // Roommate notifications
            {
                title: "New Roommate Match",
                message: "You have a new potential roommate match! Check their profile.",
                relatedEntityType: "RoommateMatch",
            },
            {
                title: "Roommate Request",
                message: "Someone is interested in being your roommate. View their profile.",
                relatedEntityType: "RoommateMatch",
            },
            // Forum notifications
            {
                title: "New Comment",
                message: "Someone commented on your forum post.",
                relatedEntityType: "ForumPost",
            },
            {
                title: "Post Liked",
                message: "Your forum post received 10 likes!",
                relatedEntityType: "ForumPost",
            },
            // Viewing notifications
            {
                title: "Viewing Confirmed",
                message: "Your property viewing has been confirmed for Saturday at 11am.",
                relatedEntityType: "PropertyViewing",
            },
            {
                title: "Viewing Reminder",
                message: "Reminder: You have a property viewing scheduled for tomorrow.",
                relatedEntityType: "PropertyViewing",
            },
            // System notifications
            {
                title: "Welcome to UniNest!",
                message: "Welcome to UniNest! Complete your profile to get better recommendations.",
                relatedEntityType: "User",
            },
            {
                title: "Profile Incomplete",
                message: "Your profile is 70% complete. Add more details to improve your matches.",
                relatedEntityType: "User",
            },
            {
                title: "Verification Approved",
                message: "Your identity verification has been approved. You now have a verified badge!",
                relatedEntityType: "User",
            },
        ];

        let notificationCount = 0;

        for (const user of users) {
            // Create 3-6 notifications per user
            const numNotifications = Math.floor(Math.random() * 4) + 3;
            const usedTemplates = new Set();

            for (let i = 0; i < numNotifications; i++) {
                // Pick a random template (avoid duplicates for same user)
                let templateIndex;
                do {
                    templateIndex = Math.floor(Math.random() * notificationTemplates.length);
                } while (usedTemplates.has(templateIndex) && usedTemplates.size < notificationTemplates.length);

                if (usedTemplates.has(templateIndex)) continue;
                usedTemplates.add(templateIndex);

                const template = notificationTemplates[templateIndex];

                // Generate a related entity ID (use user's own ID or a listing ID)
                let relatedEntityId = user.id;
                if (template.relatedEntityType === "Listing" && listings.length > 0) {
                    relatedEntityId = listings[Math.floor(Math.random() * listings.length)].id;
                }

                // Generate action URL based on entity type
                let actionUrl = null;
                switch (template.relatedEntityType) {
                    case "Message":
                        actionUrl = "/messages";
                        break;
                    case "Review":
                        actionUrl = "/reviews";
                        break;
                    case "Listing":
                        actionUrl = `/listings/${relatedEntityId}`;
                        break;
                    case "RoommateMatch":
                        actionUrl = "/roommates";
                        break;
                    case "ForumPost":
                        actionUrl = "/forum";
                        break;
                    case "PropertyViewing":
                        actionUrl = "/viewings";
                        break;
                    case "User":
                        actionUrl = "/profile";
                        break;
                }

                // Random read status (70% unread for realism)
                const isRead = Math.random() > 0.7;

                // Random timestamp within last 7 days
                const createdAt = new Date();
                createdAt.setTime(createdAt.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);

                await Notification.create({
                    userId: user.id,
                    title: template.title,
                    message: template.message,
                    relatedEntityType: template.relatedEntityType,
                    relatedEntityId: relatedEntityId,
                    actionUrl: actionUrl,
                    isRead: isRead,
                    createdAt: createdAt,
                    updatedAt: createdAt,
                });

                notificationCount++;
            }
        }

        console.log(`Created ${notificationCount} notifications`);
        console.log("Notifications seeding completed");
    } catch (error) {
        console.error("Error seeding notifications:", error);
        throw error;
    }
};

module.exports = seedNotifications;
