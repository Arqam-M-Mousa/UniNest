const crypto = require("crypto");

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 12)
 * @returns {string} - Generated password
 */
const generateSecurePassword = (length = 12) => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const special = "!@#$%^&*";

    const allChars = uppercase + lowercase + numbers + special;

    let password = "";

    // Ensure at least one character from each category
    password += uppercase[crypto.randomInt(0, uppercase.length)];
    password += lowercase[crypto.randomInt(0, lowercase.length)];
    password += numbers[crypto.randomInt(0, numbers.length)];
    password += special[crypto.randomInt(0, special.length)];

    // Fill the rest randomly
    for (let i = password.length; i < length; i++) {
        password += allChars[crypto.randomInt(0, allChars.length)];
    }

    // Shuffle the password
    return password
        .split("")
        .sort(() => crypto.randomInt(0, 2) - 0.5)
        .join("");
};

module.exports = {
    generateSecurePassword,
};
