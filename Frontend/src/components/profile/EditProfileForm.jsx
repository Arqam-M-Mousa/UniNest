import { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { uploadsAPI } from "../../services/api";
import Alert from "../Alert";
import {
  UserCircleIcon,
  PhotoIcon,
  PhoneIcon,
  UserIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import CloudinaryImage from "../CloudinaryImage";

const EditProfileForm = ({ profile, onSave, onCancel, onProfileUpdate }) => {
  const { t } = useLanguage();
  const { updateUser } = useAuth();
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber || "",
    gender: profile.gender || "",
    preferredLanguage: profile.preferredLanguage || "en",
    studentId: profile.studentId || "",
    avatarUrl: profile.avatarUrl || "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(
    profile.profilePictureUrl || ""
  );
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("firstNameRequired");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("lastNameRequired");
    }
    if (
      formData.phoneNumber &&
      !/^[0-9\-\+\s\(\)]+$/.test(formData.phoneNumber)
    ) {
      newErrors.phoneNumber = t("invalidPhone");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset any pending deletion if user picks a new file
    setPendingDelete(false);

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "File size must be less than 5MB",
      }));
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        profilePicture: "Only image files are allowed",
      }));
      return;
    }

    // Clear any previous errors
    setErrors((prev) => ({ ...prev, profilePicture: "" }));

    // Store the file for later upload
    setSelectedFile(file);

    // Create a local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDeleteProfilePicture = async () => {
    // If there's a pending file, just clear it and the preview
    if (selectedFile || previewUrl) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setPendingDelete(false);
      return;
    }

    // If there's an existing profile picture, mark it for deletion
    if (profilePictureUrl) {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteProfilePicture = () => {
    setProfilePictureUrl("");
    setPendingDelete(true);
    setShowDeleteConfirm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    let nextProfilePictureUrl =
      profilePictureUrl || profile.profilePictureUrl || "";

    try {
      // Perform deletion only when Save is clicked and a delete was queued
      if (pendingDelete && profile.profilePictureUrl) {
        setUploading(true);
        try {
          const result = await uploadsAPI.deleteProfilePicture();
          if (!result?.success) {
            throw new Error(result?.message || "Failed to delete image");
          }
          nextProfilePictureUrl = "";
        } catch (error) {
          console.error("Delete error:", error);
          setErrors((prev) => ({
            ...prev,
            profilePicture: error.message || "Failed to delete image",
          }));
          return;
        } finally {
          setUploading(false);
          setPendingDelete(false);
        }
      }

      // Upload only when Save is clicked and a file is queued
      if (selectedFile) {
        setUploading(true);
        try {
          const result = await uploadsAPI.uploadProfilePicture(selectedFile);
          if (!result?.success || !result?.data?.url) {
            throw new Error(result?.message || "Failed to upload image");
          }

          nextProfilePictureUrl = result.data.url;
          setProfilePictureUrl(nextProfilePictureUrl);

          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }
          setPreviewUrl(null);
          setSelectedFile(null);
        } catch (error) {
          console.error("Upload error:", error);
          setErrors((prev) => ({
            ...prev,
            profilePicture: error.message || "Failed to upload image",
          }));
          return;
        } finally {
          setUploading(false);
        }
      }

      // Save profile data along with the latest image URL snapshot
      await onSave({ ...formData, profilePictureUrl: nextProfilePictureUrl });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-2xl p-8">
      <h2 className="text-2xl font-bold text-[var(--color-text)] mb-8">
        {t("editProfile")}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Picture Upload Section */}
        <div className="bg-gradient-to-br from-[var(--color-accent)]/10 to-[var(--color-accent)]/5 rounded-2xl p-6 border border-[var(--color-accent)]/20">
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <PhotoIcon className="w-5 h-5 text-[var(--color-accent)]" />
            {t("profilePicture") || "Profile Picture"}
          </h3>

          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Picture Preview */}
            <div className="relative">
              {previewUrl || profilePictureUrl ? (
                previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Profile preview"
                    className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-accent)]/30 shadow-lg"
                  />
                ) : (
                  <CloudinaryImage
                    src={profilePictureUrl}
                    alt="Profile"
                    width={128}
                    height={128}
                    className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-accent)]/30 shadow-lg"
                  />
                )
              ) : (
                <div className="w-32 h-32 rounded-full bg-[var(--color-accent)]/20 border-4 border-[var(--color-accent)]/30 flex items-center justify-center">
                  <UserCircleIcon className="w-20 h-20 text-[var(--color-accent)]/40" />
                </div>
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
              {selectedFile && !uploading && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                  Pending
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1 space-y-3">
              <div>
                <label
                  htmlFor="profilePictureInput"
                  className={`inline-block px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition font-medium cursor-pointer ${
                    uploading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {uploading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Uploading...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <PhotoIcon className="w-5 h-5" />
                      {previewUrl || profilePictureUrl
                        ? "Change Picture"
                        : "Upload Picture"}
                    </span>
                  )}
                </label>
                <input
                  id="profilePictureInput"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </div>

              {(previewUrl || profilePictureUrl) && (
                <button
                  type="button"
                  onClick={handleDeleteProfilePicture}
                  disabled={uploading}
                  className="px-6 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedFile ? "Cancel" : "Delete Picture"}
                </button>
              )}

              {selectedFile && (
                <p className="text-sm text-yellow-600 dark:text-yellow-400">
                  ⚠️ Picture will be uploaded when you click "Save Changes"
                </p>
              )}

              {pendingDelete && !selectedFile && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  ⚠️ Picture will be removed when you click "Save Changes"
                </p>
              )}

              <p className="text-xs text-[var(--color-text)]/60">
                Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
              </p>

              {errors.profilePicture && (
                <p className="text-sm text-red-500">{errors.profilePicture}</p>
              )}
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-[var(--color-accent)]/5 rounded-lg p-4 border border-[var(--color-accent)]/10">
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[var(--color-accent)]" />
            {t("personalInformation")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-[var(--color-text)] mb-2"
              >
                {t("firstName")} <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full input-field ${
                  errors.firstName ? "border-red-500/60" : ""
                }`}
                placeholder={t("enterFirstName")}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-[var(--color-text)] mb-2"
              >
                {t("lastName")} <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full input-field ${
                  errors.lastName ? "border-red-500/60" : ""
                }`}
                placeholder={t("enterLastName")}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Gender */}
            <div>
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-[var(--color-text)] mb-2"
              >
                {t("gender")}
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full input-field"
              >
                <option value="">{t("selectGender")}</option>
                <option value="Male">{t("genderMale")}</option>
                <option value="Female">{t("genderFemale")}</option>
              </select>
            </div>

            {/* Preferred Language */}
            <div>
              <label
                htmlFor="preferredLanguage"
                className="block text-sm font-medium text-[var(--color-text)] mb-2"
              >
                {t("preferredLanguageLabel")}
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                value={formData.preferredLanguage}
                onChange={handleChange}
                className="w-full input-field"
              >
                <option value="en">{t("languageEnglish")}</option>
                <option value="ar">{t("languageArabic")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-[var(--color-accent)]/5 rounded-lg p-4 border border-[var(--color-accent)]/10">
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <PhoneIcon className="w-5 h-5 text-[var(--color-accent)]" />
            {t("contactInformation")}
          </h3>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-[var(--color-text)] mb-2"
            >
              {t("phoneNumber")}
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`w-full input-field ${
                errors.phoneNumber ? "border-red-500/60" : ""
              }`}
              placeholder={t("phonePlaceholder")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Student Information - Only for Students */}
        {profile.role === "Student" && (
          <div className="bg-[var(--color-accent)]/5 rounded-lg p-4 border border-[var(--color-accent)]/10">
            <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <AcademicCapIcon className="w-5 h-5 text-[var(--color-accent)]" />
              {t("studentInformation")}
            </h3>

            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-medium text-[var(--color-text)] mb-2"
              >
                {t("studentIdLabel")}
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full input-field"
                placeholder={t("studentIdPlaceholder")}
              />
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 border-t border-[var(--color-accent)]/20">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-6 py-3 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {`${t("saveChanges")}...`}
              </>
            ) : (
              t("saveChanges")
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-[var(--color-accent)]/10 text-[var(--color-accent)] rounded-lg hover:bg-[var(--color-accent)]/20 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("cancel")}
          </button>
        </div>
      </form>

      <Alert
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete profile picture"
        message="This will remove your current picture. The change only applies after you click Save Changes."
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
        onConfirm={confirmDeleteProfilePicture}
      />
    </div>
  );
};

export default EditProfileForm;
