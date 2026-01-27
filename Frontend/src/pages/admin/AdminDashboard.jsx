import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { adminAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import {
  UsersIcon,
  HomeIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClipboardDocumentCheckIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !["admin", "superadmin"].includes(user.role?.toLowerCase())) {
      navigate("/");
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, trendsRes, reportsRes, verificationsRes] = await Promise.all([
        adminAPI.getDashboardStats(),
        adminAPI.getDashboardTrends(),
        adminAPI.getRecentReports(5),
        adminAPI.getRecentVerifications(5),
      ]);

      setStats(statsRes.data);
      setTrends(trendsRes.data);
      setRecentReports(reportsRes.data || []);
      setRecentVerifications(verificationsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data");
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
        <p className="text-red-500 mb-4">{error}</p>
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
      title: t("totalUsers"),
      value: stats?.users?.total || 0,
      change: stats?.users?.newThisMonth || 0,
      changeLabel: t("newThisMonth"),
      icon: UsersIcon,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/admin/users",
    },
    {
      title: t("totalProperties"),
      value: stats?.properties?.total || 0,
      change: stats?.properties?.newThisMonth || 0,
      changeLabel: t("newThisMonth"),
      icon: HomeIcon,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: t("pendingReports"),
      value: stats?.reports?.pending || 0,
      total: stats?.reports?.total || 0,
      changeLabel: t("totalReports"),
      icon: ExclamationTriangleIcon,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      link: "/admin/reports",
    },
    {
      title: t("pendingVerifications"),
      value: stats?.verifications?.pending || 0,
      total: stats?.verifications?.approved || 0,
      changeLabel: t("approved"),
      icon: ShieldCheckIcon,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/admin/verification",
    },
  ];

  const userRoleData = [
    { name: t("students"), value: stats?.users?.students || 0, color: "#3b82f6" },
    { name: t("landlords"), value: stats?.users?.landlords || 0, color: "#8b5cf6" },
  ];

  const engagementStats = [
    {
      title: t("reviews"),
      value: stats?.engagement?.reviews || 0,
      icon: ChatBubbleLeftRightIcon,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: t("propertyViewings"),
      value: stats?.engagement?.viewings || 0,
      icon: HomeIcon,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: t("forumPosts"),
      value: stats?.engagement?.forumPosts || 0,
      icon: ChatBubbleLeftRightIcon,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
    },
    {
      title: t("roommateProfiles"),
      value: stats?.roommates?.total || 0,
      icon: UserGroupIcon,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
  ];

  const quickActions = [
    {
      title: t("manageUsers"),
      description: t("viewAndManageUsers"),
      icon: UsersIcon,
      color: "text-blue-500",
      link: "/admin/users",
    },
    {
      title: t("reviewReports"),
      description: t("handleReportsModeration"),
      icon: ExclamationTriangleIcon,
      color: "text-red-500",
      link: "/admin/reports",
    },
    {
      title: "AI Report Analysis",
      description: "Get intelligent AI recommendations for report moderation",
      icon: ChartBarIcon,
      color: "text-cyan-500",
      link: "/admin/ai-reports",
    },
    {
      title: t("verifications"),
      description: t("approveRejectRequests"),
      icon: ShieldCheckIcon,
      color: "text-green-500",
      link: "/admin/verification",
    },
    {
      title: t("universities"),
      description: t("manageUniversityListings"),
      icon: AcademicCapIcon,
      color: "text-purple-500",
      link: "/admin/universities",
    },
    {
      title: t("announcements"),
      description: t("createManageAnnouncements"),
      icon: ClipboardDocumentCheckIcon,
      color: "text-yellow-500",
      link: "/admin/announcements",
    },
    {
      title: t("adminManagement"),
      description: t("manageAdminUsersSuper"),
      icon: ShieldCheckIcon,
      color: "text-indigo-500",
      link: "/admin/management",
      superAdminOnly: true,
    },
  ];

  const formatTrendData = (data) => {
    if (!data || data.length === 0) return [];
    return data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: parseInt(item.count)
    }));
  };

  return (
    <div className="min-h-screen themed-surface">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)] mb-2">
            {t("adminDashboard")}
          </h1>
          <p className="text-[var(--color-text-soft)]">
            {t("platformOverview")}
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              onClick={() => stat.link && navigate(stat.link)}
              className={`themed-surface-alt rounded-xl p-6 border themed-border ${
                stat.link ? "cursor-pointer hover:border-[var(--color-accent)] transition-all" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-[var(--color-text-soft)] mb-1">
                {stat.title}
              </p>
              <p className="text-3xl font-bold text-[var(--color-text)] mb-2">
                {stat.value.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 text-sm">
                {stat.change !== undefined && (
                  <>
                    <span className={`flex items-center gap-1 ${
                      stat.change > 0 ? "text-green-500" : "text-gray-500"
                    }`}>
                      {stat.change > 0 && <ArrowTrendingUpIcon className="w-4 h-4" />}
                      {stat.change}
                    </span>
                    <span className="text-[var(--color-text-soft)]">
                      {stat.changeLabel}
                    </span>
                  </>
                )}
                {stat.total !== undefined && (
                  <span className="text-[var(--color-text-soft)]">
                    {stat.total} {stat.changeLabel}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* User Registration Trends */}
          <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center gap-2 mb-6">
              <ChartBarIcon className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {t("userRegistrations")}
              </h2>
            </div>
            {trends?.users && trends.users.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={formatTrendData(trends.users)}>
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
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6" }}
                    name={t("newThisMonth")}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--color-text-soft)] py-8">
                {t("noDataAvailable")}
              </p>
            )}
          </div>

          {/* User Role Distribution */}
          <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center gap-2 mb-6">
              <UsersIcon className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {t("userDistribution")}
              </h2>
            </div>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={userRoleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {userRoleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Property Listings Trend */}
          <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center gap-2 mb-6">
              <HomeIcon className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {t("newProperties")}
              </h2>
            </div>
            {trends?.properties && trends.properties.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={formatTrendData(trends.properties)}>
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
                  <Bar dataKey="count" fill="#8b5cf6" name={t("newProperties")} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--color-text-soft)] py-8">
                {t("noDataAvailable")}
              </p>
            )}
          </div>

          {/* Forum Activity */}
          <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center gap-2 mb-6">
              <ChatBubbleLeftRightIcon className="w-5 h-5 text-[var(--color-accent)]" />
              <h2 className="text-lg font-semibold text-[var(--color-text)]">
                {t("forumActivity")}
              </h2>
            </div>
            {trends?.forumPosts && trends.forumPosts.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={formatTrendData(trends.forumPosts)}>
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
                    dataKey="count"
                    stroke="#ec4899"
                    strokeWidth={2}
                    dot={{ fill: "#ec4899" }}
                    name={t("forumPosts")}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-[var(--color-text-soft)] py-8">
                {t("noDataAvailable")}
              </p>
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {engagementStats.map((stat, index) => (
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
              <p className="text-2xl font-bold text-[var(--color-text)]">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Reports */}
          <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-[var(--color-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {t("recentReports")}
                </h2>
              </div>
              <button
                onClick={() => navigate("/admin/reports")}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                {t("viewAll")}
              </button>
            </div>

            {recentReports.length > 0 ? (
              <div className="space-y-3">
                {recentReports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border themed-border rounded-lg hover:bg-[var(--color-surface)] transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-[var(--color-text)] text-sm">
                        {report.reason}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : report.status === "resolved"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-soft)]">
                      By: {report.reporter?.first_name} {report.reporter?.last_name}
                    </p>
                    <p className="text-xs text-[var(--color-text-soft)]">
                      Against: {report.reportedUser?.first_name} {report.reportedUser?.last_name}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--color-text-soft)] py-8">
                {t("noRecentReports")}
              </p>
            )}
          </div>

          {/* Recent Verifications */}
          <div className="themed-surface-alt rounded-xl p-6 border themed-border">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="w-5 h-5 text-[var(--color-accent)]" />
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  {t("recentVerifications")}
                </h2>
              </div>
              <button
                onClick={() => navigate("/admin/verification")}
                className="text-sm text-[var(--color-accent)] hover:underline"
              >
                {t("viewAll")}
              </button>
            </div>

            {recentVerifications.length > 0 ? (
              <div className="space-y-3">
                {recentVerifications.map((verification) => (
                  <div
                    key={verification.id}
                    className="p-4 border themed-border rounded-lg hover:bg-[var(--color-surface)] transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-[var(--color-text)] text-sm">
                        {verification.user?.first_name} {verification.user?.last_name}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          verification.status === "pending"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : verification.status === "approved"
                            ? "bg-green-500/10 text-green-500"
                            : "bg-red-500/10 text-red-500"
                        }`}
                      >
                        {verification.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--color-text-soft)]">
                      Role: {verification.user?.role}
                    </p>
                    <p className="text-xs text-[var(--color-text-soft)]">
                      Type: {verification.verificationType}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--color-text-soft)] py-8">
                {t("noRecentVerifications")}
              </p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="themed-surface-alt rounded-xl p-6 border themed-border">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-6">
            {t("quickActions")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quickActions
              .filter(action => !action.superAdminOnly || user.role?.toLowerCase() === "superadmin")
              .map((action, index) => (
                <button
                  key={index}
                  onClick={() => navigate(action.link)}
                  className="p-4 themed-surface rounded-lg border themed-border hover:border-[var(--color-accent)] transition-all text-left"
                >
                  <action.icon className={`w-8 h-8 ${action.color} mb-3`} />
                  <h3 className="font-semibold text-[var(--color-text)] mb-1">
                    {action.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-soft)]">
                    {action.description}
                  </p>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
