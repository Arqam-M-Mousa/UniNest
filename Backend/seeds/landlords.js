const bcrypt = require("bcryptjs");
const { User } = require("../models");

/**
 * Seed landlord users
 */
const seedLandlords = async () => {
    try {
        const passwordHash = await bcrypt.hash("landlord123", 10);

        const landlords = [
            {
                email: "ahmad.hassan@gmail.com",
                firstName: "Ahmad",
                lastName: "Hassan",
                gender: "Male",
                phoneNumber: "+970599123456",
                isVerified: true,
                isIdentityVerified: true,
                averageRating: 4.7,
                totalReviewsCount: 23,
            },
            {
                email: "fatima.khalil@gmail.com",
                firstName: "Fatima",
                lastName: "Khalil",
                gender: "Female",
                phoneNumber: "+970598765432",
                isVerified: true,
                isIdentityVerified: true,
                averageRating: 4.9,
                totalReviewsCount: 31,
            },
            {
                email: "omar.nasser@gmail.com",
                firstName: "Omar",
                lastName: "Nasser",
                gender: "Male",
                phoneNumber: "+970597654321",
                isVerified: true,
                isIdentityVerified: true,
                averageRating: 4.5,
                totalReviewsCount: 15,
            },
            {
                email: "layla.mahmoud@gmail.com",
                firstName: "Layla",
                lastName: "Mahmoud",
                gender: "Female",
                phoneNumber: "+970596543210",
                isVerified: true,
                isIdentityVerified: false,
                averageRating: 4.2,
                totalReviewsCount: 8,
            },
            {
                email: "khaled.yousef@gmail.com",
                firstName: "Khaled",
                lastName: "Yousef",
                gender: "Male",
                phoneNumber: "+970595432109",
                isVerified: true,
                isIdentityVerified: true,
                averageRating: 4.8,
                totalReviewsCount: 42,
            },
            {
                email: "nadia.saleh@gmail.com",
                firstName: "Nadia",
                lastName: "Saleh",
                gender: "Female",
                phoneNumber: "+970594321098",
                isVerified: true,
                isIdentityVerified: true,
                averageRating: 4.6,
                totalReviewsCount: 19,
            },
            {
                email: "ibrahim.awad@gmail.com",
                firstName: "Ibrahim",
                lastName: "Awad",
                gender: "Male",
                phoneNumber: "+970593210987",
                isVerified: true,
                isIdentityVerified: false,
                averageRating: 4.3,
                totalReviewsCount: 11,
            },
            {
                email: "rania.haddad@gmail.com",
                firstName: "Rania",
                lastName: "Haddad",
                gender: "Female",
                phoneNumber: "+970592109876",
                isVerified: true,
                isIdentityVerified: true,
                averageRating: 4.4,
                totalReviewsCount: 27,
            },
        ];

        for (const landlord of landlords) {
            const existing = await User.findOne({
                where: { email: landlord.email },
            });

            if (existing) {
                console.log(`Landlord ${landlord.email} already exists`);
                continue;
            }

            await User.create({
                ...landlord,
                passwordHash,
                role: "Landlord",
                preferredLanguage: "ar",
            });
            console.log(`Created landlord: ${landlord.firstName} ${landlord.lastName}`);
        }

        console.log("Landlords seeding completed");
    } catch (error) {
        console.error("Error seeding landlords:", error);
        throw error;
    }
};

module.exports = seedLandlords;
