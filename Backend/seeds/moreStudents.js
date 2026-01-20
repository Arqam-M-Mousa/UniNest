const bcrypt = require("bcryptjs");
const { User, University } = require("../models");

/**
 * Seed additional student users for a more realistic app
 */
const seedMoreStudents = async () => {
    try {
        // Get universities
        const universities = await University.findAll();

        if (universities.length === 0) {
            console.log("No universities found. Please run universities seed first.");
            return;
        }

        const najahUni = universities.find(u => u.domain === "najah.edu");
        const birzeitUni = universities.find(u => u.domain === "birzeit.edu");
        const qudsUni = universities.find(u => u.domain === "alquds.edu");
        const ppuUni = universities.find(u => u.domain === "ppu.edu");

        const passwordHash = await bcrypt.hash("student123", 10);

        const students = [
            // An-Najah students
            {
                email: "s12113001@stu.najah.edu",
                firstName: "Mohammad",
                lastName: "Abed",
                gender: "Male",
                studentId: "12113001",
                universityId: najahUni?.id,
            },
            {
                email: "s12113002@stu.najah.edu",
                firstName: "Nour",
                lastName: "Hasan",
                gender: "Female",
                studentId: "12113002",
                universityId: najahUni?.id,
            },
            {
                email: "s12113003@stu.najah.edu",
                firstName: "Yazan",
                lastName: "Saleh",
                gender: "Male",
                studentId: "12113003",
                universityId: najahUni?.id,
            },
            {
                email: "s12113004@stu.najah.edu",
                firstName: "Reem",
                lastName: "Nasser",
                gender: "Female",
                studentId: "12113004",
                universityId: najahUni?.id,
            },
            {
                email: "s12113005@stu.najah.edu",
                firstName: "Khaled",
                lastName: "Mansour",
                gender: "Male",
                studentId: "12113005",
                universityId: najahUni?.id,
            },
            {
                email: "s12113006@stu.najah.edu",
                firstName: "Dana",
                lastName: "Qasem",
                gender: "Female",
                studentId: "12113006",
                universityId: najahUni?.id,
            },
            {
                email: "s12113007@stu.najah.edu",
                firstName: "Fadi",
                lastName: "Barakat",
                gender: "Male",
                studentId: "12113007",
                universityId: najahUni?.id,
            },
            {
                email: "s12113008@stu.najah.edu",
                firstName: "Hala",
                lastName: "Issa",
                gender: "Female",
                studentId: "12113008",
                universityId: najahUni?.id,
            },
            // Birzeit students
            {
                email: "s21201001@students.birzeit.edu",
                firstName: "Sami",
                lastName: "Khoury",
                gender: "Male",
                studentId: "21201001",
                universityId: birzeitUni?.id,
            },
            {
                email: "s21201002@students.birzeit.edu",
                firstName: "Lama",
                lastName: "Darwish",
                gender: "Female",
                studentId: "21201002",
                universityId: birzeitUni?.id,
            },
            {
                email: "s21201003@students.birzeit.edu",
                firstName: "Tariq",
                lastName: "Sabbah",
                gender: "Male",
                studentId: "21201003",
                universityId: birzeitUni?.id,
            },
            {
                email: "s21201004@students.birzeit.edu",
                firstName: "Maya",
                lastName: "Handal",
                gender: "Female",
                studentId: "21201004",
                universityId: birzeitUni?.id,
            },
            // Al-Quds students
            {
                email: "s31301001@students.alquds.edu",
                firstName: "Amer",
                lastName: "Shaheen",
                gender: "Male",
                studentId: "31301001",
                universityId: qudsUni?.id,
            },
            {
                email: "s31301002@students.alquds.edu",
                firstName: "Dina",
                lastName: "Masri",
                gender: "Female",
                studentId: "31301002",
                universityId: qudsUni?.id,
            },
            // PPU students
            {
                email: "s41401001@students.ppu.edu",
                firstName: "Basil",
                lastName: "Tamimi",
                gender: "Male",
                studentId: "41401001",
                universityId: ppuUni?.id,
            },
            {
                email: "s41401002@students.ppu.edu",
                firstName: "Rana",
                lastName: "Jabari",
                gender: "Female",
                studentId: "41401002",
                universityId: ppuUni?.id,
            },
        ];

        let studentCount = 0;

        for (const student of students) {
            const existing = await User.findOne({
                where: { email: student.email },
            });

            if (existing) {
                console.log(`Student ${student.email} already exists`);
                continue;
            }

            await User.create({
                ...student,
                passwordHash,
                role: "Student",
                preferredLanguage: "ar",
                isVerified: true,
            });

            studentCount++;
            console.log(`Created student: ${student.firstName} ${student.lastName}`);
        }

        console.log(`Created ${studentCount} additional students`);
        console.log("Additional students seeding completed");
    } catch (error) {
        console.error("Error seeding additional students:", error);
        throw error;
    }
};

module.exports = seedMoreStudents;
