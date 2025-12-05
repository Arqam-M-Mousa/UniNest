import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import ProfileView from "../../components/profile/ProfileView";
import EditProfileForm from "../../components/profile/EditProfileForm";

const Profile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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
    } catch (err) {
      setError(err.message || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/signin");
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center themed-surface">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text)]">{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center themed-surface">
        <div className="text-center">
          <p className="text-[var(--color-text)] mb-4">
            {t("failedToLoadProfile")}
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition"
          >
            {t("goHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] themed-surface py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-text)]">
            {t("profile")}
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition"
          >
            {t("logout")}
          </button>
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
        {isEditing ? (
          <EditProfileForm
            profile={profile}
            onSave={handleSaveProfile}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />
        )}
      </div>
    </div>
  );
};

export default Profile;
