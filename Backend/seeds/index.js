const sequelize = require("../config/database");
const seedAdminUser = require("./adminUser");
const seedUniversities = require("./universities");
const seedStudentUsers = require("./studentUsers");
const seedMoreStudents = require("./moreStudents");
const seedLandlords = require("./landlords");
const seedPropertyListings = require("./propertyListings");
const seedItemListings = require("./itemListings");
const seedReviews = require("./reviews");
const seedForumPosts = require("./forumPosts");
const seedRoommateProfiles = require("./roommateProfiles");
const seedConversations = require("./conversations");
const seedNotifications = require("./notifications");
const seedFavorites = require("./favorites");
const seedReports = require("./reports");
const seedVerificationRequests = require("./verificationRequests");

/**
 * Run all seeds in the correct order
 * Order matters due to foreign key dependencies
 */
const runSeeds = async () => {
  try {
    // Sync database (ensure tables exist)
    await sequelize.sync();
    console.log("Database synced");

    console.log("\n========== SEEDING STARTED ==========\n");

    // 1. Core entities (no dependencies)
    console.log("--- Seeding Universities ---");
    await seedUniversities();

    // 2. Users (depends on universities)
    console.log("\n--- Seeding Admin User ---");
    await seedAdminUser();

    console.log("\n--- Seeding Student Users ---");
    await seedStudentUsers();

    console.log("\n--- Seeding More Students ---");
    await seedMoreStudents();

    console.log("\n--- Seeding Landlords ---");
    await seedLandlords();

    // 3. Listings (depends on users and universities)
    console.log("\n--- Seeding Property Listings ---");
    await seedPropertyListings();

    console.log("\n--- Seeding Item Listings ---");
    await seedItemListings();

    // 4. User interactions (depends on users and listings)
    console.log("\n--- Seeding Reviews ---");
    await seedReviews();

    console.log("\n--- Seeding Forum Posts ---");
    await seedForumPosts();

    console.log("\n--- Seeding Roommate Profiles ---");
    await seedRoommateProfiles();

    console.log("\n--- Seeding Conversations ---");
    await seedConversations();

    console.log("\n--- Seeding Favorites ---");
    await seedFavorites();

    console.log("\n--- Seeding Notifications ---");
    await seedNotifications();

    // 5. Admin-related data (depends on conversations and users)
    console.log("\n--- Seeding Reports ---");
    await seedReports();

    console.log("\n--- Seeding Verification Requests ---");
    await seedVerificationRequests();

    console.log("\n========== ALL SEEDS COMPLETED SUCCESSFULLY ==========\n");
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
