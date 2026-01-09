const express = require("express");
const { Op } = require("sequelize");
const {
    User,
    University,
    RoommateProfile,
    RoommateMatch,
    Notification,
} = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

// ============================================================================
// FEATURE WEIGHTS CONFIGURATION
// These weights determine how important each factor is in compatibility scoring
// All weights should sum to 1.0 for proper normalization
// ============================================================================
const FEATURE_WEIGHTS = {
    budget: 0.20,           // Financial compatibility - crucial for shared living
    cleanliness: 0.15,      // Daily living habits
    noise: 0.15,            // Study/rest environment compatibility
    sleepSchedule: 0.12,    // Lifestyle alignment
    studyHabits: 0.10,      // Academic lifestyle
    interests: 0.10,        // Social bonding potential
    major: 0.05,            // Academic connection
    smoking: 0.05,          // Binary dealbreaker
    pets: 0.04,             // Binary preference
    guests: 0.04,           // Social preference
};

// Dealbreaker features - if these don't match, apply a penalty multiplier
const DEALBREAKER_PENALTY = 0.7; // 30% reduction for dealbreaker mismatches
const DEALBREAKER_FEATURES = ['smoking', 'pets'];

/**
 * Convert user's priority preferences (1-5 scale) to normalized weights
 * Users can specify how important each factor is to them
 * @param {Object} userPriorities - User's matching priorities { budget: 1-5, cleanliness: 1-5, etc. }
 * @returns {Object} Normalized weights that sum to ~1.0
 */
function getUserWeights(userPriorities) {
    if (!userPriorities || typeof userPriorities !== 'object') {
        return FEATURE_WEIGHTS; // Use defaults if no custom priorities
    }

    // Map priority keys to feature weight keys
    const priorityToWeight = {
        budget: 'budget',
        cleanliness: 'cleanliness',
        noise: 'noise',
        sleepSchedule: 'sleepSchedule',
        studyHabits: 'studyHabits',
        interests: 'interests',
        major: 'major',
        smoking: 'smoking',
        pets: 'pets',
        guests: 'guests',
    };

    // Priority 1 = 0.5x default, Priority 3 = 1x default, Priority 5 = 2x default
    const rawWeights = {};
    let totalRaw = 0;

    for (const [priorityKey, weightKey] of Object.entries(priorityToWeight)) {
        const userPriority = userPriorities[priorityKey];
        const defaultWeight = FEATURE_WEIGHTS[weightKey];

        if (userPriority !== undefined && userPriority >= 1 && userPriority <= 5) {
            // Scale: 1->0.5, 2->0.75, 3->1.0, 4->1.5, 5->2.0
            const multiplier = 0.25 + (userPriority * 0.35);
            rawWeights[weightKey] = defaultWeight * multiplier;
        } else {
            rawWeights[weightKey] = defaultWeight;
        }
        totalRaw += rawWeights[weightKey];
    }

    const normalizedWeights = {};
    for (const [key, value] of Object.entries(rawWeights)) {
        normalizedWeights[key] = value / totalRaw;
    }

    return normalizedWeights;
}

// ============================================================================
// FEATURE EXTRACTION FUNCTIONS
// Extract and normalize each feature to a [0, 1] scale
// ============================================================================

/**
 * Extracts normalized features from a roommate profile
 * All features are normalized to [0, 1] where 1 = perfect match potential
 * @param {Object} profile - The roommate profile
 * @returns {Object} Normalized feature vector
 */
function extractFeatures(profile) {
    return {
        // Continuous/ordinal features normalized to [0, 1]
        budgetMid: normalizeBudget(profile.minBudget, profile.maxBudget),
        budgetRange: getBudgetRange(profile.minBudget, profile.maxBudget),
        cleanliness: normalizeOrdinal(profile.cleanlinessLevel, 1, 5),
        noise: normalizeOrdinal(profile.noiseLevel, 1, 5),

        // Categorical features encoded as ordinal
        sleepSchedule: encodeSleepSchedule(profile.sleepSchedule),
        studyHabits: encodeStudyHabits(profile.studyHabits),
        guests: encodeGuests(profile.guestsAllowed),

        // Binary features
        smoking: profile.smokingAllowed ? 1 : 0,
        pets: profile.petsAllowed ? 1 : 0,

        // Set-based features (for Jaccard similarity)
        interests: Array.isArray(profile.interests) ? profile.interests : [],
        major: profile.major || null,
    };
}

