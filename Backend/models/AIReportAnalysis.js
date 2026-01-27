const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AIReportAnalysis = sequelize.define(
  "AIReportAnalysis",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "The report status filter used (pending, all, reviewed, resolved)",
    },
    reportIds: {
      type: DataTypes.JSONB,
      allowNull: false,
      comment: "Array of report IDs that were analyzed",
    },
    reportCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: "Number of reports analyzed",
    },
    lastReportDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Date of the most recent report in the analysis",
    },
    recommendations: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: "AI recommendations array",
    },
    patterns: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: "Detected patterns array",
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "AI analysis summary",
    },
    analyzedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      comment: "Admin who requested the analysis",
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: "When this cached analysis expires",
    },
  },
  {
    tableName: "ai_report_analyses",
    timestamps: true,
    underscored: true,
  }
);

module.exports = AIReportAnalysis;
