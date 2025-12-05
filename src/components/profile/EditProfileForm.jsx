import { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

const EditProfileForm = ({ profile, onSave, onCancel }) => {
  const { t } = useLanguage();
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
            <span>📞</span> {t("contactInformation")}
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
            <span>👤</span> {t("personalInformation")}
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
                <option value="fr">{t("languageFrench")}</option>
                <option value="ar">{t("languageArabic")}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="bg-[var(--color-accent)]/5 rounded-lg p-4 border border-[var(--color-accent)]/10">
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span>🎓</span> {t("studentInformation")}
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

        {/* Avatar URL */}
        <div className="bg-[var(--color-accent)]/5 rounded-lg p-4 border border-[var(--color-accent)]/10">
          <h3 className="font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
            <span>🖼️</span> {t("profilePicture")}
          </h3>

          <div>
            <label
              htmlFor="avatarUrl"
              className="block text-sm font-medium text-[var(--color-text)] mb-2"
            >
              {t("avatarUrlLabel")}
            </label>
            <input
              id="avatarUrl"
              name="avatarUrl"
              type="url"
              value={formData.avatarUrl}
              onChange={handleChange}
              className="w-full px-4 py-3 themed-surface border border-[var(--color-accent)]/20 rounded-lg outline-none transition focus:border-[var(--color-accent)] text-[var(--color-text)] mb-3"
              placeholder={t("avatarUrlPlaceholder")}
            />
            {formData.avatarUrl && (
              <div className="mt-4">
                <p className="text-sm text-[var(--color-text)]/60 mb-2">
                  {t("preview")}
                </p>
                <img
                  src={formData.avatarUrl}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-lg object-cover border-2 border-[var(--color-accent)]/20"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/128?text=Invalid+Image";
                  }}
                />
              </div>
            )}
          </div>
        </div>

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
