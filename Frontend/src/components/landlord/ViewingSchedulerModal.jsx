import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { viewingsAPI } from "../../services/api";
import { XMarkIcon, CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";

const ViewingSchedulerModal = ({ property, onClose, onSuccess }) => {
    const { t, language } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const isRTL = language === "ar";

    const [availability, setAvailability] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingAvailability, setLoadingAvailability] = useState(true);
    const [error, setError] = useState("");

    const landlordId = property?.owner?.id || property?.listing?.owner?.id;

    useEffect(() => {
        if (landlordId) {
            fetchAvailability();
        }
    }, [landlordId]);

    const fetchAvailability = async () => {
        try {
            setLoadingAvailability(true);
            const response = await viewingsAPI.getAvailability(landlordId);
            setAvailability(response.data || []);
        } catch (err) {
            console.error("Failed to fetch availability:", err);
            setError(t("failedToLoadAvailability"));
        } finally {
            setLoadingAvailability(false);
        }
    };

    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();

        // Generate next 14 days
        for (let i = 1; i <= 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push(date);
        }

        return dates;
    };

    const getAvailableTimesForDate = (date) => {
        if (!date || availability.length === 0) return [];

        const dayOfWeek = new Date(date).getDay();
        const daySlots = availability.filter(
            (slot) => slot.dayOfWeek === dayOfWeek && slot.isActive
        );

        const times = [];
        daySlots.forEach((slot) => {
            const startTime = slot.startTime.substring(0, 5); // HH:MM
            const endTime = slot.endTime.substring(0, 5);
            times.push(startTime);
        });

        return times;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedDate || !selectedTime) {
            setError(t("pleaseSelectDateTime") || "Please select date and time");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await viewingsAPI.book({
                propertyId: property.id,
                scheduledDate: selectedDate,
                scheduledTime: selectedTime,
                studentNotes: notes,
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to book viewing:", err);
            setError(err.message || t("failedToBookViewing"));
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="themed-surface rounded-xl max-w-md w-full p-6">
                    <h3 className="text-xl font-bold text-[var(--color-text)] mb-4">
                        {t("signInRequired")}
                    </h3>
                    <p className="text-[var(--color-text-soft)] mb-6">
                        {t("pleaseSignInToMessage")}
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full btn-primary py-3 rounded-lg"
                    >
                        {t("ok")}
                    </button>
                </div>
            </div>
        );
    }

    const availableDates = getAvailableDates();
    const availableTimes = selectedDate ? getAvailableTimesForDate(selectedDate) : [];

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="themed-surface rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 themed-surface border-b themed-border p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-[var(--color-text)]">
                            {t("scheduleViewing")}
                        </h2>
                        <p className="text-sm text-[var(--color-text-soft)] mt-1">
                            {property?.title || property?.listing?.title}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-surface-alt)] rounded-lg transition-colors"
                    >
                        <XMarkIcon className="w-6 h-6 text-[var(--color-text-soft)]" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                            {error}
                        </div>
                    )}

                    {loadingAvailability ? (
                        <div className="text-center py-8 text-[var(--color-text-soft)]">
                            {t("loading")}...
                        </div>
                    ) : availability.length === 0 ? (
                        <div className="text-center py-8 themed-surface-alt rounded-lg">
                            <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-[var(--color-text-soft)]" />
                            <p className="text-[var(--color-text-soft)]">
                                {t("noAvailability")}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Date Selection */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                                    {t("selectDate")}
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {availableDates.map((date) => {
                                        const dateStr = date.toISOString().split("T")[0];
                                        const hasAvailability = getAvailableTimesForDate(dateStr).length > 0;

                                        return (
                                            <button
                                                key={dateStr}
                                                type="button"
                                                disabled={!hasAvailability}
                                                onClick={() => {
                                                    setSelectedDate(dateStr);
                                                    setSelectedTime("");
                                                }}
                                                className={`p-3 rounded-lg border text-sm transition-all ${selectedDate === dateStr
                                                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                                                        : hasAvailability
                                                            ? "themed-border hover:border-[var(--color-accent)] text-[var(--color-text)]"
                                                            : "themed-border opacity-50 cursor-not-allowed text-[var(--color-text-soft)]"
                                                    }`}
                                            >
                                                <div className="font-medium">
                                                    {date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                                        day: "numeric",
                                                    })}
                                                </div>
                                                <div className="text-xs">
                                                    {date.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
                                                        weekday: "short",
                                                    })}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time Selection */}
                            {selectedDate && (
                                <div>
                                    <label className="block text-sm font-medium text-[var(--color-text)] mb-3">
                                        {t("selectTime")}
                                    </label>
                                    {availableTimes.length > 0 ? (
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {availableTimes.map((time) => (
                                                <button
                                                    key={time}
                                                    type="button"
                                                    onClick={() => setSelectedTime(time)}
                                                    className={`p-3 rounded-lg border text-sm transition-all ${selectedTime === time
                                                            ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                                                            : "themed-border hover:border-[var(--color-accent)] text-[var(--color-text)]"
                                                        }`}
                                                >
                                                    <ClockIcon className="w-4 h-4 mx-auto mb-1" />
                                                    {time}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-[var(--color-text-soft)] text-center py-4 themed-surface-alt rounded-lg">
                                            {t("noAvailability")}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                                    {t("studentNotes")} ({t("optional")})
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder={t("studentNotesPlaceholder")}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-lg border themed-border bg-[var(--color-surface)] text-[var(--color-text)] placeholder-[var(--color-text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 rounded-lg border themed-border hover:bg-[var(--color-surface-alt)] transition-colors text-[var(--color-text)]"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !selectedDate || !selectedTime}
                                    className="flex-1 btn-primary py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? t("loading") : t("bookViewing")}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ViewingSchedulerModal;
