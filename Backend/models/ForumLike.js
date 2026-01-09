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
            type: DataTypes.STRING(10),
            allowNull: false,
            defaultValue: "up",
            validate: {
                isIn: [["up", "down"]],
            },
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
