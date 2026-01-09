import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { landlordAnalyticsAPI, viewingsAPI } from "../../services/api";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
    ChartBarIcon,
    EyeIcon,
    HeartIcon,
    ChatBubbleLeftRightIcon,
    HomeIcon,
    CalendarIcon,
    ChartPieIcon,
} from "@heroicons/react/24/outline";
import PageLoader from "../../components/common/PageLoader";

const LandlordDashboard = () => {
    const { t, language } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isRTL = language === "ar";

    const [overview, setOverview] = useState(null);
    const [trends, setTrends] = useState([]);
    const [viewings, setViewings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [overviewRes, trendsRes, viewingsRes] = await Promise.all([
                landlordAnalyticsAPI.getOverview(),
                landlordAnalyticsAPI.getTrends(),
                viewingsAPI.getMyBookings(),
            ]);

            setOverview(overviewRes.data);
            setTrends(trendsRes.data || []);
            setViewings(viewingsRes.data?.filter(v => v.status === 'pending' || v.status === 'confirmed') || []);
        } catch (err) {
            console.error("Failed to fetch dashboard data:", err);
            setError(t("failedToLoadAnalytics"));
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoader loading={true} message={t("loading")} />;
    }

    if (error) {
        return (
            <div className="min-h-screen themed-surface px-4 py-16 text-center">
                <p className="text-red-500  mb-4">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="btn-primary px-6 py-2 rounded-lg"
                >
                    {t("tryAgain")}
                </button>
            </div>
        );
    }

    const statCards = [
        {
            title: t("totalViews"),
            value: overview?.totalViews || 0,
            icon: EyeIcon,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            title: t("totalFavorites"),
            value: overview?.totalFavorites || 0,
            icon: HeartIcon,
            color: "text-pink-500",
            bgColor: "bg-pink-500/10",
        },
        {
            title: t("totalInquiries"),
            value: overview?.totalInquiries || 0,
            icon: ChatBubbleLeftRightIcon,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            title: t("propertiesCount"),
            value: overview?.propertiesCount || 0,
            icon: HomeIcon,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
    ];

    return (
        <div className="min-h-screen themed-surface">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
                        {t("landlordDashboard")}
                    </h1>
                    <p className="text-[var(--color-text-soft)]">{t("last30Days")}</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            className="themed-surface-alt rounded-xl p-6 border themed-border"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                            <p className="text-sm text-[var(--color-text-soft)] mb-1">
                                {stat.title}
                            </p>
                            <p className="text-3xl font-bold text-[var(--color-text)]">
                                {stat.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Views Trend */}
                    <div className="themed-surface-alt rounded-xl p-6 border themed-border">
                        <div className="flex items-center gap-2 mb-6">
                            <ChartBarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                            <h2 className="text-lg font-semibold text-[var(--color-text)]">
                                {t("viewsOverTime")}
                            </h2>
                        </div>
                        {trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={trends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--color-text-soft)"
                                        style={{ fontSize: 12 }}
                                    />
                                    <YAxis stroke="var(--color-text-soft)" style={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--color-surface-alt)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="views"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        dot={{ fill: "#3b82f6" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-[var(--color-text-soft)] py-8">
                                {t("noDataAvailable")}
                            </p>
                        )}
                    </div>

                    {/* Engagement Mix */}
                    <div className="themed-surface-alt rounded-xl p-6 border themed-border">
                        <div className="flex items-center gap-2 mb-6">
                            <ChartPieIcon className="w-5 h-5 text-[var(--color-accent)]" />
                            <h2 className="text-lg font-semibold text-[var(--color-text)]">
                                {t("performanceTrends")}
                            </h2>
                        </div>
                        {trends.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={trends.slice(-7)}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="var(--color-text-soft)"
                                        style={{ fontSize: 12 }}
                                    />
                                    <YAxis stroke="var(--color-text-soft)" style={{ fontSize: 12 }} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "var(--color-surface-alt)",
                                            border: "1px solid var(--color-border)",
                                            borderRadius: "8px",
                                        }}
                                    />
                                    <Legend />
                                    <Bar dataKey="favorites" fill="#ec4899" name={t("totalFavorites")} />
                                    <Bar dataKey="inquiries" fill="#10b981" name={t("totalInquiries")} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-center text-[var(--color-text-soft)] py-8">
                                {t("noDataAvailable")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Upcoming Viewings */}
                <div className="themed-surface-alt rounded-xl p-6 border themed-border">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                            <h2 className="text-lg font-semibold text-[var(--color-text)]">
                                {t("upcomingViewings")}
                            </h2>
                        </div>
                        <button
                            onClick={() => navigate("/landlord/availability")}
                            className="text-sm text-[var(--color-accent)] hover:underline"
                        >
                            {t("manageAvailability")}
                        </button>
                    </div>

                    {viewings.length > 0 ? (
                        <div className="space-y-4">
                            {viewings.slice(0, 5).map((viewing) => (
                                <div
                                    key={viewing.id}
                                    className="flex items-center justify-between p-4 border themed-border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium text-[var(--color-text)]">
                                            {viewing.property?.listing?.title || t("property")}
                                        </p>
                                        <p className="text-sm text-[var(--color-text-soft)]">
                                            {viewing.student?.firstName} {viewing.student?.lastName}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-[var(--color-text)]">
                                            {new Date(viewing.scheduledDate).toLocaleDateString(
                                                language === "ar" ? "ar-EG" : "en-US"
                                            )}
                                        </p>
                                        <p className="text-sm text-[var(--color-text-soft)]">
                                            {viewing.scheduledTime}
                                        </p>
                                    </div>
                                    <span
                                        className={`ml-4 px-3 py-1 rounded-full text-xs font-medium ${viewing.status === "confirmed"
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-yellow-500/10 text-yellow-500"
                                            }`}
                                    >
                                        {t(`viewing${viewing.status.charAt(0).toUpperCase() + viewing.status.slice(1)}`)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-[var(--color-text-soft)] py-8">
                            {t("noViewingsScheduled")}
                        </p>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <button
                        onClick={() => navigate("/my-listings")}
                        className="p-6 themed-surface-alt rounded-xl border themed-border hover:border-[var(--color-accent)] transition-colors text-left"
                    >
                        <HomeIcon className="w-8 h-8 text-[var(--color-accent)] mb-3" />
                        <h3 className="font-semibold text-[var(--color-text)] mb-1">
                            {t("myListings")}
                        </h3>
                        <p className="text-sm text-[var(--color-text-soft)]">
                            {t("manageYourProperties")}
                        </p>
                    </button>

                    <button
                        onClick={() => navigate("/landlord/availability")}
                        className="p-6 themed-surface-alt rounded-xl border themed-border hover:border-[var(--color-accent)] transition-colors text-left"
                    >
                        <CalendarIcon className="w-8 h-8 text-[var(--color-accent)] mb-3" />
                        <h3 className="font-semibold text-[var(--color-text)] mb-1">
                            {t("manageAvailability")}
                        </h3>
                        <p className="text-sm text-[var(--color-text-soft)]">
                            {t("setAvailability")}
                        </p>
                    </button>

                    <button
                        onClick={() => navigate("/profile")}
                        className="p-6 themed-surface-alt rounded-xl border themed-border hover:border-[var(--color-accent)] transition-colors text-left"
                    >
                        <ChartBarIcon className="w-8 h-8 text-[var(--color-accent)] mb-3" />
                        <h3 className="font-semibold text-[var(--color-text)] mb-1">
                            {t("verification")}
                        </h3>
                        <p className="text-sm text-[var(--color-text-soft)]">
                            {t("getVerified")}
                        </p>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LandlordDashboard;
