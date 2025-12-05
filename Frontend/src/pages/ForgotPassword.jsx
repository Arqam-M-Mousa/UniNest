import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const ForgotPassword = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 themed-bg-alt relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/6 via-transparent to-[var(--color-accent)]/12 pointer-events-none" />

      <div className="w-full max-w-md themed-surface-alt p-8 rounded-3xl shadow-2xl border border-[var(--color-accent)]/20 backdrop-blur-sm relative z-10">
        <h1 className="heading-font text-3xl font-bold mb-3 text-[var(--color-text)] text-center">
          {t("forgotPassword")}
        </h1>
        <p className="text-center text-[var(--color-text-soft)] mb-8 text-sm">
          {t("email")}
        </p>
        {submitted ? (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-green-600 dark:text-green-400 text-sm text-center">
            {t("resetLinkSent")}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email")}
              className="input-field text-base w-full"
            />
            <button
              type="submit"
              className="btn-primary w-full py-4 text-base font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300"
            >
              {t("sendResetLink")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
