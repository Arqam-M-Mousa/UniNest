const sequelize = require("../config/database");
const User = require("./User");
const University = require("./University");
const Listing = require("./Listing");
const PropertyListing = require("./PropertyListing");
const ItemListing = require("./ItemListing");
const ListingImage = require("./ListingImage");
const Favorite = require("./Favorite");
const Review = require("./Review");
const Conversation = require("./Conversation");
const Message = require("./Message");
const Notification = require("./Notification");
const VerificationCode = require("./VerificationCode");
const RoommateProfile = require("./RoommateProfile");
const RoommateMatch = require("./RoommateMatch");

// User - University relationship
User.belongsTo(University, {
  foreignKey: "universityId",
  as: "university",
  allowNull: true,
});
University.hasMany(User, { foreignKey: "universityId", as: "users" });

// User - Listings relationship
User.hasMany(Listing, { foreignKey: "ownerId", as: "listings" });
Listing.belongsTo(User, { foreignKey: "ownerId", as: "owner" });

// Listing - ListingImage relationship
Listing.hasMany(ListingImage, {
  foreignKey: "listingId",
  as: "images",
  onDelete: "CASCADE",
});
ListingImage.belongsTo(Listing, { foreignKey: "listingId" });

// Listing - PropertyListing relationship
Listing.hasOne(PropertyListing, {
  foreignKey: "listingId",
  as: "propertyDetails",
  onDelete: "CASCADE",
});
PropertyListing.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

// Listing - Favorite relationship
Listing.hasMany(Favorite, {
  foreignKey: "listingId",
  as: "favorites",
  onDelete: "CASCADE",
});
Favorite.belongsTo(Listing, { foreignKey: "listingId" });

// User - Favorite relationship
User.hasMany(Favorite, {
  foreignKey: "studentId",
  as: "favorites",
  onDelete: "CASCADE",
});
Favorite.belongsTo(User, { foreignKey: "studentId", as: "student" });

// Listing - Review relationship
Listing.hasMany(Review, {
  foreignKey: "listingId",
  as: "reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(Listing, { foreignKey: "listingId", allowNull: true });

// User - Review relationships (Student & Landlord)
User.hasMany(Review, { foreignKey: "studentId", as: "reviewsWritten" });
Review.belongsTo(User, { foreignKey: "studentId", as: "student" });

User.hasMany(Review, {
  foreignKey: "landlordId",
  as: "reviewsReceived",
  onDelete: "CASCADE",
});
Review.belongsTo(User, {
  foreignKey: "landlordId",
  as: "landlord",
  allowNull: true,
});

// PropertyListing - University relationship
PropertyListing.belongsTo(University, { foreignKey: "universityId" });
University.hasMany(PropertyListing, { foreignKey: "universityId" });

// Conversation relationships
User.hasMany(Conversation, {
  foreignKey: "studentId",
  as: "studentConversations",
});
Conversation.belongsTo(User, { foreignKey: "studentId", as: "student" });

User.hasMany(Conversation, {
  foreignKey: "landlordId",
  as: "landlordConversations",
});
Conversation.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

PropertyListing.hasMany(Conversation, { foreignKey: "propertyId" });
Conversation.belongsTo(PropertyListing, {
  foreignKey: "propertyId",
  as: "property",
});

// Message relationships
Conversation.hasMany(Message, {
  foreignKey: "conversationId",
  as: "messages",
  onDelete: "CASCADE",
});
Message.belongsTo(Conversation, { foreignKey: "conversationId" });

User.hasMany(Message, { foreignKey: "senderId", as: "messagesSent" });
Message.belongsTo(User, { foreignKey: "senderId", as: "sender" });

// Notification relationships
User.hasMany(Notification, {
  foreignKey: "userId",
  as: "notifications",
  onDelete: "CASCADE",
});
Notification.belongsTo(User, { foreignKey: "userId" });

// RoommateProfile relationships
User.hasOne(RoommateProfile, {
  foreignKey: "userId",
  as: "roommateProfile",
  onDelete: "CASCADE",
});
RoommateProfile.belongsTo(User, { foreignKey: "userId", as: "user" });
RoommateProfile.belongsTo(University, { foreignKey: "universityId", as: "university" });
University.hasMany(RoommateProfile, { foreignKey: "universityId" });

// RoommateMatch relationships
User.hasMany(RoommateMatch, {
  foreignKey: "requesterId",
  as: "sentMatches",
  onDelete: "CASCADE",
});
RoommateMatch.belongsTo(User, { foreignKey: "requesterId", as: "requester" });

User.hasMany(RoommateMatch, {
  foreignKey: "targetId",
  as: "receivedMatches",
  onDelete: "CASCADE",
});
RoommateMatch.belongsTo(User, { foreignKey: "targetId", as: "target" });

const db = {
  sequelize,
  User,
  University,
  Listing,
  PropertyListing,
  ItemListing,
  ListingImage,
  Favorite,
  Review,
  Conversation,
  Message,
  Notification,
  VerificationCode,
  RoommateProfile,
  RoommateMatch,
};

module.exports = db;
