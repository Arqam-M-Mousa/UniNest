const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PropertyViewing = sequelize.define(
    "PropertyViewing",
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
        studentId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        landlordId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        scheduledDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
        },
        scheduledTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 60, // minutes
        },
        status: {
            type: DataTypes.ENUM(
                "pending",
                "confirmed",
                "cancelled",
                "completed",
                "no_show"
            ),
            allowNull: false,
            defaultValue: "pending",
        },
        studentNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        landlordNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        reminderSent: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        tableName: "property_viewings",
        timestamps: true,
        underscored: true,
    }
);

module.exports = PropertyViewing;
