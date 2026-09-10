import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { DOCUMENT_TYPES, ROLES } from '../constants/index.js';
import {
  summarizeApplication,
  draftRejectionRemarks,
  suggestCategoriesAndSkills,
  verifyDocument,
} from '../services/ai.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export const suggestForProvider = asyncHandler(async (req, res) => {
  const { description, category } = req.body;
  if (!description?.trim() && !category) {
    throw new ApiError(400, 'Please describe your work or pick a category first');
  }

  const suggestion = await suggestCategoriesAndSkills(description?.trim(), category);
  res.json(new ApiResponse(200, suggestion));
});

export const verifyProviderDocument = asyncHandler(async (req, res) => {
  const doc = req.user.providerProfile.documents.find((d) => d._id.toString() === req.params.docId);
  if (!doc) throw new ApiError(404, 'Document not found');

  const docType = DOCUMENT_TYPES.find((d) => d.key === doc.type);
  const label = docType?.label || doc.name;

  const ext = path.extname(doc.fileUrl).toLowerCase();
  const mediaType = MIME_BY_EXT[ext];
  if (!mediaType) throw new ApiError(400, 'Unsupported file type for AI verification');

  const filePath = path.join(uploadDir, path.basename(doc.fileUrl));
  if (!fs.existsSync(filePath)) throw new ApiError(404, 'File no longer exists on the server');

  const base64Data = fs.readFileSync(filePath).toString('base64');
  const result = await verifyDocument({ label, base64Data, mediaType, providerName: req.user.name });
  res.json(new ApiResponse(200, result));
});

export const getApplicationSummary = asyncHandler(async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: ROLES.PROVIDER });
  if (!provider) throw new ApiError(404, 'Provider not found');

  const summary = await summarizeApplication(provider.providerProfile);
  res.json(new ApiResponse(200, summary));
});

export const draftRejection = asyncHandler(async (req, res) => {
  const provider = await User.findOne({ _id: req.params.id, role: ROLES.PROVIDER });
  if (!provider) throw new ApiError(404, 'Provider not found');

  const missingRequired = DOCUMENT_TYPES.filter(
    (d) => d.required && !provider.providerProfile.documents.some((doc) => doc.type === d.key)
  ).map((d) => d.label);

  const draft = await draftRejectionRemarks(provider.providerProfile, missingRequired, req.body.note);
  res.json(new ApiResponse(200, draft));
});
