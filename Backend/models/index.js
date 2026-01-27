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
const VerificationRequest = require("./VerificationRequest");
const ForumPost = require("./ForumPost");
const ForumComment = require("./ForumComment");
const ForumLike = require("./ForumLike");
const ReviewHelpful = require("./ReviewHelpful");
const PropertyViewing = require("./PropertyViewing");
const LandlordAvailability = require("./LandlordAvailability");
const PriceHistory = require("./PriceHistory");
const PropertyAnalytics = require("./PropertyAnalytics");
const MessageReport = require("./MessageReport");
const ChatMessage = require("./ChatMessage");
const AIReportAnalysis = require("./AIReportAnalysis");


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

// Listing - ItemListing relationship
Listing.hasOne(ItemListing, {
  foreignKey: "listingId",
  as: "itemDetails",
  onDelete: "CASCADE",
});
ItemListing.belongsTo(Listing, { foreignKey: "listingId", as: "listing" });

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

// VerificationRequest relationships
User.hasMany(VerificationRequest, {
  foreignKey: "userId",
  as: "verificationRequests",
  onDelete: "CASCADE",
});
VerificationRequest.belongsTo(User, { foreignKey: "userId", as: "user" });

User.hasMany(VerificationRequest, {
  foreignKey: "reviewedBy",
  as: "reviewedVerifications",
});
VerificationRequest.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

// ForumPost relationships
User.hasMany(ForumPost, {
  foreignKey: "userId",
  as: "forumPosts",
  onDelete: "CASCADE",
});
ForumPost.belongsTo(User, { foreignKey: "userId", as: "author" });

ForumPost.hasMany(ForumComment, {
  foreignKey: "postId",
  as: "comments",
  onDelete: "CASCADE",
});
ForumComment.belongsTo(ForumPost, { foreignKey: "postId", as: "post" });

ForumPost.hasMany(ForumLike, {
  foreignKey: "postId",
  as: "likes",
  onDelete: "CASCADE",
});
ForumLike.belongsTo(ForumPost, { foreignKey: "postId", as: "post" });

// ForumComment relationships
User.hasMany(ForumComment, {
  foreignKey: "userId",
  as: "forumComments",
  onDelete: "CASCADE",
});
ForumComment.belongsTo(User, { foreignKey: "userId", as: "author" });

// ForumLike relationships
User.hasMany(ForumLike, {
  foreignKey: "userId",
  as: "forumLikes",
  onDelete: "CASCADE",
});
ForumLike.belongsTo(User, { foreignKey: "userId", as: "user" });

// ReviewHelpful relationships
Review.hasMany(ReviewHelpful, {
  foreignKey: "reviewId",
  as: "helpfulVotes",
  onDelete: "CASCADE",
});
ReviewHelpful.belongsTo(Review, { foreignKey: "reviewId", as: "review" });

User.hasMany(ReviewHelpful, {
  foreignKey: "userId",
  as: "helpfulReviews",
  onDelete: "CASCADE",
});
ReviewHelpful.belongsTo(User, { foreignKey: "userId", as: "user" });

// PropertyViewing relationships
PropertyListing.hasMany(PropertyViewing, {
  foreignKey: "propertyId",
  as: "viewings",
  onDelete: "CASCADE",
});
PropertyViewing.belongsTo(PropertyListing, { foreignKey: "propertyId", as: "property" });

User.hasMany(PropertyViewing, {
  foreignKey: "studentId",
  as: "studentViewings",
  onDelete: "CASCADE",
});
PropertyViewing.belongsTo(User, { foreignKey: "studentId", as: "student" });

User.hasMany(PropertyViewing, {
  foreignKey: "landlordId",
  as: "landlordViewings",
  onDelete: "CASCADE",
});
PropertyViewing.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

// LandlordAvailability relationships
User.hasMany(LandlordAvailability, {
  foreignKey: "landlordId",
  as: "availability",
  onDelete: "CASCADE",
});
LandlordAvailability.belongsTo(User, { foreignKey: "landlordId", as: "landlord" });

// PriceHistory relationships
PropertyListing.hasMany(PriceHistory, {
  foreignKey: "propertyId",
  as: "priceHistory",
  onDelete: "CASCADE",
});
PriceHistory.belongsTo(PropertyListing, { foreignKey: "propertyId", as: "property" });

// PropertyAnalytics relationships
PropertyListing.hasMany(PropertyAnalytics, {
  foreignKey: "propertyId",
  as: "analytics",
  onDelete: "CASCADE",
});
PropertyAnalytics.belongsTo(PropertyListing, { foreignKey: "propertyId", as: "property" });

// MessageReport relationships
User.hasMany(MessageReport, {
  foreignKey: "reporterId",
  as: "reportsFiled",
  onDelete: "CASCADE",
});
MessageReport.belongsTo(User, { foreignKey: "reporterId", as: "reporter" });

User.hasMany(MessageReport, {
  foreignKey: "reportedUserId",
  as: "reportsReceived",
  onDelete: "CASCADE",
});
MessageReport.belongsTo(User, { foreignKey: "reportedUserId", as: "reportedUser" });

Conversation.hasMany(MessageReport, {
  foreignKey: "conversationId",
  as: "reports",
  onDelete: "CASCADE",
});
MessageReport.belongsTo(Conversation, { foreignKey: "conversationId", as: "conversation" });

Message.hasMany(MessageReport, {
  foreignKey: "messageId",
  as: "reports",
  onDelete: "SET NULL",
});
MessageReport.belongsTo(Message, { foreignKey: "messageId", as: "message" });

User.hasMany(MessageReport, {
  foreignKey: "reviewedBy",
  as: "reviewedReports",
});
MessageReport.belongsTo(User, { foreignKey: "reviewedBy", as: "reviewer" });

// ChatMessage relationships
User.hasMany(ChatMessage, {
  foreignKey: "userId",
  as: "chatMessages",
  onDelete: "CASCADE",
});
ChatMessage.belongsTo(User, { foreignKey: "userId", as: "user" });

// AIReportAnalysis relationships
User.hasMany(AIReportAnalysis, {
  foreignKey: "analyzedBy",
  as: "aiAnalyses",
  onDelete: "CASCADE",
});
AIReportAnalysis.belongsTo(User, { foreignKey: "analyzedBy", as: "analyst" });

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
  VerificationRequest,
  ForumPost,
  ForumComment,
  ForumLike,
  ReviewHelpful,
  PropertyViewing,
  LandlordAvailability,
  PriceHistory,
  PropertyAnalytics,
  MessageReport,
  ChatMessage,
  AIReportAnalysis,
};


module.exports = db;
