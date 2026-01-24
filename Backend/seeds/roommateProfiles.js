const { User, University, RoommateProfile } = require("../models");

/**
 * Seed roommate profiles for students
 */
const seedRoommateProfiles = async () => {
    try {
        // Get students
        const students = await User.findAll({
            where: { role: "Student" },
        });

        if (students.length === 0) {
            console.log("No students found. Please run student users seed first.");
            return;
        }

        // Get universities
        const universities = await University.findAll();
        const najahUni = universities.find(u => u.domain === "najah.edu") || universities[0];

        const profileTemplates = [
            {
                minBudget: 500,
                maxBudget: 800,
                cleanlinessLevel: 5,
                noiseLevel: 2,
                sleepSchedule: "early",
                studyHabits: "home",
                smokingAllowed: false,
                petsAllowed: false,
                guestsAllowed: "sometimes",
                bio: "I'm a Computer Science student who loves coding and quiet evenings. Looking for a clean and organized roommate who respects study time. I usually wake up early and go to bed by 11pm. I enjoy cooking and don't mind sharing kitchen duties!",
                major: "Computer Science",
                interests: ["Programming", "Gaming", "Reading", "Coffee"],
                preferredAreas: ["Rafidia", "Near Campus", "City Center"],
                matchingPriorities: {
                    budget: 4,
                    cleanliness: 5,
                    noise: 5,
                    sleepSchedule: 4,
                    studyHabits: 3,
                    interests: 2,
                    smoking: 5,
                    pets: 3,
                    guests: 2,
                },
            },
            {
                minBudget: 600,
                maxBudget: 1000,
                cleanlinessLevel: 4,
                noiseLevel: 3,
                sleepSchedule: "normal",
                studyHabits: "mixed",
                smokingAllowed: false,
                petsAllowed: true,
                guestsAllowed: "often",
                bio: "Engineering student looking for a friendly roommate! I'm pretty social and like having friends over occasionally. I study both at home and in the library depending on my mood. I have a small cat - hope that's okay!",
                major: "Electrical Engineering",
                interests: ["Music", "Movies", "Hiking", "Photography"],
                preferredAreas: ["Rafidia", "Near Old Campus"],
                matchingPriorities: {
                    budget: 3,
                    cleanliness: 4,
                    noise: 3,
                    sleepSchedule: 3,
                    studyHabits: 2,
                    interests: 4,
                    smoking: 5,
                    pets: 5,
                    guests: 4,
                },
            },
            {
                minBudget: 400,
                maxBudget: 700,
                cleanlinessLevel: 3,
                noiseLevel: 4,
                sleepSchedule: "late",
                studyHabits: "library",
                smokingAllowed: false,
                petsAllowed: false,
                guestsAllowed: "sometimes",
                bio: "Night owl medical student here! I spend most of my time at the library or hospital, so I'm rarely home during the day. Looking for someone who doesn't mind a roommate with an irregular schedule. I'm easy-going and low maintenance.",
                major: "Medicine",
                interests: ["Fitness", "Podcasts", "Cooking", "Netflix"],
                preferredAreas: ["Near Hospital", "City Center"],
                matchingPriorities: {
                    budget: 5,
                    cleanliness: 3,
                    noise: 2,
                    sleepSchedule: 4,
                    studyHabits: 2,
                    interests: 3,
                    smoking: 4,
                    pets: 3,
                    guests: 3,
                },
            },
            {
                minBudget: 700,
                maxBudget: 1200,
                cleanlinessLevel: 5,
                noiseLevel: 1,
                sleepSchedule: "early",
                studyHabits: "home",
                smokingAllowed: false,
                petsAllowed: false,
                guestsAllowed: "never",
                bio: "Serious student looking for a quiet, focused roommate. I'm preparing for graduate school and need a peaceful environment. I keep everything very clean and organized. Prefer someone who values their studies as much as I do.",
                major: "Physics",
                interests: ["Research", "Chess", "Classical Music", "Tea"],
                preferredAreas: ["Quiet Neighborhoods", "Near Library"],
                matchingPriorities: {
                    budget: 2,
                    cleanliness: 5,
                    noise: 5,
                    sleepSchedule: 5,
                    studyHabits: 5,
                    interests: 1,
                    smoking: 5,
                    pets: 5,
                    guests: 5,
                },
            },
            {
                minBudget: 500,
                maxBudget: 900,
                cleanlinessLevel: 4,
                noiseLevel: 3,
                sleepSchedule: "normal",
                studyHabits: "mixed",
                smokingAllowed: false,
                petsAllowed: true,
                guestsAllowed: "sometimes",
                bio: "Business student who believes in work-life balance! I study hard but also know how to relax. Looking for a roommate who's responsible but also fun to hang out with. I love cooking Middle Eastern food and always make extra!",
                major: "Business Administration",
                interests: ["Cooking", "Soccer", "Travel", "Languages"],
                preferredAreas: ["City Center", "Near Restaurants"],
                matchingPriorities: {
                    budget: 4,
                    cleanliness: 4,
                    noise: 3,
                    sleepSchedule: 3,
                    studyHabits: 3,
                    interests: 4,
                    smoking: 4,
                    pets: 2,
                    guests: 3,
                },
            },
            {
                minBudget: 600,
                maxBudget: 1100,
                cleanlinessLevel: 4,
                noiseLevel: 2,
                sleepSchedule: "early",
                studyHabits: "home",
                smokingAllowed: false,
                petsAllowed: false,
                guestsAllowed: "sometimes",
                bio: "Architecture student with a creative mind! I spend a lot of time on projects at home, so I need a good workspace. I'm neat and organized (occupational hazard!). Looking for someone respectful of shared spaces.",
                major: "Architecture",
                interests: ["Design", "Art", "Photography", "Cycling"],
                preferredAreas: ["Near Campus", "Areas with Good Light"],
                matchingPriorities: {
                    budget: 3,
                    cleanliness: 5,
                    noise: 4,
                    sleepSchedule: 3,
                    studyHabits: 4,
                    interests: 3,
                    smoking: 5,
                    pets: 4,
                    guests: 3,
                },
            },
        ];

        let profileCount = 0;

        for (let i = 0; i < students.length; i++) {
            const student = students[i];

            // Check if profile already exists
            const existingProfile = await RoommateProfile.findOne({
                where: { userId: student.id },
            });

            if (existingProfile) {
                console.log(`Roommate profile for ${student.email} already exists`);
                continue;
            }

            // Use template based on index (cycle through templates)
            const template = profileTemplates[i % profileTemplates.length];

            // Calculate move-in date (random date in next 1-3 months)
            const moveInDate = new Date();
            moveInDate.setDate(moveInDate.getDate() + Math.floor(Math.random() * 60) + 30);

            await RoommateProfile.create({
                userId: student.id,
                universityId: student.universityId || najahUni?.id,
                ...template,
                moveInDate: moveInDate.toISOString().split('T')[0],
                isActive: true,
            });

            profileCount++;
            console.log(`Created roommate profile for: ${student.firstName} ${student.lastName}`);
        }

        console.log(`Created ${profileCount} roommate profiles`);
        console.log("Roommate profiles seeding completed");
    } catch (error) {
        console.error("Error seeding roommate profiles:", error);
        throw error;
    }
};

module.exports = seedRoommateProfiles;
