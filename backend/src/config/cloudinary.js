import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { ApiError } from '../utils/ApiError.js';

let configured = false;

const configure = () => {
  if (configured) return;
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new ApiError(503, 'File storage is not configured on this server');
  }
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });
  configured = true;
};

// Uploads a Multer memory-storage buffer straight to Cloudinary - no local
// disk involved, so files survive container restarts/redeploys (unlike
// saving to the server's own filesystem, which Render's free tier wipes on
// every restart).
export const uploadBufferToCloudinary = (buffer, { folder, resourceType = 'auto' }) => {
  configure();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type });
      }
    );
    Readable.from(buffer).pipe(uploadStream);
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  if (!publicId) return;
  configure();
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('[cloudinary] Failed to delete asset:', publicId, error.message);
  }
};
