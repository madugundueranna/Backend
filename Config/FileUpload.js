require("dotenv").config();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only .png, .jpg, .jpeg, and .webp formats are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB
  },
});

// ─── Cloudinary Upload Function ───────────────────────────────────────────────
const uploadToCloudinary = async (file, folder = "qreventix") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
        quality: "auto",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    stream.end(file.buffer);
  });
};

// ─── Multiple Images Upload Function ───────────────────────────────────────────
const uploadMultipleToCloudinary = async (files, folder = "qreventix") => {
  try {
    const uploadPromises = files.map((file) =>
      uploadToCloudinary(file, folder)
    );
    const results = await Promise.all(uploadPromises);
    return results.map((result) => ({
      public_id: result.public_id,
      url: result.secure_url,
    }));
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};

module.exports = { upload, uploadToCloudinary, uploadMultipleToCloudinary, cloudinary };
