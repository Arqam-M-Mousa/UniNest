import { useState } from "react";
import { forumAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { XMarkIcon } from "@heroicons/react/24/outline";

const categories = ["General", "Housing", "Roommates", "University", "Tips", "Questions"];

const CreatePostModal = ({ onClose, onPostCreated, editPost = null }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        title: editPost?.title || "",
        content: editPost?.content || "",
        category: editPost?.category || "General",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!formData.title.trim() || !formData.content.trim()) {
            setError(t("titleAndContentRequired"));
            return;
        }

        try {
            setLoading(true);
            if (editPost) {
                const response = await forumAPI.updatePost(editPost.id, formData);
                onPostCreated(response.data);
            } else {
                const response = await forumAPI.createPost(formData);
                onPostCreated(response.data);
            }
        } catch (err) {
            setError(err.message || t("failedToCreatePost"));
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
                        {editPost ? t("editPost") : t("createPost")}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("category")}
                        </label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            required
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {t(category.toLowerCase())}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("title")}
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder={t("enterPostTitle")}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            required
                            maxLength={200}
                        />
                    </div>

                    {/* Content */}
                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                            {t("content")}
                        </label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            placeholder={t("enterPostContent")}
                            rows={8}
                            className="w-full px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] resize-none"
                            required
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
                            className="flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            {loading ? t("posting") : editPost ? t("saveChanges") : t("post")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePostModal;
