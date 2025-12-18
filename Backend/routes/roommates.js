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

function calculateCompatibilityScore(profileA, profileB) {
    let score = 0;
    let totalWeight = 0;

    const budgetWeight = 25;
    totalWeight += budgetWeight;
    if (profileA.minBudget && profileA.maxBudget && profileB.minBudget && profileB.maxBudget) {
        const overlapStart = Math.max(parseFloat(profileA.minBudget), parseFloat(profileB.minBudget));
        const overlapEnd = Math.min(parseFloat(profileA.maxBudget), parseFloat(profileB.maxBudget));
        if (overlapEnd >= overlapStart) {
            const overlapRange = overlapEnd - overlapStart;
            const maxRange = Math.max(
                parseFloat(profileA.maxBudget) - parseFloat(profileA.minBudget),
                parseFloat(profileB.maxBudget) - parseFloat(profileB.minBudget)
            );
            score += budgetWeight * Math.min(1, overlapRange / (maxRange || 1));
        }
    } else {
        score += budgetWeight * 0.5;
    }

    const majorWeight = 10;
    totalWeight += majorWeight;
    if (profileA.major && profileB.major) {
        if (profileA.major === profileB.major) score += majorWeight;
    } else {
        score += majorWeight * 0.5;
    }

    const interestsWeight = 10;
    totalWeight += interestsWeight;
    const interestsA = Array.isArray(profileA.interests) ? profileA.interests : [];
    const interestsB = Array.isArray(profileB.interests) ? profileB.interests : [];
    if (interestsA.length > 0 && interestsB.length > 0) {
        const shared = interestsA.filter((i) => interestsB.includes(i)).length;
        const maxPossible = Math.max(interestsA.length, interestsB.length);
        score += interestsWeight * (shared / maxPossible);
    } else {
        score += interestsWeight * 0.3;
    }

    const cleanlinessWeight = 10;
    totalWeight += cleanlinessWeight;
    if (profileA.cleanlinessLevel && profileB.cleanlinessLevel) {
        const diff = Math.abs(profileA.cleanlinessLevel - profileB.cleanlinessLevel);
        score += cleanlinessWeight * (1 - diff / 4);
    } else {
        score += cleanlinessWeight * 0.5;
    }

    const noiseWeight = 10;
    totalWeight += noiseWeight;
    if (profileA.noiseLevel && profileB.noiseLevel) {
        const diff = Math.abs(profileA.noiseLevel - profileB.noiseLevel);
        score += noiseWeight * (1 - diff / 4);
    } else {
        score += noiseWeight * 0.5;
    }

    const sleepWeight = 10;
    totalWeight += sleepWeight;
    if (profileA.sleepSchedule && profileB.sleepSchedule) {
        if (profileA.sleepSchedule === profileB.sleepSchedule) {
            score += sleepWeight;
        } else if (profileA.sleepSchedule === "normal" || profileB.sleepSchedule === "normal") {
            score += sleepWeight * 0.5;
        }
    } else {
        score += sleepWeight * 0.5;
    }

    const studyWeight = 10;
    totalWeight += studyWeight;
    if (profileA.studyHabits && profileB.studyHabits) {
        if (profileA.studyHabits === profileB.studyHabits) {
            score += studyWeight;
        } else if (profileA.studyHabits === "mixed" || profileB.studyHabits === "mixed") {
            score += studyWeight * 0.7;
        }
    } else {
        score += studyWeight * 0.5;
    }

    const smokingWeight = 5;
    totalWeight += smokingWeight;
    if (profileA.smokingAllowed === profileB.smokingAllowed) score += smokingWeight;

    const petsWeight = 5;
    totalWeight += petsWeight;
    if (profileA.petsAllowed === profileB.petsAllowed) score += petsWeight;

    const guestsWeight = 5;
    totalWeight += guestsWeight;
    if (profileA.guestsAllowed && profileB.guestsAllowed) {
        if (profileA.guestsAllowed === profileB.guestsAllowed) {
            score += guestsWeight;
        } else if (profileA.guestsAllowed === "sometimes" || profileB.guestsAllowed === "sometimes") {
            score += guestsWeight * 0.7;
        }
    } else {
        score += guestsWeight * 0.5;
    }

    return Math.round((score / totalWeight) * 100);
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

            // Get current user's profile for compatibility calculation
            const myProfile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
            });

            // Build where clause for search
            const where = {
                userId: { [Op.ne]: req.user.id }, // Exclude self
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

            // Get current user's gender for filtering
            const currentUser = await User.findByPk(req.user.id);
            const currentUserGender = currentUser?.gender;

            const profiles = await RoommateProfile.findAll({
                where,
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["id", "firstName", "lastName", "profilePictureUrl", "gender"],
                        // Filter by same gender if current user has gender set
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

            // Calculate compatibility scores
            const results = profiles.map((profile) => {
                const compatibilityScore = myProfile
                    ? calculateCompatibilityScore(myProfile, profile)
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
                    compatibilityScore,
                };
            });

            // Sort by compatibility score if user has a profile
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

            // Get both sent and received matches
            const matches = await RoommateMatch.findAll({
                where: {
                    [Op.or]: [{ requesterId: userId }, { targetId: userId }],
                },
                include: [
                    {
                        model: User,
                        as: "requester",
                        attributes: ["id", "firstName", "lastName", "profilePictureUrl", "gender"],
                    },
                    {
                        model: User,
                        as: "target",
                        attributes: ["id", "firstName", "lastName", "profilePictureUrl", "gender"],
                    },
                ],
                order: [["createdAt", "DESC"]],
            });

            // Fetch requester profiles for pending received matches
            const transformedMatches = await Promise.all(matches.map(async (match) => {
                const isSender = match.requesterId === userId;
                const otherUser = isSender ? match.target : match.requester;
                const otherUserId = isSender ? match.targetId : match.requesterId;

                // Include the other user's profile
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

            // Can't match yourself
            if (targetUserId === req.user.id) {
                return sendError(res, "Cannot send match request to yourself", HTTP_STATUS.BAD_REQUEST);
            }

            // Check if SENDER has a roommate profile (required to send match request)
            const senderProfile = await RoommateProfile.findOne({
                where: { userId: req.user.id, isActive: true },
            });
            if (!senderProfile) {
                return sendError(res, "You must create a roommate profile before sending match requests", HTTP_STATUS.BAD_REQUEST);
            }

            // Check if target user exists and is a student
            const targetUser = await User.findByPk(targetUserId);
            if (!targetUser) {
                return sendError(res, "User not found", HTTP_STATUS.NOT_FOUND);
            }
            if (targetUser.role !== "Student") {
                return sendError(res, "Can only match with students", HTTP_STATUS.BAD_REQUEST);
            }

            // Check if target has a roommate profile
            const targetProfile = await RoommateProfile.findOne({
                where: { userId: targetUserId, isActive: true },
            });
            if (!targetProfile) {
                return sendError(res, "User does not have an active roommate profile", HTTP_STATUS.BAD_REQUEST);
            }

            // GENDER VALIDATION: Only same gender can match
            const currentUser = await User.findByPk(req.user.id);
            if (currentUser.gender && targetUser.gender && currentUser.gender !== targetUser.gender) {
                return sendError(res, "You can only connect with roommates of the same gender", HTTP_STATUS.BAD_REQUEST);
            }

            // Check for existing match (in either direction)
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

            // Calculate compatibility score
            const myProfile = await RoommateProfile.findOne({
                where: { userId: req.user.id },
            });

            const compatibilityScore = myProfile
                ? calculateCompatibilityScore(myProfile, targetProfile)
                : null;

            // Create match request
            const match = await RoommateMatch.create({
                requesterId: req.user.id,
                targetId: targetUserId,
                compatibilityScore,
                status: "pending",
                message: message || null,
            });

            // Send notification to target user about the match request
            const notification = await Notification.create({
                userId: targetUserId,
                title: "New Roommate Request",
                message: `${currentUser.firstName} ${currentUser.lastName} wants to connect with you as a roommate${message ? `: "${message}"` : ""}`,
                relatedEntityType: "roommate_match",
                relatedEntityId: match.id,
                actionUrl: "/roommates",
            });

            // Emit real-time notification via socket
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

            // Only the target can respond to the match
            if (match.targetId !== req.user.id) {
                return sendError(res, "Only the recipient can respond to a match request", HTTP_STATUS.FORBIDDEN);
            }

            // Can only respond to pending matches
            if (match.status !== "pending") {
                return sendError(res, "Match has already been responded to", HTTP_STATUS.BAD_REQUEST);
            }

            await match.update({
                status,
                respondedAt: new Date(),
            });

            // Send notification to the requester about the response
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

            // Emit real-time notification via socket
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

            // Only the requester or the target can delete the match
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
