const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Listing = require("./Listing");

const PropertyListing = sequelize.define(
  "PropertyListing",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    propertyType: {
      type: DataTypes.ENUM("Apartment", "House", "Room", "Studio"),
      allowNull: false,
    },
    pricePerMonth: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: "USD",
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    bedrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bathrooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    squareFeet: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amenitiesJson: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    distanceToUniversity: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    availableFrom: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    availableUntil: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    leaseDuration: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    universityId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "universities",
        key: "id",
      },
    },
  },
  {
    tableName: "property_listings",
    timestamps: true,
    underscored: true,
  }
);

module.exports = PropertyListing;
