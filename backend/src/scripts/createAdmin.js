import dotenv from 'dotenv';

dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.model.js';
import { ROLES } from '../constants/index.js';

const run = async () => {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password) {
    console.log('Usage: npm run seed:admin -- <email> <password> [name]');
    process.exit(1);
  }

  await connectDB();

  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`A user with email "${email}" already exists`);
    await mongoose.disconnect();
    process.exit(1);
  }

  await User.create({
    name: name || 'Admin',
    email,
    password,
    role: ROLES.ADMIN,
  });

  console.log(`Admin user created: ${email}`);
  await mongoose.disconnect();
  process.exit(0);
};

run();
