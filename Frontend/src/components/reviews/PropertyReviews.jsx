import { useState, useEffect } from "react";
import { reviewsAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { StarIcon, PlusIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import ReviewCard from "./ReviewCard";
import WriteReviewModal from "./WriteReviewModal";

const PropertyReviews = ({ propertyId, listingId, maxReviews }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showWriteModal, setShowWriteModal] = useState(false);
    const [sortBy, setSortBy] = useState("createdAt");

    const isLimited = maxReviews !== undefined && maxReviews > 0;

    useEffect(() => {
        fetchReviews();
        fetchStats();
    }, [propertyId, sortBy]);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await reviewsAPI.getPropertyReviews(propertyId, sortBy, "DESC");
            setReviews(response.data.reviews || []);
        } catch (error) {
            console.error("Failed to fetch reviews:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await reviewsAPI.getStats("Listing", propertyId);
            setStats(response.data);
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const canWriteReview = user && user.role === "Student";

    return (
        <div className="bg-[var(--color-bg-secondary)] rounded-lg p-6 border border-[var(--color-border)]">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">{t("reviews")}</h2>
                    {stats && (
                        <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-5 h-5 ${i < Math.round(stats.averageRating)
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-lg font-semibold text-[var(--color-text)]">
                                {stats.averageRating.toFixed(1)}
                            </span>
                            <span className="text-[var(--color-text-secondary)]">
                                ({stats.count} {stats.count === 1 ? t("review") : t("reviews")})
                            </span>
                        </div>
                    )}
                </div>
                {canWriteReview && (
                    <button
                        onClick={() => setShowWriteModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium shadow-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
                    >
                        <PlusIcon className="w-5 h-5" />
                        {t("writeReview")}
                    </button>
                )}
            </div>

            {/* Rating Distribution - only show in full view */}
            {!isLimited && stats && stats.count > 0 && (
                <div className="mb-6 p-4 bg-[var(--color-bg)] rounded-lg">
                    <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
                        {t("ratingDistribution")}
                    </h3>
                    <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center gap-3">
                                <span className="text-sm text-[var(--color-text)] w-12">
                                    {rating} <StarIcon className="w-4 h-4 inline text-yellow-400" />
                                </span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{
                                            width: `${stats.count > 0 ? (stats.distribution[rating] / stats.count) * 100 : 0}%`,
                                        }}
                                    />
                                </div>
                                <span className="text-sm text-[var(--color-text-secondary)] w-8">
                                    {stats.distribution[rating]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Sort Options - only show in full view */}
            {!isLimited && reviews.length > 0 && (
                <div className="mb-4">
                    <label className="text-sm text-[var(--color-text)] mr-2">{t("sortBy")}:</label>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    >
                        <option value="createdAt">{t("newest")}</option>
                        <option value="rating">{t("rating")}</option>
                    </select>
                </div>
            )}

            {/* Get reviews to display (limited or all) */}

            {/* Reviews List */}
            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-accent)]"></div>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-[var(--color-text-secondary)]">{t("noReviewsYet")}</p>
                    {canWriteReview && (
                        <button
                            onClick={() => setShowWriteModal(true)}
                            className="mt-3 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] font-medium"
                        >
                            {t("beTheFirst")}
                        </button>
                    )}
                </div>
            ) : (
                (() => {
                    const displayReviews = isLimited ? reviews.slice(0, maxReviews) : reviews;
                    return (
                        <div className="space-y-4">
                            {displayReviews.map((review) => (
                                <ReviewCard
                                    key={review.id}
                                    review={review}
                                    onUpdate={fetchReviews}
                                    onDelete={fetchReviews}
                                />
                            ))}
                        </div>
                    );
                })()
            )}

            {/* Write Review Modal */}
            {showWriteModal && (
                <WriteReviewModal
                    targetType="Listing"
                    targetId={propertyId}
                    onClose={() => setShowWriteModal(false)}
                    onSuccess={() => {
                        setShowWriteModal(false);
                        fetchReviews();
                        fetchStats();
                    }}
                />
            )}
        </div>
    );
};

export default PropertyReviews;
