const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RoommateMatch = sequelize.define(
    "RoommateMatch",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        requesterId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        targetId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        compatibilityScore: {
            type: DataTypes.FLOAT,
            allowNull: true,
            validate: {
                min: 0,
                max: 100,
            },
        },
        status: {
            type: DataTypes.ENUM("pending", "accepted", "rejected"),
            defaultValue: "pending",
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        respondedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "roommate_matches",
        timestamps: true,
        underscored: true,
        indexes: [
            {
                unique: true,
                fields: ["requester_id", "target_id"],
                name: "unique_match_pair",
            },
        ],
    }
);

module.exports = RoommateMatch;
