import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { roommatesAPI, conversationsAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import RoommateCard from "../../components/roommates/RoommateCard";
import {
    MagnifyingGlassIcon,
    AdjustmentsHorizontalIcon,
    UserPlusIcon,
    XMarkIcon,
    CheckIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

function RoommateSearch() {
    const { t } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [matches, setMatches] = useState([]);
    const [hasProfile, setHasProfile] = useState(false);
    const [error, setError] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [connectingTo, setConnectingTo] = useState(null);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);
    const [matchMessage, setMatchMessage] = useState("");
    const [sendingMatch, setSendingMatch] = useState(false);
    const [startingConversation, setStartingConversation] = useState(false);
    const [activeTab, setActiveTab] = useState("search"); // "search" | "matches"

    const [filters, setFilters] = useState({
        sleepSchedule: "",
        smokingAllowed: "",
        petsAllowed: "",
        major: "",
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
            const [searchRes, matchesRes] = await Promise.all([
                roommatesAPI.search(filters),
                roommatesAPI.getMatches(),
            ]);

            if (searchRes.data) {
                setProfiles(searchRes.data.profiles || []);
                setHasProfile(searchRes.data.hasProfile);
            }
            if (matchesRes.data) {
                setMatches(matchesRes.data.matches || []);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = useCallback(async () => {
        try {
            setLoading(true);
            const res = await roommatesAPI.search(filters);
            if (res.data) {
                setProfiles(res.data.profiles || []);
                setHasProfile(res.data.hasProfile);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleConnect = (profile) => {
        setSelectedProfile(profile);
        setMatchMessage("");
        setShowMatchModal(true);
    };

    const handleSendMatch = async () => {
        if (!selectedProfile) return;

        try {
            setSendingMatch(true);
            await roommatesAPI.sendMatch(selectedProfile.userId, matchMessage);
            setShowMatchModal(false);
            setSelectedProfile(null);
            setMatchMessage("");
            // Refresh matches
            const matchesRes = await roommatesAPI.getMatches();
            if (matchesRes.data) {
                setMatches(matchesRes.data.matches || []);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSendingMatch(false);
        }
    };

    const handleRespondMatch = async (matchId, status) => {
        try {
            await roommatesAPI.respondMatch(matchId, status);
            // Refresh matches
            const matchesRes = await roommatesAPI.getMatches();
            if (matchesRes.data) {
                setMatches(matchesRes.data.matches || []);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleMessageClick = async (userId) => {
        try {
            setStartingConversation(true);
            const res = await conversationsAPI.startDirect(userId);
            if (res.data?.id) {
                navigate(`/messages/${res.data.id}`);
            } else {
                navigate("/messages");
            }
        } catch (err) {
            setError(err.message);
            // Fallback to messages page
            navigate("/messages");
        } finally {
            setStartingConversation(false);
        }
    };

    if (loading && profiles.length === 0) {
        return <PageLoader message={t("loadingRoommates")} />;
    }

    const pendingReceived = matches.filter((m) => m.status === "pending" && !m.isSender);
    const pendingSent = matches.filter((m) => m.status === "pending" && m.isSender);
    const accepted = matches.filter((m) => m.status === "accepted");

    return (
        <div className="min-h-screen bg-[var(--color-bg)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-dark,var(--color-accent))] text-white py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {t("findRoommates")}
                    </h1>
                    <p className="text-white/80 text-lg">
                        {t("findRoommatesSubtitle")}
                    </p>

                    {/* Profile CTA if no profile */}
                    {!hasProfile && (
                        <div className="mt-6 p-4 bg-white/10 backdrop-blur rounded-xl flex items-center justify-between">
                            <div>
                                <p className="font-medium">{t("createProfileToMatch")}</p>
                                <p className="text-sm text-white/70">{t("createProfileHint")}</p>
                            </div>
                            <button
                                onClick={() => navigate("/roommates/profile")}
                                className="px-4 py-2 bg-white text-[var(--color-accent)] rounded-lg font-medium hover:bg-white/90 transition-all"
                            >
                                {t("createProfile")}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === "search"
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                            }`}
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        {t("search")}
                    </button>
                    <button
                        onClick={() => setActiveTab("matches")}
                        className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${activeTab === "matches"
                            ? "bg-[var(--color-accent)] text-white"
                            : "bg-[var(--color-surface)] text-[var(--color-text)] border border-[var(--color-border)]"
                            }`}
                    >
                        <UserPlusIcon className="w-5 h-5" />
                        {t("matches")}
                        {pendingReceived.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                                {pendingReceived.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                        {error}
                    </div>
                )}

                {activeTab === "search" && (
                    <>
                        {/* Filter Bar */}
                        <div className="bg-[var(--color-surface)] rounded-2xl p-4 mb-6 border border-[var(--color-border)]">
                            <div className="flex flex-wrap gap-4 items-center">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-accent)] transition-all"
                                >
                                    <AdjustmentsHorizontalIcon className="w-5 h-5" />
                                    {t("filters")}
                                </button>

                                {showFilters && (
                                    <>
                                        <select
                                            value={filters.sleepSchedule}
                                            onChange={(e) => handleFilterChange("sleepSchedule", e.target.value)}
                                            className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                                        >
                                            <option value="">{t("anySleepSchedule")}</option>
                                            <option value="early">{t("sleepEarly")}</option>
                                            <option value="normal">{t("sleepNormal")}</option>
                                            <option value="late">{t("sleepLate")}</option>
                                        </select>

                                        <select
                                            value={filters.smokingAllowed}
                                            onChange={(e) => handleFilterChange("smokingAllowed", e.target.value)}
                                            className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                                        >
                                            <option value="">{t("anySmoking")}</option>
                                            <option value="true">{t("smokingOk")}</option>
                                            <option value="false">{t("noSmoking")}</option>
                                        </select>

                                        <select
                                            value={filters.major}
                                            onChange={(e) => handleFilterChange("major", e.target.value)}
                                            className="px-4 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)]"
                                        >
                                            <option value="">{t("anyMajor")}</option>
                                            <option value="majorEngineering">{t("majorEngineering")}</option>
                                            <option value="majorComputerScience">{t("majorComputerScience")}</option>
                                            <option value="majorMedicine">{t("majorMedicine")}</option>
                                            <option value="majorBusiness">{t("majorBusiness")}</option>
                                            <option value="majorLaw">{t("majorLaw")}</option>
                                            <option value="majorArts">{t("majorArts")}</option>
                                            <option value="majorScience">{t("majorScience")}</option>
                                            <option value="majorEducation">{t("majorEducation")}</option>
                                            <option value="majorPsychology">{t("majorPsychology")}</option>
                                            <option value="majorCommunications">{t("majorCommunications")}</option>
                                            <option value="majorArchitecture">{t("majorArchitecture")}</option>
                                            <option value="majorNursing">{t("majorNursing")}</option>
                                            <option value="majorOther">{t("majorOther")}</option>
                                        </select>

                                        <button
                                            onClick={handleSearch}
                                            className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:opacity-90 transition-all"
                                        >
                                            {t("applyFilters")}
                                        </button>
                                    </>
                                )}

                                <div className="ml-auto text-sm text-[var(--color-text-muted)]">
                                    {profiles.length} {t("roommatesFound")}
                                </div>
                            </div>
                        </div>

                        {/* Results Grid */}
                        {profiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {profiles.map((profile) => (
                                    <RoommateCard
                                        key={profile.id}
                                        profile={profile}
                                        onConnect={handleConnect}
                                        isConnecting={connectingTo === profile.id}
                                        onViewDetails={() => navigate(`/roommates/view/${profile.userId}`, { state: { profile } })}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                                    <MagnifyingGlassIcon className="w-10 h-10 text-[var(--color-accent)]" />
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                                    {t("noRoommatesFound")}
                                </h3>
                                <p className="text-[var(--color-text-muted)]">
                                    {t("tryDifferentFilters")}
                                </p>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "matches" && (
                    <div className="space-y-8">
                        {/* Pending Received */}
                        {pendingReceived.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                                    {t("pendingRequests")}
                                    <span className="px-2 py-0.5 text-sm bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-full">
                                        {pendingReceived.length}
                                    </span>
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingReceived.map((match) => (
                                        <div
                                            key={match.id}
                                            className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/roommates/view/${match.otherUser?.id}`, { state: { profile: { ...match.otherUserProfile, user: match.otherUser, compatibilityScore: match.compatibilityScore } } })}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center overflow-hidden">
                                                    {match.otherUser?.profilePictureUrl ? (
                                                        <img
                                                            src={match.otherUser.profilePictureUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserPlusIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-[var(--color-text)]">
                                                        {match.otherUser?.firstName} {match.otherUser?.lastName}
                                                    </h3>
                                                    {match.message && (
                                                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">
                                                            "{match.message}"
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-[var(--color-text-muted)]">
                                                        {match.compatibilityScore}% {t("compatible")}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRespondMatch(match.id, "accepted"); }}
                                                        className="p-2 rounded-full bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-all"
                                                        title={t("accept")}
                                                    >
                                                        <CheckIcon className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleRespondMatch(match.id, "rejected"); }}
                                                        className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                                                        title={t("reject")}
                                                    >
                                                        <XMarkIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Accepted Matches */}
                        {accepted.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                                    {t("acceptedMatches")}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {accepted.map((match) => (
                                        <div
                                            key={match.id}
                                            className="bg-[var(--color-surface)] rounded-xl p-4 border border-green-500/30 hover:shadow-md transition-all cursor-pointer group"
                                            onClick={() => navigate(`/roommates/view/${match.otherUser?.id}`, { state: { profile: { ...match.otherUserProfile, user: match.otherUser, compatibilityScore: match.compatibilityScore } } })}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center overflow-hidden">
                                                    {match.otherUser?.profilePictureUrl ? (
                                                        <img
                                                            src={match.otherUser.profilePictureUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserPlusIcon className="w-6 h-6 text-green-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-[var(--color-text)]">
                                                        {match.otherUser?.firstName} {match.otherUser?.lastName}
                                                    </h3>
                                                    <p className="text-sm text-green-500">
                                                        ✓ {t("matched")}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleMessageClick(match.otherUser?.id); }}
                                                    disabled={startingConversation}
                                                    className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                                                >
                                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                                    {startingConversation ? t("loading") : t("message")}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Pending Sent */}
                        {pendingSent.length > 0 && (
                            <div>
                                <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                                    {t("sentRequests")}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {pendingSent.map((match) => (
                                        <div
                                            key={match.id}
                                            className="bg-[var(--color-surface)] rounded-xl p-4 border border-[var(--color-border)] hover:border-[var(--color-accent)]/30 transition-all cursor-pointer group"
                                            onClick={() => navigate(`/roommates/view/${match.otherUser?.id}`, { state: { profile: { ...match.otherUserProfile, user: match.otherUser, compatibilityScore: match.compatibilityScore } } })}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center overflow-hidden">
                                                    {match.otherUser?.profilePictureUrl ? (
                                                        <img
                                                            src={match.otherUser.profilePictureUrl}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <UserPlusIcon className="w-6 h-6 text-[var(--color-accent)]" />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-[var(--color-text)]">
                                                        {match.otherUser?.firstName} {match.otherUser?.lastName}
                                                    </h3>
                                                    <p className="text-sm text-[var(--color-text-muted)]">
                                                        {t("awaitingResponse")}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State */}
                        {matches.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center">
                                    <UserPlusIcon className="w-10 h-10 text-[var(--color-accent)]" />
                                </div>
                                <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">
                                    {t("noMatchesYet")}
                                </h3>
                                <p className="text-[var(--color-text-muted)]">
                                    {t("startConnecting")}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Match Modal */}
            {showMatchModal && selectedProfile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-[var(--color-surface)] rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h3 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                            {t("sendMatchRequest")}
                        </h3>
                        <p className="text-[var(--color-text-muted)] mb-4">
                            {t("matchRequestHintPre")} <span className="font-semibold text-[var(--color-text)]">{selectedProfile.user?.firstName}</span>
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
                                onClick={() => setShowMatchModal(false)}
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

export default RoommateSearch;
