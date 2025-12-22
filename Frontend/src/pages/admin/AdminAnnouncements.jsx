import { useState, useEffect } from "react";
import { announcementsAPI, universitiesAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import Alert from "../../components/common/Alert";
import {
    MegaphoneIcon,
    UserGroupIcon,
    AcademicCapIcon,
    UsersIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";

const AdminAnnouncements = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [universities, setUniversities] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        message: "",
        targetType: "all",
        targetValue: null
    });
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, type: "", message: "" });

    useEffect(() => {
        fetchUniversities();
    }, []);

    const fetchUniversities = async () => {
        try {
            const response = await universitiesAPI.list();
            setUniversities(response.data || []);
        } catch (error) {
            console.error("Failed to fetch universities:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset targetValue when targetType changes
            ...(name === "targetType" ? { targetValue: null } : {})
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.message.trim()) {
            setAlert({
                show: true,
                type: "error",
                message: t("pleaseFillAllFields") || "Please fill in all required fields"
            });
            return;
        }

        // Validate targetValue for certain targetTypes
        if ((formData.targetType === "role" || formData.targetType === "university") && !formData.targetValue) {
            setAlert({
                show: true,
                type: "error",
                message: t("pleaseSelectTarget") || "Please select a target for this announcement"
            });
            return;
        }

        try {
            setLoading(true);
            const response = await announcementsAPI.send(formData);

            setAlert({
                show: true,
                type: "success",
                message: `${t("announcementSent") || "Announcement sent successfully to"} ${response.data.recipientCount} ${t("users") || "users"}`
            });

            // Reset form
            setFormData({
                title: "",
                message: "",
                targetType: "all",
                targetValue: null
            });
        } catch (error) {
            setAlert({
                show: true,
                type: "error",
                message: error.message || t("failedToSendAnnouncement") || "Failed to send announcement"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen themed-surface py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <MegaphoneIcon className="w-8 h-8 text-[var(--color-accent)]" />
                        <h1 className="text-3xl font-bold text-[var(--color-text)]">
                            {t("systemAnnouncements") || "System Announcements"}
                        </h1>
                    </div>
                    <p className="text-[var(--color-text-soft)]">
                        {t("sendAnnouncementsDescription") || "Send system-wide announcements to users"}
                    </p>
                </div>

                {/* Form */}
                <div className="themed-surface-alt rounded-xl border border-[var(--color-border)] p-6 shadow-lg">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                {t("title") || "Title"} *
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                placeholder={t("announcementTitle") || "Enter announcement title"}
                                required
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                {t("message") || "Message"} *
                            </label>
                            <textarea
                                name="message"
                                value={formData.message}
                                onChange={handleInputChange}
                                rows="6"
                                className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                placeholder={t("announcementMessage") || "Enter your announcement message"}
                                required
                            />
                        </div>

                        {/* Target Type */}
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                                {t("targetAudience") || "Target Audience"} *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* All Users */}
                                <label className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.targetType === "all"
                                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="all"
                                        checked={formData.targetType === "all"}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <UserGroupIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    <div>
                                        <div className="font-medium text-[var(--color-text)]">
                                            {t("allUsers") || "All Users"}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-soft)]">
                                            {t("sendToEveryone") || "Send to everyone"}
                                        </div>
                                    </div>
                                </label>

                                {/* By Role */}
                                <label className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.targetType === "role"
                                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="role"
                                        checked={formData.targetType === "role"}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <UsersIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    <div>
                                        <div className="font-medium text-[var(--color-text)]">
                                            {t("byRole") || "By Role"}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-soft)]">
                                            {t("targetSpecificRole") || "Target specific role"}
                                        </div>
                                    </div>
                                </label>

                                {/* By University */}
                                <label className={`relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.targetType === "university"
                                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10"
                                        : "border-[var(--color-border)] hover:border-[var(--color-accent)]/50"
                                    }`}>
                                    <input
                                        type="radio"
                                        name="targetType"
                                        value="university"
                                        checked={formData.targetType === "university"}
                                        onChange={handleInputChange}
                                        className="sr-only"
                                    />
                                    <AcademicCapIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    <div>
                                        <div className="font-medium text-[var(--color-text)]">
                                            {t("byUniversity") || "By University"}
                                        </div>
                                        <div className="text-xs text-[var(--color-text-soft)]">
                                            {t("targetUniversity") || "Target university"}
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Role Selector */}
                        {formData.targetType === "role" && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    {t("selectRole") || "Select Role"}
                                </label>
                                <select
                                    name="targetValue"
                                    value={formData.targetValue || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    required
                                >
                                    <option value="">{t("selectRole") || "Select a role"}</option>
                                    <option value="Student">{t("students") || "Students"}</option>
                                    <option value="Landlord">{t("landlords") || "Landlords"}</option>
                                    <option value="Admin">{t("admins") || "Admins"}</option>
                                </select>
                            </div>
                        )}

                        {/* University Selector */}
                        {formData.targetType === "university" && (
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    {t("selectUniversity") || "Select University"}
                                </label>
                                <select
                                    name="targetValue"
                                    value={formData.targetValue || ""}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    required
                                >
                                    <option value="">{t("selectUniversity") || "Select a university"}</option>
                                    {universities.map(uni => (
                                        <option key={uni.id} value={uni.id}>
                                            {uni.name} - {uni.city}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-6 py-4 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {t("sending") || "Sending..."}
                                </>
                            ) : (
                                <>
                                    <CheckCircleIcon className="w-6 h-6" />
                                    {t("sendAnnouncement") || "Send Announcement"}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Alert */}
            <Alert
                isOpen={alert.show}
                onClose={() => setAlert({ ...alert, show: false })}
                title={alert.type === "success" ? t("success") || "Success" : t("error") || "Error"}
                message={alert.message}
                type={alert.type}
                confirmText={t("ok") || "OK"}
            />
        </div>
    );
};

export default AdminAnnouncements;
