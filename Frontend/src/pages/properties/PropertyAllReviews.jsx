import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { reviewsAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import { ArrowLeftIcon, StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

const PropertyAllReviews = () => {
    const { id } = useParams(); // listingId
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [reviews, setReviews] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                // Use getPropertyReviews instead of getByListing
                const res = await reviewsAPI.getPropertyReviews(id);
                setReviews(res.data?.reviews || []);

                // Fetch stats for average rating
                const statsRes = await reviewsAPI.getStats("Listing", id);
                setAverageRating(statsRes.data?.averageRating || 0);
            } catch (err) {
                console.error("Failed to load reviews:", err);
                setError(err.message || "Failed to load reviews");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [id]);

    const renderStars = (rating) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star}>
                        {star <= rating ? (
                            <StarIconSolid className="h-5 w-5 text-yellow-400" />
                        ) : (
                            <StarIcon className="h-5 w-5 text-gray-300" />
                        )}
                    </span>
                ))}
            </div>
        );
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) return <PageLoader />;

    if (error) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-[var(--text-secondary)] mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-[var(--accent-primary)] hover:underline"
                    >
                        {t("goBack")}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-4"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                        {t("goBack")}
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <StarIconSolid className="h-8 w-8 text-yellow-400" />
                            <div>
                                <h1 className="text-2xl font-bold text-[var(--text-primary)]">
                                    {t("allReviews")}
                                </h1>
                                <p className="text-[var(--text-secondary)]">
                                    {reviews.length} {t("reviews")}
                                </p>
                            </div>
                        </div>

                        {/* Average Rating */}
                        <div className="text-right">
                            <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-[var(--text-primary)]">
                                    {averageRating.toFixed(1)}
                                </span>
                                <StarIconSolid className="h-6 w-6 text-yellow-400" />
                            </div>
                            <p className="text-sm text-[var(--text-secondary)]">{t("averageRating")}</p>
                        </div>
                    </div>
                </div>

                {/* Reviews List */}
                {reviews.length === 0 ? (
                    <div className="bg-[var(--bg-secondary)] rounded-xl p-12 text-center border border-[var(--border-color)]">
                        <StarIcon className="h-12 w-12 text-[var(--text-secondary)] mx-auto mb-4 opacity-50" />
                        <p className="text-[var(--text-secondary)]">{t("noReviewsYet")}</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="bg-[var(--bg-secondary)] rounded-xl p-6 border border-[var(--border-color)]"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white font-semibold">
                                            {review.student?.firstName?.charAt(0) || "U"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)]">
                                                {review.student?.firstName} {review.student?.lastName?.charAt(0)}.
                                            </p>
                                            <p className="text-sm text-[var(--text-secondary)]">
                                                {formatDate(review.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                    {renderStars(review.rating)}
                                </div>

                                {/* Title */}
                                {review.title && (
                                    <h3 className="font-semibold text-[var(--text-primary)] mb-2">
                                        {review.title}
                                    </h3>
                                )}

                                {/* Comment */}
                                <p className="text-[var(--text-secondary)] mb-4">{review.comment}</p>

                                {/* Pros & Cons */}
                                {(review.pros || review.cons) && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
                                        {review.pros && (
                                            <div>
                                                <p className="text-sm font-medium text-green-500 mb-1">
                                                    ✓ {t("pros")}
                                                </p>
                                                <p className="text-sm text-[var(--text-secondary)]">{review.pros}</p>
                                            </div>
                                        )}
                                        {review.cons && (
                                            <div>
                                                <p className="text-sm font-medium text-red-500 mb-1">
                                                    ✗ {t("cons")}
                                                </p>
                                                <p className="text-sm text-[var(--text-secondary)]">{review.cons}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Helpful Count */}
                                {review.helpfulCount > 0 && (
                                    <p className="text-sm text-[var(--text-secondary)] mt-4">
                                        👍 {review.helpfulCount} {t("foundHelpful")}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PropertyAllReviews;
