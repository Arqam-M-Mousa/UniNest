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
        // Budget preferences
        minBudget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        maxBudget: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        // Living preferences (1-5 scale)
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
        // Lifestyle preferences
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
        // Personal info
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // Major / Field of Study
        major: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        // Interests / Tags for better matching
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
        // Profile status
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
