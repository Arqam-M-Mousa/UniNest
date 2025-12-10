import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import PageLoader from "../components/PageLoader";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <PageLoader loading={loading} overlay message="Sending reset link...">
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4 themed-surface relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

        <div className="w-full max-w-[520px] themed-surface-alt p-10 sm:p-12 rounded-3xl shadow-2xl border border-[var(--color-accent)]/20 backdrop-blur-sm relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent)] blur-2xl opacity-20 rounded-full" />
              <UserCircleIcon className="w-24 h-24 text-[var(--color-accent)] drop-shadow-lg relative" />
            </div>
          </div>

          <h1 className="heading-font text-4xl sm:text-5xl font-bold mb-4 text-[var(--color-text)] text-center bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent leading-tight pb-1">
            {t("forgotPassword")}
          </h1>
          <p className="text-center text-[var(--color-text-soft)] mb-10 text-base leading-relaxed">
            {t("forgotPasswordInstructions") || "Enter your email address and we'll send you a link to reset your password."}
          </p>

          {submitted ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-green-600 dark:text-green-400 text-base text-center">
                <div className="font-semibold mb-2">✓ Email Sent!</div>
                <div className="text-sm">
                  {t("resetLinkSent") || "Check your inbox for password reset instructions."}
                </div>
              </div>
              <Link
                to="/signin"
                className="btn-outline w-full py-4 text-center block"
              >
                {t("backToSignIn") || "Back to Sign In"}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative group">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("email") || "Email"}
                  disabled={loading}
                  className="input-field text-base w-full py-4 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {loading ? "Sending..." : t("sendResetLink") || "Send Reset Link"}
              </button>
            </form>
          )}

          <div className="text-center mt-10 pt-8 border-t border-[var(--color-border)]">
            <p className="text-[var(--color-text-soft)] text-base m-0">
              {t("rememberPassword") || "Remember your password?"}{" "}
              <Link
                to="/signin"
                className="font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] hover:underline transition-all"
              >
                {t("signIn") || "Sign In"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PageLoader>
  );
};

export default ForgotPassword;
