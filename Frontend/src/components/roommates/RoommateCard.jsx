import { useLanguage } from "../../context/LanguageContext";
import CompatibilityBadge from "./CompatibilityBadge";
import {
    UserIcon,
    AcademicCapIcon,
    CurrencyDollarIcon,
    MoonIcon,
    SparklesIcon,
} from "@heroicons/react/24/outline";

function RoommateCard({ profile, onConnect, isConnecting, onViewDetails }) {
    const { t } = useLanguage();

    const user = profile.user || {};
    const university = profile.university || {};

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
        if (!profile.minBudget && !profile.maxBudget) return null;
        if (profile.minBudget && profile.maxBudget) {
            return `${profile.minBudget} - ${profile.maxBudget} NIS`;
        }
        if (profile.minBudget) return `${profile.minBudget}+ NIS`;
        return `${t("upTo")} ${profile.maxBudget} NIS`;
    };

    return (
        <div
            onClick={onViewDetails}
            className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-lg border border-[var(--color-border)] hover:shadow-xl hover:border-[var(--color-accent)]/30 transition-all duration-300 flex flex-col h-full cursor-pointer group"
        >
            {/* Header with avatar and compatibility */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    {user.profilePictureUrl ? (
                        <img
                            src={user.profilePictureUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-14 h-14 rounded-full object-cover border-2 border-[var(--color-accent)]"
                        />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                            <UserIcon className="w-7 h-7 text-[var(--color-accent)]" />
                        </div>
                    )}
                    <div>
                        <h3 className="font-semibold text-[var(--color-text)] text-lg group-hover:text-[var(--color-accent)] transition-colors">
                            {user.firstName} {user.lastName?.[0]}.
                        </h3>
                        {university.name && (
                            <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-1">
                                <AcademicCapIcon className="w-4 h-4" />
                                {university.name}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <CompatibilityBadge score={profile.compatibilityScore} size="md" />
                    <span className="text-[10px] font-bold text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
                        {t("viewDetails")} →
                    </span>
                </div>
            </div>

            {/* Bio */}
            {profile.bio && (
                <p className="text-sm text-[var(--color-text-muted)] mb-4 line-clamp-2">
                    {profile.bio}
                </p>
            )}

            {/* Key preferences */}
            <div className="flex flex-wrap gap-2 mb-4">
                {formatBudget() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                        <CurrencyDollarIcon className="w-3.5 h-3.5" />
                        {formatBudget()}
                    </span>
                )}
                {profile.sleepSchedule && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-500">
                        <MoonIcon className="w-3.5 h-3.5" />
                        {getSleepLabel(profile.sleepSchedule)}
                    </span>
                )}
                {profile.cleanlinessLevel && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                        <SparklesIcon className="w-3.5 h-3.5" />
                        {getCleanlinessLabel(profile.cleanlinessLevel)}
                    </span>
                )}
                {profile.major && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-500">
                        <AcademicCapIcon className="w-3.5 h-3.5" />
                        {t(profile.major)}
                    </span>
                )}
            </div>

            {/* Interests */}
            {profile.interests && profile.interests.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                    {profile.interests.slice(0, 4).map((interest) => (
                        <span
                            key={interest}
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-bg)] text-[var(--color-text-muted)] border border-[var(--color-border)]"
                        >
                            {t(interest)}
                        </span>
                    ))}
                    {profile.interests.length > 4 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                            +{profile.interests.length - 4}
                        </span>
                    )}
                </div>
            )}

            {/* Additional info row */}
            <div className="flex flex-wrap gap-3 text-xs text-[var(--color-text-muted)] mb-4">
                {profile.smokingAllowed !== undefined && (
                    <span>
                        {profile.smokingAllowed ? "🚬 " + t("smokingOk") : "🚭 " + t("noSmoking")}
                    </span>
                )}
                {profile.petsAllowed !== undefined && (
                    <span>
                        {profile.petsAllowed ? "🐾 " + t("petsOk") : t("noPets")}
                    </span>
                )}
            </div>

            {/* Connect button */}
            <div className="mt-auto pt-3 border-t border-[var(--color-border)]">
                <button
                    onClick={(e) => { e.stopPropagation(); onConnect(profile); }}
                    disabled={isConnecting}
                    className="w-full py-2.5 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark,var(--color-accent))] hover:opacity-90 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                    {isConnecting ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {t("connecting")}
                        </>
                    ) : (
                        t("connectRoommate")
                    )}
                </button>
            </div>
        </div>
    );
}

export default RoommateCard;

