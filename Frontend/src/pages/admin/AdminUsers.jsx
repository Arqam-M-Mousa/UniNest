import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { adminAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import {
  UsersIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckBadgeIcon,
  XCircleIcon,
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
                        {t("joined")}
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
                        <td className="py-3 px-4 text-[var(--color-text-soft)] text-sm">
                          {new Date(u.created_at).toLocaleDateString()}
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
    </div>
  );
};

export default AdminUsers;
