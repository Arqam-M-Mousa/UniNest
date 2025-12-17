import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { roommatesAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import {
    UserIcon,
    CurrencyDollarIcon,
    SparklesIcon,
    MoonIcon,
    BookOpenIcon,
    HomeIcon,
    CheckCircleIcon,
    XCircleIcon,
    AcademicCapIcon,
    TagIcon,
} from "@heroicons/react/24/outline";

// Major options (key -> translation key)
const MAJOR_OPTIONS = [
    "majorEngineering",
    "majorComputerScience",
    "majorMedicine",
    "majorBusiness",
    "majorLaw",
    "majorArts",
    "majorScience",
    "majorEducation",
    "majorPsychology",
    "majorCommunications",
    "majorArchitecture",
    "majorNursing",
    "majorOther",
];

// Interest options (key -> translation key)
const INTEREST_OPTIONS = [
    "interestSports",
    "interestGaming",
    "interestReading",
    "interestMusic",
    "interestCooking",
    "interestFitness",
    "interestMovies",
    "interestTravel",
    "interestPhotography",
    "interestArt",
    "interestOutdoors",
    "interestTech",
    "interestFashion",
    "interestPets",
    "interestVolunteering",
];

function RoommateProfile() {
    const { t } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);

    const [formData, setFormData] = useState({
        minBudget: "",
        maxBudget: "",
        cleanlinessLevel: 3,
        noiseLevel: 3,
        sleepSchedule: "normal",
        studyHabits: "mixed",
        smokingAllowed: false,
        petsAllowed: false,
        guestsAllowed: "sometimes",
        bio: "",
        major: "",
        interests: [],
        isActive: true,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/signin");
            return;
        }
        if (user?.role !== "Student") {
            navigate("/apartments");
            return;
        }
        loadData();
    }, [isAuthenticated, user, navigate]);

    const loadData = async () => {
        try {
            setLoading(true);
            const profileRes = await roommatesAPI.getProfile();

            if (profileRes.data?.profile) {
                const p = profileRes.data.profile;
                setHasProfile(true);
                setFormData({
                    minBudget: p.minBudget || "",
                    maxBudget: p.maxBudget || "",
                    cleanlinessLevel: p.cleanlinessLevel || 3,
                    noiseLevel: p.noiseLevel || 3,
                    sleepSchedule: p.sleepSchedule || "normal",
                    studyHabits: p.studyHabits || "mixed",
                    smokingAllowed: p.smokingAllowed || false,
                    petsAllowed: p.petsAllowed || false,
                    guestsAllowed: p.guestsAllowed || "sometimes",
                    bio: p.bio || "",
                    major: p.major || "",
                    interests: p.interests || [],
                    isActive: p.isActive ?? true,
                });
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setSuccess(null);
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setError(null);

            await roommatesAPI.saveProfile(formData);
            setHasProfile(true);
            setSuccess(t("profileSaved"));
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader message={t("loadingProfile")} />;
    }

    // Custom CSS for range inputs to ensure track is visible
    const rangeInputStyle = `
        input[type=range] {
            -webkit-appearance: none;
            width: 100%;
            background: transparent;
        }
        input[type=range]::-webkit-slider-runnable-track {
            width: 100%;
            height: 8px;
            cursor: pointer;
            background: var(--color-border);
            border-radius: 4px;
        }
        input[type=range]::-webkit-slider-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: var(--color-accent);
            cursor: pointer;
            -webkit-appearance: none;
            margin-top: -6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        input[type=range]:focus::-webkit-slider-runnable-track {
            background: var(--color-border);
        }
        input[type=range]::-moz-range-track {
            width: 100%;
            height: 8px;
            cursor: pointer;
            background: var(--color-border);
            border-radius: 4px;
        }
        input[type=range]::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: var(--color-accent);
            cursor: pointer;
            border: none;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
    `;

    return (
        <div className="min-h-screen bg-[var(--color-bg)] py-8 px-4">
            <style>{rangeInputStyle}</style>
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        {t("roommateProfile")}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {t("roommateProfileSubtitle")}
                    </p>
                </div>

                {/* Error/Success messages */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-2">
                        <XCircleIcon className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 shrink-0" />
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Status Card */}
                    <div className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${formData.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                <span className="font-semibold text-[var(--color-text)]">
                                    {formData.isActive ? t("profileActive") : t("profileInactive")}
                                </span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => handleChange("isActive", e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-13 h-7 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-accent)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[var(--color-accent)]" />
                            </label>
                        </div>
                    </div>

                    {/* Budget Section */}
                    <div className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                            <CurrencyDollarIcon className="w-6 h-6 text-[var(--color-accent)]" />
                            {t("budgetPreferences")}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2 px-1">
                                    {t("minBudget")} (NIS)
                                </label>
                                <input
                                    type="number"
                                    value={formData.minBudget}
                                    onChange={(e) => handleChange("minBudget", e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                                    placeholder="500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2 px-1">
                                    {t("maxBudget")} (NIS)
                                </label>
                                <input
                                    type="number"
                                    value={formData.maxBudget}
                                    onChange={(e) => handleChange("maxBudget", e.target.value)}
                                    className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                                    placeholder="2000"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Living Preferences */}
                    <div className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                            <HomeIcon className="w-6 h-6 text-[var(--color-accent)]" />
                            {t("livingPreferences")}
                        </h2>

                        {/* Cleanliness Slider */}
                        <div className="mb-10">
                            <div className="flex justify-between mb-4 px-1">
                                <label className="text-sm font-semibold text-[var(--color-text-muted)]">
                                    {t("cleanlinessLevel")}
                                </label>
                                <span className="text-sm text-[var(--color-accent)] font-bold">
                                    {formData.cleanlinessLevel}/5
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.cleanlinessLevel}
                                onChange={(e) => handleChange("cleanlinessLevel", parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs font-medium text-[var(--color-text-muted)] mt-2 px-1">
                                <span>{t("relaxed")}</span>
                                <span>{t("veryClean")}</span>
                            </div>
                        </div>

                        {/* Noise Level Slider */}
                        <div className="mb-10">
                            <div className="flex justify-between mb-4 px-1">
                                <label className="text-sm font-semibold text-[var(--color-text-muted)]">
                                    {t("noiseLevel")}
                                </label>
                                <span className="text-sm text-[var(--color-accent)] font-bold">
                                    {formData.noiseLevel}/5
                                </span>
                            </div>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.noiseLevel}
                                onChange={(e) => handleChange("noiseLevel", parseInt(e.target.value))}
                                className="w-full"
                            />
                            <div className="flex justify-between text-xs font-medium text-[var(--color-text-muted)] mt-2 px-1">
                                <span>{t("quiet")}</span>
                                <span>{t("social")}</span>
                            </div>
                        </div>

                        {/* Sleep Schedule */}
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3 px-1 flex items-center gap-2">
                                <MoonIcon className="w-4 h-4" />
                                {t("sleepSchedule")}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["early", "normal", "late"].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleChange("sleepSchedule", option)}
                                        className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all ${formData.sleepSchedule === option
                                            ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20"
                                            : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                                            }`}
                                    >
                                        {t(`sleep${option.charAt(0).toUpperCase() + option.slice(1)}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Study Habits */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3 px-1 flex items-center gap-2">
                                <BookOpenIcon className="w-4 h-4" />
                                {t("studyHabits")}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {["home", "library", "mixed"].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => handleChange("studyHabits", option)}
                                        className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all ${formData.studyHabits === option
                                            ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20"
                                            : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                                            }`}
                                    >
                                        {t(`study${option.charAt(0).toUpperCase() + option.slice(1)}`)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Lifestyle */}
                    <div className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                            <SparklesIcon className="w-6 h-6 text-[var(--color-accent)]" />
                            {t("lifestyle")}
                        </h2>

                        <div className="space-y-6">
                            {/* Smoking Toggle */}
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🚬</span>
                                    <span className="font-semibold text-[var(--color-text)]">{t("smokingAllowed")}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.smokingAllowed}
                                        onChange={(e) => handleChange("smokingAllowed", e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-13 h-7 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-accent)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[var(--color-accent)]" />
                                </label>
                            </div>

                            {/* Pets Toggle */}
                            <div className="flex items-center justify-between px-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">🐾</span>
                                    <span className="font-semibold text-[var(--color-text)]">{t("petsAllowed")}</span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.petsAllowed}
                                        onChange={(e) => handleChange("petsAllowed", e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-13 h-7 bg-[var(--color-border)] peer-focus:ring-2 peer-focus:ring-[var(--color-accent)]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:bg-[var(--color-accent)]" />
                                </label>
                            </div>

                            {/* Guests */}
                            <div>
                                <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3 px-1">
                                    {t("guestsPolicy")}
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {["never", "sometimes", "often"].map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => handleChange("guestsAllowed", option)}
                                            className={`py-3 px-4 rounded-2xl border text-sm font-semibold transition-all ${formData.guestsAllowed === option
                                                ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)] shadow-md shadow-[var(--color-accent)]/20"
                                                : "border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                                                }`}
                                        >
                                            {t(`guests${option.charAt(0).toUpperCase() + option.slice(1)}`)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-[var(--color-surface)] rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                            <UserIcon className="w-6 h-6 text-[var(--color-accent)]" />
                            {t("aboutYou")}
                        </h2>

                        {/* Major */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3 px-1 flex items-center gap-2">
                                <AcademicCapIcon className="w-4 h-4" />
                                {t("major")}
                            </label>
                            <select
                                value={formData.major}
                                onChange={(e) => handleChange("major", e.target.value)}
                                className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                            >
                                <option value="">{t("selectMajor")}</option>
                                {MAJOR_OPTIONS.map((key) => (
                                    <option key={key} value={key}>
                                        {t(key)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Interests */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3 px-1 flex items-center gap-2">
                                <TagIcon className="w-4 h-4" />
                                {t("interests")}
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {INTEREST_OPTIONS.map((key) => {
                                    const isSelected = formData.interests.includes(key);
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    handleChange("interests", formData.interests.filter((i) => i !== key));
                                                } else {
                                                    handleChange("interests", [...formData.interests, key]);
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isSelected
                                                ? "bg-[var(--color-accent)] text-white shadow-md shadow-[var(--color-accent)]/20"
                                                : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
                                                }`}
                                        >
                                            {t(key)}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="text-xs font-medium text-[var(--color-text-muted)] mt-2 px-1">
                                {formData.interests.length} {t("selected")}
                            </p>
                        </div>

                        {/* Bio */}
                        <div>
                            <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3 px-1">
                                {t("bio")}
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => handleChange("bio", e.target.value)}
                                rows={5}
                                maxLength={500}
                                placeholder={t("bioPlaceholder")}
                                className="w-full px-5 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent resize-none transition-all leading-relaxed"
                            />
                            <p className="text-xs font-medium text-[var(--color-text-muted)] mt-2 text-right px-1">
                                {formData.bio.length}/500
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark,var(--color-accent))] hover:shadow-lg hover:shadow-[var(--color-accent)]/30 disabled:opacity-50 transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                        >
                            {saving ? (
                                <>
                                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                    {t("saving")}
                                </>
                            ) : (
                                t("saveProfile")
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/roommates")}
                            className="py-4 px-6 rounded-2xl font-bold text-[var(--color-text)] border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-all duration-300 text-lg"
                        >
                            {t("findRoommates")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default RoommateProfile;

