const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ItemListing = sequelize.define(
  "ItemListing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "listings",
        key: "id",
      },
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "NIS",
    },
    condition: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "good",
      validate: {
        isIn: [["new", "like_new", "good", "fair"]],
      },
    },
    category: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: "other",
      validate: {
        isIn: [["furniture", "electronics", "books", "clothing", "kitchenware", "sports", "other"]],
      },
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    tableName: "item_listings",
    timestamps: true,
    underscored: true,
  }
);

module.exports = ItemListing;
