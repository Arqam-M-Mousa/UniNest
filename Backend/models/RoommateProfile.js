const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RoommateProfile = sequelize.define(
    "RoommateProfile",
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            unique: true,
            references: {
                model: "users",
                key: "id",
            },
        },
        universityId: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: "universities",
                key: "id",
            },
        },
        minBudget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        maxBudget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        cleanlinessLevel: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5,
            },
        },
        noiseLevel: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5,
            },
        },
        sleepSchedule: {
            type: DataTypes.ENUM("early", "normal", "late"),
            allowNull: true,
        },
        studyHabits: {
            type: DataTypes.ENUM("home", "library", "mixed"),
            allowNull: true,
        },
        smokingAllowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        petsAllowed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        guestsAllowed: {
            type: DataTypes.ENUM("never", "sometimes", "often"),
            defaultValue: "sometimes",
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        major: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        interests: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        moveInDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        preferredAreas: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: [],
        },
        matchingPriorities: {
            type: DataTypes.JSON,
            allowNull: true,
            defaultValue: null,
            comment: "User preferences for matching importance: { budget: 1-5, cleanliness: 1-5, noise: 1-5, sleepSchedule: 1-5, studyHabits: 1-5, interests: 1-5, smoking: 1-5, pets: 1-5, guests: 1-5 }",
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "roommate_profiles",
        timestamps: true,
        underscored: true,
    }
);

module.exports = RoommateProfile;