/**
 * Normalize ordinal value to [0, 1]
 */
function normalizeOrdinal(value, min, max) {
    if (value === null || value === undefined) return null;
    return (value - min) / (max - min);
}

/**
 * Calculate normalized budget midpoint (for distance calculation)
 * Uses log scale since budget differences matter more at lower ranges
 */
function normalizeBudget(minBudget, maxBudget) {
    if (!minBudget || !maxBudget) return null;
    const midpoint = (parseFloat(minBudget) + parseFloat(maxBudget)) / 2;
    // Normalize using log scale (assuming budget range 100-5000)
    const logMin = Math.log(100);
    const logMax = Math.log(5000);
    const logMid = Math.log(Math.max(100, Math.min(5000, midpoint)));
    return (logMid - logMin) / (logMax - logMin);
}

/**
 * Get budget range for overlap calculation
 */
function getBudgetRange(minBudget, maxBudget) {
    if (!minBudget || !maxBudget) return { min: null, max: null };
    return {
        min: parseFloat(minBudget),
        max: parseFloat(maxBudget)
    };
}

/**
 * Encode sleep schedule as ordinal (early bird = 0, normal = 0.5, night owl = 1)
 */
function encodeSleepSchedule(schedule) {
    const mapping = {
        'early_bird': 0,
        'early': 0,
        'normal': 0.5,
        'night_owl': 1,
        'night': 1,
        'late': 1,
    };
    return schedule ? (mapping[schedule.toLowerCase()] ?? 0.5) : null;
}

/**
 * Encode study habits as ordinal
 */
function encodeStudyHabits(habits) {
    const mapping = {
        'home': 0,
        'at_home': 0,
        'mixed': 0.5,
        'library': 1,
        'outside': 1,
    };
    return habits ? (mapping[habits.toLowerCase()] ?? 0.5) : null;
}

/**
 * Encode guest preference as ordinal
 */
function encodeGuests(guests) {
    const mapping = {
        'never': 0,
        'rarely': 0.25,
        'sometimes': 0.5,
        'often': 0.75,
        'always': 1,
    };
    return guests ? (mapping[guests.toLowerCase()] ?? 0.5) : null;
}

// ============================================================================
// DISTANCE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate weighted Euclidean distance between two feature vectors
 * Returns a similarity score [0, 100] where 100 = perfect match
 * @param {Object} profileA - First roommate profile (the searcher)
 * @param {Object} profileB - Second roommate profile (potential match)
 * @param {Object} customWeights - Optional custom weights based on user priorities
 */
