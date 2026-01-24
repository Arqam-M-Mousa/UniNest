const { User, Listing, Favorite } = require("../models");

/**
 * Seed favorites (saved listings by students)
 */
const seedFavorites = async () => {
    try {
        // Get students
        const students = await User.findAll({
            where: { role: "Student" },
        });

        if (students.length === 0) {
            console.log("No students found. Please run student users seed first.");
            return;
        }

        // Get all listings
        const listings = await Listing.findAll({
            where: { isPublished: true },
        });

        if (listings.length === 0) {
            console.log("No listings found. Please run listings seeds first.");
            return;
        }

        let favoriteCount = 0;

        for (const student of students) {
            // Each student favorites 3-7 random listings
            const numFavorites = Math.floor(Math.random() * 5) + 3;
            const shuffledListings = [...listings].sort(() => Math.random() - 0.5);
            const selectedListings = shuffledListings.slice(0, Math.min(numFavorites, listings.length));

            for (const listing of selectedListings) {
                // Check if favorite already exists
                const existingFavorite = await Favorite.findOne({
                    where: {
                        studentId: student.id,
                        listingId: listing.id,
                    },
                });

                if (existingFavorite) continue;

                await Favorite.create({
                    studentId: student.id,
                    listingId: listing.id,
                });

                favoriteCount++;
            }
        }

        console.log(`Created ${favoriteCount} favorites`);
        console.log("Favorites seeding completed");
    } catch (error) {
        console.error("Error seeding favorites:", error);
        throw error;
    }
};

module.exports = seedFavorites;
