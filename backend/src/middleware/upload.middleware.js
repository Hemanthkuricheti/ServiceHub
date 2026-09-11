import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, PNG, WEBP and PDF files are allowed'));
  }
};

// Buffered in memory, then streamed straight to Cloudinary - the app never
// writes uploaded files to its own disk.
export const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
