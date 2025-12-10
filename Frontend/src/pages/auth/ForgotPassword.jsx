import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import PageLoader from "../components/PageLoader";
import apiRequest from "../../services/api";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await apiRequest("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setStep(2);
    } catch (err) {
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Just move to next step - we'll verify the code when resetting password
    setStep(3);
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      await apiRequest("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword }),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/signin");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep(1);
    setCode("");
    setError("");
  };

  return (
    <PageLoader loading={loading} overlay message={loading ? "Processing..." : ""}>
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
          <p className="text-center text-[var(--color-text-soft)] mb-8 text-base leading-relaxed">
            {step === 1 && (t("forgotPasswordInstructions") || "Enter your email address and we'll send you a code to reset your password.")}
            {step === 2 && "Enter the 6-digit code we sent to your email."}
            {step === 3 && "Enter your new password."}
          </p>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center mb-10">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition-all ${step === stepNum
                    ? "bg-[var(--color-accent)] text-white scale-110 shadow-lg"
                    : step > stepNum
                      ? "bg-green-500 text-white"
                      : "bg-[var(--color-surface)] text-[var(--color-text-soft)] border-2 border-[var(--color-border)]"
                    }`}
                >
                  {step > stepNum ? "✓" : stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-12 sm:w-16 h-1 mx-1 rounded-full transition-all ${step > stepNum
                      ? "bg-green-500"
                      : "bg-[var(--color-border)]"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-base animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}

          {success ? (
            <div className="space-y-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-5 text-green-600 dark:text-green-400 text-base text-center">
                <div className="font-semibold mb-2">✓ Password Reset Successfully!</div>
                <div className="text-sm">
                  Redirecting you to sign in...
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Email Entry */}
              {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-6">
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
                    {loading ? "Sending..." : t("sendResetCode") || "Send Reset Code"}
                  </button>
                </form>
              )}

              {/* Step 2: Code Verification */}
              {step === 2 && (
                <form onSubmit={handleVerifyCode} className="space-y-6">
                  <div className="text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 mb-4">
                    <p className="text-sm text-[var(--color-text-soft)] mb-1">
                      We sent a 6-digit code to
                    </p>
                    <p className="font-semibold text-[var(--color-text)]">
                      {email}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block text-center">
                      Verification Code
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setCode(value);
                        }}
                        maxLength={6}
                        required
                        disabled={loading}
                        className="input-field text-base w-full py-4 text-center text-3xl font-mono tracking-[0.5em] transition-all duration-300 focus:scale-[1.01] bg-[var(--color-surface)] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] hover:underline font-medium w-full text-center"
                  >
                    ← Change email address
                  </button>

                  <button
                    type="submit"
                    disabled={loading || code.length !== 6}
                    className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Continue
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        disabled={loading}
                        className="input-field text-base w-full py-4 pr-12 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)] hover:text-[var(--color-text)] transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        disabled={loading}
                        className="input-field text-base w-full py-4 pr-12 transition-all duration-300 focus:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)] hover:text-[var(--color-text)] transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="w-5 h-5" />
                        ) : (
                          <EyeIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    )}
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </form>
              )}
            </>
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
