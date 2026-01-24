const { User, Conversation, Message, MessageReport } = require("../models");

/**
 * Seed message reports for admin dashboard
 */
const seedReports = async () => {
    try {
        // Get students (reporters)
        const students = await User.findAll({
            where: { role: "Student" },
        });

        // Get landlords (can be reported)
        const landlords = await User.findAll({
            where: { role: "Landlord" },
        });

        // Get conversations
        const conversations = await Conversation.findAll({
            include: [{ model: Message, as: "messages" }],
        });

        if (students.length === 0 || landlords.length === 0) {
            console.log("No students or landlords found. Please run user seeds first.");
            return;
        }

        if (conversations.length === 0) {
            console.log("No conversations found. Please run conversations seed first.");
            return;
        }

        const reportTemplates = [
            {
                reason: "spam",
                description: "This user keeps sending the same promotional message about their property multiple times a day. It's very annoying and feels like spam.",
                status: "pending",
            },
            {
                reason: "harassment",
                description: "The landlord became very aggressive when I asked about the deposit policy. They used inappropriate language and made me feel uncomfortable.",
                status: "pending",
            },
            {
                reason: "scam",
                description: "I believe this is a scam. They asked me to send money before viewing the property and the photos look like they were taken from another website.",
                status: "reviewed",
                adminNotes: "Investigating the listing and user account. Photos appear to be stock images.",
                action: "warning",
            },
            {
                reason: "inappropriate_content",
                description: "The user sent me inappropriate images that were not related to the property listing.",
                status: "resolved",
                adminNotes: "User has been warned. Content has been removed.",
                action: "warning",
            },
            {
                reason: "threats",
                description: "After I declined to rent their property, they sent me threatening messages saying they would find out where I live.",
                status: "pending",
            },
            {
                reason: "hate_speech",
                description: "The landlord made discriminatory comments about my background when I inquired about the apartment.",
                status: "reviewed",
                adminNotes: "Serious violation. Escalating for further action.",
                action: "suspended",
            },
            {
                reason: "other",
                description: "The landlord is asking for personal information that seems unnecessary for renting, like my family's financial details and social media passwords.",
                status: "pending",
            },
            {
                reason: "scam",
                description: "This person is pretending to be a landlord but doesn't actually own the property. I verified with the building management.",
                status: "resolved",
                adminNotes: "Account has been banned. Fake landlord confirmed.",
                action: "banned",
            },
            {
                reason: "harassment",
                description: "Keeps messaging me even after I said I'm no longer interested. Has sent over 20 messages in the past week.",
                status: "dismissed",
                adminNotes: "Messages reviewed. While persistent, content is not harassing. User advised to use block feature.",
                action: "none",
            },
            {
                reason: "spam",
                description: "Sending links to external websites that look suspicious. Might be phishing attempts.",
                status: "pending",
            },
        ];

        // Get admin for reviewed reports
        const admin = await User.findOne({
            where: { role: "SuperAdmin" },
        });

        let reportCount = 0;

        for (let i = 0; i < reportTemplates.length; i++) {
            const template = reportTemplates[i];
            
            // Pick a random conversation
            const conversation = conversations[i % conversations.length];
            if (!conversation) continue;

            // Determine reporter and reported based on conversation
            const reporter = students[i % students.length];
            const reportedUser = landlords[i % landlords.length];

            // Check if similar report exists
            const existingReport = await MessageReport.findOne({
                where: {
                    reporterId: reporter.id,
                    reportedUserId: reportedUser.id,
                    conversationId: conversation.id,
                    reason: template.reason,
                },
            });

            if (existingReport) {
                console.log(`Report already exists for ${reporter.firstName} -> ${reportedUser.firstName}`);
                continue;
            }

            // Get a message from the conversation if available
            const message = conversation.messages?.[0] || null;

            // Create random timestamp within last 30 days
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 30));

            const reportData = {
                reporterId: reporter.id,
                reportedUserId: reportedUser.id,
                conversationId: conversation.id,
                messageId: message?.id || null,
                reason: template.reason,
                description: template.description,
                status: template.status,
                createdAt,
                updatedAt: createdAt,
            };

            // Add review data for non-pending reports
            if (template.status !== "pending" && admin) {
                reportData.reviewedBy = admin.id;
                reportData.reviewedAt = new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 days after creation
                reportData.adminNotes = template.adminNotes || null;
                reportData.action = template.action || "none";
            }

            await MessageReport.create(reportData);
            reportCount++;
            console.log(`Created report: ${template.reason} (${template.status})`);
        }

        console.log(`Created ${reportCount} message reports`);
        console.log("Reports seeding completed");
    } catch (error) {
        console.error("Error seeding reports:", error);
        throw error;
    }
};

module.exports = seedReports;
