import { deleteFromCloudinary } from '../config/cloudinary.js';

export const deleteUploadedFile = (publicId) => deleteFromCloudinary(publicId);
