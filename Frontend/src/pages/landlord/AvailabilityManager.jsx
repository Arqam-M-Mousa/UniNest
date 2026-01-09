import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { viewingsAPI } from "../../services/api";
import {
    CalendarIcon,
    ClockIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import PageLoader from "../../components/common/PageLoader";

const AvailabilityManager = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [availability, setAvailability] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const daysOfWeek = [
        { value: 0, label: t("sunday") },
        { value: 1, label: t("monday") },
        { value: 2, label: t("tuesday") },
        { value: 3, label: t("wednesday") },
        { value: 4, label: t("thursday") },
        { value: 5, label: t("friday") },
        { value: 6, label: t("saturday") },
    ];

    useEffect(() => {
        if (user?.role?.toLowerCase() === "landlord") {
            fetchAvailability();
        } else {
            navigate("/");
        }
    }, [user]);

    const fetchAvailability = async () => {
        try {
            setLoading(true);
            const response = await viewingsAPI.getAvailability(user.id);
            setAvailability(response.data || []);
        } catch (err) {
            console.error("Failed to fetch availability:", err);
            setError(t("failedToLoadAvailability"));
        } finally {
            setLoading(false);
        }
    };

    const addTimeSlot = (dayOfWeek) => {
        setAvailability([
            ...availability,
            {
                dayOfWeek,
                startTime: "09:00",
                endTime: "17:00",
                isActive: true,
                isNew: true,
            },
        ]);
    };

    const removeTimeSlot = (index) => {
        setAvailability(availability.filter((_, i) => i !== index));
    };

    const updateTimeSlot = (index, field, value) => {
        const updated = [...availability];
        updated[index] = { ...updated[index], [field]: value };
        setAvailability(updated);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setSuccess(false);

            const slots = availability.map((slot) => ({
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime,
                isActive: slot.isActive !== false,
            }));

            await viewingsAPI.setAvailability(slots);
            setSuccess(true);

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error("Failed to save availability:", err);
            setError(err.message || t("failedToLoadAvailability"));
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader loading={true} message={t("loading")} />;
    }

    return (
        <div className="min-h-screen themed-surface">
            <div className="max-w-5xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-[var(--color-accent)] hover:underline mb-4"
                    >
                        ← {t("back")}
                    </button>
                    <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        {t("manageAvailability")}
                    </h1>
                    <p className="text-[var(--color-text-soft)]">
                        {t("setAvailability")}
                    </p>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3 text-green-500">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>{t("availabilityUpdated")}</span>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
                        {error}
                    </div>
                )}

                {/* Weekly Schedule */}
                <div className="space-y-6">
                    {daysOfWeek.map((day) => {
                        const daySlots = availability.filter((slot) => slot.dayOfWeek === day.value);

                        return (
                            <div key={day.value} className="themed-surface-alt rounded-xl p-6 border themed-border">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <CalendarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                                        <h3 className="text-lg font-semibold text-[var(--color-text)]">
                                            {day.label}
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => addTimeSlot(day.value)}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg border themed-border hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10 transition-colors text-sm font-medium text-[var(--color-text)]"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        {t("addTimeSlot")}
                                    </button>
                                </div>

                                {daySlots.length > 0 ? (
                                    <div className="space-y-3">
                                        {availability.map((slot, index) => {
                                            if (slot.dayOfWeek !== day.value) return null;

                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-4 p-4 border themed-border rounded-lg"
                                                >
                                                    <ClockIcon className="w-5 h-5 text-[var(--color-text-soft)]" />

                                                    {/* Start Time */}
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-[var(--color-text-soft)] mb-1">
                                                            {t("startTime")}
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={slot.startTime}
                                                            onChange={(e) => updateTimeSlot(index, "startTime", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border themed-border bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                        />
                                                    </div>

                                                    {/* End Time */}
                                                    <div className="flex-1">
                                                        <label className="block text-xs text-[var(--color-text-soft)] mb-1">
                                                            {t("endTime")}
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={slot.endTime}
                                                            onChange={(e) => updateTimeSlot(index, "endTime", e.target.value)}
                                                            className="w-full px-3 py-2 rounded-lg border themed-border bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                                        />
                                                    </div>

                                                    {/* Active Toggle */}
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={slot.isActive !== false}
                                                            onChange={(e) => updateTimeSlot(index, "isActive", e.target.checked)}
                                                            className="w-4 h-4 rounded border-gray-300 text-[var(--color-accent)] focus:ring-[var(--color-accent)]"
                                                        />
                                                        <span className="text-sm text-[var(--color-text-soft)]">
                                                            {t("active") || "Active"}
                                                        </span>
                                                    </label>

                                                    {/* Delete Button */}
                                                    <button
                                                        onClick={() => removeTimeSlot(index)}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-500"
                                                    >
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-sm text-[var(--color-text-soft)] py-8 themed-surface rounded-lg">
                                        {t("noAvailability")}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 rounded-lg border themed-border hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-text)]"
                    >
                        {t("cancel")}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-3 btn-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? t("saving") : t("saveChanges")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AvailabilityManager;
