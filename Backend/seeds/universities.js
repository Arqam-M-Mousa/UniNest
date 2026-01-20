const { University } = require("../models");

/**
 * Seed universities in Palestine
 */
const seedUniversities = async () => {
    try {32.22063832210063, 35.24465715234747
        const universities = [
            {
                name: "An-Najah National University - New Campus",
                city: "Nablus",
                domain: "najah.edu",
                latitude: 32.22766,
                longitude: 35.22060,
            },
            {
                name: "An-Najah National University - Old Campus",
                city: "Nablus",
                domain: "najah.edu",
                latitude: 32.22058,
                longitude: 35.24435,
            },
            {
                name: "Birzeit University",
                city: "Birzeit",
                domain: "birzeit.edu",
                latitude: 31.95930,
                longitude: 35.18202,
            },
            {
                name: "Al-Quds University",
                city: "Jerusalem",
                domain: "alquds.edu",
                latitude: 31.75595,
                longitude: 35.26018,
            },
            {
                name: "Palestine Polytechnic University",
                city: "Hebron",
                domain: "ppu.edu",
                latitude: 31.5326,
                longitude: 35.0998,
            },
            {
                name: "Bethlehem University",
                city: "Bethlehem",
                domain: "bethlehem.edu",
                latitude: 31.7154,
                longitude: 35.2024,
            },
            {
                name: "Arab American University",
                city: "Jenin",
                domain: "aaup.edu",
                latitude: 32.40642,
                longitude: 35.3426,
            },
            {
                name: "Palestine Technical University - Kadoorie",
                city: "Tulkarm",
                domain: "ptuk.edu.ps",
                latitude: 32.31347,
                longitude: 35.02281,
            },
            {
                name: "Hebron University",
                city: "Hebron",
                domain: "hebron.edu",
                latitude: 31.55027,
                longitude: 35.09389,
            },
        ];

        for (const uni of universities) {
            const existing = await University.findOne({
                where: { domain: uni.domain },
            });

            if (existing) {
                console.log(`University ${uni.name} already exists`);
                continue;
            }

            await University.create(uni);
            console.log(`Created university: ${uni.name}`);
        }

        console.log("Universities seeding completed");
    } catch (error) {
        console.error("Error seeding universities:", error);
        throw error;
    }
};

module.exports = seedUniversities;
