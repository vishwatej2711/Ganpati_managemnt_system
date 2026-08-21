import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables immediately to resolve TypeScript import ordering issues
dotenv.config();

// Verify credentials exist to log detailed help warnings
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.warn(
    '⚠️ [WARNING]: Cloudinary credentials are not fully configured in your backend .env file.\n' +
    'Please verify that CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.'
  );
}

// Initialize Cloudinary SDK configuration
cloudinary.config({
  cloud_name: cloudName || 'placeholder_name',
  api_key: apiKey || 'placeholder_key',
  api_secret: apiSecret || 'placeholder_secret',
});

/**
 * Uploads a memory file buffer directly to Cloudinary.
 */
export function uploadToCloudinary(fileBuffer: Buffer): Promise<{ secure_url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    // Assert credentials exist at upload execution time to return clear messages
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return reject(new Error('Cloudinary is not configured. Please define credentials in your backend .env file.'));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'ganpati_management' },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        } else {
          reject(new Error('Cloudinary upload returned empty response.'));
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/**
 * Deletes an image from Cloudinary using its public ID.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  // Assert credentials exist at execution time
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Skipping Cloudinary deletion: SDK is not configured.');
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`Cloudinary deletion completed for ID ${publicId}:`, result);
  } catch (error) {
    console.error(`Failed to delete media from Cloudinary for ID ${publicId}:`, error);
  }
}

/**
 * Utility to extract the public ID (including folder namespace) from a full Cloudinary URL.
 */
export function getPublicIdFromUrl(url: string): string | null {
  if (!url || !url.includes('/upload/')) return null;
  try {
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;

    // Remove version prefix (e.g. 'v1234567890/')
    const remaining = parts[1].replace(/^v\d+\//, '');

    // Remove file extension (e.g. '.jpg', '.png')
    const lastDotIndex = remaining.lastIndexOf('.');
    if (lastDotIndex === -1) return remaining;

    return remaining.substring(0, lastDotIndex);
  } catch (error) {
    console.error('Error parsing public ID from Cloudinary URL:', error, url);
    return null;
  }
}
