import { v2 as cloudinary } from 'cloudinary';

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