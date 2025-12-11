import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useLanguage } from "../../context/LanguageContext";
import {
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  LanguageIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  StarIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import CloudinaryImage from "../media/CloudinaryImage";

const ProfileView = ({ profile, onEdit }) => {
  const { t, language } = useLanguage();

  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Student":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "Landlord":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "Admin":
        return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "SuperAdmin":
        return "bg-red-500/20 text-red-600 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  // Helper to translate role
  const getTranslatedRole = (role) => {
    const roles = {
      Student: "student",
      Landlord: "landlord",
      Admin: "admin",
      SuperAdmin: "superadmin",
    };
    return t(roles[role] || role.toLowerCase());
  };

  // Helper to translate gender
  const getTranslatedGender = (gender) => {
    if (!gender) return t("notSpecified");
    if (gender === "Male") return t("genderMale");
    if (gender === "Female") return t("genderFemale");
    return gender;
  };

  // Use profilePictureUrl first, then fall back to avatarUrl
  const displayImage = profile.profilePictureUrl || profile.avatarUrl;

  const dateLocale = language === "ar" ? ar : enUS;

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-2xl p-8">
        {/* Avatar and Basic Info */}
        <div className="flex gap-8 mb-8 flex-col sm:flex-row items-start sm:items-center">
          {/* Avatar */}
          <div className="relative">
            {displayImage ? (
              <CloudinaryImage
                src={displayImage}
                alt={`${profile.firstName} ${profile.lastName}`}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-accent)]/30 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent)]/60 flex items-center justify-center text-white font-bold text-2xl border-4 border-[var(--color-accent)]/30">
                {getInitials()}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white" />
          </div>

          {/* Name and Role */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-[var(--color-text)]/60 mb-3">{profile.email}</p>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(
                  profile.role
                )}`}
              >
                {getTranslatedRole(profile.role)}
              </span>
              {profile.isVerified && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 shadow-sm">
                  ✓ {t("verified")}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="px-5 py-2 bg-[var(--color-accent)] text-white rounded-full shadow-md shadow-[var(--color-accent)]/20 hover:shadow-lg hover:shadow-[var(--color-accent)]/30 transition font-medium"
          >
            {t("editProfile")}
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent mb-8" />
        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <PhoneIcon className="w-5 h-5 text-[var(--color-accent)]" />
              {t("contactInformation")}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text)]/60 flex items-center gap-2">
                  <EnvelopeIcon className="w-4 h-4" />
                  {t("email")}
                </p>
                <p className="text-[var(--color-text)] font-medium ml-6">
                  {profile.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]/60 flex items-center gap-2">
                  <PhoneIcon className="w-4 h-4" />
                  {t("phoneNumber")}
                </p>
                <p className="text-[var(--color-text)] font-medium ml-6">
                  {profile.phoneNumber || t("notProvided")}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[var(--color-accent)]" />
              {t("personalInformation")}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text)]/60 flex items-center gap-2">
                  <IdentificationIcon className="w-4 h-4" />
                  {t("gender")}
                </p>
                <p className="text-[var(--color-text)] font-medium ml-6">
                  {getTranslatedGender(profile.gender)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]/60 flex items-center gap-2">
                  <LanguageIcon className="w-4 h-4" />
                  {t("preferredLanguageLabel")}
                </p>
                <p className="text-[var(--color-text)] font-medium ml-6">
                  {profile.preferredLanguage === "en"
                    ? t("languageEnglish")
                    : t("languageArabic")}
                </p>
              </div>
            </div>
          </div>

          {/* Student Information - Only for Students */}
          {profile.role === "Student" && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5 text-[var(--color-accent)]" />
                {t("studentInformation")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text)]/60 flex items-center gap-2">
                    <AcademicCapIcon className="w-4 h-4" />
                    {t("studentIdLabel")}
                  </p>
                  <p className="text-[var(--color-text)] font-medium ml-6">
                    {profile.studentId || t("notProvided")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text)]/60 flex items-center gap-2">
                    <BuildingLibraryIcon className="w-4 h-4" />
                    {t("university")}
                  </p>
                  <p className="text-[var(--color-text)] font-medium ml-6">
                    {profile.university?.name ||
                      profile.universityName ||
                      profile.universityId ||
                      t("notAssigned")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Rating Information */}
          {profile.role === "Landlord" && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-[var(--color-accent)]" />
                {t("ratings")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text)]/60">
                    {t("averageRating")}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-[var(--color-accent)]">
                      {profile.averageRating
                        ? profile.averageRating.toFixed(1)
                        : "0.0"}
                    </p>
                    <span className="text-sm text-[var(--color-text)]/60">
                      / 5.0
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text)]/60">
                    {t("totalReviews")}
                  </p>
                  <p className="text-lg font-semibold text-[var(--color-text)]">
                    {profile.totalReviewsCount || 0}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Metadata */}
        <div className="mt-6 text-xs text-[var(--color-text)]/50 space-y-1">
          <p>
            {t("accountCreated")}{" "}
            {formatDistanceToNow(new Date(profile.createdAt), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </p>
          <p>
            {t("lastUpdated")}{" "}
            {formatDistanceToNow(new Date(profile.updatedAt), {
              addSuffix: true,
              locale: dateLocale,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
