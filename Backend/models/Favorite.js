const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Favorite = sequelize.define(
  "Favorite",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    listingId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "listings",
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
  },
  {
    tableName: "favorites",
    timestamps: true,
    underscored: true,
  }
);

module.exports = Favorite;
