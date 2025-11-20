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
    <div className="min-h-[50vh] flex items-center justify-center py-16 px-4 bg-white dark:bg-slate-900">
      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl shadow-card">
        <h1 className="text-3xl font-bold mb-6 text-slate-800 dark:text-slate-100">
          {t("forgotPassword")}
        </h1>
        {submitted ? (
          <p className="text-gray-600 dark:text-slate-300 text-sm">
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
              className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="w-full bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:hover:bg-primary text-white font-semibold py-3 rounded-lg transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
