import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

export const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl) return;
  const filePath = path.join(uploadDir, path.basename(fileUrl));
  fs.unlink(filePath, () => {});
};
