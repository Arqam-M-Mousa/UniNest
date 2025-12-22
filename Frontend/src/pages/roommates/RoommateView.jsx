import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { roommatesAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import {
    UserIcon,
    AcademicCapIcon,
    CurrencyDollarIcon,
    MoonIcon,
    SparklesIcon,
    HomeIcon,
    BookOpenIcon,
    TagIcon,
    ArrowLeftIcon,
    UserPlusIcon,
    CheckIcon,
    FireIcon,
    UserGroupIcon,
    HeartIcon,
} from "@heroicons/react/24/outline";

function RoommateView() {
    const { t } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const profileData = location.state?.profile;
    const [loading, setLoading] = useState(!profileData);
    const [profile, setProfile] = useState(profileData || null);
    const [sendingMatch, setSendingMatch] = useState(false);
    const [matchMessage, setMatchMessage] = useState("");
    const [showMatchForm, setShowMatchForm] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/signin");
            return;
        }
        if (!profileData) {
            navigate("/roommates");
        }
    }, [isAuthenticated, profileData, navigate]);

    const userData = profile?.user || {};

    const getSleepLabel = (schedule) => {
        const labels = {
            early: t("sleepEarly"),
            normal: t("sleepNormal"),
            late: t("sleepLate"),
        };
        return labels[schedule] || schedule;
    };

    const getCleanlinessLabel = (level) => {
        if (!level) return null;
        const labels = {
            1: t("cleanlinessRelaxed"),
            2: t("cleanlinessFlexible"),
            3: t("cleanlinessModerate"),
            4: t("cleanlinessClean"),
            5: t("cleanlinessVeryClean"),
        };
        return labels[level] || level;
    };

    const formatBudget = () => {
        if (!profile?.minBudget && !profile?.maxBudget) return t("notSpecified");
        if (profile.minBudget && profile.maxBudget) {
            return `${profile.minBudget} - ${profile.maxBudget} NIS`;
        }
        if (profile.minBudget) return `${profile.minBudget}+ NIS`;
        return `${t("upTo")} ${profile.maxBudget} NIS`;
    };

    const handleSendMatch = async () => {
        if (!profile) return;

        try {
            setSendingMatch(true);
            setError(null);
            await roommatesAPI.sendMatch(profile.userId, matchMessage);
            setSuccess(t("matchRequestSent"));
            setShowMatchForm(false);
            setMatchMessage("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSendingMatch(false);
        }
    };

    if (loading || !profile) {
        return <PageLoader message={t("loadingProfile")} />;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark,var(--color-accent))] text-white py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                        {t("back")}
                    </button>

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Profile Picture */}
                        <div className="flex-shrink-0">
                            {userData.profilePictureUrl ? (
                                <img
                                    src={userData.profilePictureUrl}
                                    alt={`${userData.firstName} ${userData.lastName}`}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-xl"
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-xl">
                                    <UserIcon className="w-12 h-12 text-white" />
                                </div>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="text-center md:text-left flex-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    {userData.firstName} {userData.lastName}
                                </h1>
                                {profile.compatibilityScore != null && (
                                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/20 text-white text-sm font-bold">
                                        {profile.compatibilityScore}% {t("compatible")}
                                    </span>
                                )}
                            </div>
                            <p className="text-white/80 flex items-center justify-center md:justify-start gap-2 mb-3">
                                <AcademicCapIcon className="w-5 h-5" />
                                {profile.university?.name || t("student")}
                            </p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                {profile.major && (
                                    <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium">
                                        {t(profile.major)}
                                    </span>
                                )}
                                {profile.sameMajor === 1 && (
                                    <span className="px-3 py-1.5 rounded-full bg-green-500 text-white text-sm font-bold flex items-center gap-1">
                                        <CheckIcon className="w-4 h-4" />
                                        {t("sameMajor")}
                                    </span>
                                )}
                                <span className="px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium flex items-center gap-1">
                                    <CurrencyDollarIcon className="w-4 h-4" />
                                    {formatBudget()}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 flex-shrink-0">
                            {!showMatchForm && !success && (
                                <button
                                    onClick={() => setShowMatchForm(true)}
                                    className="px-6 py-3 bg-white text-[var(--color-accent)] rounded-xl font-bold hover:bg-white/90 transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <UserPlusIcon className="w-5 h-5" />
                                    {t("connectRoommate")}
                                </button>
                            )}
                            {success && (
                                <div className="px-6 py-3 bg-green-500 text-white rounded-xl font-bold flex items-center gap-2">
                                    <CheckIcon className="w-5 h-5" />
                                    {success}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* About Me */}
                        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                                <BookOpenIcon className="w-4 h-4 text-[var(--color-accent)]" />
                                {t("aboutMe")}
                            </h3>
                            <p className="text-[var(--color-text)] leading-relaxed">
                                {profile.bio || t("noBioProvided")}
                            </p>
                        </div>

                        {/* Interests */}
                        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                                <TagIcon className="w-4 h-4 text-[var(--color-accent)]" />
                                {t("interests")}
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.interests && profile.interests.length > 0 ? (
                                    profile.interests.map(interest => (
                                        <span
                                            key={interest}
                                            className="px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-medium border border-[var(--color-accent)]/20"
                                        >
                                            {t(interest)}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-sm text-[var(--color-text-muted)] italic">{t("noInterests")}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Living Preferences */}
                        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4 flex items-center gap-2">
                                <HomeIcon className="w-4 h-4 text-[var(--color-accent)]" />
                                {t("livingPreferences")}
                            </h3>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col items-center text-center">
                                    <SparklesIcon className="w-6 h-6 text-emerald-500 mb-2" />
                                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">{t("cleanliness")}</p>
                                    <p className="text-sm font-bold text-[var(--color-text)]">{getCleanlinessLabel(profile.cleanlinessLevel) || "-"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col items-center text-center">
                                    <MoonIcon className="w-6 h-6 text-indigo-500 mb-2" />
                                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">{t("sleep")}</p>
                                    <p className="text-sm font-bold text-[var(--color-text)]">{getSleepLabel(profile.sleepSchedule) || "-"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col items-center text-center">
                                    <AcademicCapIcon className="w-6 h-6 text-purple-500 mb-2" />
                                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">{t("study")}</p>
                                    <p className="text-sm font-bold text-[var(--color-text)]">{profile.studyHabits ? t(`study${profile.studyHabits.charAt(0).toUpperCase() + profile.studyHabits.slice(1)}`) : "-"}</p>
                                </div>
                                <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col items-center text-center">
                                    <UserGroupIcon className="w-6 h-6 text-amber-500 mb-2" />
                                    <p className="text-xs text-[var(--color-text-muted)] uppercase font-semibold mb-1">{t("guests")}</p>
                                    <p className="text-sm font-bold text-[var(--color-text)]">{profile.guestsAllowed ? t(`guests${profile.guestsAllowed.charAt(0).toUpperCase() + profile.guestsAllowed.slice(1)}`) : "-"}</p>
                                </div>
                            </div>
                        </div>

                        {/* Lifestyle */}
                        <div className="p-6 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)]">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-4">
                                {t("lifestyle")}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                                    <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-2">
                                        <FireIcon className="w-5 h-5 text-orange-500" />
                                        {t("smokingAllowed")}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile.smokingAllowed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                                        {profile.smokingAllowed ? t("yes") : t("no")}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                                    <span className="text-sm font-medium text-[var(--color-text)] flex items-center gap-2">
                                        <HeartIcon className="w-5 h-5 text-pink-500" />
                                        {t("petsAllowed")}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${profile.petsAllowed ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"}`}>
                                        {profile.petsAllowed ? t("yes") : t("no")}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Match Request Modal */}
            {showMatchForm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowMatchForm(false)}
                >
                    <div
                        className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-md w-full shadow-xl border border-[var(--color-border)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-[var(--color-text)] mb-2">
                            {t("sendMatchRequest")}
                        </h3>
                        <p className="text-[var(--color-text-muted)] mb-4">
                            {t("matchRequestHintPre")} <span className="font-semibold text-[var(--color-text)]">{userData.firstName}</span>
                        </p>
                        <textarea
                            value={matchMessage}
                            onChange={(e) => setMatchMessage(e.target.value)}
                            placeholder={t("introMessagePlaceholder")}
                            rows={3}
                            maxLength={300}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowMatchForm(false)}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] font-medium hover:border-[var(--color-accent)] transition-all"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                onClick={handleSendMatch}
                                disabled={sendingMatch}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                            >
                                {sendingMatch ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        {t("sending")}
                                    </>
                                ) : (
                                    t("sendRequest")
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default RoommateView;
