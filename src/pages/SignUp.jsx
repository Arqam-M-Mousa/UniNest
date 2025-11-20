import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const SignUp = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordAgain: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordAgain) {
      alert("Passwords do not match!");
      return;
    }
    navigate("/marketplace");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 themed-surface">
      <div className="themed-surface-alt border-[3px] border-[var(--color-accent)] rounded-[30px] p-10 max-w-[500px] w-full shadow-lg shadow-black/10 dark:shadow-black/30">
        <div className="flex justify-center mb-6 -mt-14">
          <svg
            width="99"
            height="99"
            viewBox="0 0 99 99"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-lg"
          >
            <circle cx="49.5" cy="49.5" r="49.5" fill="#60B5EF" />
            <path
              d="M49.5 25C41.768 25 35.5 31.268 35.5 39C35.5 46.732 41.768 53 49.5 53C57.232 53 63.5 46.732 63.5 39C63.5 31.268 57.232 25 49.5 25ZM49.5 59C38.402 59 27.5 63.451 27.5 68V73H71.5V68C71.5 63.451 60.598 59 49.5 59Z"
              fill="white"
            />
          </svg>
        </div>

        <h1 className="heading-font text-center text-5xl mb-12 font-bold text-[var(--color-text)]">
          {t("signUp")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-10">
          <div className="relative">
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full py-3 border-none text-2xl bg-transparent text-[var(--color-text)] text-center focus:outline-none placeholder:text-[var(--color-text-soft)] placeholder:text-2xl border-b border-[var(--color-border)] focus:border-b-2 focus:border-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full py-3 border-none text-2xl bg-transparent text-[var(--color-text)] text-center focus:outline-none placeholder:text-[var(--color-text-soft)] placeholder:text-2xl border-b border-[var(--color-border)] focus:border-b-2 focus:border-[var(--color-accent)] transition-all"
            />
          </div>

          <div className="relative">
            <input
              type="password"
              name="passwordAgain"
              placeholder={t("passwordAgain")}
              value={formData.passwordAgain}
              onChange={handleChange}
              required
              className="w-full py-3 border-none text-2xl bg-transparent text-[var(--color-text)] text-center focus:outline-none placeholder:text-[var(--color-text-soft)] placeholder:text-2xl border-b border-[var(--color-border)] focus:border-b-2 focus:border-[var(--color-accent)] transition-all"
            />
          </div>

          <button type="submit" className="btn-primary mt-4">
            {t("signUp")}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-[var(--color-text-soft)] text-sm m-0">
            {t("haveAccount")}{" "}
            <Link
              to="/signin"
              className="underline font-semibold text-[var(--color-text)] hover:text-[var(--color-accent)]"
            >
              {t("logIn")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
