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
    <div className="min-h-[50vh] flex items-center justify-center py-16 px-4 themed-surface">
      <div className="w-full max-w-md themed-surface-alt p-8 rounded-2xl shadow-card">
        <h1 className="heading-font text-3xl font-bold mb-6 text-[var(--color-text)]">
          {t("forgotPassword")}
        </h1>
        {submitted ? (
          <p className="text-[var(--color-text-soft)] text-sm">
            If this email exists, a reset link was sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("email")}
              className="input-field"
            />
            <button type="submit" className="btn-primary w-full">
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
