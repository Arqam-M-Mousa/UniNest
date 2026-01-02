const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ReviewHelpful = sequelize.define(
    "ReviewHelpful",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        reviewId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "reviews",
                key: "id",
            },
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "review_helpful",
        timestamps: false,
        underscored: true,
    }
);

module.exports = ReviewHelpful;
