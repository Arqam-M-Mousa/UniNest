/**
 * Email validation
 */
const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * UUID validation
 */
const isValidUUID = (uuid) => {
  if (typeof uuid !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Password validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 */
const isValidPassword = (password) => {
  if (typeof password !== "string" || password.length < 8) return false;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Phone number validation
 */
const isValidPhoneNumber = (phone) => {
  if (typeof phone !== "string") return false;
  const cleaned = phone.replace(/\s/g, "");
  const phoneRegex = /^[\d\-\+\(\)]{10,}$/;
  return phoneRegex.test(cleaned);
};

/**
 * URL validation
 */
const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate rating (1–5)
 */
const isValidRating = (rating) => {
  const num = Number(rating);
  return Number.isInteger(num) && num >= 1 && num <= 5;
};

/**
 * Validate price (positive number with up to 2 decimals)
 */
const isValidPrice = (price) => {
  const num = Number(price);
  if (Number.isNaN(num) || num <= 0) return false;

  const decimal = num.toString().split(".")[1];
  return !decimal || decimal.length <= 2;
};

/**
 * Validate string length
 */
const isValidStringLength = (str, min = 1, max = 255) => {
  const value = String(str);
  return value.length >= min && value.length <= max;
};

/**
 * Validate enum value
 */
const isValidEnum = (value, allowedValues) => {
  return allowedValues.includes(value);
};

/**
 * Validate required fields
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(
    (field) =>
      data[field] === undefined || data[field] === null || data[field] === ""
  );

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};

module.exports = {
  isValidEmail,
  isValidUUID,
  isValidPassword,
  isValidPhoneNumber,
  isValidURL,
  isValidRating,
  isValidPrice,
  isValidStringLength,
  isValidEnum,
  validateRequiredFields,
};
