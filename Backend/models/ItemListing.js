const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Listing = require("./Listing");

const ItemListing = sequelize.define(
  "ItemListing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: true,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
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
