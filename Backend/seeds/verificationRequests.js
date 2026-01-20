const { User, VerificationRequest } = require("../models");

/**
 * Seed verification requests for admin dashboard
 */
const seedVerificationRequests = async () => {
    try {
        // Get landlords (they need verification)
        const landlords = await User.findAll({
            where: { role: "Landlord" },
        });

        // Get some students too (they might want to verify)
        const students = await User.findAll({
            where: { role: "Student" },
            limit: 5,
        });

        const users = [...landlords, ...students];

        if (users.length === 0) {
            console.log("No users found. Please run user seeds first.");
            return;
        }

        // Get admin for reviewed requests
        const admin = await User.findOne({
            where: { role: "SuperAdmin" },
        });

        const verificationTemplates = [
            {
                documentType: "id_card",
                status: "pending",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/id_card_1.jpg",
            },
            {
                documentType: "passport",
                status: "pending",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/passport_1.jpg",
            },
            {
                documentType: "business_license",
                status: "approved",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/business_license_1.jpg",
                reviewNotes: "Business license verified. All documents are in order.",
            },
            {
                documentType: "id_card",
                status: "approved",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/id_card_2.jpg",
                reviewNotes: "ID card verified successfully. Identity confirmed.",
            },
            {
                documentType: "drivers_license",
                status: "rejected",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/drivers_license_1.jpg",
                reviewNotes: "Document is expired. Please submit a valid, non-expired document.",
            },
            {
                documentType: "passport",
                status: "pending",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/passport_2.jpg",
            },
            {
                documentType: "id_card",
                status: "rejected",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/id_card_3.jpg",
                reviewNotes: "Image is too blurry to verify. Please upload a clearer photo.",
            },
            {
                documentType: "business_license",
                status: "pending",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/business_license_2.jpg",
            },
            {
                documentType: "drivers_license",
                status: "approved",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/drivers_license_2.jpg",
                reviewNotes: "Driver's license verified. Valid until 2027.",
            },
            {
                documentType: "passport",
                status: "rejected",
                documentUrl: "https://res.cloudinary.com/demo/image/upload/v1/verification/passport_3.jpg",
                reviewNotes: "Name on passport does not match account name. Please contact support.",
            },
        ];

        let requestCount = 0;

        for (let i = 0; i < Math.min(verificationTemplates.length, users.length); i++) {
            const user = users[i];
            const template = verificationTemplates[i];

            // Check if user already has a verification request
            const existingRequest = await VerificationRequest.findOne({
                where: { userId: user.id },
            });

            if (existingRequest) {
                console.log(`Verification request already exists for ${user.firstName} ${user.lastName}`);
                continue;
            }

            // Create random submission timestamp within last 14 days
            const submittedAt = new Date();
            submittedAt.setDate(submittedAt.getDate() - Math.floor(Math.random() * 14));

            const requestData = {
                userId: user.id,
                documentType: template.documentType,
                documentUrl: template.documentUrl,
                status: template.status,
                submittedAt,
                createdAt: submittedAt,
                updatedAt: submittedAt,
            };

            // Add review data for non-pending requests
            if (template.status !== "pending" && admin) {
                requestData.reviewedBy = admin.id;
                requestData.reviewedAt = new Date(submittedAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000); // 0-3 days after submission
                requestData.reviewNotes = template.reviewNotes || null;
            }

            await VerificationRequest.create(requestData);
            requestCount++;

            // Update user's verification status if approved
            if (template.status === "approved") {
                await user.update({
                    isIdentityVerified: true,
                    identityVerifiedAt: requestData.reviewedAt,
                    verificationStatus: "approved",
                });
            }

            console.log(`Created verification request for ${user.firstName} ${user.lastName}: ${template.documentType} (${template.status})`);
        }

        console.log(`Created ${requestCount} verification requests`);
        console.log("Verification requests seeding completed");
    } catch (error) {
        console.error("Error seeding verification requests:", error);
        throw error;
    }
};

module.exports = seedVerificationRequests;
