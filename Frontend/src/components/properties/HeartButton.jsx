import { useState, useEffect } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { favoritesAPI } from "../../services/api";
import Alert from "../common/Alert";

export default function HeartButton({
  size = 40,
  propertyId,
  listingId,
  initialActive = false,
  onToggle,
  className = "",
}) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Check if this property is in favorites on mount
  useEffect(() => {
    const checkFavorite = async () => {
      if (!isAuthenticated || !listingId) return;
      try {
        const response = await favoritesAPI.check(listingId);
        setActive(response?.data?.isFavorite || false);
      } catch (err) {
        console.error("Failed to check favorite status:", err);
      }
    };
    checkFavorite();
  }, [isAuthenticated, listingId]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }

    if (!listingId || loading) return;

    setLoading(true);
    try {
      if (active) {
        await favoritesAPI.remove(listingId);
        setActive(false);
        onToggle && onToggle(false);
      } else {
        await favoritesAPI.add(listingId);
        setActive(true);
        onToggle && onToggle(true);
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    setShowAuthAlert(false);
    navigate("/signin");
  };

  return (
    <>
      <button
        type="button"
        aria-pressed={active}
        aria-label={active ? "Remove from favorites" : "Add to favorites"}
        onClick={toggle}
        disabled={loading}
        className={`group relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:scale-110 ${loading ? "opacity-50 cursor-wait" : ""} ${className}`}
        style={{ width: size, height: size }}
      >
        {active ? (
          <HeartSolid
            className="transition-all duration-300 drop-shadow-md"
            style={{ width: size * 0.6, height: size * 0.6 }}
            fill="#e0245e"
          />
        ) : (
          <HeartOutline
            className="transition-all duration-300 drop-shadow-md"
            style={{ width: size * 0.6, height: size * 0.6 }}
            stroke="white"
            strokeWidth="2"
          />
        )}
        <span className="absolute inset-0 rounded-full bg-black/30 group-hover:bg-black/50 transition-colors duration-300 -z-10" />
      </button>

      <Alert
        isOpen={showAuthAlert}
        onClose={() => setShowAuthAlert(false)}
        title={t("signInRequired")}
        message={t("pleaseSignInToAddFavorite") || "Please sign in to add properties to your favorites list."}
        confirmText={t("signIn")}
        cancelText={t("cancel")}
        onConfirm={handleSignIn}
        type="warning"
      />
    </>
  );
}
