import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
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

    const formData = new FormData();
    formData.append("profilePicture", file);

    setUploading(true);
    setErrors((prev) => ({ ...prev, profilePicture: "" }));

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/uploads/profile-picture",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to upload image");
      }

      if (result.success) {
        setProfilePictureUrl(result.data.url);
        // Update the user context immediately
        updateUser({ profilePictureUrl: result.data.url });
        // Refresh the profile to get updated data
        if (onProfileUpdate) {
          await onProfileUpdate();
        }
        // Show success feedback
        alert("Profile picture uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.message || "Failed to upload image",
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    if (!profilePictureUrl) return;

    if (!confirm("Are you sure you want to delete your profile picture?")) {
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:8080/api/uploads/profile-picture",
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete image");
      }

      if (result.success) {
        setProfilePictureUrl("");
        // Update the user context immediately
        updateUser({ profilePictureUrl: null });
        // Refresh the profile to get updated data
        if (onProfileUpdate) {
          await onProfileUpdate();
        }
        alert("Profile picture deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setErrors((prev) => ({
        ...prev,
        profilePicture: error.message || "Failed to delete image",
      }));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
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
              {profilePictureUrl ? (
                <CloudinaryImage
                  src={profilePictureUrl}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-4 border-[var(--color-accent)]/30 shadow-lg"
                />
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
                      {profilePictureUrl ? "Change Picture" : "Upload Picture"}
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

              {profilePictureUrl && (
                <button
                  type="button"
                  onClick={handleDeleteProfilePicture}
                  disabled={uploading}
                  className="px-6 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Picture
                </button>
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

        {/* Name Section */}
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
              className={`w-full px-4 py-3 themed-surface border rounded-lg outline-none transition focus:border-[var(--color-accent)] ${
                errors.firstName
                  ? "border-red-500/50"
                  : "border-[var(--color-accent)]/20"
              } text-[var(--color-text)]`}
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
              className={`w-full px-4 py-3 themed-surface border rounded-lg outline-none transition focus:border-[var(--color-accent)] ${
                errors.lastName
                  ? "border-red-500/50"
                  : "border-[var(--color-accent)]/20"
              } text-[var(--color-text)]`}
              placeholder={t("enterLastName")}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
            )}
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
              className={`w-full px-4 py-3 themed-surface border rounded-lg outline-none transition focus:border-[var(--color-accent)] ${
                errors.phoneNumber
                  ? "border-red-500/50"
                  : "border-[var(--color-accent)]/20"
              } text-[var(--color-text)]`}
              placeholder={t("phonePlaceholder")}
            />
            {errors.phoneNumber && (
              <p className="text-xs text-red-500 mt-1">{errors.phoneNumber}</p>
            )}
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-[var(--color-accent)]/5 rounded-lg p-4 border border-[var(--color-accent)]/10">
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[var(--color-accent)]" />
            {t("personalInformation")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-4 py-3 themed-surface border border-[var(--color-accent)]/20 rounded-lg outline-none transition focus:border-[var(--color-accent)] text-[var(--color-text)]"
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
                className="w-full px-4 py-3 themed-surface border border-[var(--color-accent)]/20 rounded-lg outline-none transition focus:border-[var(--color-accent)] text-[var(--color-text)]"
              >
                <option value="en">{t("languageEnglish")}</option>
                <option value="ar">{t("languageArabic")}</option>
              </select>
            </div>
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
                className="w-full px-4 py-3 themed-surface border border-[var(--color-accent)]/20 rounded-lg outline-none transition focus:border-[var(--color-accent)] text-[var(--color-text)]"
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
    </div>
  );
};

export default EditProfileForm;
