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
    TrashIcon,
    ChatBubbleLeftRightIcon,
    UserGroupIcon,
    PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Alert from "../../components/common/Alert";

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
    const [matches, setMatches] = useState([]);
    const [loadingMatches, setLoadingMatches] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: null,
        type: "info",
    });

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
            if (user?.role === "Student") {
                loadMatches();
            }
        }
    };

    const loadMatches = async () => {
        try {
            setLoadingMatches(true);
            const res = await roommatesAPI.getMatches();
            setMatches(res.data?.matches || []);
        } catch (err) {
            console.error("Failed to load matches:", err);
        } finally {
            setLoadingMatches(false);
        }
    };

    const handleDeleteMatch = (matchId) => {
        setAlertConfig({
            isOpen: true,
            title: t("removeMatch"),
            message: t("removeMatchConfirm"),
            type: "warning",
            confirmText: t("delete"),
            cancelText: t("cancel"),
            onConfirm: async () => {
                try {
                    await roommatesAPI.deleteMatch(matchId);
                    setMatches((prev) => prev.filter((m) => m.id !== matchId));
                    setSuccess(t("matchRemoved"));
                    setTimeout(() => setSuccess(null), 3000);
                } catch (err) {
                    setError(err.message);
                }
            },
        });
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
            setIsEditing(false); // Switch back to view mode after saving
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <PageLoader message={t("loadingProfile")} />;
    }

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
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        {t("roommateProfile")}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">
                        {t("roommateProfileSubtitle")}
                    </p>
                </div>

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

                <div className="space-y-8">
                    <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] overflow-hidden">
                                    {user?.profilePictureUrl ? (
                                        <img src={user.profilePictureUrl} alt={user.firstName} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-[var(--color-text)]">
                                        {user?.firstName} {user?.lastName}
                                    </h2>
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        {user?.role} • {user?.university?.name || t("notAssigned")}
                                    </p>
                                </div>
                            </div>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[var(--color-accent)] text-white font-bold hover:shadow-lg hover:shadow-[var(--color-accent)]/20 transition-all"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                    {t("editProfile")}
                                </button>
                            )}
                        </div>
                    </div>

                    {!isEditing ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${formData.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                    <span className="font-semibold text-[var(--color-text)]">
                                        {formData.isActive ? t("profileActive") : t("profileInactive")}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                                        <CurrencyDollarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                                        {t("budgetPreferences")}
                                    </h3>
                                    <p className="text-2xl font-bold text-[var(--color-accent)]">
                                        {formData.minBudget || 0} - {formData.maxBudget || '∞'} <span className="text-xs font-medium text-[var(--color-text-muted)]">NIS</span>
                                    </p>
                                </div>

                                <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                    <h3 className="text-lg font-bold text-[var(--color-text)] mb-4 flex items-center gap-2">
                                        <AcademicCapIcon className="w-5 h-5 text-[var(--color-accent)]" />
                                        {t("major")}
                                    </h3>
                                    <p className="text-lg font-semibold text-[var(--color-text)]">
                                        {formData.major ? t(formData.major) : t("notSpecified")}
                                    </p>
                                </div>
                            </div>

                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                <h3 className="text-lg font-bold text-[var(--color-text)] mb-6 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-[var(--color-accent)]" />
                                    {t("livingPreferences")}
                                </h3>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                    <div className="text-center p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">{t("cleanliness")}</p>
                                        <p className="font-bold text-[var(--color-text)]">{formData.cleanlinessLevel}/5</p>
                                    </div>
                                    <div className="text-center p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">{t("noise")}</p>
                                        <p className="font-bold text-[var(--color-text)]">{formData.noiseLevel}/5</p>
                                    </div>
                                    <div className="text-center p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">{t("sleep")}</p>
                                        <p className="font-bold text-[var(--color-text)]">{t(`sleep${formData.sleepSchedule.charAt(0).toUpperCase() + formData.sleepSchedule.slice(1)}`)}</p>
                                    </div>
                                    <div className="text-center p-3 rounded-2xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-[var(--color-text-muted)] mb-1">{t("study")}</p>
                                        <p className="font-bold text-[var(--color-text)]">{t(`study${formData.studyHabits.charAt(0).toUpperCase() + formData.studyHabits.slice(1)}`)}</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-[var(--color-text-muted)] mb-3">{t("bio")}</h4>
                                    <p className="text-[var(--color-text)] leading-relaxed bg-[var(--color-bg)] p-4 rounded-2xl border border-[var(--color-border)]">
                                        {formData.bio || t("noBioProvided")}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-bold text-[var(--color-text-muted)] mb-3">{t("interests")}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.interests.length > 0 ? (
                                            formData.interests.map((key) => (
                                                <span key={key} className="px-3 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold border border-[var(--color-accent)]/20">
                                                    {t(key)}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-[var(--color-text-muted)] italic">{t("noInterests")}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
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
                                        <div className="w-13 h-7 bg-[var(--color-border)] rounded-full peer peer-checked:bg-[var(--color-accent)] after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-full" />
                                    </label>
                                </div>
                            </div>

                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                                    <CurrencyDollarIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    {t("budgetPreferences")}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">{t("minBudget")} (NIS)</label>
                                        <input type="number" value={formData.minBudget} onChange={(e) => handleChange("minBudget", e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-2">{t("maxBudget")} (NIS)</label>
                                        <input type="number" value={formData.maxBudget} onChange={(e) => handleChange("maxBudget", e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)]" />
                                    </div>
                                </div>
                            </div>

                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                                    <HomeIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    {t("livingPreferences")}
                                </h2>
                                <div className="mb-10">
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-semibold text-[var(--color-text-muted)]">{t("cleanlinessLevel")}</label>
                                        <span className="text-sm text-[var(--color-accent)] font-bold">{formData.cleanlinessLevel}/5</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={formData.cleanlinessLevel} onChange={(e) => handleChange("cleanlinessLevel", parseInt(e.target.value))} className="w-full" />
                                </div>
                                <div className="mb-10">
                                    <div className="flex justify-between mb-4">
                                        <label className="text-sm font-semibold text-[var(--color-text-muted)]">{t("noiseLevel")}</label>
                                        <span className="text-sm text-[var(--color-accent)] font-bold">{formData.noiseLevel}/5</span>
                                    </div>
                                    <input type="range" min="1" max="5" value={formData.noiseLevel} onChange={(e) => handleChange("noiseLevel", parseInt(e.target.value))} className="w-full" />
                                </div>
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3">{t("sleepSchedule")}</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["early", "normal", "late"].map((opt) => (
                                            <button key={opt} type="button" onClick={() => handleChange("sleepSchedule", opt)} className={`py-3 rounded-2xl border text-sm font-semibold transition-all ${formData.sleepSchedule === opt ? "bg-[var(--color-accent)] text-white" : "border-[var(--color-border)]"}`}>{t(`sleep${opt.charAt(0).toUpperCase() + opt.slice(1)}`)}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3">{t("studyHabits")}</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {["home", "library", "mixed"].map((opt) => (
                                            <button key={opt} type="button" onClick={() => handleChange("studyHabits", opt)} className={`py-3 rounded-2xl border text-sm font-semibold transition-all ${formData.studyHabits === opt ? "bg-[var(--color-accent)] text-white" : "border-[var(--color-border)]"}`}>{t(`study${opt.charAt(0).toUpperCase() + opt.slice(1)}`)}</button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                                    <SparklesIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    {t("lifestyle")}
                                </h2>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-[var(--color-text)]">🚬 {t("smokingAllowed")}</span>
                                        <input type="checkbox" checked={formData.smokingAllowed} onChange={(e) => handleChange("smokingAllowed", e.target.checked)} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-[var(--color-text)]">🐾 {t("petsAllowed")}</span>
                                        <input type="checkbox" checked={formData.petsAllowed} onChange={(e) => handleChange("petsAllowed", e.target.checked)} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-[var(--color-text-muted)] mb-3">{t("guestsPolicy")}</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {["never", "sometimes", "often"].map((opt) => (
                                                <button key={opt} type="button" onClick={() => handleChange("guestsAllowed", opt)} className={`py-3 rounded-2xl border text-sm font-semibold ${formData.guestsAllowed === opt ? "bg-[var(--color-accent)] text-white" : "border-[var(--color-border)]"}`}>{t(`guests${opt.charAt(0).toUpperCase() + opt.slice(1)}`)}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                                <h2 className="text-xl font-bold text-[var(--color-text)] mb-5 flex items-center gap-2">
                                    <AcademicCapIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                    {t("aboutYou")}
                                </h2>
                                <div className="space-y-6">
                                    <select value={formData.major} onChange={(e) => handleChange("major", e.target.value)} className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)]">
                                        <option value="">{t("selectMajor")}</option>
                                        {MAJOR_OPTIONS.map(opt => <option key={opt} value={opt}>{t(opt)}</option>)}
                                    </select>
                                    <div className="flex flex-wrap gap-2">
                                        {INTEREST_OPTIONS.map(opt => (
                                            <button key={opt} type="button" onClick={() => handleChange("interests", formData.interests.includes(opt) ? formData.interests.filter(i => i !== opt) : [...formData.interests, opt])} className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${formData.interests.includes(opt) ? "bg-[var(--color-accent)] text-white" : "bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)]"}`}>{t(opt)}</button>
                                        ))}
                                    </div>
                                    <textarea value={formData.bio} onChange={(e) => handleChange("bio", e.target.value)} rows={5} className="w-full px-5 py-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] focus:ring-2 focus:ring-[var(--color-accent)]" placeholder={t("bioPlaceholder")} />
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button type="submit" disabled={saving} className="flex-1 py-4 px-6 rounded-2xl font-bold text-white bg-[var(--color-accent)] hover:shadow-lg transition-all">{saving ? t("saving") : t("saveProfile")}</button>
                                <button type="button" onClick={() => { setIsEditing(false); loadData(); }} className="flex-1 py-4 px-6 rounded-2xl font-bold text-[var(--color-text)] border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] transition-all">{t("cancel")}</button>
                            </div>
                        </form>
                    )}

                    <div className="themed-surface rounded-3xl p-6 border border-[var(--color-border)] shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-[var(--color-text)] flex items-center gap-2">
                                <UserGroupIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                {t("manageMatches")}
                            </h2>
                            <span className="px-3 py-1 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-bold rounded-full">
                                {matches.length} {t("matches")}
                            </span>
                        </div>

                        {loadingMatches ? (
                            <div className="py-8 flex justify-center">
                                <div className="w-8 h-8 border-3 border-[var(--color-accent)]/30 border-t-[var(--color-accent)] rounded-full animate-spin" />
                            </div>
                        ) : matches.length === 0 ? (
                            <div className="py-10 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                                <p className="text-[var(--color-text-muted)] text-sm">{t("noMatchesYet")}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {matches.map((match) => (
                                    <div
                                        key={match.id}
                                        className="p-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-accent)]/30 transition-all cursor-pointer group"
                                        onClick={() => navigate(`/roommates/view/${match.otherUser?.id}`, { state: { profile: { ...match.otherUserProfile, user: match.otherUser, compatibilityScore: match.compatibilityScore } } })}
                                    >
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--color-accent)]/10 flex items-center justify-center text-[var(--color-accent)] font-bold">
                                                {match.otherUser?.profilePictureUrl ? (
                                                    <img src={match.otherUser.profilePictureUrl} className="w-full h-full object-cover" />
                                                ) : (match.otherUser?.firstName?.[0] || "?")}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-bold text-[var(--color-text)] truncate">{match.otherUser?.firstName} {match.otherUser?.lastName}</h3>
                                                <p className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${match.status === 'accepted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                                                    {t(match.status)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={(e) => { e.stopPropagation(); navigate("/messages"); }} className="flex-1 py-2 rounded-xl bg-[var(--color-bg-alt)] hover:bg-[var(--color-accent)]/10 text-[var(--color-text)] text-xs font-bold transition-all flex items-center justify-center gap-2">
                                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                {t("message")}
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteMatch(match.id); }} className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all shadow-sm">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Alert
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                confirmText={alertConfig.confirmText}
                cancelText={alertConfig.cancelText}
                onConfirm={alertConfig.onConfirm}
            />
        </div>
    );
}

export default RoommateProfile;
