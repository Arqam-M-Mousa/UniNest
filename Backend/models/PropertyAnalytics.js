const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PropertyAnalytics = sequelize.define(
    "PropertyAnalytics",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        propertyId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "property_listings",
                key: "id",
            },
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        views: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        uniqueViews: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        favorites: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        inquiries: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        searchAppearances: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        tableName: "property_analytics",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["property_id", "date"],
            },
        ],
    }
);

module.exports = PropertyAnalytics;
