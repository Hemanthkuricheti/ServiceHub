import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { generateToken } from '../utils/generateToken.js';
import { ROLES } from '../constants/index.js';

const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

let cachedGoogleClient = null;

const getGoogleClient = () => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new ApiError(503, 'Google sign-in is not configured on this server');
  }
  if (!cachedGoogleClient) cachedGoogleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return cachedGoogleClient;
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'Email is already registered');

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: ROLES.PROVIDER,
    providerProfile: {},
  });

  const token = generateToken(user._id, user.role);
  res
    .status(201)
    .json(new ApiResponse(201, { user: sanitizeUser(user), token }, 'Registration successful'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id, user.role);
  res.json(new ApiResponse(200, { user: sanitizeUser(user), token }, 'Login successful'));
});

export const getMe = asyncHandler(async (req, res) => {
  res.json(new ApiResponse(200, { user: sanitizeUser(req.user) }));
});

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) throw new ApiError(400, 'Missing Google credential');

  const client = getGoogleClient();
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Invalid or expired Google credential');
  }

  if (!payload?.email_verified) {
    throw new ApiError(401, 'Google account email is not verified');
  }

  let user = await User.findOne({ googleId: payload.sub });

  if (!user) {
    user = await User.findOne({ email: payload.email });
    if (user) {
      user.googleId = payload.sub;
      await user.save();
    }
  }

  if (!user) {
    user = await User.create({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      role: ROLES.PROVIDER,
      providerProfile: {},
    });
  }

  const token = generateToken(user._id, user.role);
  res.json(new ApiResponse(200, { user: sanitizeUser(user), token }, 'Signed in with Google'));
});
