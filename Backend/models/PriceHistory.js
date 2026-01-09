const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const PriceHistory = sequelize.define(
    "PriceHistory",
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
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        recordedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        changeType: {
            type: DataTypes.ENUM("initial", "increase", "decrease"),
            allowNull: false,
        },
        changePercentage: {
            type: DataTypes.FLOAT,
            allowNull: true,
            comment: "Percentage change from previous price",
        },
    },
    {
        tableName: "price_history",
        timestamps: true,
        underscored: true,
    }
);

module.exports = PriceHistory;
