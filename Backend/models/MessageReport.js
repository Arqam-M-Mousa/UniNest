const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MessageReport = sequelize.define(
  "MessageReport",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    reporterId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    reportedUserId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    conversationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "conversations",
        key: "id",
      },
    },
    messageId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "messages",
        key: "id",
      },
    },
    reason: {
      type: DataTypes.ENUM(
        "spam",
        "harassment",
        "inappropriate_content",
        "scam",
        "hate_speech",
        "threats",
        "other"
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "reviewed", "resolved", "dismissed"),
      defaultValue: "pending",
    },
    adminNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    action: {
      type: DataTypes.ENUM("none", "warning", "suspended", "banned"),
      allowNull: true,
    },
  },
  {
    tableName: "message_reports",
    timestamps: true,
    underscored: true,
  }
);

module.exports = MessageReport;
