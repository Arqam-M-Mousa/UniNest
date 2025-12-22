import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import ProfileView from "../../components/profile/ProfileView";
import EditProfileForm from "../../components/profile/EditProfileForm";
import ChangePasswordSection from "../../components/profile/ChangePasswordSection";
import DangerZoneSection from "../../components/profile/DangerZoneSection";
import PageLoader from "../../components/common/PageLoader";
import Alert from "../../components/common/Alert";

const Profile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching profile...");
      const data = await userAPI.getProfile();
      console.log("Profile response:", data);
      setProfile(data.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
      setError(err.message || "Failed to load profile");
      if (
        err.message === "Missing Authorization header" ||
        err.message === "User not found"
      ) {
        navigate("/signin");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (updatedData) => {
    try {
      setError(null);
      const data = await userAPI.updateProfile(updatedData);
      setProfile(data.data);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      // Refresh profile to get updated image URL
      await fetchProfile();
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleDeleteAccount = async () => {
    try {
      setError(null);
      await userAPI.deleteProfile();
      handleLogout();
    } catch (err) {
      setError(err.message || "Failed to delete account");
    }
  };

  return (
    <PageLoader
      sessionKey="profile_visited"
      loading={loading}
      message={t("loadingProfile")}
    >
      <div className="min-h-[calc(100vh-200px)] themed-surface py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-start mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-text-soft)]/80 mb-1">
                {t("account") || "Account"}
              </p>
              <h1 className="text-3xl font-bold text-[var(--color-text)]">
                {t("profile")}
              </h1>
            </div>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-500/20 text-green-600 rounded-lg border border-green-500/30">
              {t("profileUpdated")}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 text-red-600 rounded-lg border border-red-500/30">
              {error}
            </div>
          )}

          {/* Content */}
          {!profile ? (
            <div className="text-center themed-surface-alt border border-[var(--color-accent)]/20 rounded-2xl p-12">
              <p className="text-[var(--color-text)] mb-4">
                {t("failedToLoadProfile") || "Failed to load profile"}
              </p>
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition"
              >
                {t("goHome")}
              </button>
            </div>
          ) : isEditing ? (
            <EditProfileForm
              profile={profile}
              onSave={handleSaveProfile}
              onCancel={() => setIsEditing(false)}
              onProfileUpdate={fetchProfile}
            />
          ) : (
            <>
              <ProfileView
                profile={profile}
                onEdit={() => setIsEditing(true)}
              />
              <div className="mt-6 space-y-6">
                {/* Verification Section for Landlords */}
                {profile.role === "Landlord" && (
                  <div className="themed-surface-alt border border-[var(--color-border)] rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                          {t("identityVerification") || "Identity Verification"}
                        </h3>
                        {profile.isIdentityVerified ? (
                          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{t("verified") || "Verified"}</span>
                          </div>
                        ) : profile.verificationStatus === "pending" ? (
                          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="font-medium">{t("pending") || "Pending Review"}</span>
                          </div>
                        ) : profile.verificationStatus === "rejected" ? (
                          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{t("rejected") || "Rejected"}</span>
                          </div>
                        ) : (
                          <p className="text-sm text-[var(--color-text-soft)]">
                            {t("getVerifiedDescription") || "Verify your identity to build trust with students and get the verified badge on your listings"}
                          </p>
                        )}
                      </div>
                      {!profile.isIdentityVerified && (
                        <button
                          onClick={() => navigate("/verification")}
                          className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition font-medium whitespace-nowrap"
                        >
                          {profile.verificationStatus === "rejected"
                            ? t("reapply") || "Reapply"
                            : profile.verificationStatus === "pending"
                              ? t("viewStatus") || "View Status"
                              : t("getVerified") || "Get Verified"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                <ChangePasswordSection />
                <DangerZoneSection onDelete={() => setShowDeleteConfirm(true)} />
              </div>
            </>
          )}
        </div>
      </div>

      <Alert
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title={t("deleteAccount")}
        message={t("deleteAccountWarning")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="warning"
        onConfirm={handleDeleteAccount}
      />
    </PageLoader>
  );
};

export default Profile;
