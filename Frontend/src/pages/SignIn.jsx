import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";

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
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 themed-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

      <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-3xl p-8 sm:p-10 max-w-[500px] w-full shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-sm relative z-10">
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-[var(--color-accent)] blur-2xl opacity-20 rounded-full" />
            <UserCircleIcon className="w-20 h-20 text-[var(--color-accent)] drop-shadow-lg relative" />
          </div>
        </div>

        <h1 className="heading-font text-center text-3xl sm:text-4xl mb-3 font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent leading-tight pb-1">
          {t("signIn")}
        </h1>
        <p className="text-center text-[var(--color-text-soft)] mb-8 text-sm">
          {t("welcomeBack") || "Welcome back! Sign in to continue"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
              className="input-field text-base w-full py-3.5 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="input-field text-base w-full py-3.5 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-2 py-4 text-base font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading
              ? t("signingIn") || "Signing In..."
              : t("signIn") || "Sign In"}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-[var(--color-accent)]/10">
          <Link
            to="/forgot-password"
            className="text-sm text-[var(--color-accent)] hover:underline transition-all block mb-4 font-medium"
          >
            {t("forgotPassword") || "Forgot your password?"}
          </Link>
          <p className="text-[var(--color-text-soft)] text-sm m-0">
            {t("noAccount") || "You don't have an account?"}{" "}
            <Link
              to="/signup"
              className="font-semibold text-[var(--color-accent)] hover:underline transition-all"
            >
              {t("createOne") || "Create one"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
