const bcrypt = require("bcryptjs");
const { User } = require("../models");

/**
 * Seed admin user
 */
const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@uninest.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    // Hash the admin password
    const passwordHash = await bcrypt.hash("admin", 10);

    // Create admin user
    const adminUser = await User.create({
      email: "admin@uninest.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      role: "Admin",
      gender: "Male",
      preferredLanguage: "en",
      isVerified: true,
    });

    console.log("Admin user created successfully:", {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
};

module.exports = seedAdminUser;
