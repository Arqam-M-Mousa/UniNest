const sequelize = require("../config/database");
const seedAdminUser = require("./adminUser");
const seedStudentUsers = require("./studentUsers");

/**
 * Run all seeds
 */
const runSeeds = async () => {
  try {
    // Sync database (ensure tables exist)
    await sequelize.sync();
    console.log("Database synced");

    // Run seed files
    await seedAdminUser();
    await seedStudentUsers();

    console.log("All seeds completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error running seeds:", error);
    process.exit(1);
  }
};

// Run seeds if this file is executed directly
if (require.main === module) {
  runSeeds();
}

module.exports = runSeeds;
