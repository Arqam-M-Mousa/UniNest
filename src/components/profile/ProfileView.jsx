import { formatDistanceToNow } from "date-fns";

const ProfileView = ({ profile, onEdit }) => {
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

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-2xl p-8">
        {/* Avatar and Basic Info */}
        <div className="flex gap-8 mb-8 flex-col sm:flex-row items-start sm:items-center">
          {/* Avatar */}
          <div className="relative">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={`${profile.firstName} ${profile.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-[var(--color-accent)]/30"
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
                {profile.role}
              </span>
              {profile.isVerified && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-600 border border-green-500/30">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>

          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition font-medium"
          >
            Edit Profile
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent mb-8" />

        {/* Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span className="text-[var(--color-accent)]">📞</span> Contact
              Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text)]/60">Email</p>
                <p className="text-[var(--color-text)] font-medium">
                  {profile.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]/60">
                  Phone Number
                </p>
                <p className="text-[var(--color-text)] font-medium">
                  {profile.phoneNumber || "Not provided"}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span>👤</span> Personal Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text)]/60">Gender</p>
                <p className="text-[var(--color-text)] font-medium">
                  {profile.gender || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]/60">
                  Preferred Language
                </p>
                <p className="text-[var(--color-text)] font-medium">
                  {profile.preferredLanguage === "en" ? "English" : "Français"}
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div>
            <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
              <span>🎓</span> Student Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text)]/60">
                  Student ID
                </p>
                <p className="text-[var(--color-text)] font-medium">
                  {profile.studentId || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text)]/60">
                  University
                </p>
                <p className="text-[var(--color-text)] font-medium">
                  {profile.universityId || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* Rating Information */}
          {profile.role === "Landlord" && (
            <div>
              <h3 className="text-lg font-semibold text-[var(--color-text)] mb-4 flex items-center gap-2">
                <span>⭐</span> Ratings
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-[var(--color-text)]/60">
                    Average Rating
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-[var(--color-accent)]">
                      {profile.averageRating
                        ? profile.averageRating.toFixed(1)
                        : "N/A"}
                    </p>
                    <span className="text-sm text-[var(--color-text)]/60">
                      / 5.0
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text)]/60">
                    Total Reviews
                  </p>
                  <p className="text-lg font-semibold text-[var(--color-text)]">
                    {profile.totalReviewsCount}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-[var(--color-accent)]/20 to-transparent my-8" />

        {/* Account Metadata */}
        <div className="text-xs text-[var(--color-text)]/50">
          <p>
            Account created{" "}
            {formatDistanceToNow(new Date(profile.createdAt), {
              addSuffix: true,
            })}
          </p>
          <p>
            Last updated{" "}
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