function calculateCompatibilityScore(profileA, profileB, customWeights = null) {
    const featuresA = extractFeatures(profileA);
    const featuresB = extractFeatures(profileB);

    const weights = customWeights || FEATURE_WEIGHTS;

    let weightedDistanceSum = 0;
    let totalWeight = 0;
    let hasDealbreaker = false;

    const budgetSimilarity = calculateBudgetSimilarity(
        featuresA.budgetRange,
        featuresB.budgetRange
    );
    if (budgetSimilarity !== null) {
        weightedDistanceSum += weights.budget * Math.pow(1 - budgetSimilarity, 2);
        totalWeight += weights.budget;
    }

    const ordinalFeatures = [
        { key: 'cleanliness', weight: weights.cleanliness },
        { key: 'noise', weight: weights.noise },
    ];

    for (const { key, weight } of ordinalFeatures) {
        const valA = featuresA[key];
        const valB = featuresB[key];
        if (valA !== null && valB !== null) {
            const distance = Math.abs(valA - valB);
            weightedDistanceSum += weight * Math.pow(distance, 2);
            totalWeight += weight;
        }
    }

    const categoricalFeatures = [
        { key: 'sleepSchedule', weight: weights.sleepSchedule },
        { key: 'studyHabits', weight: weights.studyHabits },
        { key: 'guests', weight: weights.guests },
    ];

    for (const { key, weight } of categoricalFeatures) {
        const valA = featuresA[key];
        const valB = featuresB[key];
        if (valA !== null && valB !== null) {
            const distance = Math.abs(valA - valB);
            weightedDistanceSum += weight * Math.pow(distance, 2);
            totalWeight += weight;
        }
    }

    const binaryFeatures = [
        { key: 'smoking', weight: weights.smoking },
        { key: 'pets', weight: weights.pets },
    ];

    for (const { key, weight } of binaryFeatures) {
        const valA = featuresA[key];
        const valB = featuresB[key];
        const distance = valA === valB ? 0 : 1;
        weightedDistanceSum += weight * Math.pow(distance, 2);
        totalWeight += weight;

        if (DEALBREAKER_FEATURES.includes(key) && valA !== valB) {
            hasDealbreaker = true;
        }
    }

    const interestsSimilarity = calculateJaccardSimilarity(
        featuresA.interests,
        featuresB.interests
    );
    if (interestsSimilarity !== null) {
        weightedDistanceSum += weights.interests * Math.pow(1 - interestsSimilarity, 2);
        totalWeight += weights.interests;
    }

    let sameMajor = 0;
    if (featuresA.major && featuresB.major) {
        const majorMatch = featuresA.major.toLowerCase() === featuresB.major.toLowerCase() ? 0 : 1;
        sameMajor = majorMatch === 0 ? 1 : 0; // Invert: 0 distance = 1 same, 1 distance = 0 different
        weightedDistanceSum += weights.major * Math.pow(majorMatch, 2);
        totalWeight += weights.major;
    }

    if (totalWeight === 0) {
        return { score: 50, sameMajor: 0 };
    }

    const normalizedDistance = Math.sqrt(weightedDistanceSum / totalWeight);

    let similarity = (1 - normalizedDistance) * 100;

    if (hasDealbreaker) {
        similarity *= DEALBREAKER_PENALTY;
    }

    return {
        score: Math.round(Math.max(0, Math.min(100, similarity))),
        sameMajor
    };
}

/**
 * Calculate budget range overlap similarity
 * Returns similarity [0, 1] based on how much budget ranges overlap
 */
function calculateBudgetSimilarity(rangeA, rangeB) {
    if (!rangeA.min || !rangeA.max || !rangeB.min || !rangeB.max) {
        return null;
    }

    const overlapStart = Math.max(rangeA.min, rangeB.min);
    const overlapEnd = Math.min(rangeA.max, rangeB.max);

    if (overlapEnd < overlapStart) {
        const gap = overlapStart - overlapEnd;
        const avgRange = ((rangeA.max - rangeA.min) + (rangeB.max - rangeB.min)) / 2;
        return Math.max(0, 1 - (gap / (avgRange || 1)));
    }

    const overlapRange = overlapEnd - overlapStart;
    const unionRange = Math.max(rangeA.max, rangeB.max) - Math.min(rangeA.min, rangeB.min);

    return overlapRange / (unionRange || 1);
}

/**
 * Calculate Jaccard similarity for set-based features (interests)
 * Returns similarity [0, 1] where 1 = identical sets
 */
function calculateJaccardSimilarity(setA, setB) {
    if (!setA.length || !setB.length) {
        return null;
    }

    const setALower = setA.map(i => i.toLowerCase());
    const setBLower = setB.map(i => i.toLowerCase());

    const intersection = setALower.filter(i => setBLower.includes(i)).length;
    const union = new Set([...setALower, ...setBLower]).size;

    return union > 0 ? intersection / union : 0;
}


