/**
 * Generate a random string (useful for tokens, codes)
 */
const generateRandomString = (length = 32) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Format date to ISO string
 */
const formatDate = (date = new Date()) => {
  return new Date(date).toISOString();
};

/**
 * Parse date safely
 */
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get time difference in seconds
 */
const getTimeDifference = (startDate, endDate = new Date()) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.floor((end - start) / 1000);
};

/**
 * Check if date is in the past
 */
const isDateInPast = (date) => {
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 */
const isDateInFuture = (date) => {
  return new Date(date) > new Date();
};

/**
 * Sanitize string (remove HTML/special chars)
 */
const sanitizeString = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/[<>\"']/g, "")
    .trim()
    .substring(0, 1000);
};

/**
 * Sanitize object
 */
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === "object") {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

/**
 * Group array by property
 */
const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

/**
 * Sort array of objects
 */
const sortBy = (array, key, order = "asc") => {
  const sorted = [...array];
  sorted.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (order === "desc") {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
  return sorted;
};

/**
 * Chunk array into smaller arrays
 */
const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

/**
 * Remove duplicates from array
 */
const removeDuplicates = (array, key = null) => {
  if (!key) return [...new Set(array)];

  const seen = new Set();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
};

module.exports = {
  generateRandomString,
  formatDate,
  parseDate,
  getTimeDifference,
  isDateInPast,
  isDateInFuture,
  sanitizeString,
  sanitizeObject,
  groupBy,
  sortBy,
  chunk,
  removeDuplicates,
};
