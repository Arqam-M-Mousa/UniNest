const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, VerificationCode, University } = require("../models");
const {
  HTTP_STATUS,
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responses");
const { sendVerificationEmail, sendPasswordResetEmail } = require("./emailService");

const JWT_SECRET = process.env.JWT_SECRET;

const deriveStudentDetailsFromEmail = async (email) => {
  if (!email || !email.includes("@")) {
    return { studentId: null, universityId: null };
  }

  const [localPartRaw, domainPartRaw] = email.trim().toLowerCase().split("@");
  const localMatch = localPartRaw.match(/^s(\d{5,})$/);
  if (!localMatch) {
    return { studentId: null, universityId: null };
  }

  const studentId = localMatch[1];

  let universityId = null;
  if (domainPartRaw) {
    const cleanDomain = domainPartRaw.replace(/^www\./, "");
    const domainParts = cleanDomain.split(".");
    const emailRoot = domainParts.slice(-2).join(".");

    const universities = await University.findAll({
      attributes: ["id", "domain"],
    });

    const matchedUniversity = universities.find((uni) => {
      if (!uni.domain) return false;
      const uniDomain = uni.domain.toLowerCase().replace(/^www\./, "");
      const uniRoot = uniDomain.split(".").slice(-2).join(".");
      return emailRoot === uniRoot || cleanDomain.endsWith(uniDomain);
    });

    universityId = matchedUniversity ? matchedUniversity.id : null;
  }

  return { studentId, universityId };
};

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification code to email
 * POST /api/auth/send-verification-code
 */
const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendValidationError(res, ["Email is required"]);
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, "Email already registered", HTTP_STATUS.CONFLICT);
    }

    // Generate verification code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused codes for this email
    await VerificationCode.destroy({
      where: { email, isUsed: false },
    });

    // Create new verification code
    await VerificationCode.create({
      email,
      code,
      expiresAt,
    });

    // Send email
    try {
      await sendVerificationEmail(email, code);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // Continue anyway - code is saved in DB for development
    }

    return sendSuccess(res, { email }, "Verification code sent to your email");
  } catch (error) {
    console.error("Send verification code error:", error);
    return sendError(
      res,
      "Failed to send verification code",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

/**
 * Verify the code
 * POST /api/auth/verify-code
 */
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return sendValidationError(res, ["Email and code are required"]);
    }

    // Find the verification code
    const verification = await VerificationCode.findOne({
      where: {
        email,
        code,
        isUsed: false,
      },
    });

    if (!verification) {
      return sendError(
        res,
        "Invalid or expired verification code",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return sendError(
        res,
        "Verification code has expired",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Mark as used
    await verification.update({ isUsed: true });

    return sendSuccess(res, { email }, "Email verified successfully");
  } catch (error) {
    console.error("Verify code error:", error);
    return sendError(
      res,
      "Verification failed",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

/**
 * Sign up a new user (requires verified email)
 */
const signup = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      phoneNumber,
      avatarUrl,
      studentId,
      gender,
      preferredLanguage,
      universityId,
      verificationCode,
    } = req.body;

    if (!email || !password || !firstName || !lastName || !verificationCode) {
      return sendValidationError(res, ["Missing required fields"]);
    }

    // Verify the code one more time
    const verification = await VerificationCode.findOne({
      where: {
        email,
        code: verificationCode,
        isUsed: true, // Should be marked as used from verify-code endpoint
      },
    });

    if (!verification) {
      return sendError(
        res,
        "Please verify your email first",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if verification was used recently (within 30 minutes)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    if (verification.createdAt < thirtyMinutesAgo) {
      return sendError(
        res,
        "Verification code expired. Please request a new one.",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, "Email already registered", HTTP_STATUS.CONFLICT);
    }

    const derivedEmailDetails = await deriveStudentDetailsFromEmail(email);
    const isStudentEmail = !!derivedEmailDetails.studentId;
    const isStudentRole = role === "Student" || isStudentEmail;

    let finalStudentId = studentId || null;
    let finalUniversityId = universityId || null;
    let finalRole = role;

    if (isStudentRole) {
      const { studentId: derivedStudentId, universityId: derivedUniversityId } =
        derivedEmailDetails;

      if (!derivedStudentId) {
        return sendValidationError(res, [
          "Use your university student email (e.g., s123456@stu.najah.edu)",
        ]);
      }

      if (!derivedUniversityId) {
        return sendValidationError(res, [
          "We could not match your email domain to a university. Contact support if this is unexpected.",
        ]);
      }

      finalStudentId = derivedStudentId;
      finalUniversityId = derivedUniversityId;
      finalRole = "Student";
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role: finalRole,
      phoneNumber,
      avatarUrl,
      studentId: finalStudentId,
      gender,
      preferredLanguage,
      universityId: finalUniversityId,
      isVerified: true,
    });

    // Generate token for auto-login after signup
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      },
      "User registered successfully",
      HTTP_STATUS.CREATED
    );
  } catch (error) {
    return sendError(res, "Signup failed", HTTP_STATUS.SERVER_ERROR, error);
  }
};

/**
 * Sign in an existing user
 */
const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendValidationError(res, ["Email and password required"]);
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(
        res,
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return sendError(
        res,
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined!");
      return sendError(
        res,
        "Server configuration error",
        HTTP_STATUS.SERVER_ERROR
      );
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "1d",
    });

    return sendSuccess(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatarUrl,
          profilePictureUrl: user.profilePictureUrl,
          preferredLanguage: user.preferredLanguage,
        },
      },
      "Signed in"
    );
  } catch (error) {
    console.error("Signin error:", error);
    return sendError(res, "Signin failed", HTTP_STATUS.SERVER_ERROR, error);
  }
};

/**
 * Request password reset code
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendValidationError(res, ["Email is required"]);
    }

    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return sendSuccess(
        res,
        { email },
        "If this email is registered, you will receive a password reset code"
      );
    }

    // Generate reset code
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing unused codes for this email
    await VerificationCode.destroy({
      where: { email, isUsed: false },
    });

    // Create new reset code
    await VerificationCode.create({
      email,
      code,
      expiresAt,
    });

    // Send email
    try {
      await sendPasswordResetEmail(email, code);
    } catch (emailError) {
      console.error("Password reset email sending failed:", emailError);
      // Continue anyway - code is saved in DB for development
    }

    return sendSuccess(
      res,
      { email },
      "If this email is registered, you will receive a password reset code"
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return sendError(
      res,
      "Failed to process password reset request",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

/**
 * Reset password with code
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return sendValidationError(res, [
        "Email, code, and new password are required",
      ]);
    }

    // Validate password length
    if (newPassword.length < 6) {
      return sendValidationError(res, [
        "Password must be at least 6 characters long",
      ]);
    }

    // Find the verification code
    const verification = await VerificationCode.findOne({
      where: {
        email,
        code,
        isUsed: false,
      },
    });

    if (!verification) {
      return sendError(
        res,
        "Invalid or expired reset code",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      return sendError(
        res,
        "Reset code has expired",
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return sendError(res, "User not found", HTTP_STATUS.NOT_FOUND);
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.update({ passwordHash });

    // Mark code as used
    await verification.update({ isUsed: true });

    return sendSuccess(res, {}, "Password reset successfully");
  } catch (error) {
    console.error("Reset password error:", error);
    return sendError(
      res,
      "Failed to reset password",
      HTTP_STATUS.SERVER_ERROR,
      error
    );
  }
};

module.exports = {
  sendVerificationCode,
  verifyCode,
  signup,
  signin,
  forgotPassword,
  resetPassword,
};
