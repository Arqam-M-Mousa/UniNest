const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ListingImage = sequelize.define(
  "ListingImage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isPrimary: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    displayOrder: {
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
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "listings",
        key: "id",
      },
    },
  },
  {
    tableName: "listing_images",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ListingImage;
