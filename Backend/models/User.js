const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Student", "Landlord", "Admin", "SuperAdmin"),
      defaultValue: "Student",
      allowNull: false,
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePictureUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePicturePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    studentId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female"),
      allowNull: true,
    },
    preferredLanguage: {
      type: DataTypes.STRING,
      defaultValue: "en",
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isIdentityVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    identityVerifiedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verificationDocumentUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationStatus: {
      type: DataTypes.ENUM("none", "pending", "approved", "rejected"),
      defaultValue: "none",
    },
    averageRating: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    totalReviewsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    universityId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "universities",
        key: "id",
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

module.exports = User;
