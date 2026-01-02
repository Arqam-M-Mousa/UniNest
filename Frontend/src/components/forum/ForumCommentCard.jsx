import { useState } from "react";
import { forumAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { TrashIcon } from "@heroicons/react/24/outline";
import Alert from "../common/Alert";

const ForumCommentCard = ({ comment, onDelete }) => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [deleting, setDeleting] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);

    const canDelete =
        user &&
        (comment.author.id === user.id || ["SuperAdmin", "Admin"].includes(user.role));

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await forumAPI.deleteComment(comment.id);
            onDelete();
        } catch (error) {
            console.error("Failed to delete comment:", error);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <>
            <div className="flex items-start gap-3 p-4 bg-[var(--color-bg-secondary)] rounded-lg border border-[var(--color-border)]">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {comment.author?.avatarUrl ? (
                        <img
                            src={comment.author.avatarUrl}
                            alt={`${comment.author.firstName} ${comment.author.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] flex items-center justify-center text-white text-sm font-semibold">
                            {comment.author?.firstName?.[0]}{comment.author?.lastName?.[0]}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-medium text-[var(--color-text)]">
                            {comment.author?.firstName} {comment.author?.lastName}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                {new Date(comment.createdAt).toLocaleString()}
                            </span>
                            {canDelete && (
                                <button
                                    onClick={() => setShowDeleteAlert(true)}
                                    disabled={deleting}
                                    className="text-[var(--color-text-secondary)] hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                    <p className="text-[var(--color-text)] text-sm whitespace-pre-wrap">
                        {comment.content}
                    </p>
                </div>
            </div>

            {/* Delete Confirmation Alert */}
            <Alert
                isOpen={showDeleteAlert}
                onClose={() => setShowDeleteAlert(false)}
                title={t("deleteComment")}
                message={t("confirmDeleteComment")}
                type="warning"
                confirmText={t("delete")}
                cancelText={t("cancel")}
                onConfirm={handleDelete}
            />
        </>
    );
};

export default ForumCommentCard;
