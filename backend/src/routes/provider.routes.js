import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto,
  removeProfilePhoto,
  uploadDocument,
  removeDocument,
  submitApplication,
} from '../controllers/provider.controller.js';
import { suggestForProvider, verifyProviderDocument } from '../controllers/ai.controller.js';
import { updateProfileValidator } from '../validators/provider.validator.js';
import { validate } from '../middleware/validate.middleware.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect, authorize(ROLES.PROVIDER));

/**
 * @swagger
 * /provider/profile:
 *   get:
 *     tags: [Provider]
 *     summary: Get the current provider's own profile
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: The provider's profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile: { $ref: '#/components/schemas/ProviderProfile' }
 */
router.get('/profile', getProfile);

/**
 * @swagger
 * /provider/profile:
 *   put:
 *     tags: [Provider]
 *     summary: Update the provider's profile
 *     description: >
 *       Accepts any subset of the fields below. Once the application is `approved`, categories/location/name/phone/bio become permanently
 *       read-only (403 if attempted); only `skills` and `experienceYears` can still be changed, and only starting one year after approval
 *       (see `canEditSkillsAndExperience` / `skillsEditableFrom` on the profile) - otherwise this returns 403.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               phone: { type: string }
 *               bio: { type: string, maxLength: 500 }
 *               categories: { type: array, items: { type: string }, example: ["Plumbing", "Electrical"] }
 *               skills: { type: array, items: { type: string }, example: ["Pipe Fitting", "Wiring"] }
 *               experienceYears: { type: number, example: 5 }
 *               location: { $ref: '#/components/schemas/Location' }
 *     responses:
 *       200:
 *         description: Profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Profile updated }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile: { $ref: '#/components/schemas/ProviderProfile' }
 *       403:
 *         description: Field(s) locked because the application is approved / not yet eligible for editing
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.put('/profile', updateProfileValidator, validate, updateProfile);

/**
 * @swagger
 * /provider/profile/photo:
 *   post:
 *     tags: [Provider]
 *     summary: Upload/replace the provider's profile photo
 *     description: Editable anytime, even after approval - unlike the rest of the profile, which locks once approved.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [photo]
 *             properties:
 *               photo: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Profile photo uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Profile photo uploaded }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profilePhoto: { type: string, example: "https://res.cloudinary.com/demo/image/upload/v1/servicehub/profile-photos/xyz789.jpg" }
 */
router.post('/profile/photo', upload.single('photo'), uploadProfilePhoto);

/**
 * @swagger
 * /provider/profile/photo:
 *   delete:
 *     tags: [Provider]
 *     summary: Remove the provider's profile photo
 *     description: Removable anytime, even after approval.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Profile photo removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Profile photo removed }
 *       400:
 *         description: No profile photo to remove
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.delete('/profile/photo', removeProfilePhoto);

/**
 * @swagger
 * /provider/profile/documents:
 *   post:
 *     tags: [Provider]
 *     summary: Upload a verification document
 *     description: Uploading again with the same `type` replaces the existing file for that slot. Not allowed once the application is approved.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [document, type]
 *             properties:
 *               document: { type: string, format: binary }
 *               type:
 *                 type: string
 *                 enum: [aadharCard, panCard, drivingLicense, addressProof, experienceCertificate, skillTrainingCertificate]
 *                 description: aadharCard and panCard are required before submission; the rest are optional.
 *     responses:
 *       200:
 *         description: Document uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents: { type: array, items: { $ref: '#/components/schemas/Document' } }
 *       403:
 *         description: Approved applications cannot be edited
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/profile/documents', upload.single('document'), uploadDocument);

/**
 * @swagger
 * /provider/profile/documents/{docId}:
 *   delete:
 *     tags: [Provider]
 *     summary: Remove an uploaded document
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Document removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     documents: { type: array, items: { $ref: '#/components/schemas/Document' } }
 *       403:
 *         description: Approved applications cannot be edited
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.delete('/profile/documents/:docId', removeDocument);

/**
 * @swagger
 * /provider/submit:
 *   post:
 *     tags: [Provider]
 *     summary: Submit the application for admin review
 *     description: >
 *       Requires at least one category, one skill, a city, and both required documents (Aadhar, PAN).
 *       Sends an in-app notification + email to the provider and to every admin.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Application submitted for review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Application submitted for review }
 *                 data:
 *                   type: object
 *                   properties:
 *                     profile: { $ref: '#/components/schemas/ProviderProfile' }
 *       400:
 *         description: Missing required profile fields or documents, or already submitted/approved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/submit', submitApplication);

/**
 * @swagger
 * /provider/ai/suggest:
 *   post:
 *     tags: [Provider]
 *     summary: "AI: suggest categories and skills"
 *     description: Both fields are optional but at least one is required. `category` narrows the suggested skills to that category and works alone, without a description. Requires `GEMINI_API_KEY` on the server, or returns 503.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description: { type: string, example: I fix leaky pipes and install water heaters }
 *               category: { type: string, example: Plumbing }
 *     responses:
 *       200:
 *         description: Suggested categories and skills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories: { type: array, items: { type: string } }
 *                     skills: { type: array, items: { type: string } }
 *       400:
 *         description: Please describe your work or pick a category first
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       503:
 *         description: AI features are not configured on this server
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/ai/suggest', suggestForProvider);

/**
 * @swagger
 * /provider/profile/documents/{docId}/ai-verify:
 *   post:
 *     tags: [Provider]
 *     summary: "AI: verify an uploaded document"
 *     description: >
 *       Checks legibility, extracts the ID number and printed name, and compares that name against the provider's
 *       registered name (a partial match - e.g. first name only, reordered, abbreviated - is treated as a pass, not a mismatch).
 *       Requires `GEMINI_API_KEY` on the server, or returns 503.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: docId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     legibility: { type: string, enum: [clear, blurry, unreadable] }
 *                     extractedIdNumber: { type: string, nullable: true }
 *                     formatLooksValid: { type: boolean }
 *                     extractedName: { type: string, nullable: true }
 *                     nameMatch: { type: string, enum: [match, partial_match, mismatch, not_visible] }
 *                     concerns: { type: array, items: { type: string } }
 *       404:
 *         description: Document not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       503:
 *         description: AI features are not configured on this server
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/profile/documents/:docId/ai-verify', verifyProviderDocument);

export default router;
