import { Cloudinary } from "@cloudinary/url-gen";
import { auto } from "@cloudinary/url-gen/actions/resize";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { AdvancedImage } from "@cloudinary/react";

// Initialize Cloudinary instance
const cld = new Cloudinary({
  cloud: {
    cloudName: "dkunvnzl0",
  },
});

/**
 * Optimized Cloudinary Image Component
 * Automatically applies format and quality optimization
 */
const CloudinaryImage = ({
  src,
  alt = "Image",
  width = 500,
  height = 500,
  className = "",
  crop = true,
}) => {
  // If src is not a Cloudinary public ID or URL, return regular img
  if (!src) {
    return null;
  }

  // Extract public ID from Cloudinary URL or use src directly
  let publicId = src;

  // If it's a full Cloudinary URL, extract the public ID
  if (src.includes("cloudinary.com")) {
    // Extract public ID from URL like: https://res.cloudinary.com/dkunvnzl0/image/upload/v123456/folder/image.jpg
    const matches = src.match(/\/v\d+\/(.+?)(?:\.\w+)?$/);
    if (matches && matches[1]) {
      publicId = matches[1];
    } else {
      // Try another pattern: /upload/folder/image.jpg
      const uploadMatch = src.match(/\/upload\/(.+?)(?:\.\w+)?$/);
      if (uploadMatch && uploadMatch[1]) {
        publicId = uploadMatch[1];
      }
    }
  }

  try {
    // Build optimized image transformation
    let img = cld
      .image(publicId)
      .format("auto") // Optimize delivery format (WebP, AVIF, etc.)
      .quality("auto"); // Auto quality optimization

    // Apply crop transformation if requested
    if (crop) {
      img = img.resize(
        auto().gravity(autoGravity()).width(width).height(height)
      );
    }

    return <AdvancedImage cldImg={img} className={className} alt={alt} />;
  } catch (error) {
    // Fallback to regular img tag if transformation fails
    console.warn("Cloudinary transformation failed, using fallback:", error);
    return <img src={src} alt={alt} className={className} />;
  }
};

export default CloudinaryImage;
