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

/**
 * Check if email matches student pattern: s{5+ digits}@domain
 */
const isStudentEmail = (email) => {
  if (!email?.includes("@")) return false;
  return /^s\d{5,}@[\w.-]+$/i.test(email.trim());
};

const SignUp = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showEmailVerifiedBanner, setShowEmailVerifiedBanner] = useState(false);
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
    phoneNumber: "",
  });

  // Derived role - locked based on email pattern from step 1
  const isStudent = isStudentEmail(formData.email);
  const role = isStudent ? "Student" : "Landlord";

  // Extract student ID and university from email
  const getStudentDetails = () => {
    if (!isStudent) return { studentId: "", universityId: "" };

    const match = formData.email.trim().toLowerCase().match(/^s(\d{5,})@([\w.-]+)$/);
    if (!match) return { studentId: "", universityId: "" };

    const studentId = match[1];
    const domain = match[2].replace(/^www\./, "");
    const domainRoot = domain.split(".").slice(-2).join(".");

    const matchedUni = universities.find((uni) => {
      if (!uni.domain) return false;
      const uniDomain = uni.domain.toLowerCase().replace(/^www\./, "");
      const uniRoot = uniDomain.split(".").slice(-2).join(".");
      return domainRoot === uniRoot || domain.endsWith(uniDomain);
    });

    return { studentId, universityId: matchedUni?.id || "" };
  };

  const { studentId, universityId } = getStudentDetails();

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

  const handleChangeEmail = () => {
    setStep(1);
    setVerificationCode("");
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
    if (role === "Student") {
      if (!studentId) {
        setError("Use your university student email (e.g., s123456@stu.najah.edu).");
        return;
      }
      if (!universityId) {
        setError("We could not match your email domain to a university. Please use your official university email.");
        return;
      }
    }

    // Validate landlord-specific required fields
    if (role === "Landlord" && !formData.phoneNumber?.trim()) {
      setError("Phone number is required for landlords");
      return;
    }

    if (!formData.gender) {
      setError("Please select your gender");
      return;
    }

    setLoading(true);

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        role,
        phoneNumber: formData.phoneNumber,
        verificationCode,
        ...(role === "Student" && { studentId, universityId }),
      };
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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-4 themed-surface relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-accent)]/5 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

        <div className="themed-surface-alt border border-[var(--color-accent)]/20 rounded-3xl p-10 sm:p-12 max-w-[640px] w-full shadow-2xl shadow-black/5 dark:shadow-black/40 backdrop-blur-sm relative z-10">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-accent)] blur-2xl opacity-20 rounded-full" />
              <UserCircleIcon className="w-24 h-24 text-[var(--color-accent)] drop-shadow-lg relative" />
            </div>
          </div>

          <h1 className="heading-font text-center text-4xl sm:text-5xl mb-4 font-bold bg-gradient-to-r from-[var(--color-text)] to-[var(--color-accent)] bg-clip-text text-transparent leading-tight pb-1">
            {t("signUp")}
          </h1>
          <p className="text-center text-[var(--color-text-soft)] mb-8 text-base">
            {t("createYourAccount") || "Create your account to get started"}
          </p>

          {/* Step Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mb-10">
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
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 dark:text-red-400 text-sm animate-in fade-in slide-in-from-top-2 duration-200">
              {error}
            </div>
          )}

          {/* Step 1: Email Entry */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="flex flex-col gap-6">
              <div>
                <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    name="email"
                    placeholder={t("email") || "your.email@university.edu"}
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="input-field text-base w-full py-4 transition-all duration-300 focus:scale-[1.01]"
                  />
                </div>
                <p className="text-xs text-[var(--color-text-soft)] mt-2">
                  Use your university email (s123456@...) for student account
                </p>
              </div>

              <button
                type="submit"
                disabled={sendingCode}
                className="btn-primary mt-2 py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-6">
              <div className="text-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4">
                <p className="text-sm text-[var(--color-text-soft)] mb-1">
                  We sent a 6-digit code to
                </p>
                <p className="font-semibold text-[var(--color-text)]">
                  {formData.email}
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
                    value={verificationCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setVerificationCode(value);
                    }}
                    maxLength={6}
                    required
                    className="input-field text-base w-full py-4 text-center text-3xl font-mono tracking-[0.5em] transition-all duration-300 focus:scale-[1.01] bg-[var(--color-surface)]"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleChangeEmail}
                className="text-sm text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] hover:underline font-medium self-center"
              >
                ← Change email address
              </button>

              <button
                type="submit"
                disabled={verifyingCode}
                className="btn-primary mt-2 py-4 text-lg font-semibold shadow-lg shadow-[var(--color-accent)]/20 hover:shadow-xl hover:shadow-[var(--color-accent)]/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
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
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {showEmailVerifiedBanner && (
                <div className="p-4 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl border border-green-500/30 text-base text-center font-medium animate-in fade-in slide-in-from-top-2 duration-200">
                  ✓ Email verified! Complete your profile below.
                </div>
              )}

              {/* Personal Information Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--color-text)] border-b border-[var(--color-border)] pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="relative group">
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder={t("firstName")}
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="input-field text-base w-full py-3 transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="relative group">
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder={t("lastName")}
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="input-field text-base w-full py-3 transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>

                  <div className="relative group">
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      {t("gender")} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className="input-field text-base w-full py-3 transition-all duration-300 focus:scale-[1.02] cursor-pointer"
                    >
                      <option value="">{t("selectGender") || "Select"}</option>
                      <option value="Male">{t("genderMale") || "Male"}</option>
                      <option value="Female">
                        {t("genderFemale") || "Female"}
                      </option>
                    </select>
                  </div>

                  <div className="relative group">
                    <label className="text-sm font-medium text-[var(--color-text)] mb-2 block">
                      {t("phoneNumber")}{" "}
                      {role === "Landlord" ? (
                        <span className="text-red-500">*</span>
                      ) : (
                        <span className="text-[var(--color-text-soft)]">(Optional)</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder={t("phoneNumber")}
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required={role === "Landlord"}
                      className="input-field text-base w-full py-3 transition-all duration-300 focus:scale-[1.02]"
                    />
                  </div>
                </div>
              </div>

              <div className="relative group">
                <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                  {t("role") || "Role"}
                </label>
                <div className="input-field text-base w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed pointer-events-none">
                  {role === "Student" ? t("student") : t("landlord")}
                </div>
                <p className="text-[11px] text-[var(--color-text-soft)] mt-1">
                  {role === "Student"
                    ? "Role locked to Student based on your university email."
                    : "Role set to Landlord based on your email type."}
                </p>
              </div>

              {role === "Student" && (
                <>
                  <div className="relative group">
                    <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                      {t("studentId")} <span className="text-red-500">*</span>
                    </label>
                    <div className="input-field text-base w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed pointer-events-none">
                      {studentId || "Loading..."}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-soft)] mt-1">
                      Auto-filled from your verified student email.
                    </p>
                  </div>

                  <div className="relative group">
                    <label className="text-xs text-[var(--color-text-soft)] ml-1 mb-1 block">
                      {t("selectUniversity")}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="input-field text-base w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed pointer-events-none">
                      {universitiesLoading
                        ? "Loading..."
                        : universities.find((u) => u.id === universityId)?.name ||
                        t("selectUniversity")}
                    </div>
                    <p className="text-[11px] text-[var(--color-text-soft)] mt-1">
                      Auto-selected from your email domain.
                    </p>
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
          title={t("accountCreatedTitle")}
          message={t("accountCreatedMessage")}
          type="success"
          confirmText={t("signInNow")}
          onConfirm={() => navigate("/signin")}
        />
      </div>
    </PageLoader>
  );
};

export default SignUp;
