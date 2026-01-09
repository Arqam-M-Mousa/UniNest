const express = require("express");
const router = express.Router();

const authRoutes = require("./auth");
const userRoutes = require("./users");
const universityRoutes = require("./universities");
const contactRoutes = require("./contact");
const notificationRoutes = require("./notifications");
const conversationRoutes = require("./conversations");
const propertyListingRoutes = require("./propertyListings");
const favoriteRoutes = require("./favorites");
const uploadRoutes = require("./uploads");
const adminRoutes = require("./admin");
const roommateRoutes = require("./roommates");
const verificationRoutes = require("./verification");
const announcementRoutes = require("./announcements");

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/universities", universityRoutes);
router.use("/contact", contactRoutes);
router.use("/notifications", notificationRoutes);
router.use("/conversations", conversationRoutes);
router.use("/property-listings", propertyListingRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/uploads", uploadRoutes);
router.use("/admin", adminRoutes);
router.use("/roommates", roommateRoutes);
router.use("/verification", verificationRoutes);
router.use("/announcements", announcementRoutes);
router.use("/forum", require("./forum"));
router.use("/reviews", require("./reviews"));
router.use("/marketplace", require("./marketplace"));
router.use("/viewings", require("./viewings"));
router.use("/analytics/landlord", require("./landlordAnalytics"));
router.use("/analytics/market", require("./marketAnalytics"));

module.exports = router;
