import { Link } from "react-router-dom";
import {
    ChatBubbleLeftIcon,
    EyeIcon,
    LockClosedIcon,
    ChevronUpIcon,
    ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { ChevronUpIcon as ChevronUpSolid, ChevronDownIcon as ChevronDownSolid } from "@heroicons/react/24/solid";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { forumAPI } from "../../services/api";
import { useState } from "react";

const ForumPostCard = ({ post }) => {
    const { t } = useLanguage();
    const { user } = useAuth();

    // Get user's current vote from the likes array
    const getUserVote = () => {
        if (!user || !post.likes) return null;
        const userVote = post.likes?.find(like => like.userId === user.id);
        return userVote?.voteType || null;
    };

    const [voteScore, setVoteScore] = useState(post.voteScore || 0);
    const [upvotes, setUpvotes] = useState(post.upvotes || 0);
    const [downvotes, setDownvotes] = useState(post.downvotes || 0);
    const [userVote, setUserVote] = useState(getUserVote());
    const [isVoting, setIsVoting] = useState(false);

    const getCategoryColor = (category) => {
        const colors = {
            General: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
            Housing: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
            Roommates: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
            University: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
            Tips: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
            Questions: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
        };
        return colors[category] || colors.General;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMs = now - date;
        const diffInMins = Math.floor(diffInMs / 60000);
        const diffInHours = Math.floor(diffInMs / 3600000);
        const diffInDays = Math.floor(diffInMs / 86400000);

        if (diffInMins < 1) return t("justNow");
        if (diffInMins < 60) return `${diffInMins}${t("minsAgo")}`;
        if (diffInHours < 24) return `${diffInHours}${t("hoursAgo")}`;
        if (diffInDays < 7) return `${diffInDays}${t("daysAgo")}`;
        return date.toLocaleDateString();
    };

    const handleVote = async (e, voteType) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user || isVoting) return;

        try {
            setIsVoting(true);
            const response = await forumAPI.vote(post.id, voteType);
            setVoteScore(response.data.voteScore);
            setUpvotes(response.data.upvotes);
            setDownvotes(response.data.downvotes);
            setUserVote(response.data.userVote);
        } catch (error) {
            console.error("Failed to vote:", error);
        } finally {
            setIsVoting(false);
        }
    };

    return (
        <div className="flex bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors rounded-lg border border-[var(--color-border)]">
            {/* Vote Column */}
            <div className="flex flex-col items-center justify-start py-3 px-3 border-r border-[var(--color-border)]">
                <button
                    onClick={(e) => handleVote(e, "up")}
                    disabled={!user || isVoting}
                    className={`p-1 rounded transition-colors ${userVote === "up"
                        ? "text-green-500"
                        : "text-[var(--color-text-secondary)] hover:text-green-500"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={t("upvote")}
                >
                    {userVote === "up" ? (
                        <ChevronUpSolid className="w-6 h-6" />
                    ) : (
                        <ChevronUpIcon className="w-6 h-6" />
                    )}
                </button>
                <span className="text-xs font-bold text-green-500">
                    {upvotes}
                </span>
                <div className="h-1" />
                <span className="text-xs font-bold text-red-500">
                    {downvotes}
                </span>
                <button
                    onClick={(e) => handleVote(e, "down")}
                    disabled={!user || isVoting}
                    className={`p-1 rounded transition-colors ${userVote === "down"
                        ? "text-red-500"
                        : "text-[var(--color-text-secondary)] hover:text-red-500"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title={t("downvote")}
                >
                    {userVote === "down" ? (
                        <ChevronDownSolid className="w-6 h-6" />
                    ) : (
                        <ChevronDownIcon className="w-6 h-6" />
                    )}
                </button>
            </div>

            {/* Post Content */}
            <Link
                to={`/community/${post.id}`}
                className="flex-1 p-4"
            >
                <div className="flex items-start gap-3">
                    {/* Author Avatar */}
                    <div className="flex-shrink-0">
                        {post.author?.avatarUrl ? (
                            <img
                                src={post.author.avatarUrl}
                                alt={`${post.author.firstName} ${post.author.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold">
                                {post.author?.firstName?.[0]}{post.author?.lastName?.[0]}
                            </div>
                        )}
                    </div>

                    {/* Post Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {post.isPinned && (
                                        <span className="px-2 py-0.5 text-xs font-medium bg-[var(--color-accent)]/20 text-[var(--color-accent)] rounded">
                                            📌 {t("pinned")}
                                        </span>
                                    )}
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getCategoryColor(post.category)}`}>
                                        #{t(post.category.toLowerCase())}
                                    </span>
                                    <span className="text-xs text-[var(--color-text-secondary)]">
                                        • {formatDate(post.createdAt)}
                                    </span>
                                </div>
                                <h3 className="text-lg font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors mt-1 flex items-center gap-2">
                                    {post.title}
                                    {post.isLocked && (
                                        <LockClosedIcon className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    )}
                                </h3>
                            </div>
                        </div>

                        <p className="text-[var(--color-text-secondary)] line-clamp-2 mb-3 text-sm">
                            {post.content}
                        </p>

                        {/* Post Stats */}
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)]">
                            <div className="flex items-center gap-1">
                                {post.author?.avatarUrl ? (
                                    <img
                                        src={post.author.avatarUrl}
                                        alt=""
                                        className="w-5 h-5 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-xs font-semibold">
                                        {post.author?.firstName?.[0]}
                                    </div>
                                )}
                                <span className="font-medium">{post.author?.firstName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ChatBubbleLeftIcon className="w-4 h-4" />
                                <span>{post.commentCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <EyeIcon className="w-4 h-4" />
                                <span>{post.viewCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ForumPostCard;
