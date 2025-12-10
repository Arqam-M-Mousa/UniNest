import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import ProfileView from "../../components/profile/ProfileView";
import EditProfileForm from "../../components/profile/EditProfileForm";
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
            <ProfileView
              profile={profile}
              onEdit={() => setIsEditing(true)}
              onDelete={() => setShowDeleteConfirm(true)}
            />
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
