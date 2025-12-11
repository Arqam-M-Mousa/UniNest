import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { adminAPI } from "../../services/api";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";
import {
    UserCircleIcon,
    PlusIcon,
    TrashIcon,
    ShieldCheckIcon,
} from "@heroicons/react/24/outline";

const AdminManagement = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [admins, setAdmins] = useState([]);
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [activeAdmin, setActiveAdmin] = useState(null);
    const [formData, setFormData] = useState({
        email: "",
        firstName: "",
        lastName: "",
        role: "Admin",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Check if user is superadmin
        if (!user || user.role?.toLowerCase() !== "superadmin") {
            navigate("/");
            return;
        }
        fetchAdmins();
    }, [user, navigate]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const response = await adminAPI.listAdmins();
            setAdmins(response?.data || []);
        } catch (err) {
            console.error("Failed to fetch admins:", err);
            setError("Failed to load admin users");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
            setError("All fields are required");
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                role: formData.role,
            };

            const response = await adminAPI.createAdmin(payload);

            if (response.success) {
                setSuccess("Admin user created successfully!");
                resetForm();
                setShowFormModal(false);
                fetchAdmins();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            setError(err.message || "Failed to create admin user");
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            email: "",
            firstName: "",
            lastName: "",
            role: "Admin",
        });
        setActiveAdmin(null);
        setError("");
    };

    const handleCancel = () => {
        resetForm();
        setShowFormModal(false);
        setShowDeleteConfirm(false);
    };

    const handleDeleteClick = (admin) => {
        setActiveAdmin(admin);
        setShowDeleteConfirm(true);
    };

    const handleAddClick = () => {
        resetForm();
        setShowFormModal(true);
    };

    const handleDelete = async () => {
        if (!activeAdmin) return;
        setSubmitting(true);
        setError("");
        setSuccess("");
        try {
            const response = await adminAPI.deleteAdmin(activeAdmin.id);
            if (response.success) {
                setSuccess("Admin user deleted successfully!");
                resetForm();
                setShowDeleteConfirm(false);
                fetchAdmins();
                setTimeout(() => setSuccess(""), 3000);
            }
        } catch (err) {
            setError(err.message || "Failed to delete admin user");
        } finally {
            setSubmitting(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        if (role === "SuperAdmin") {
            return "bg-red-500/20 text-red-600 border-red-500/30";
        }
        return "bg-purple-500/20 text-purple-600 border-purple-500/30";
    };

    return (
        <PageLoader sessionKey="admin_management_visited" loading={loading} message={t("loading")}>
            <div className="min-h-screen themed-surface py-12 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-[var(--color-text)] flex items-center gap-3">
                                <ShieldCheckIcon className="w-12 h-12 text-[var(--color-accent)]" />
                                {t("adminManagement") || "Admin Management"}
                            </h1>
                            <p className="text-[var(--color-text-soft)] mt-2 text-lg">
                                {t("manageAdminUsers") || "Manage admin users and permissions"}
                            </p>
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="flex items-center gap-2 px-6 py-3 rounded-lg btn-primary text-sm hover:scale-105 transition-transform"
                        >
                            <PlusIcon className="w-5 h-5" />
                            {t("createAdmin") || "Create Admin"}
                        </button>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 p-4 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg border border-green-500/30">
                            {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && !showFormModal && (
                        <div className="mb-6 p-4 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg border border-red-500/30">
                            {error}
                        </div>
                    )}

                    {/* Admins List */}
                    <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
                        <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
                            {t("adminUsers") || "Admin Users"} ({admins.length})
                        </h2>

                        {admins.length === 0 ? (
                            <div className="text-center py-12 text-[var(--color-text-soft)]">
                                <UserCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>{t("noAdminsFound") || "No admin users found"}</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full" dir="ltr">
                                    <thead>
                                        <tr className="border-b border-[var(--color-border)]">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                                {t("name") || "Name"}
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                                {t("email")}
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                                {t("role")}
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                                {t("createdAt") || "Created"}
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                                                {t("actions") || "Actions"}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.map((admin) => (
                                            <tr
                                                key={admin.id}
                                                className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition"
                                            >
                                                <td className="py-3 px-4 text-[var(--color-text)]">
                                                    {admin.firstName} {admin.lastName}
                                                </td>
                                                <td className="py-3 px-4 text-[var(--color-text-soft)]">
                                                    {admin.email}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(admin.role)}`}>
                                                        {admin.role === "SuperAdmin" ? (t("superadmin") || "SuperAdmin") : (t("admin") || "Admin")}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-[var(--color-text-soft)]">
                                                    {new Date(admin.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <button
                                                        onClick={() => handleDeleteClick(admin)}
                                                        disabled={admin.id === user?.id}
                                                        className="p-2 rounded-md text-red-600 hover:bg-red-500/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title={admin.id === user?.id ? "Cannot delete yourself" : "Delete admin"}
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Create Admin Modal */}
                {showFormModal && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
                        role="dialog"
                        aria-modal="true"
                        onClick={handleCancel}
                    >
                        <div
                            className="w-full max-w-lg rounded-2xl themed-surface p-7 shadow-2xl border themed-border"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-[var(--color-text)]">
                                        {t("createAdmin") || "Create Admin"}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-soft)] mt-1">
                                        {t("fillAdminDetails") || "Fill in the admin user details"}
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                            {t("firstName")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full input-field"
                                            value={formData.firstName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, firstName: e.target.value })
                                            }
                                            placeholder="John"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                            {t("lastName")} <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full input-field"
                                            value={formData.lastName}
                                            onChange={(e) =>
                                                setFormData({ ...formData, lastName: e.target.value })
                                            }
                                            placeholder="Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                        {t("email")} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full input-field"
                                        value={formData.email}
                                        onChange={(e) =>
                                            setFormData({ ...formData, email: e.target.value })
                                        }
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>

                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                                    <p className="text-sm text-[var(--color-text)]">
                                        ℹ️ {t("passwordWillBeEmailed") || "A secure password will be generated and sent to the admin's email"}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                                        {t("role")} <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        className="w-full input-field"
                                        value={formData.role}
                                        onChange={(e) =>
                                            setFormData({ ...formData, role: e.target.value })
                                        }
                                        required
                                    >
                                        <option value="Admin">{t("admin") || "Admin"}</option>
                                        <option value="SuperAdmin">{t("superadmin") || "SuperAdmin"}</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="flex-1 px-4 py-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition"
                                    >
                                        {t("cancel")}
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-5 py-2 rounded-md btn-primary disabled:opacity-60"
                                    >
                                        {submitting ? (t("creating") || "Creating...") : (t("create") || "Create")}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <Alert
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    title={t("deleteAdmin") || "Delete Admin"}
                    message={t("deleteAdminMessage") || `Are you sure you want to delete ${activeAdmin?.firstName} ${activeAdmin?.lastName}? This action cannot be undone.`}
                    confirmText={t("delete")}
                    cancelText={t("cancel")}
                    type="warning"
                    iconOverride={
                        <svg
                            className="w-8 h-8 animate-pulse"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    }
                    onConfirm={handleDelete}
                />
            </div>
        </PageLoader>
    );
};

export default AdminManagement;
