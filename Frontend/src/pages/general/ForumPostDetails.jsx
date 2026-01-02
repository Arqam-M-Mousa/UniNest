import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { forumAPI } from "../../services/api";
import {
    EyeIcon,
    ChatBubbleLeftIcon,
    LockClosedIcon,
    PencilIcon,
    TrashIcon,
    ArrowLeftIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { ChevronUpIcon as ChevronUpSolid, ChevronDownIcon as ChevronDownSolid } from "@heroicons/react/24/solid";
import CreatePostModal from "../../components/forum/CreatePostModal";
import ForumCommentCard from "../../components/forum/ForumCommentCard";
import Alert from "../../components/common/Alert";

const CommunityPostDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentContent, setCommentContent] = useState("");
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [voteScore, setVoteScore] = useState(0);
    const [userVote, setUserVote] = useState(null);
    const [isVoting, setIsVoting] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [id]);

    useEffect(() => {
        if (!socket || !post) return;

        socket.on("forum:new_comment", ({ postId, comment }) => {
            if (postId === id) {
                setPost((prev) => ({
                    ...prev,
                    comments: [...(prev.comments || []), comment],
                }));
            }
        });

        socket.on("forum:comment_deleted", ({ postId, commentId }) => {
            if (postId === id) {
                setPost((prev) => ({
                    ...prev,
                    comments: prev.comments.filter((c) => c.id !== commentId),
                }));
            }
        });

        return () => {
            socket.off("forum:new_comment");
            socket.off("forum:comment_deleted");
        };
    }, [socket, id, post]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const response = await forumAPI.getPostById(id);
            setPost(response.data);
            setVoteScore(response.data.voteScore || 0);
            // Check user's vote on this post
            if (user && response.data.likes) {
                const userVoteData = response.data.likes.find((like) => like.userId === user.id);
                setUserVote(userVoteData?.voteType || null);
            }
        } catch (error) {
            console.error("Failed to fetch post:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVote = async (voteType) => {
        if (!user || isVoting) return;

        try {
            setIsVoting(true);
            const response = await forumAPI.vote(id, voteType);
            setVoteScore(response.data.voteScore);
            setUserVote(response.data.userVote);
        } catch (error) {
            console.error("Failed to vote:", error);
        } finally {
            setIsVoting(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentContent.trim() || !user) return;

        try {
            setSubmittingComment(true);
            const response = await forumAPI.addComment(id, commentContent);
            setPost((prev) => ({
                ...prev,
                comments: [...(prev.comments || []), response.data],
            }));
            setCommentContent("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeletePost = async () => {
        try {
            await forumAPI.deletePost(id);
            navigate("/community");
        } catch (error) {
            console.error("Failed to delete post:", error);
        }
    };

    const handleTogglePin = async () => {
        try {
            await forumAPI.togglePin(id);
            fetchPost();
        } catch (error) {
            console.error("Failed to toggle pin:", error);
        }
    };

    const handleToggleLock = async () => {
        try {
            await forumAPI.toggleLock(id);
            fetchPost();
        } catch (error) {
            console.error("Failed to toggle lock:", error);
        }
    };

    const canModerate = user && ["SuperAdmin", "Admin"].includes(user.role);
    const isAuthor = user && post && post.author?.id === user.id;

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
                <p className="text-[var(--color-text-secondary)]">{t("postNotFound")}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)] py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/community")}
                    className="flex items-center gap-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-6 transition-colors"
                >
                    <ArrowLeftIcon className="w-5 h-5" />
                    {t("backToCommunity")}
                </button>

                {/* Post Card */}
                <div className="flex bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] mb-6">
                    {/* Vote Column */}
                    <div className="flex flex-col items-center justify-start py-4 px-4 border-r border-[var(--color-border)]">
                        <button
                            onClick={() => handleVote("up")}
                            disabled={!user || isVoting}
                            className={`p-1 rounded transition-colors ${userVote === "up"
                                    ? "text-green-500"
                                    : "text-[var(--color-text-secondary)] hover:text-green-500"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={t("upvote")}
                        >
                            {userVote === "up" ? (
                                <ChevronUpSolid className="w-8 h-8" />
                            ) : (
                                <ChevronUpIcon className="w-8 h-8" />
                            )}
                        </button>
                        <span className={`text-lg font-bold my-1 ${voteScore > 0 ? "text-green-500" :
                                voteScore < 0 ? "text-red-500" :
                                    "text-[var(--color-text-secondary)]"
                            }`}>
                            {voteScore}
                        </span>
                        <button
                            onClick={() => handleVote("down")}
                            disabled={!user || isVoting}
                            className={`p-1 rounded transition-colors ${userVote === "down"
                                    ? "text-red-500"
                                    : "text-[var(--color-text-secondary)] hover:text-red-500"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={t("downvote")}
                        >
                            {userVote === "down" ? (
                                <ChevronDownSolid className="w-8 h-8" />
                            ) : (
                                <ChevronDownIcon className="w-8 h-8" />
                            )}
                        </button>
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 p-6">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                            <div className="flex-shrink-0">
                                {post.author?.avatarUrl ? (
                                    <img
                                        src={post.author.avatarUrl}
                                        alt={`${post.author.firstName} ${post.author.lastName}`}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                                        {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">
                                            {post.title}
                                        </h1>
                                        <p className="text-sm text-[var(--color-text-secondary)]">
                                            {post.author?.firstName} {post.author?.lastName} • {new Date(post.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {(isAuthor || canModerate) && (
                                        <div className="flex items-center gap-2">
                                            {isAuthor && (
                                                <button
                                                    onClick={() => setShowEditModal(true)}
                                                    className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            {(isAuthor || canModerate) && (
                                                <button
                                                    onClick={() => setShowDeleteAlert(true)}
                                                    className="p-2 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 text-sm font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded">
                                #{t(post.category.toLowerCase())}
                            </span>
                            {post.isPinned && (
                                <span className="px-3 py-1 text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
                                    📌 {t("pinned")}
                                </span>
                            )}
                            {post.isLocked && (
                                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded flex items-center gap-1">
                                    <LockClosedIcon className="w-4 h-4" />
                                    {t("locked")}
                                </span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="prose max-w-none mb-6">
                            <p className="text-[var(--color-text)] whitespace-pre-wrap">{post.content}</p>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 pt-4 border-t border-[var(--color-border)]">
                            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                <ChatBubbleLeftIcon className="w-5 h-5" />
                                <span>{post.comments?.length || 0} {t("comments")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                <EyeIcon className="w-5 h-5" />
                                <span>{post.viewCount || 0} {t("views")}</span>
                            </div>

                            {/* Admin Actions */}
                            {canModerate && (
                                <div className="ml-auto flex items-center gap-2">
                                    <button
                                        onClick={handleTogglePin}
                                        className="px-3 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded transition-colors"
                                    >
                                        {post.isPinned ? t("unpin") : t("pin")}
                                    </button>
                                    <button
                                        onClick={handleToggleLock}
                                        className="px-3 py-1 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded transition-colors"
                                    >
                                        {post.isLocked ? t("unlock") : t("lock")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 border border-[var(--color-border)]">
                    <h2 className="text-xl font-bold text-[var(--color-text)] mb-4">
                        {t("comments")} ({post.comments?.length || 0})
                    </h2>

                    {/* Add Comment Form */}
                    {user && !post.isLocked && (
                        <form onSubmit={handleAddComment} className="mb-6">
                            <textarea
                                value={commentContent}
                                onChange={(e) => setCommentContent(e.target.value)}
                                placeholder={t("addComment")}
                                rows={3}
                                className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                            />
                            <div className="flex justify-end mt-2">
                                <button
                                    type="submit"
                                    disabled={submittingComment || !commentContent.trim()}
                                    className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submittingComment ? t("posting") : t("postComment")}
                                </button>
                            </div>
                        </form>
                    )}

                    {post.isLocked && (
                        <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-800 dark:text-yellow-200 text-sm">
                            {t("postIsLocked")}
                        </div>
                    )}

                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                        <div className="space-y-4">
                            {post.comments.map((comment) => (
                                <ForumCommentCard
                                    key={comment.id}
                                    comment={comment}
                                    onDelete={() => fetchPost()}
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-[var(--color-text-secondary)] py-8">
                            {t("noCommentsYet")}
                        </p>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <CreatePostModal
                    editPost={post}
                    onClose={() => setShowEditModal(false)}
                    onPostCreated={() => {
                        setShowEditModal(false);
                        fetchPost();
                    }}
                />
            )}

            {/* Delete Confirmation Alert */}
            <Alert
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                title={t("deletePost")}
                message={t("confirmDeletePost")}
                type="warning"
                confirmText={t("delete")}
                cancelText={t("cancel")}
                onConfirm={handleDeletePost}
            />
        </div>
    );
};

export default CommunityPostDetails;
