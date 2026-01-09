import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { forumAPI } from "../../services/api";
import {
    ChatBubbleLeftRightIcon,
    PlusIcon,
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
} from "@heroicons/react/24/outline";
import CreatePostModal from "../../components/forum/CreatePostModal";
import ForumPostCard from "../../components/forum/ForumPostCard";

const categories = ["All", "General", "Housing", "Roommates", "University", "Tips", "Questions"];

const Community = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const { socket } = useSocket();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showMyPosts, setShowMyPosts] = useState(false);
    const [sortBy, setSortBy] = useState("createdAt");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPosts();
    }, [selectedCategory, sortBy, showMyPosts]);

    useEffect(() => {
        if (!socket) return;

        socket.emit("forum:join");

        socket.on("forum:new_post", (newPost) => {
            setPosts((prev) => [newPost, ...prev]);
        });

        socket.on("forum:post_updated", (updatedPost) => {
            setPosts((prev) =>
                prev.map((post) => (post.id === updatedPost.id ? updatedPost : post))
            );
        });

        socket.on("forum:post_deleted", ({ id }) => {
            setPosts((prev) => prev.filter((post) => post.id !== id));
        });

        return () => {
            socket.emit("forum:leave");
            socket.off("forum:new_post");
            socket.off("forum:post_updated");
            socket.off("forum:post_deleted");
        };
    }, [socket]);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const filters = {
                category: selectedCategory === "All" ? undefined : selectedCategory,
                sortBy,
                sortOrder: "DESC",
            };
            const response = await forumAPI.getPosts(filters);
            let fetchedPosts = response.data.posts || [];

            // Filter to only show user's posts if My Posts is active
            if (showMyPosts && user) {
                fetchedPosts = fetchedPosts.filter(post => post.author?.id === user.id);
            }

            setPosts(fetchedPosts);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            fetchPosts();
            return;
        }
        try {
            setLoading(true);
            const response = await forumAPI.getPosts({ search: searchTerm, sortBy });
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error("Failed to search posts:", error);
        } finally {
            setLoading(false);
        }
    };

    // Count posts per category (from loaded posts for display purposes)
    const getCategoryCount = (category) => {
        if (category === "All") return posts.length;
        return posts.filter(p => p.category === category).length;
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[var(--color-text)]">
                                {t("community")}
                            </h1>
                            <p className="text-[var(--color-text-secondary)] mt-1">
                                {t("communityDescription")}
                            </p>
                        </div>
                        {user && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-colors font-medium shadow-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
                            >
                                <PlusIcon className="w-5 h-5" />
                                {t("createPost")}
                            </button>
                        )}
                    </div>

                    {/* Search Bar */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-secondary)]" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                placeholder={t("searchCommunity")}
                                className="w-full pl-10 pr-4 py-2.5 bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-5 py-2.5 rounded-lg transition-colors font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
                        >
                            {t("search")}
                        </button>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2.5 bg-[var(--color-bg-secondary)] text-[var(--color-text)] rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        >
                            <option value="createdAt">{t("newest")}</option>
                            <option value="viewCount">{t("mostViewed")}</option>
                            <option value="popular">{t("popular")}</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Categories Sidebar */}
                    <div className="w-64 flex-shrink-0 hidden lg:block">
                        <div className="bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)] p-4 sticky top-24">
                            <h3 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-3 uppercase tracking-wide">
                                {t("categories")}
                            </h3>
                            <div className="space-y-1">
                                {user && (
                                    <button
                                        onClick={() => {
                                            setShowMyPosts(!showMyPosts);
                                            if (!showMyPosts) setSelectedCategory("All");
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-2 ${showMyPosts
                                            ? "bg-[var(--color-accent)] text-white"
                                            : "text-[var(--color-accent)] border border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10"
                                            }`}
                                    >
                                        <span>#{t("myPosts")}</span>
                                    </button>
                                )}
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => {
                                            setSelectedCategory(category);
                                            setShowMyPosts(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category && !showMyPosts
                                            ? "bg-[var(--color-accent)] text-white"
                                            : "text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)]"
                                            }`}
                                    >
                                        <span>#{t(category.toLowerCase())}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Posts List */}
                    <div className="flex-1">
                        {/* Mobile Category Pills */}
                        <div className="flex gap-2 overflow-x-auto pb-3 lg:hidden mb-4">
                            {user && (
                                <button
                                    onClick={() => {
                                        setShowMyPosts(!showMyPosts);
                                        if (!showMyPosts) setSelectedCategory("All");
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${showMyPosts
                                        ? "bg-[var(--color-accent)] text-white"
                                        : "bg-[var(--color-bg-secondary)] text-[var(--color-accent)] border border-[var(--color-accent)]"
                                        }`}
                                >
                                    #{t("myPosts")}
                                </button>
                            )}
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => {
                                        setSelectedCategory(category);
                                        setShowMyPosts(false);
                                    }}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === category && !showMyPosts
                                        ? "bg-[var(--color-accent)] text-white"
                                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text)] border border-[var(--color-border)]"
                                        }`}
                                >
                                    #{t(category.toLowerCase())}
                                </button>
                            ))}
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent)]"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                                <ChatBubbleLeftRightIcon className="w-16 h-16 text-[var(--color-text-secondary)] mx-auto mb-4" />
                                <p className="text-[var(--color-text-secondary)] text-lg">
                                    {showMyPosts ? t("noMyPostsYet") : t("noPostsFound")}
                                </p>
                                {user && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium"
                                    >
                                        {showMyPosts ? t("createYourFirstPost") : t("createFirstPost")}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {posts.map((post) => (
                                    <ForumPostCard key={post.id} post={post} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal
                    onClose={() => setShowCreateModal(false)}
                    onPostCreated={(newPost) => {
                        setShowCreateModal(false);
                        fetchPosts(); // Refresh the list
                    }}
                />
            )}
        </div>
    );
};

export default Community;
