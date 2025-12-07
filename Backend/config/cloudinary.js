const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config();

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error(
    "⚠️ WARNING: Cloudinary environment variables are not fully configured!"
  );
} else {
  console.log("✅ Cloudinary is configured");
}

module.exports = cloudinary;
