const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LandlordAvailability = sequelize.define(
    "LandlordAvailability",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        landlordId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        dayOfWeek: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: 0,
                max: 6,
            },
            comment: "0 = Sunday, 1 = Monday, ..., 6 = Saturday",
        },
        startTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        endTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "landlord_availability",
        timestamps: true,
        underscored: true,
    }
);

module.exports = LandlordAvailability;
