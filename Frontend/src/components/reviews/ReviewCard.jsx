import { useState } from "react";
import { reviewsAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { StarIcon } from "@heroicons/react/24/solid";
import {
    HandThumbUpIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { HandThumbUpIcon as ThumbUpSolid } from "@heroicons/react/24/solid";
import WriteReviewModal from "./WriteReviewModal";
import Alert from "../common/Alert";

const ReviewCard = ({ review, onUpdate, onDelete }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [isHelpful, setIsHelpful] = useState(
        user && review.helpfulVotes?.some((vote) => vote.userId === user.id)
    );
    const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0);

    const isAuthor = user && review.student?.id === user.id;
    const canDelete = isAuthor || (user && ["SuperAdmin", "Admin"].includes(user.role));

    const handleToggleHelpful = async () => {
        if (!user) return;
        try {
            const response = await reviewsAPI.toggleHelpful(review.id);
            setIsHelpful(response.data.voted);
            setHelpfulCount(response.data.helpfulCount);
        } catch (error) {
            console.error("Failed to toggle helpful:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await reviewsAPI.deleteReview(review.id);
            onDelete();
        } catch (error) {
            console.error("Failed to delete review:", error);
        }
    };

    return (
        <div className="bg-[var(--color-bg)] rounded-lg p-4 border border-[var(--color-border)]">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        {review.student?.avatarUrl ? (
                            <img
                                src={review.student.avatarUrl}
                                alt={`${review.student.firstName} ${review.student.lastName}`}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white font-semibold text-sm">
                                {review.student?.firstName?.[0]}{review.student?.lastName?.[0]}
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="font-medium text-[var(--color-text)]">
                            {review.student?.firstName} {review.student?.lastName}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? "text-yellow-400" : "text-gray-300"
                                            }`}
                                    />
                                ))}
                            </div>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                {canDelete && (
                    <div className="flex items-center gap-2">
                        {isAuthor && (
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] transition-colors"
                            >
                                <PencilIcon className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={() => setShowDeleteAlert(true)}
                            className="p-1 text-[var(--color-text-secondary)] hover:text-red-500 transition-colors"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Title */}
            {review.title && (
                <h4 className="font-semibold text-[var(--color-text)] mb-2">
                    {review.title}
                </h4>
            )}

            {/* Comment */}
            <p className="text-[var(--color-text-secondary)] mb-3 whitespace-pre-wrap">
                {review.comment}
            </p>

            {(review.pros || review.cons) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {review.pros && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                            <p className="text-sm font-medium text-green-800 dark:text-green-300 mb-1">
                                {t("pros")}
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-200">
                                {review.pros}
                            </p>
                        </div>
                    )}
                    {review.cons && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                            <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                                {t("cons")}
                            </p>
                            <p className="text-sm text-red-700 dark:text-red-200">
                                {review.cons}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Helpful Button */}
            <div className=" flex items-center gap-2">
                <button
                    onClick={handleToggleHelpful}
                    disabled={!user}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${isHelpful
                        ? "bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                        : "bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isHelpful ? (
                        <ThumbUpSolid className="w-4 h-4" />
                    ) : (
                        <HandThumbUpIcon className="w-4 h-4" />
                    )}
                    <span>{t("helpful")}</span>
                    {helpfulCount > 0 && <span>({helpfulCount})</span>}
                </button>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <WriteReviewModal
                    targetType={review.targetType}
                    targetId={review.listingId || review.landlordId}
                    editReview={review}
                    onClose={() => setShowEditModal(false)}
                    onSuccess={() => {
                        setShowEditModal(false);
                        onUpdate();
                    }}
                />
            )}

            {/* Delete Confirmation Alert */}
            <Alert
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                title={t("deleteReview")}
                message={t("confirmDeleteReview")}
                type="warning"
                confirmText={t("delete")}
                cancelText={t("cancel")}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default ReviewCard;
