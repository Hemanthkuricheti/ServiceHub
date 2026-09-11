import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, APPLICATION_STATUS } from '../constants/index.js';

const documentSchema = new mongoose.Schema({
  type: { type: String, default: 'other' },
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  publicId: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' },
  },
  { _id: false }
);

const providerProfileSchema = new mongoose.Schema(
  {
    bio: { type: String, default: '', maxlength: 500 },
    categories: [{ type: String }],
    skills: [{ type: String }],
    experienceYears: { type: Number, min: 0, default: 0 },
    location: { type: locationSchema, default: () => ({}) },
    profilePhoto: { type: String, default: '' },
    profilePhotoPublicId: { type: String, default: '' },
    documents: [documentSchema],
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.INCOMPLETE,
    },
    rejectionRemarks: { type: String, default: '' },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [function requiresPassword() { return !this.googleId; }, 'Password is required'],
      minlength: 6,
      select: false,
    },
    googleId: { type: String, default: undefined, unique: true, sparse: true },
    phone: { type: String, trim: true, default: '' },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.PROVIDER },
    providerProfile: { type: providerProfileSchema, default: undefined },
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
