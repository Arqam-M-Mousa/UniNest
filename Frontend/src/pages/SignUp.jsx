import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { authAPI, universitiesAPI } from "../services/api";
import Alert from "../components/Alert";
import {
  UserCircleIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import PageLoader from "../components/PageLoader";

const SignUp = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEmailVerifiedBanner, setShowEmailVerifiedBanner] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: verify code, 3: complete signup
  const [verificationCode, setVerificationCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordAgain, setShowPasswordAgain] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordAgain: "",
    firstName: "",
    lastName: "",
    gender: "",
    role: "Student",
    phoneNumber: "",
    studentId: "",
    universityId: "",
  });

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.email) {
      setError("Please enter your email");
      return;
    }

    setSendingCode(true);

    try {
      const response = await authAPI.sendVerificationCode(formData.email);

      if (response.success) {
        setStep(2);
        setError(null);
      } else {
        setError(response.message || "Failed to send verification code");
      }
    } catch (err) {
      console.error("Send code error:", err);
      setError(err.message || "Failed to send verification code");
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(null);

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setVerifyingCode(true);

    try {
      const response = await authAPI.verifyCode(
        formData.email,
        verificationCode
      );

      if (response.success) {
        setStep(3);
        setError(null);
        setShowEmailVerifiedBanner(true);
      } else {
        setError(response.message || "Invalid verification code");
      }
    } catch (err) {
      console.error("Verify code error:", err);
      setError(err.message || "Invalid verification code");
    } finally {
      setVerifyingCode(false);
    }
  };

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

    // Validate student-specific required fields
    if (formData.role === "Student") {
      if (!formData.studentId || !formData.studentId.trim()) {
        setError("Student ID is required for students");
        return;
      }
      if (!formData.universityId) {
        setError("University selection is required for students");
        return;
      }
    }

    // Validate landlord-specific required fields
    if (formData.role === "Landlord") {
      if (!formData.phoneNumber || !formData.phoneNumber.trim()) {
        setError("Phone number is required for landlords");
        return;
      }
    }

    if (!formData.gender) {
      setError("Please select your gender");
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
        gender: formData.gender,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
        verificationCode: verificationCode,
      };

      // Add required fields for students
      if (formData.role === "Student") {
        signupData.studentId = formData.studentId;
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

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setUniversitiesLoading(true);
        const response = await universitiesAPI.list();
        setUniversities(response?.data || []);
      } catch (err) {
        console.error("Failed to fetch universities:", err);
      } finally {
        setUniversitiesLoading(false);
      }
    };

    fetchUniversities();
  }, []);

  const pageLoading = loading || sendingCode || verifyingCode;
  const loaderMessage = sendingCode
    ? "Sending verification code..."
    : verifyingCode
    ? "Verifying code..."
    : t("creatingAccount") || "Creating Account...";

  // Auto-dismiss success modal after 3 seconds and go to signin
  useEffect(() => {
    if (!showSuccessAlert) return;
    const id = setTimeout(() => {
      setShowSuccessAlert(false);
      navigate("/signin");
    }, 3000);
    return () => clearTimeout(id);
  }, [showSuccessAlert, navigate]);

  // Auto-hide the email verified banner after 3 seconds
  useEffect(() => {
    if (!showEmailVerifiedBanner) return;
    const id = setTimeout(() => setShowEmailVerifiedBanner(false), 3000);
    return () => clearTimeout(id);
  }, [showEmailVerifiedBanner]);

  return (
    <PageLoader
      loading={pageLoading}
      overlay
      message={loaderMessage}
      minHeight="min-h-[calc(100vh-200px)]"
    >
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 themed-surface relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

        <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-3xl p-8 sm:p-10 max-w-[600px] w-full shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-sm relative z-10">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent)] blur-2xl opacity-20 rounded-full" />
              <UserCircleIcon className="w-20 h-20 text-[var(--color-accent)] drop-shadow-lg relative" />
            </div>
          </div>

          <h1 className="heading-font text-center text-3xl sm:text-4xl mb-3 font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent leading-tight pb-1">
            {t("signUp")}
          </h1>
          <p className="text-center text-[var(--color-text-soft)] mb-8 text-sm">
            {t("createYourAccount") || "Create your account to get started"}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}

          {/* Step 1: Email Entry */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="flex flex-col gap-5">
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder={t("email") || "Email"}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field text-base w-full py-3.5 transition-all duration-300 focus:scale-[1.01]"
                />
              </div>

              <button
                type="submit"
                disabled={sendingCode}
                className="btn-primary mt-2 py-4 text-base font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {sendingCode && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {sendingCode ? "Sending Code..." : "Send Verification Code"}
              </button>
            </form>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
              <p className="text-center text-[var(--color-text-soft)] text-sm">
                We sent a 6-digit code to{" "}
                <strong className="text-[var(--color-text)]">
                  {formData.email}
                </strong>
              </p>

              <div className="relative group">
                <input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                  }}
                  maxLength={6}
                  required
                  className="input-field text-base w-full py-3.5 text-center text-2xl font-mono tracking-[0.5em] transition-all duration-300 focus:scale-[1.01]"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-[var(--color-accent)] hover:underline font-medium self-start"
              >
                ← Change email
              </button>

              <button
                type="submit"
                disabled={verifyingCode}
                className="btn-primary mt-2 py-4 text-base font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {verifyingCode && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {verifyingCode ? "Verifying..." : "Verify Code"}
              </button>
            </form>
          )}

          {/* Step 3: Complete Signup */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {showEmailVerifiedBanner && (
                <div className="mb-2 p-3 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl border border-green-500/30 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                  ✓ Email verified! Complete your profile below.
                </div>
              )}

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

                <div className="relative group">
                  <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                    {t("gender")}
                    <span className="text-red-500"> *</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02] cursor-pointer"
                  >
                    <option value="">{t("selectGender") || "Select"}</option>
                    <option value="Male">{t("genderMale") || "Male"}</option>
                    <option value="Female">
                      {t("genderFemale") || "Female"}
                    </option>
                  </select>
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                  {t("phoneNumber")}{" "}
                  {formData.role === "Landlord" ? (
                    <span className="text-red-500">*</span>
                  ) : (
                    <span className="text-red-500/60">(Optional)</span>
                  )}
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder={t("phoneNumber")}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required={formData.role === "Landlord"}
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
                      {t("studentId")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      placeholder={t("studentId")}
                      value={formData.studentId}
                      onChange={handleChange}
                      required
                      className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="relative group">
                    <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                      {t("selectUniversity")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="universityId"
                      value={formData.universityId}
                      onChange={handleChange}
                      disabled={universitiesLoading}
                      required
                      className="input-field text-base w-full transition-all duration-300 focus:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {universitiesLoading
                          ? "Loading universities..."
                          : t("selectUniversity")}
                      </option>
                      {universities.map((uni) => (
                        <option key={uni.id} value={uni.id}>
                          {uni.name}
                          {uni.city ? ` — ${uni.city}` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder={t("password")}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field text-base w-full pr-12 transition-all duration-300 focus:scale-[1.02]"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)] hover:text-[var(--color-text)] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative group">
                <input
                  type={showPasswordAgain ? "text" : "password"}
                  name="passwordAgain"
                  placeholder={t("passwordAgain")}
                  value={formData.passwordAgain}
                  onChange={handleChange}
                  required
                  className="input-field text-base w-full pr-12 transition-all duration-300 focus:scale-[1.02]"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordAgain(!showPasswordAgain)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-soft)] hover:text-[var(--color-text)] transition-colors"
                  tabIndex={-1}
                >
                  {showPasswordAgain ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-6 py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                )}
                {loading
                  ? t("creatingAccount") || "Creating Account..."
                  : t("signUp")}
              </button>
            </form>
          )}

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
    </PageLoader>
  );
};

export default SignUp;
