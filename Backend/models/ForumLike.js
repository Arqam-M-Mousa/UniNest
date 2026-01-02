const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ForumLike = sequelize.define(
    "ForumLike",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        postId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: "forum_posts",
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
        voteType: {
            type: DataTypes.ENUM("up", "down"),
            allowNull: false,
            defaultValue: "up",
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        tableName: "forum_likes",
        timestamps: false,
        underscored: true,
    }
);

module.exports = ForumLike;
