import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';
import { SERVICE_CATEGORIES } from '../constants/index.js';

const MODEL = 'gemini-3.6-flash';

let cachedClient = null;

const getClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(503, 'AI features are not configured on this server');
  }
  if (!cachedClient) cachedClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return cachedClient;
};

const CATEGORY_LOOKUP = new Map(SERVICE_CATEGORIES.map((category) => [category.toLowerCase(), category]));

// Translates Gemini SDK errors into ApiError so the route handler's generic
// error middleware returns a sensible status code and message instead of
// leaking an SDK-internal error string.
//
// The SDK throws several internal error subclasses (e.g. RateLimitError) that
// are not exported from the package and don't inherit from its public
// `ApiError` class, so `instanceof` checks against exported classes silently
// miss them. Every one of these errors does carry a numeric `.status`
// matching the HTTP response code, so branch on that instead.
const translateGeminiError = (error) => {
  const status = typeof error?.status === 'number' ? error.status : null;

  if (status === 401 || status === 403) {
    return new ApiError(503, 'AI service is not configured correctly (invalid API key)');
  }
  if (status === 429) {
    return new ApiError(429, 'AI service is busy right now, please try again in a moment');
  }
  if (status && status >= 500) {
    return new ApiError(503, 'AI service is temporarily unavailable, please try again');
  }
  if (status) {
    return new ApiError(502, 'AI service returned an error, please try again');
  }
  return new ApiError(502, 'AI request failed, please try again');
};

// Runs one structured-output interaction and returns the parsed JSON object.
const runInteraction = async ({ input, systemInstruction, schema }) => {
  const client = getClient();
  let interaction;
  try {
    interaction = await client.interactions.create({
      model: MODEL,
      input,
      system_instruction: systemInstruction,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema,
      },
    });
  } catch (error) {
    throw translateGeminiError(error);
  }

  if (!interaction.output_text) {
    throw new ApiError(502, 'AI request returned no output, please try again');
  }

  try {
    return JSON.parse(interaction.output_text);
  } catch {
    throw new ApiError(502, 'AI returned malformed output, please try again');
  }
};

const ApplicationSummarySchema = z.object({
  summary: z.string().describe('2-3 sentence summary of this application for a busy admin reviewer'),
  flags: z.array(z.string()).describe('Specific concerns or inconsistencies worth the admin double-checking, empty array if none'),
  recommendation: z.enum(['approve', 'reject', 'needs_more_info']),
});

const RejectionDraftSchema = z.object({
  remarks: z.string().describe('Professional, specific rejection remarks the provider will read'),
});

const SkillSuggestionSchema = z.object({
  categories: z.array(z.string()).describe('Matching categories, must only use values from the provided allowed list'),
  skills: z.array(z.string()).describe('3-6 concise skill tags extracted or inferred from the description'),
});

const DocumentVerificationSchema = z.object({
  legibility: z.enum(['clear', 'blurry', 'unreadable']),
  extractedIdNumber: z.string().nullable().describe('The ID number visible on the document, or null if none is visible'),
  formatLooksValid: z.boolean().describe('Whether the extracted number matches the expected format for this document type'),
  extractedName: z.string().nullable().describe('The full name printed on the document, or null if no name is visible'),
  nameMatch: z
    .enum(['match', 'partial_match', 'mismatch', 'not_visible'])
    .describe(
      'Whether the name on the document reasonably identifies the same person as the registered name. Use "match" for an exact or near-exact match, "partial_match" when it is clearly the same person but the document shows a shorter/longer form, different name order, initials, or a minor spelling variation (a partial match is expected and fine - the document name need not be the full registered name), "mismatch" only when the names appear to belong to different people, and "not_visible" if no name is visible on the document.'
    ),
  concerns: z.array(z.string()).describe('Any issues noticed, e.g. expired date, wrong document type uploaded'),
});

export const summarizeApplication = async (profile) => {
  return runInteraction({
    systemInstruction:
      'You are assisting an admin reviewing service-provider onboarding applications for a home-services platform. Be concise and factual - never invent details not present in the data.',
    input: `Review this application and summarize it for the admin.\n\n${JSON.stringify(
      {
        categories: profile.categories,
        skills: profile.skills,
        experienceYears: profile.experienceYears,
        location: profile.location,
        documentsUploaded: (profile.documents || []).map((d) => d.type),
        priorRejectionRemarks: profile.rejectionRemarks || null,
      },
      null,
      2
    )}`,
    schema: z.toJSONSchema(ApplicationSummarySchema),
  });
};

export const draftRejectionRemarks = async (profile, missingRequiredLabels, adminNote) => {
  return runInteraction({
    systemInstruction:
      'You draft short, professional, specific rejection remarks for a service-provider onboarding platform. Address the provider directly and politely, and tell them exactly what to fix.',
    input: `Draft rejection remarks for this application.\n\nMissing required documents: ${
      missingRequiredLabels.length ? missingRequiredLabels.join(', ') : 'none'
    }\nAdmin's note on what's wrong (may be empty): ${adminNote || '(no note provided)'}\n\nKeep it under 3 sentences.`,
    schema: z.toJSONSchema(RejectionDraftSchema),
  });
};

export const suggestCategoriesAndSkills = async (description, category) => {
  const result = await runInteraction({
    systemInstruction: `You help service providers fill out their onboarding profile. Given a plain-text description of the work they do${
      category ? ` and the service category they selected (${category})` : ''
    }, suggest matching categories (ONLY from this exact list: ${SERVICE_CATEGORIES.join(
      ', '
    )}) and a short list of skill tags${
      category ? ` specific to ${category} work` : ''
    }. Always include "${category}" in the suggested categories if it was given.`,
    input: category ? `Category: ${category}\nDescription: ${description || '(not provided)'}` : description,
    schema: z.toJSONSchema(SkillSuggestionSchema),
  });

  const matchedCategories = result.categories
    .map((category) => CATEGORY_LOOKUP.get(category.trim().toLowerCase()))
    .filter(Boolean);

  return {
    categories: [...new Set(matchedCategories)],
    skills: result.skills,
  };
};

export const verifyDocument = async ({ label, base64Data, mediaType, providerName }) => {
  const isPdf = mediaType === 'application/pdf';

  return runInteraction({
    systemInstruction:
      'You check verification documents for a service-provider onboarding platform. Report only what is visible in the document - never guess or invent an ID number or name. When comparing the name on the document to the provider\'s registered name, be lenient: the document is not expected to show the provider\'s full registered name, so treat a first-name-only, last-name-only, reordered, abbreviated, or minor-spelling-variant match as a partial match rather than a mismatch.',
    input: [
      isPdf
        ? { type: 'document', data: base64Data, mime_type: mediaType }
        : { type: 'image', data: base64Data, mime_type: mediaType },
      {
        type: 'text',
        text: `This document was uploaded as a "${label}" by a provider registered as "${providerName}". Check its legibility, extract any ID number visible, note whether the format looks right for this document type, extract the name printed on the document, and assess whether that name reasonably matches the registered name (a partial match is fine and expected - it does not need to be the full registered name). Flag if this file doesn't look like a ${label} at all.`,
      },
    ],
    schema: z.toJSONSchema(DocumentVerificationSchema),
  });
};
