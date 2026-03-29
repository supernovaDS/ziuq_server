import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // 📂 Dynamic Folder Logic
    let folderName = "quiz_general_uploads";

    if (file.fieldname === "banner") {
      folderName = "quiz_banners";
    } else if (file.fieldname === "media") {
      folderName = "quiz_rounds_media";
    } else if (file.fieldname === "questionMedia") {
      folderName = "quiz_questions_media"; // 👈 New folder for questions
    }

    return {
      folder: folderName,
      resource_type: "auto", // Allows images AND videos
      allowed_formats: ["jpg", "png", "jpeg", "mp4", "mov", "avi"],
    };
  },
});

const upload = multer({ storage: storage });
export default upload;
