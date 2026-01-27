import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { adminAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckBadgeIcon,
  XCircleIcon,
  NoSymbolIcon,
  ChatBubbleLeftRightIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

const AdminUsers = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    role: "all",
    search: "",
  });
  const [error, setError] = useState("");
  const [processingUser, setProcessingUser] = useState(null);
  const [actionModal, setActionModal] = useState({ isOpen: false, type: null, userId: null, userName: "" });
  const [resultAlert, setResultAlert] = useState({ isOpen: false, type: "", message: "" });

  useEffect(() => {
    if (!user || !["admin", "superadmin"].includes(user.role?.toLowerCase())) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [user, navigate, pagination.page, filters.role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllUsers(
        pagination.page,
        pagination.limit,
        filters.role === "all" ? null : filters.role,
        filters.search
      );
      setUsers(response.data.users || []);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchUsers();
  };

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage });
  };

  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "superadmin":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "admin":
        return "bg-orange-500/10 text-orange-500 border-orange-500/30";
      case "landlord":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "student":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/30";
    }
  };

  const openActionModal = (type, userId, userName) => {
    setActionModal({ isOpen: true, type, userId, userName });
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, type: null, userId: null, userName: "" });
  };

  const handleConfirmAction = async () => {
    const { type, userId } = actionModal;
    closeActionModal();
    setProcessingUser(userId);

    try {
      switch (type) {
        case "suspend":
          await adminAPI.suspendUser(userId);
          setResultAlert({ isOpen: true, type: "success", message: t("userSuspended") || "User messaging suspended successfully" });
          break;
        case "unsuspend":
          await adminAPI.unsuspendUser(userId);
          setResultAlert({ isOpen: true, type: "success", message: t("userUnsuspended") || "User messaging unsuspended successfully" });
          break;
        case "ban":
          await adminAPI.banUser(userId);
          setResultAlert({ isOpen: true, type: "success", message: t("userBanned") || "User banned successfully" });
          break;
        case "unban":
          await adminAPI.unbanUser(userId);
          setResultAlert({ isOpen: true, type: "success", message: t("userUnbanned") || "User unbanned successfully" });
          break;
      }
      await fetchUsers();
    } catch (err) {
      setResultAlert({ isOpen: true, type: "error", message: err.message || `Failed to ${type} user` });
    } finally {
      setProcessingUser(null);
    }
  };

  const getActionModalContent = () => {
    const { type, userName } = actionModal;
    switch (type) {
      case "suspend":
        return {
          title: t("suspendUserTitle") || "Suspend User",
          message: `${t("confirmSuspendUser") || "Suspend messaging for"} ${userName}?`,
          confirmText: t("suspend") || "Suspend",
          alertType: "warning",
        };
      case "unsuspend":
        return {
          title: t("unsuspendUserTitle") || "Unsuspend User",
          message: `${t("confirmUnsuspendUser") || "Restore messaging for"} ${userName}?`,
          confirmText: t("unsuspend") || "Unsuspend",
          alertType: "info",
        };
      case "ban":
        return {
          title: t("banUserTitle") || "Ban User",
          message: `${t("confirmBanUser") || "Ban"} ${userName}? ${t("banUserWarning") || "This will completely disable their account."}`,
          confirmText: t("ban") || "Ban",
          alertType: "danger",
        };
      case "unban":
        return {
          title: t("unbanUserTitle") || "Unban User",
          message: `${t("confirmUnbanUser") || "Unban"} ${userName}?`,
          confirmText: t("unban") || "Unban",
          alertType: "info",
        };
      default:
        return { title: "", message: "", confirmText: "", alertType: "info" };
    }
  };

  if (loading && users.length === 0) {
    return <PageLoader loading={true} message={t("loading")} />;
  }

  return (
    <div className="min-h-screen themed-surface py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] flex items-center gap-3">
            <UsersIcon className="w-12 h-12 text-[var(--color-accent)]" />
            {t("userManagement")}
          </h1>
          <p className="text-[var(--color-text-soft)] mt-2 text-lg">
            {t("viewManageAllUsers")}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg border border-red-500/30">
            {error}
          </div>
        )}

        <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSearch} className="mb-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-soft)] pointer-events-none" />
              <input
                type="text"
                placeholder={t("searchByNameEmail")}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 input-field"
              />
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="relative min-w-[160px]">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[var(--color-text-soft)] pointer-events-none" />
                <select
                  value={filters.role}
                  onChange={(e) => {
                    setFilters({ ...filters, role: e.target.value });
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className="w-full pl-10 pr-8 py-2.5 input-field appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                  }}
                >
                  <option value="all">{t("allRoles")}</option>
                  <option value="Student">{t("students")}</option>
                  <option value="Landlord">{t("landlords")}</option>
                  <option value="Admin">{t("admins")}</option>
                  <option value="SuperAdmin">{t("superAdmins")}</option>
                </select>
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 btn-primary rounded-lg whitespace-nowrap"
              >
                {t("search")}
              </button>
            </div>
          </form>

          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-[var(--color-text-soft)]">
              {t("showingUsers").replace("{count}", users.length).replace("{total}", pagination.total)}
            </p>
          </div>

          {users.length === 0 ? (
            <div className="text-center py-12 text-[var(--color-text-soft)]">
                <UsersIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>{t("noUsersFound")}</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full" dir="ltr">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        {t("user")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        {t("email")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        {t("role")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        {t("status")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        Moderation
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        {t("joined")}
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {u.profile_picture_url || u.avatar_url ? (
                              <img
                                src={u.profile_picture_url || u.avatar_url}
                                alt={`${u.first_name} ${u.last_name}`}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center">
                                <span className="text-[var(--color-accent)] font-semibold">
                                  {u.first_name?.[0]}{u.last_name?.[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <p className="font-medium text-[var(--color-text)]">
                                {u.first_name} {u.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-soft)]">
                          {u.email}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {u.is_verified ? (
                            <div className="flex items-center gap-1 text-green-500">
                              <CheckBadgeIcon className="w-5 h-5" />
                              <span className="text-xs">{t("verified")}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-gray-500">
                              <XCircleIcon className="w-5 h-5" />
                              <span className="text-xs">{t("notVerified")}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            {!u.is_active ? (
                              <div className="flex items-center gap-1 text-red-600">
                                <NoSymbolIcon className="w-4 h-4" />
                                <span className="text-xs font-semibold">BANNED</span>
                              </div>
                            ) : u.is_messaging_suspended ? (
                              <div className="flex items-center gap-1 text-orange-600">
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                <span className="text-xs font-semibold">SUSPENDED</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckBadgeIcon className="w-4 h-4" />
                                <span className="text-xs">Active</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-soft)] text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {!u.is_active ? (
                              <button
                                onClick={() => openActionModal("unban", u.id, `${u.first_name} ${u.last_name}`)}
                                disabled={processingUser === u.id}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                {t("unban") || "Unban"}
                              </button>
                            ) : (
                              <>
                                {u.is_messaging_suspended ? (
                                  <button
                                    onClick={() => openActionModal("unsuspend", u.id, `${u.first_name} ${u.last_name}`)}
                                    disabled={processingUser === u.id}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {t("unsuspend") || "Unsuspend"}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => openActionModal("suspend", u.id, `${u.first_name} ${u.last_name}`)}
                                    disabled={processingUser === u.id || ["Admin", "SuperAdmin"].includes(u.role)}
                                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    {t("suspend") || "Suspend"}
                                  </button>
                                )}
                                <button
                                  onClick={() => openActionModal("ban", u.id, `${u.first_name} ${u.last_name}`)}
                                  disabled={processingUser === u.id || ["Admin", "SuperAdmin"].includes(u.role)}
                                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  {t("ban") || "Ban"}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 rounded-lg border themed-border text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-surface)] transition"
                  >
                    {t("previous")}
                  </button>
                  <div className="flex items-center gap-1">
                    {[...Array(pagination.totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        page === 1 ||
                        page === pagination.totalPages ||
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-lg ${
                              page === pagination.page
                                ? "bg-[var(--color-accent)] text-white"
                                : "border themed-border text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                            } transition`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === pagination.page - 2 ||
                        page === pagination.page + 2
                      ) {
                        return <span key={page} className="px-2">...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border themed-border text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-surface)] transition"
                  >
                    {t("next")}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Action Confirmation Modal */}
      {actionModal.isOpen && (
        <Alert
          isOpen={actionModal.isOpen}
          onClose={closeActionModal}
          title={getActionModalContent().title}
          message={getActionModalContent().message}
          confirmText={getActionModalContent().confirmText}
          cancelText={t("cancel") || "Cancel"}
          onConfirm={handleConfirmAction}
          type={getActionModalContent().alertType}
        />
      )}

      {/* Result Alert */}
      {resultAlert.isOpen && (
        <Alert
          isOpen={resultAlert.isOpen}
          onClose={() => setResultAlert({ isOpen: false, type: "", message: "" })}
          title={resultAlert.type === "success" ? (t("success") || "Success") : (t("error") || "Error")}
          message={resultAlert.message}
          confirmText={t("ok") || "OK"}
          type={resultAlert.type === "success" ? "success" : "danger"}
        />
      )}
    </div>
  );
};

export default AdminUsers;
