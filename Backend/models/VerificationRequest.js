const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const VerificationRequest = sequelize.define(
    "VerificationRequest",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
        },
        documentType: {
            type: DataTypes.ENUM(
                "id_card",
                "passport",
                "drivers_license",
                "business_license"
            ),
            allowNull: false,
        },
        documentUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM("pending", "approved", "rejected"),
            defaultValue: "pending",
        },
        reviewedBy: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        reviewNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        submittedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        reviewedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    },
    {
        tableName: "verification_requests",
        timestamps: true,
        underscored: true,
    }
);

module.exports = VerificationRequest;
