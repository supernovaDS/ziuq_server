import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (localFilePath, folderName) => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName,
      resource_type: "auto",
    });
    // Remove the file from local storage after successful upload
    fs.unlink(localFilePath, (err) => {
      if (err) console.error("Error deleting local file:", err);
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error.message);
    // Even if it fails, delete the local file
    fs.unlink(localFilePath, () => {});
    throw error;
  }
};

/**
 * Extracts the public_id from a Cloudinary URL and deletes the asset.
 * URL Example: https://res.cloudinary.com/cloud_name/image/upload/v1/folder/image_name.jpg
 * Public ID: folder/image_name
 */
export const deleteFromCloudinary = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    // Split the URL to find the part containing the folder and filename
    const urlParts = fileUrl.split('/');
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    
    // Remove the file extension (e.g., .jpg, .mp4)
    const publicId = `${folderName}/${fileNameWithExtension.split('.')[0]}`;

    // Cloudinary destroy method
    // We use 'auto' to handle both images and videos
    await cloudinary.uploader.destroy(publicId, { resource_type: 'auto' });
    
    console.log(`Successfully deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error.message);
  }
};