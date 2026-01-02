import { useState } from "react";
import { reviewsAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { XMarkIcon, StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";

const WriteReviewModal = ({ targetType, targetId, editReview = null, onClose, onSuccess }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        rating: editReview?.rating || 0,
        title: editReview?.title || "",
        comment: editReview?.comment || "",
        pros: editReview?.pros || "",
        cons: editReview?.cons || "",
    });
    const [hoveredRating, setHoveredRating] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (formData.rating === 0) {
            setError(t("pleaseSelectRating"));
            return;
        }

        if (!formData.comment.trim()) {
            setError(t("commentRequired"));
            return;
        }

        try {
            setLoading(true);
            if (editReview) {
                await reviewsAPI.updateReview(editReview.id, formData);
            } else {
                await reviewsAPI.createReview({
                    targetType,
                    targetId,
                    ...formData,
                });
            }
            onSuccess();
        } catch (err) {
            setError(err.message || t("failedToSubmitReview"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="themed-surface backdrop-blur-sm rounded-xl border themed-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">
                        {editReview ? t("editReview") : t("writeReview")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Rating */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("rating")} *
                        </label>
                        <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((rating) => (
                                <button
                                    key={rating}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating })}
                                    onMouseEnter={() => setHoveredRating(rating)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="focus:outline-none"
                                >
                                    {rating <= (hoveredRating || formData.rating) ? (
                                        <StarIcon className="w-8 h-8 text-yellow-400" />
                                    ) : (
                                        <StarOutline className="w-8 h-8 text-gray-300" />
                                    )}
                                </button>
                            ))}
                            {formData.rating > 0 && (
                                <span className="ml-2 text-[var(--color-text)]">
                                    {formData.rating}/5
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("title")} ({t("optional")})
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t("reviewTitlePlaceholder")}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            maxLength={100}
                        />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("yourReview")} *
                        </label>
                        <textarea
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder={t("reviewCommentPlaceholder")}
                            rows={5}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                            required
                        />
                    </div>

                    {/* Pros */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("pros")} ({t("optional")})
                        </label>
                        <textarea
                            value={formData.pros}
                            onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                            placeholder={t("prosPlaceholder")}
                            rows={2}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                        />
                    </div>

                    {/* Cons */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("cons")} ({t("optional")})
                        </label>
                        <textarea
                            value={formData.cons}
                            onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                            placeholder={t("consPlaceholder")}
                            rows={2}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-lg transition-colors"
                            disabled={loading}
                        >
                            {t("cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
                        >
                            {loading ? t("submitting") : editReview ? t("saveChanges") : t("submitReview")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WriteReviewModal;
