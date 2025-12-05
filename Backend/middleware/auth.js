const jwt = require("jsonwebtoken");
const { User } = require("../models");
const dotenv = require("dotenv");
const {
  sendUnauthorized,
  sendForbidden,
  sendError,
} = require("../utils/responses");
dotenv.config();

/**
 * JWT secret
 */
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

/**
 * Authenticate JWT
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return sendUnauthorized(res, "Missing Authorization header");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return sendUnauthorized(res, "Invalid Authorization format");
    }

    const token = parts[1];
    console.log("Token received:", token.substring(0, 20) + "...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token decoded, user ID:", decoded.id);

    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "role"],
    });
    if (!user) {
      return sendUnauthorized(res, "User not found");
    }

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return sendUnauthorized(res, "Token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return sendUnauthorized(res, "Invalid token");
    }
    return sendError(res, error.message || "Internal server error", 500, error);
  }
};

/**
 * Role-based authorization
 */
const authorize = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user?.role) {
      return sendForbidden(res, "Access denied: No role attached to user");
    }
    if (!allowed.includes(req.user.role)) {
      return sendForbidden(
        res,
        `Access denied: Requires role(s): ${allowed.join(", ")}`
      );
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
