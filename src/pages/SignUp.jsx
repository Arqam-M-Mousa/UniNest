import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { authAPI } from "../services/api";
import Alert from "../components/Alert";

const SignUp = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordAgain: "",
    firstName: "",
    lastName: "",
    role: "Student",
    phoneNumber: "",
    studentId: "",
    universityId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.passwordAgain) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    try {
      // Prepare signup data
      const signupData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
      };

      // Add optional fields for students
      if (formData.role === "Student") {
        if (formData.studentId) signupData.studentId = formData.studentId;
        if (formData.universityId)
          signupData.universityId = formData.universityId;
      }

      console.log("Signing up with data:", signupData);
      const response = await authAPI.signup(signupData);

      if (response.success) {
        console.log("Signup successful:", response.data);
        // Show success message and redirect to signin
        setShowSuccessAlert(true);
      } else {
        setError(response.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError(err.message || "An error occurred during signup");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 themed-surface relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

      <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-3xl p-8 max-w-[600px] w-full shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-sm relative z-10">
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
          {t("signUp")}
        </h1>
        <p className="text-center text-[var(--color-text-soft)] mb-8 text-sm">
          {t("createYourAccount") || "Create your account to get started"}
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 text-red-600 rounded-lg border border-red-500/30 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
              <input
                type="text"
                name="firstName"
                placeholder={t("firstName")}
                value={formData.firstName}
                onChange={handleChange}
                required
                className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
              />
            </div>

            <div className="relative group">
              <input
                type="text"
                name="lastName"
                placeholder={t("lastName")}
                value={formData.lastName}
                onChange={handleChange}
                required
                className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
              />
            </div>
          </div>

          <div className="relative group">
            <input
              type="email"
              name="email"
              placeholder={t("email")}
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
            />
          </div>

          <div className="relative group">
            <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
              {t("phoneNumber")}{" "}
              <span className="text-red-500/60">(Optional)</span>
            </label>
            <input
              type="tel"
              name="phoneNumber"
              placeholder={t("phoneNumber")}
              value={formData.phoneNumber}
              onChange={handleChange}
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
            />
          </div>

          <div className="relative group">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02] cursor-pointer"
            >
              <option value="Student">{t("student")}</option>
              <option value="Landlord">{t("landlord")}</option>
            </select>
          </div>

          {formData.role === "Student" && (
            <>
              <div className="relative group">
                <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                  {t("studentId")}{" "}
                  <span className="text-red-500/60">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="studentId"
                  placeholder={t("studentId")}
                  value={formData.studentId}
                  onChange={handleChange}
                  className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
                />
              </div>

              <div className="relative group">
                <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                  {t("selectUniversity")}{" "}
                  <span className="text-red-500/60">(Optional)</span>
                </label>
                <select
                  name="universityId"
                  value={formData.universityId}
                  onChange={handleChange}
                  className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02] cursor-pointer"
                >
                  <option value="">{t("selectUniversity")}</option>
                  <option value="univ-1">Harvard University</option>
                  <option value="univ-2">Stanford University</option>
                  <option value="univ-3">MIT</option>
                  <option value="univ-4">Oxford University</option>
                  <option value="univ-5">Cambridge University</option>
                </select>
              </div>
            </>
          )}

          <div className="relative group">
            <input
              type="password"
              name="password"
              placeholder={t("password")}
              value={formData.password}
              onChange={handleChange}
              required
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
            />
          </div>

          <div className="relative group">
            <input
              type="password"
              name="passwordAgain"
              placeholder={t("passwordAgain")}
              value={formData.passwordAgain}
              onChange={handleChange}
              required
              className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : t("signUp")}
          </button>
        </form>

        <div className="text-center mt-8 pt-6 border-t border-[var(--color-accent)]/10">
          <p className="text-[var(--color-text-soft)] text-sm m-0">
            {t("haveAccount")}{" "}
            <Link
              to="/signin"
              className="font-semibold text-[var(--color-accent)] hover:underline transition-all"
            >
              {t("logIn")}
            </Link>
          </p>
        </div>
      </div>

      {/* Success Alert */}
      <Alert
        isOpen={showSuccessAlert}
        onClose={() => {
          setShowSuccessAlert(false);
          navigate("/signin");
        }}
        title="Account Created!"
        message="Your account has been created successfully. Please sign in to continue."
        type="success"
        confirmText="Sign In Now"
        onConfirm={() => navigate("/signin")}
      />
    </div>
  );
};

export default SignUp;
