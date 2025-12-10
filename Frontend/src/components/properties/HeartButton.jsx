import { useState } from "react";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import Alert from "./Alert";

export default function HeartButton({
  size = 40,
  initialActive = false,
  onToggle,
  className = "",
}) {
  const [active, setActive] = useState(initialActive);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const toggle = (e) => {
    e.preventDefault(); // prevent parent Link navigation when inside cards
    e.stopPropagation(); // prevent event bubbling

    // Check authentication
    if (!isAuthenticated) {
      setShowAuthAlert(true);
      return;
    }

    const next = !active;
    setActive(next);
    onToggle && onToggle(next);
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
        className={`group relative flex items-center justify-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] hover:scale-110 ${className}`}
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
