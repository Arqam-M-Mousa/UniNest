import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "../../context/LanguageContext";
import {
  UserCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  LanguageIcon,
  AcademicCapIcon,
  BuildingLibraryIcon,
  StarIcon,
  IdentificationIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import CloudinaryImage from "../CloudinaryImage";

const ProfileView = ({ profile, onEdit, onDelete }) => {
  const { t } = useLanguage();
  const getInitials = () => {
    return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Student":
        return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "Landlord":
        return "bg-green-500/20 text-green-600 border-green-500/30";
      case "Admin":
        return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  // Use profilePictureUrl first, then fall back to avatarUrl
  const displayImage = profile.profilePictureUrl || profile.avatarUrl;

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
                {profile.role === "Student"
                  ? t("student")
                  : profile.role === "Landlord"
                  ? t("landlord")
                  : t("admin")}
              </span>
              {profile.isVerified && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-600 border border-green-500/30">
                  ✓ {t("verified")}
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition font-medium"
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
                  {profile.gender || t("notSpecified")}
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

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent my-8" />

        {/* Danger Zone */}
        <div className="p-4 bg-red-500/5 border border-red-500/30 rounded-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <TrashIcon className="w-5 h-5" />
                {t("deleteAccount") || "Delete account"}
              </h3>
              <p className="text-sm text-red-600/80">
                {t("deleteAccountWarning") ||
                  "Permanently deletes your account and all data. This action cannot be undone."}
              </p>
            </div>
            <button
              onClick={onDelete}
              className="px-4 py-2 border border-red-500 text-red-600 bg-white/60 rounded-lg hover:bg-red-500/10 transition font-medium flex items-center gap-2 self-start sm:self-auto"
            >
              <TrashIcon className="w-4 h-4" />
              {t("delete") || "Delete"}
            </button>
          </div>
        </div>

        {/* Account Metadata */}
        <div className="text-xs text-[var(--color-text)]/50">
          <p>
            {t("accountCreated")}{" "}
            {formatDistanceToNow(new Date(profile.createdAt), {
              addSuffix: true,
            })}
          </p>
          <p>
            {t("lastUpdated")}{" "}
            {formatDistanceToNow(new Date(profile.updatedAt), {
              addSuffix: true,
            })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
