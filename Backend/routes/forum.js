const express = require("express");
const { Op } = require("sequelize");
const {
    ForumPost,
    ForumComment,
    ForumLike,
    User,
} = require("../models");
const { authenticate, authorize } = require("../middleware/auth");
const { sendSuccess, sendError, HTTP_STATUS } = require("../utils/responses");

const router = express.Router();

// GET /api/forum/posts - Get all forum posts with filters and pagination
router.get("/posts", async (req, res) => {
    try {
        const {
            category,
            search,
            sortBy = "createdAt",
            sortOrder = "DESC",
            limit = 20,
            offset = 0,
        } = req.query;

        const where = {};

        if (category && category !== "All") {
            where.category = category;
        }

        if (search) {
            where[Op.or] = [
                { title: { [Op.iLike]: `%${search}%` } },
                { content: { [Op.iLike]: `%${search}%` } },
            ];
        }

        const order = [];
        if (sortBy === "popular") {
            order.push(["viewCount", "DESC"]);
        } else if (sortBy === "likes") {
            // We'll handle this with a subquery count
            order.push(["createdAt", "DESC"]); // Fallback for now
        } else {
            order.push([sortBy, sortOrder.toUpperCase()]);
        }

        // Pinned posts should always be at the top
        order.unshift(["isPinned", "DESC"]);

        const total = await ForumPost.count({ where });

        const posts = await ForumPost.findAll({
            where,
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role"],
                },
                {
                    model: ForumComment,
                    as: "comments",
                    attributes: ["id"],
                    required: false,
                },
                {
                    model: ForumLike,
                    as: "likes",
                    attributes: ["id", "userId", "voteType"],
                    required: false,
                },
            ],
            order,
            limit: Math.min(parseInt(limit, 10), 50),
            offset: parseInt(offset, 10),
        });

        const postsWithCounts = posts.map((post) => {
            const upvotes = post.likes ? post.likes.filter(l => l.voteType === 'up').length : 0;
            const downvotes = post.likes ? post.likes.filter(l => l.voteType === 'down').length : 0;
            return {
                id: post.id,
                title: post.title,
                content: post.content,
                category: post.category,
                isPinned: post.isPinned,
                isLocked: post.isLocked,
                viewCount: post.viewCount,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                author: post.author,
                commentCount: post.comments ? post.comments.length : 0,
                likes: post.likes || [],
                upvotes,
                downvotes,
                voteScore: upvotes - downvotes,
            };
        });

        return sendSuccess(res, {
            posts: postsWithCounts,
            total,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
        });
    } catch (error) {
        console.error("Failed to fetch forum posts", error);
        return sendError(
            res,
            "Failed to fetch forum posts",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// GET /api/forum/posts/:id - Get single post with comments
router.get("/posts/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const post = await ForumPost.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role", "isIdentityVerified"],
                },
                {
                    model: ForumComment,
                    as: "comments",
                    include: [
                        {
                            model: User,
                            as: "author",
                            attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role"],
                        },
                    ],
                    order: [["createdAt", "ASC"]],
                },
                {
                    model: ForumLike,
                    as: "likes",
                    attributes: ["id", "userId", "voteType"],
                },
            ],
        });

        if (!post) {
            return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
        }

        // Increment view count
        await ForumPost.increment("viewCount", { where: { id } });

        const upvotes = post.likes ? post.likes.filter(l => l.voteType === 'up').length : 0;
        const downvotes = post.likes ? post.likes.filter(l => l.voteType === 'down').length : 0;

        const result = {
            id: post.id,
            title: post.title,
            content: post.content,
            category: post.category,
            isPinned: post.isPinned,
            isLocked: post.isLocked,
            viewCount: post.viewCount + 1,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
            author: post.author,
            comments: post.comments || [],
            likes: post.likes || [],
            upvotes,
            downvotes,
            voteScore: upvotes - downvotes,
        };

        return sendSuccess(res, result);
    } catch (error) {
        console.error("Failed to fetch forum post", error);
        return sendError(
            res,
            "Failed to fetch forum post",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/forum/posts - Create new post
router.post("/posts", authenticate, async (req, res) => {
    try {
        const { title, content, category } = req.body;
        const userId = req.user.id;

        if (!title || !content) {
            return sendError(
                res,
                "Title and content are required",
                HTTP_STATUS.BAD_REQUEST
            );
        }

        const post = await ForumPost.create({
            userId,
            title,
            content,
            category: category || "General",
        });

        const fullPost = await ForumPost.findByPk(post.id, {
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role"],
                },
            ],
        });

        // Emit Socket.io event for real-time updates
        const io = req.app.get("io");
        if (io) {
            io.emit("forum:new_post", fullPost);
        }

        return sendSuccess(res, fullPost, HTTP_STATUS.CREATED);
    } catch (error) {
        console.error("Failed to create forum post", error);
        return sendError(
            res,
            "Failed to create forum post",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// PUT /api/forum/posts/:id - Update post
router.put("/posts/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, category } = req.body;
        const userId = req.user.id;
        const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);

        const post = await ForumPost.findByPk(id);

        if (!post) {
            return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user is author or admin
        if (post.userId !== userId && !isAdmin) {
            return sendError(
                res,
                "Not authorized to edit this post",
                HTTP_STATUS.FORBIDDEN
            );
        }

        await post.update({
            ...(title && { title }),
            ...(content && { content }),
            ...(category && { category }),
        });

        const updatedPost = await ForumPost.findByPk(id, {
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role"],
                },
            ],
        });

        // Emit Socket.io event
        const io = req.app.get("io");
        if (io) {
            io.emit("forum:post_updated", updatedPost);
        }

        return sendSuccess(res, updatedPost);
    } catch (error) {
        console.error("Failed to update forum post", error);
        return sendError(
            res,
            "Failed to update forum post",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// DELETE /api/forum/posts/:id - Delete post
router.delete("/posts/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);

        const post = await ForumPost.findByPk(id);

        if (!post) {
            return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user is author or admin
        if (post.userId !== userId && !isAdmin) {
            return sendError(
                res,
                "Not authorized to delete this post",
                HTTP_STATUS.FORBIDDEN
            );
        }

        await post.destroy();

        // Emit Socket.io event
        const io = req.app.get("io");
        if (io) {
            io.emit("forum:post_deleted", { id });
        }

        return sendSuccess(res, { message: "Post deleted successfully" });
    } catch (error) {
        console.error("Failed to delete forum post", error);
        return sendError(
            res,
            "Failed to delete forum post",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/forum/posts/:id/comments - Add comment to post
router.post("/posts/:id/comments", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) {
            return sendError(res, "Content is required", HTTP_STATUS.BAD_REQUEST);
        }

        const post = await ForumPost.findByPk(id);

        if (!post) {
            return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
        }

        if (post.isLocked) {
            return sendError(
                res,
                "This post is locked and cannot receive new comments",
                HTTP_STATUS.FORBIDDEN
            );
        }

        const comment = await ForumComment.create({
            postId: id,
            userId,
            content,
        });

        const fullComment = await ForumComment.findByPk(comment.id, {
            include: [
                {
                    model: User,
                    as: "author",
                    attributes: ["id", "firstName", "lastName", "avatarUrl", "profilePictureUrl", "role"],
                },
            ],
        });

        // Emit Socket.io event
        const io = req.app.get("io");
        if (io) {
            io.emit("forum:new_comment", { postId: id, comment: fullComment });
        }

        return sendSuccess(res, fullComment, HTTP_STATUS.CREATED);
    } catch (error) {
        console.error("Failed to add comment", error);
        return sendError(
            res,
            "Failed to add comment",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// DELETE /api/forum/comments/:id - Delete comment
router.delete("/comments/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const isAdmin = ["SuperAdmin", "Admin"].includes(req.user.role);

        const comment = await ForumComment.findByPk(id);

        if (!comment) {
            return sendError(res, "Comment not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user is author or admin
        if (comment.userId !== userId && !isAdmin) {
            return sendError(
                res,
                "Not authorized to delete this comment",
                HTTP_STATUS.FORBIDDEN
            );
        }

        const postId = comment.postId;
        await comment.destroy();

        // Emit Socket.io event
        const io = req.app.get("io");
        if (io) {
            io.emit("forum:comment_deleted", { postId, commentId: id });
        }

        return sendSuccess(res, { message: "Comment deleted successfully" });
    } catch (error) {
        console.error("Failed to delete comment", error);
        return sendError(
            res,
            "Failed to delete comment",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/forum/posts/:id/vote - Vote on post (upvote or downvote)
router.post("/posts/:id/vote", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body; // 'up' or 'down'
        const userId = req.user.id;

        if (!voteType || !['up', 'down'].includes(voteType)) {
            return sendError(res, "Invalid vote type. Must be 'up' or 'down'", HTTP_STATUS.BAD_REQUEST);
        }

        const post = await ForumPost.findByPk(id);

        if (!post) {
            return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user already voted on the post
        const existingVote = await ForumLike.findOne({
            where: { postId: id, userId },
        });

        let userVote = null;
        if (existingVote) {
            if (existingVote.voteType === voteType) {
                // Same vote type - remove vote (toggle off)
                await existingVote.destroy();
                userVote = null;
            } else {
                // Different vote type - change vote
                await existingVote.update({ voteType });
                userVote = voteType;
            }
        } else {
            // No existing vote - create new vote
            await ForumLike.create({ postId: id, userId, voteType });
            userVote = voteType;
        }

        // Get updated vote counts
        const upvotes = await ForumLike.count({ where: { postId: id, voteType: 'up' } });
        const downvotes = await ForumLike.count({ where: { postId: id, voteType: 'down' } });

        return sendSuccess(res, {
            userVote,
            upvotes,
            downvotes,
            voteScore: upvotes - downvotes
        });
    } catch (error) {
        console.error("Failed to vote", error);
        return sendError(
            res,
            "Failed to vote",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// POST /api/forum/posts/:id/like - Toggle like on post (legacy - kept for compatibility)
router.post("/posts/:id/like", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const post = await ForumPost.findByPk(id);

        if (!post) {
            return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
        }

        // Check if user already liked the post
        const existingLike = await ForumLike.findOne({
            where: { postId: id, userId },
        });

        let liked = false;
        if (existingLike) {
            // Unlike
            await existingLike.destroy();
            liked = false;
        } else {
            // Like (upvote)
            await ForumLike.create({ postId: id, userId, voteType: 'up' });
            liked = true;
        }

        // Get updated counts
        const upvotes = await ForumLike.count({ where: { postId: id, voteType: 'up' } });
        const downvotes = await ForumLike.count({ where: { postId: id, voteType: 'down' } });

        return sendSuccess(res, { liked, likeCount: upvotes, voteScore: upvotes - downvotes });
    } catch (error) {
        console.error("Failed to toggle like", error);
        return sendError(
            res,
            "Failed to toggle like",
            HTTP_STATUS.SERVER_ERROR,
            error
        );
    }
});

// PATCH /api/forum/posts/:id/pin - Pin/unpin post (admin only)
router.patch(
    "/posts/:id/pin",
    authenticate,
    authorize(["SuperAdmin", "Admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const post = await ForumPost.findByPk(id);

            if (!post) {
                return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
            }

            await post.update({ isPinned: !post.isPinned });

            return sendSuccess(res, {
                message: post.isPinned ? "Post pinned" : "Post unpinned",
                isPinned: post.isPinned,
            });
        } catch (error) {
            console.error("Failed to toggle pin", error);
            return sendError(
                res,
                "Failed to toggle pin",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

// PATCH /api/forum/posts/:id/lock - Lock/unlock post (admin only)
router.patch(
    "/posts/:id/lock",
    authenticate,
    authorize(["SuperAdmin", "Admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;

            const post = await ForumPost.findByPk(id);

            if (!post) {
                return sendError(res, "Post not found", HTTP_STATUS.NOT_FOUND);
            }

            await post.update({ isLocked: !post.isLocked });

            return sendSuccess(res, {
                message: post.isLocked ? "Post locked" : "Post unlocked",
                isLocked: post.isLocked,
            });
        } catch (error) {
            console.error("Failed to toggle lock", error);
            return sendError(
                res,
                "Failed to toggle lock",
                HTTP_STATUS.SERVER_ERROR,
                error
            );
        }
    }
);

module.exports = router;
