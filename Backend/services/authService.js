const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const {
  HTTP_STATUS,
  sendSuccess,
  sendError,
  sendValidationError,
} = require("../utils/responses");

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Sign up a new user
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
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return sendValidationError(res, ["Missing required fields"]);
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return sendError(res, "Email already registered", HTTP_STATUS.CONFLICT);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      role,
      phoneNumber,
      avatarUrl,
      studentId,
      gender,
      preferredLanguage,
      universityId,
    });

    return sendSuccess(
      res,
      { id: user.id, email: user.email },
      "User registered",
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
          profilePictureUrl: user.profilePictureUrl,
        },
      },
      "Signed in"
    );
  } catch (error) {
    console.error("Signin error:", error);
    return sendError(res, "Signin failed", HTTP_STATUS.SERVER_ERROR, error);
  }
};

module.exports = {
  signup,
  signin,
};
