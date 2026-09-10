import { Router } from 'express';
import {
  getProviders,
  getProviderById,
  approveProvider,
  rejectProvider,
  getDashboardStats,
} from '../controllers/admin.controller.js';
import { getApplicationSummary, draftRejection } from '../controllers/ai.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { ROLES } from '../constants/index.js';

const router = Router();

router.use(protect, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /admin/stats:
 *   get:
 *     tags: [Admin]
 *     summary: Dashboard statistics
 *     description: Application counts by status, plus a 6-month monthly registration breakdown for the bar chart.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         incomplete: { type: number }
 *                         pending: { type: number }
 *                         approved: { type: number }
 *                         rejected: { type: number }
 *                         monthlyRegistrations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month: { type: string, example: Sep }
 *                               count: { type: number }
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /admin/providers:
 *   get:
 *     tags: [Admin]
 *     summary: List providers
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Matches against name, email, or category
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [incomplete, pending, approved, rejected] }
 *       - in: query
 *         name: category
 *         schema: { type: string, example: Plumbing }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Paginated list of providers
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     providers: { type: array, items: { $ref: '#/components/schemas/User' } }
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total: { type: number }
 *                         page: { type: number }
 *                         limit: { type: number }
 *                         totalPages: { type: number }
 */
router.get('/providers', getProviders);

/**
 * @swagger
 * /admin/providers/{id}:
 *   get:
 *     tags: [Admin]
 *     summary: Get one provider's full detail
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Provider detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider: { $ref: '#/components/schemas/User' }
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get('/providers/:id', getProviderById);

/**
 * @swagger
 * /admin/providers/{id}/approve:
 *   put:
 *     tags: [Admin]
 *     summary: Approve a pending application
 *     description: Only applications with status `pending` can be approved. Sends an in-app notification + email to the provider.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Provider approved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Provider approved }
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Only pending applications can be approved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.put('/providers/:id/approve', approveProvider);

/**
 * @swagger
 * /admin/providers/{id}/reject:
 *   put:
 *     tags: [Admin]
 *     summary: Reject a pending application
 *     description: Only applications with status `pending` can be rejected. Sends an in-app notification + email (including the remarks) to the provider.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [remarks]
 *             properties:
 *               remarks: { type: string, example: Documents are unclear, please re-upload. }
 *     responses:
 *       200:
 *         description: Provider rejected
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Provider rejected }
 *                 data:
 *                   type: object
 *                   properties:
 *                     provider: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Rejection remarks are required, or only pending applications can be rejected
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.put('/providers/:id/reject', rejectProvider);

/**
 * @swagger
 * /admin/providers/{id}/ai-summary:
 *   get:
 *     tags: [Admin]
 *     summary: "AI: summarize an application"
 *     description: Summarizes the application and flags inconsistencies, with an approve/reject/needs-more-info recommendation. Requires `GEMINI_API_KEY` on the server, or returns 503.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: AI summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary: { type: string }
 *                     flags: { type: array, items: { type: string } }
 *                     recommendation: { type: string, enum: [approve, reject, needs_more_info] }
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       503:
 *         description: AI features are not configured on this server
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.get('/providers/:id/ai-summary', getApplicationSummary);

/**
 * @swagger
 * /admin/providers/{id}/ai-draft-rejection:
 *   post:
 *     tags: [Admin]
 *     summary: "AI: draft rejection remarks"
 *     description: Drafts polished, specific rejection remarks from a short admin note and the missing-document context. Requires `GEMINI_API_KEY` on the server, or returns 503.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note: { type: string, example: ID photo is blurry }
 *     responses:
 *       200:
 *         description: Drafted remarks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: object
 *                   properties:
 *                     remarks: { type: string }
 *       404:
 *         description: Provider not found
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 *       503:
 *         description: AI features are not configured on this server
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ApiError' }
 */
router.post('/providers/:id/ai-draft-rejection', draftRejection);

export default router;
