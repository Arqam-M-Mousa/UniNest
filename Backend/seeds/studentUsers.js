const bcrypt = require("bcryptjs");
const { User, University } = require("../models");

/**
 * Seed student users for testing
 */
const seedStudentUsers = async () => {
    try {
        // Find An-Najah university by domain
        let university = await University.findOne({
            where: { domain: "najah.edu" },
        });

        // If not found, try to find by name
        if (!university) {
            university = await University.findOne({
                where: { name: { [require("sequelize").Op.iLike]: "%najah%" } },
            });
        }

        // If still not found, create it
        if (!university) {
            university = await University.create({
                name: "An-Najah National University",
                city: "Nablus",
                domain: "najah.edu",
            });
            console.log("Created An-Najah National University");
        }

        const students = [
            {
                email: "s12112521@stu.najah.edu",
                firstName: "Arqam",
                lastName: "Mousa",
                gender: "Male",
                studentId: "12112521",
            },
            {
                email: "s12112520@stu.najah.edu",
                firstName: "Amjad",
                lastName: "Mousa",
                gender: "Male",
                studentId: "12112520",
            },
            {
                email: "s12112522@stu.najah.edu",
                firstName: "Sarah",
                lastName: "Ahmad",
                gender: "Female",
                studentId: "12112522",
            },
            {
                email: "s12112523@stu.najah.edu",
                firstName: "Lina",
                lastName: "Khalil",
                gender: "Female",
                studentId: "12112523",
            },
        ];

        const passwordHash = await bcrypt.hash("student", 10);

        for (const student of students) {
            const existing = await User.findOne({
                where: { email: student.email },
            });

            if (existing) {
                console.log(`Student ${student.email} already exists`);
                continue;
            }

            const user = await User.create({
                email: student.email,
                passwordHash,
                firstName: student.firstName,
                lastName: student.lastName,
                role: "Student",
                gender: student.gender,
                studentId: student.studentId,
                universityId: university.id,
                preferredLanguage: "en",
                isVerified: true,
            });

            console.log(`Student created: ${user.email} (${user.firstName} ${user.lastName}, ID: ${user.studentId})`);
        }

        console.log("Student seeding completed");
    } catch (error) {
        console.error("Error seeding student users:", error);
        throw error;
    }
};

module.exports = seedStudentUsers;
