import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { universitiesAPI } from "../services/api";
import PageLoader from "../components/PageLoader";
import Alert from "../components/Alert";
import {
  AcademicCapIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

const Admin = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [mode, setMode] = useState("create"); // create | edit
  const [activeUniversity, setActiveUniversity] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    domain: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role?.toLowerCase() !== "admin") {
      navigate("/");
      return;
    }
    fetchUniversities();
  }, [user, navigate]);

  const fetchUniversities = async () => {
    try {
      setLoading(true);
      const response = await universitiesAPI.list();
      setUniversities(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch universities:", err);
      setError("Failed to load universities");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("University name is required");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        city: formData.city.trim() || null,
        domain: formData.domain.trim() || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const response =
        mode === "edit" && activeUniversity
          ? await universitiesAPI.update(activeUniversity.id, payload)
          : await universitiesAPI.create(payload);

      if (response.success) {
        setSuccess(
          mode === "edit"
            ? "University updated successfully!"
            : "University added successfully!"
        );
        resetForm();
        setShowFormModal(false);
        fetchUniversities();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(
        err.message ||
          (mode === "edit"
            ? "Failed to update university"
            : "Failed to add university")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      city: "",
      domain: "",
      latitude: "",
      longitude: "",
    });
    setActiveUniversity(null);
    setMode("create");
    setError("");
  };

  const handleCancel = () => {
    resetForm();
    setShowFormModal(false);
    setShowDeleteConfirm(false);
  };

  const handleEditClick = (uni) => {
    setActiveUniversity(uni);
    setMode("edit");
    setFormData({
      name: uni.name || "",
      city: uni.city || "",
      domain: uni.domain || "",
      latitude: uni.latitude ?? "",
      longitude: uni.longitude ?? "",
    });
    setShowFormModal(true);
  };

  const handleAddClick = () => {
    resetForm();
    setMode("create");
    setShowFormModal(true);
  };

  const handleDelete = async () => {
    if (!activeUniversity) return;
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const response = await universitiesAPI.remove(activeUniversity.id);
      if (response.success) {
        setSuccess("University deleted successfully!");
        resetForm();
        setShowFormModal(false);
        setShowDeleteConfirm(false);
        fetchUniversities();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to delete university");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLoader loading={loading} message="Loading universities...">
      <div className="min-h-screen themed-surface py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-[var(--color-text)] flex items-center gap-3">
                <AcademicCapIcon className="w-12 h-12 text-[var(--color-accent)]" />
                Universities Management
              </h1>
              <p className="text-[var(--color-text-soft)] mt-2 text-lg">
                Manage university information and locations
              </p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-6 py-3 rounded-lg btn-primary text-sm hover:scale-105 transition-transform"
            >
              <PlusIcon className="w-5 h-5" />
              {t("Add University") || "Add University"}
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg border border-green-500/30">
              {success}
            </div>
          )}

          {/* Error Message */}
          {error && !showAddModal && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          {/* Universities List */}
          <div className="themed-surface-alt border border-[var(--color-border)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">
              {t("Universities") || "Universities"} ({universities.length})
            </h2>
            <div className="mb-4 text-sm text-[var(--color-text-soft)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3">
              Tip: click any university row to open edit/delete actions.
            </div>

            {universities.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-soft)]">
                <AcademicCapIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>No universities found. Add one to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        City
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        Domain
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        Latitude
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-[var(--color-text)]">
                        Longitude
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {universities.map((uni) => (
                      <tr
                        key={uni.id}
                        className="border-b border-[var(--color-border)] hover:bg-[var(--color-surface)] transition cursor-pointer"
                        onClick={() => handleEditClick(uni)}
                      >
                        <td className="py-3 px-4 text-[var(--color-text)]">
                          {uni.name}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-soft)]">
                          {uni.city || "—"}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-soft)]">
                          {uni.domain || "—"}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-soft)]">
                          {uni.latitude || "—"}
                        </td>
                        <td className="py-3 px-4 text-[var(--color-text-soft)]">
                          {uni.longitude || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add University Modal */}
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
                    {mode === "edit"
                      ? t("Edit University") || "Edit University"
                      : t("Add University") || "Add University"}
                  </h3>
                  <p className="text-xs text-[var(--color-text-soft)] mt-1">
                    {mode === "edit"
                      ? "Update the details below"
                      : "Fill in the details below"}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-300 px-3 py-2 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                    {t("University name") || "University name"}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full input-field"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g. Harvard University"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                    {t("City") || "City"}
                  </label>
                  <input
                    type="text"
                    className="w-full input-field"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="e.g. Cambridge, MA"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                    {t("Domain") || "Domain"}
                  </label>
                  <input
                    type="text"
                    className="w-full input-field"
                    value={formData.domain}
                    onChange={(e) =>
                      setFormData({ ...formData, domain: e.target.value })
                    }
                    placeholder="e.g. harvard.edu"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                      {t("Latitude") || "Latitude"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full input-field"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData({ ...formData, latitude: e.target.value })
                      }
                      placeholder="e.g. 42.3744"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-1 block">
                      {t("Longitude") || "Longitude"}
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="w-full input-field"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData({ ...formData, longitude: e.target.value })
                      }
                      placeholder="e.g. -71.1169"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-6 items-center justify-between">
                  {mode === "edit" && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={submitting}
                      className="px-4 py-2 rounded-md border border-red-500 text-red-500 hover:bg-red-500/10 transition disabled:opacity-60"
                    >
                      <div className="flex items-center gap-2 justify-center">
                        <TrashIcon className="w-4 h-4" />
                        <span>{t("Delete") || "Delete"}</span>
                      </div>
                    </button>
                  )}

                  <div className="flex gap-3 ml-auto">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 rounded-md border themed-border themed-text-soft hover:bg-[var(--color-surface-alt)] transition"
                    >
                      {t("cancel") || "Cancel"}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-md btn-primary disabled:opacity-60"
                    >
                      {submitting
                        ? mode === "edit"
                          ? t("Saving...") || "Saving..."
                          : t("Adding...") || "Adding..."
                        : mode === "edit"
                        ? t("Save") || "Save"
                        : t("Add") || "Add"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        <Alert
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete university"
          message="This action cannot be undone. Are you sure you want to delete this university?"
          confirmText="Delete"
          cancelText="Cancel"
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

export default Admin;