router.get(
    "/profile",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const profile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
                include: [
                    {
                        model: University,
                        as: "university",
                        attributes: ["id", "name", "city"],
                    },
                ],
            });

            if (!profile) {
                return sendSuccess(res, { profile: null });
            }

            return sendSuccess(res, { profile });
        } catch (error) {
            console.error("Failed to fetch roommate profile:", error);
            return sendError(
                res,
                "Failed to fetch roommate profile",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.post(
    "/profile",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const {
                universityId,
                minBudget,
                maxBudget,
                cleanlinessLevel,
                noiseLevel,
                sleepSchedule,
                studyHabits,
                smokingAllowed,
                petsAllowed,
                guestsAllowed,
                bio,
                major,
                interests,
                moveInDate,
                preferredAreas,
                matchingPriorities,
                isActive,
            } = req.body;

            // Validate cleanliness and noise levels
            if (cleanlinessLevel && (cleanlinessLevel < 1 || cleanlinessLevel > 5)) {
                return sendError(res, "Cleanliness level must be between 1 and 5", HTTP_STATUS.BAD_REQUEST);
            }
            if (noiseLevel && (noiseLevel < 1 || noiseLevel > 5)) {
                return sendError(res, "Noise level must be between 1 and 5", HTTP_STATUS.BAD_REQUEST);
            }

            // Find existing profile or create new
            let profile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
            });

            // If universityId not provided, get it from user record
            let finalUniversityId = universityId;
            if (!finalUniversityId) {
                const user = await User.findByPk(req.user.id);
                finalUniversityId = user.universityId;
            }

            const profileData = {
                userId: req.user.id,
                universityId: finalUniversityId || null,
                minBudget: minBudget || null,
                maxBudget: maxBudget || null,
                cleanlinessLevel: cleanlinessLevel || null,
                noiseLevel: noiseLevel || null,
                sleepSchedule: sleepSchedule || null,
                studyHabits: studyHabits || null,
                smokingAllowed: smokingAllowed ?? false,
                petsAllowed: petsAllowed ?? false,
                guestsAllowed: guestsAllowed || "sometimes",
                bio: bio || null,
                major: major || null,
                interests: interests || [],
                moveInDate: moveInDate || null,
                preferredAreas: preferredAreas || [],
                matchingPriorities: matchingPriorities || null,
                isActive: isActive ?? true,
            };

            if (profile) {
                // Update existing
                await profile.update(profileData);
            } else {
                // Create new
                profile = await RoommateProfile.create(profileData);
            }

            // Fetch with associations
            const updatedProfile = await RoommateProfile.findByPk(profile.id, {
                include: [
                    {
                        model: University,
                        as: "university",
                        attributes: ["id", "name", "city"],
                    },
                ],
            });

            return sendSuccess(res, { profile: updatedProfile });
        } catch (error) {
            console.error("Failed to save roommate profile:", error);
            return sendError(
                res,
                "Failed to save roommate profile",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.delete(
    "/profile",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const profile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
            });

            if (!profile) {
                return sendError(res, "No roommate profile found", HTTP_STATUS.NOT_FOUND);
            }

            // Deactivate instead of deleting
            await profile.update({ isActive: false });

            return sendSuccess(res, { message: "Roommate profile deactivated" });
        } catch (error) {
            console.error("Failed to deactivate roommate profile:", error);
            return sendError(
                res,
                "Failed to deactivate roommate profile",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.get(
    "/search",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const {
                universityId,
                minBudget,
                maxBudget,
                minCleanliness,
                maxCleanliness,
                sleepSchedule,
                studyHabits,
                smokingAllowed,
                petsAllowed,
                major,
                limit = 20,
                offset = 0,
            } = req.query;

            const myProfile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
            });

            if (myProfile && !myProfile.isActive) {
                return sendSuccess(res, {
                    profiles: [],
                    total: 0,
                    hasProfile: true,
                    isProfileActive: false,
                    message: "Activate your profile to search for roommates",
                });
            }

            const where = {
                userId: { [Op.ne]: req.user.id },
                isActive: true,
            };

            if (universityId) {
                where.universityId = universityId;
            }
            if (minBudget) {
                where.maxBudget = { [Op.gte]: parseFloat(minBudget) };
            }
            if (maxBudget) {
                where.minBudget = { [Op.lte]: parseFloat(maxBudget) };
            }
            if (sleepSchedule) {
                where.sleepSchedule = sleepSchedule;
            }
            if (studyHabits) {
                where.studyHabits = studyHabits;
            }
            if (smokingAllowed !== undefined) {
                where.smokingAllowed = smokingAllowed === "true";
            }
            if (petsAllowed !== undefined) {
                where.petsAllowed = petsAllowed === "true";
            }
            if (major) {
                where.major = major;
            }

            const currentUser = await User.findByPk(req.user.id);
            const currentUserGender = currentUser?.gender;

            const profiles = await RoommateProfile.findAll({
                where,
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "gender"],
                        where: currentUserGender ? { gender: currentUserGender } : {},
                    },
                    {
                        model: University,
                        as: "university",
                        attributes: ["id", "name", "city"],
                    },
                ],
                limit: Math.min(parseInt(limit), 50),
                offset: parseInt(offset),
                order: [["createdAt", "DESC"]],
            });

            const userWeights = myProfile ? getUserWeights(myProfile.matchingPriorities) : null;

            const results = profiles.map((profile) => {
                const compatibilityResult = myProfile
                    ? calculateCompatibilityScore(myProfile, profile, userWeights)
                    : null;

                return {
                    id: profile.id,
                    userId: profile.userId,
                    user: profile.user,
                    university: profile.university,
                    minBudget: profile.minBudget,
                    maxBudget: profile.maxBudget,
                    cleanlinessLevel: profile.cleanlinessLevel,
                    noiseLevel: profile.noiseLevel,
                    sleepSchedule: profile.sleepSchedule,
                    studyHabits: profile.studyHabits,
                    smokingAllowed: profile.smokingAllowed,
                    petsAllowed: profile.petsAllowed,
                    guestsAllowed: profile.guestsAllowed,
                    bio: profile.bio,
                    major: profile.major,
                    interests: profile.interests,
                    moveInDate: profile.moveInDate,
                    preferredAreas: profile.preferredAreas,
                    compatibilityScore: compatibilityResult?.score || null,
                    sameMajor: compatibilityResult?.sameMajor || 0,
                };
            });

            if (myProfile) {
                results.sort((a, b) => (b.compatibilityScore || 0) - (a.compatibilityScore || 0));
            }

            return sendSuccess(res, {
                profiles: results,
                total: results.length,
                hasProfile: !!myProfile,
            });
        } catch (error) {
            console.error("Failed to search roommates:", error);
            return sendError(
                res,
                "Failed to search roommates",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.get(
    "/matches",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const userId = req.user.id;

            const matches = await RoommateMatch.findAll({
                where: {
                    [Op.or]: [{ requesterId: userId }, { targetId: userId }],
                },
                include: [
                    {
                        model: User,
                        as: "requester",
                        attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "gender"],
                    },
                    {
                        model: User,
                        as: "target",
                        attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "gender"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            const transformedMatches = await Promise.all(matches.map(async (match) => {
                const isSender = match.requesterId === userId;
                const otherUser = isSender ? match.target : match.requester;
                const otherUserId = isSender ? match.targetId : match.requesterId;

                let otherUserProfile = null;
                const profile = await RoommateProfile.findOne({
                    where: { userId: otherUserId },
                });
                if (profile) {
                    otherUserProfile = {
                        bio: profile.bio,
                        major: profile.major,
                        interests: profile.interests,
                        minBudget: profile.minBudget,
                        maxBudget: profile.maxBudget,
                        cleanlinessLevel: profile.cleanlinessLevel,
                        noiseLevel: profile.noiseLevel,
                        sleepSchedule: profile.sleepSchedule,
                        studyHabits: profile.studyHabits,
                        smokingAllowed: profile.smokingAllowed,
                        petsAllowed: profile.petsAllowed,
                        guestsAllowed: profile.guestsAllowed,
                    };
                }

                return {
                    id: match.id,
                    otherUser,
                    otherUserProfile,
                    compatibilityScore: match.compatibilityScore,
                    status: match.status,
                    message: match.message,
                    isSender,
                    createdAt: match.createdAt,
                    respondedAt: match.respondedAt,
                };
            }));

            return sendSuccess(res, { matches: transformedMatches });
        } catch (error) {
            console.error("Failed to fetch matches:", error);
            return sendError(
                res,
                "Failed to fetch matches",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.post(
    "/matches/:userId",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const targetUserId = req.params.userId;
            const { message } = req.body;

            if (targetUserId === req.user.id) {
                return sendError(res, "Cannot send match request to yourself", HTTP_STATUS.BAD_REQUEST);
            }

            const senderProfile = await RoommateProfile.findOne({
                where: { userId: req.user.id, isActive: true },
            });
            if (!senderProfile) {
                return sendError(res, "You must create a roommate profile before sending match requests", HTTP_STATUS.BAD_REQUEST);
            }

            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser) {
                return sendError(res, "User not found", HTTP_STATUS.NOT_FOUND);
            }
            if (targetUser.role !== "Student") {
                return sendError(res, "Can only match with students", HTTP_STATUS.BAD_REQUEST);
            }

            const targetProfile = await RoommateProfile.findOne({
                where: { userId: targetUserId, isActive: true },
            });
            if (!targetProfile) {
                return sendError(res, "User does not have an active roommate profile", HTTP_STATUS.BAD_REQUEST);
            }

            const currentUser = await User.findByPk(req.user.id);
            if (currentUser.gender && targetUser.gender && currentUser.gender !== targetUser.gender) {
                return sendError(res, "You can only connect with roommates of the same gender", HTTP_STATUS.BAD_REQUEST);
            }

            const existingMatch = await RoommateMatch.findOne({
                where: {
                    [Op.or]: [
                        { requesterId: req.user.id, targetId: targetUserId },
                        { requesterId: targetUserId, targetId: req.user.id },
                    ],
                },
            });

            if (existingMatch) {
                return sendError(res, "Match request already exists", HTTP_STATUS.CONFLICT);
            }

            const myProfile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
            });

            const userWeights = myProfile ? getUserWeights(myProfile.matchingPriorities) : null;
            const compatibilityResult = myProfile
                ? calculateCompatibilityScore(myProfile, targetProfile, userWeights)
                : null;

            const match = await RoommateMatch.create({
                requesterId: req.user.id,
                targetId: targetUserId,
                compatibilityScore: compatibilityResult?.score || null,
                status: "pending",
                message: message || null,
            });

            const notification = await Notification.create({
                userId: targetUserId,
                title: "New Roommate Request",
                message: `${currentUser.firstName} ${currentUser.lastName} wants to connect with you as a roommate${message ? `: "${message}"` : ""}`,
                relatedEntityType: "roommate_match",
                relatedEntityId: match.id,
                actionUrl: "/roommates",
            });

            const io = req.app.get("io");
            if (io) {
                io.to(`user:${targetUserId}`).emit("notification:new", notification);
            }

            return sendSuccess(res, { match }, HTTP_STATUS.CREATED);
        } catch (error) {
            console.error("Failed to send match request:", error);
            return sendError(
                res,
                "Failed to send match request",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.put(
    "/matches/:matchId",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const { matchId } = req.params;
            const { status } = req.body;

            if (!["accepted", "rejected"].includes(status)) {
                return sendError(res, "Status must be 'accepted' or 'rejected'", HTTP_STATUS.BAD_REQUEST);
            }

            const match = await RoommateMatch.findByPk(matchId);

            if (!match) {
                return sendError(res, "Match not found", HTTP_STATUS.NOT_FOUND);
            }

            if (match.targetId !== req.user.id) {
                return sendError(res, "Only the recipient can respond to a match request", HTTP_STATUS.FORBIDDEN);
            }

            if (match.status !== "pending") {
                return sendError(res, "Match has already been responded to", HTTP_STATUS.BAD_REQUEST);
            }

            await match.update({
                status,
                respondedAt: new Date(),
            });

            const currentUser = await User.findByPk(req.user.id);
            const notificationTitle = status === "accepted"
                ? "Roommate Request Accepted!"
                : "Roommate Request Declined";
            const notificationMessage = status === "accepted"
                ? `${currentUser.firstName} ${currentUser.lastName} accepted your roommate request! You can now message each other.`
                : `${currentUser.firstName} ${currentUser.lastName} declined your roommate request.`;

            const notification = await Notification.create({
                userId: match.requesterId,
                title: notificationTitle,
                message: notificationMessage,
                relatedEntityType: "roommate_match",
                relatedEntityId: match.id,
                actionUrl: "/roommates",
            });

            const io = req.app.get("io");
            if (io) {
                io.to(`user:${match.requesterId}`).emit("notification:new", notification);
            }

            return sendSuccess(res, { match });
        } catch (error) {
            console.error("Failed to update match:", error);
            return sendError(
                res,
                "Failed to update match",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

router.delete(
    "/matches/:matchId",
    authenticate,
    authorize(["Student"]),
    async (req, res) => {
        try {
            const { matchId } = req.params;
            const userId = req.user.id;

            const match = await RoommateMatch.findByPk(matchId);

            if (!match) {
                return sendError(res, "Match not found", HTTP_STATUS.NOT_FOUND);
            }

            if (match.requesterId !== userId && match.targetId !== userId) {
                return sendError(res, "You are not authorized to remove this match", HTTP_STATUS.FORBIDDEN);
            }

            await match.destroy();

            return sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
        } catch (error) {
            console.error("Failed to delete match:", error);
            return sendError(
                res,
                "Failed to remove match",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

module.exports = router;
