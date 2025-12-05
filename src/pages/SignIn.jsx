import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";

const SignIn = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { signin, error, loading, clearError } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    const result = await signin(formData.email, formData.password);

    if (result.success) {
      navigate("/marketplace");
    } else {
      setLocalError(result.error || "Failed to sign in");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (localError) setLocalError("");
    if (error) clearError();
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 themed-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

      <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-3xl p-8 max-w-[500px] w-full shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-sm relative z-10">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--color-accent)] blur-xl opacity-30 rounded-full" />
            <svg
              width="80"
              height="80"
              viewBox="0 0 99 99"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg relative"
            >
              <circle cx="49.5" cy="49.5" r="49.5" fill="#60B5EF" />
              <path
                d="M49.5 25C41.768 25 35.5 31.268 35.5 39C35.5 46.732 41.768 53 49.5 53C57.232 53 63.5 46.732 63.5 39C63.5 31.268 57.232 25 49.5 25ZM49.5 59C38.402 59 27.5 63.451 27.5 68V73H71.5V68C71.5 63.451 60.598 59 49.5 59Z"
                fill="white"
              />
            </svg>
          </div>
        </div>

        <h1 className="heading-font text-center text-4xl mb-2 font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent">
          {t("signIn")}
        </h1>
        <p className="text-center text-[var(--color-text-soft)] mb-8 text-sm">
          {t("welcomeBack")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {(localError || error) && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-600 dark:text-red-400 text-sm">
              {localError || error}
            </div>
          )}

          <div className="relative group">
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              required
              disabled={loading}
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
              disabled={loading}
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-4 py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t("signing In") || "Signing In..." : t("signIn")}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-[var(--color-accent)]/10">
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--color-accent)] hover:underline transition-all block mb-4"
          >
            {t("forgotPassword")}
          </Link>
          <p className="text-[var(--color-text-soft)] text-sm m-0">
            {t("noAccount")}{" "}
            <Link
              to="/signup"
              className="font-semibold text-[var(--color-accent)] hover:underline transition-all"
            >
              {t("createOne")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
