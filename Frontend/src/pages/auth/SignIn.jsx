import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import PageLoader from "../../components/common/PageLoader";

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
      navigate("/");
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
    <PageLoader
      loading={loading}
      overlay
      message={t("signingIn") || "Signing In..."}
      minHeight="min-h-[calc(100vh-200px)]"
    >
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4 themed-surface relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

        <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-3xl p-10 sm:p-12 max-w-[520px] w-full shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-sm relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent)] blur-2xl opacity-20 rounded-full" />
              <UserCircleIcon className="w-24 h-24 text-[var(--color-accent)] drop-shadow-lg relative" />
            </div>
          </div>

          <h1 className="heading-font text-center text-4xl sm:text-5xl mb-4 font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent leading-tight pb-1">
            {t("signIn")}
          </h1>
          <p className="text-center text-[var(--color-text-soft)] mb-10 text-base">
            {t("welcomeBack") || "Welcome back! Sign in to continue"}
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {(localError || error) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
                {localError || error}
              </div>
            )}

            <div className="relative group">
              <input
                type="email"
                name="email"
                placeholder={t("email") || "Email"}
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                disabled={loading}
                className="input-field text-base w-full py-4 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="relative group">
              <input
                type="password"
                name="password"
                placeholder={t("password") || "Password"}
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                disabled={loading}
                className="input-field text-base w-full py-4 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex justify-end -mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] hover:underline transition-all font-medium"
              >
                {t("forgotPassword") || "Forgot your password?"}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading
                ? t("signingIn") || "Signing In..."
                : t("signIn") || "Sign In"}
            </button>
          </form>

          <div className="text-center mt-10 pt-8 border-t border-[var(--color-border)]">
            <p className="text-[var(--color-text-soft)] text-base m-0">
              {t("noAccount") || "You don't have an account?"}{" "}
              <Link
                to="/signup"
                className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] hover:underline transition-all"
              >
                {t("createOne") || "Create one"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default SignIn;
