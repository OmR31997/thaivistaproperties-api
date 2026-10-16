import 'dotenv/config';
import { randomBytes, scryptSync } from 'node:crypto';
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    publicId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: 'Sub Admin' },
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
    avatar: String,
    lastLoginAt: Date,
  },
  { timestamps: true },
);

userSchema.index(
  { role: 1 },
  {
    unique: true,
    partialFilterExpression: { role: 'Super Admin' },
    name: 'one_super_admin_only',
  },
);

const User = mongoose.model('User', userSchema);
const uri = process.env.MONGODB_URI;
const email = process.env.DEFAULT_ADMIN_EMAIL;
const password = process.env.DEFAULT_ADMIN_PASSWORD;

if (!uri || !email || !password) {
  throw new Error('MONGODB_URI, DEFAULT_ADMIN_EMAIL, and DEFAULT_ADMIN_PASSWORD are required');
}

await mongoose.connect(uri);

try {
  const existing = await User.findOne({ role: 'Super Admin' }).lean().exec();
  if (existing) {
    console.log('Super admin already exists; seed skipped');
  } else {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    await User.create({
      publicId: `USR_${randomBytes(8).toString('hex')}`,
      email: email.toLowerCase().trim(),
      name: 'Super Admin',
      passwordHash: `${salt}:${hash}`,
      role: 'Super Admin',
      status: 'ACTIVE',
    });
    console.log('Default super admin created');
  }
} finally {
  await mongoose.disconnect();
}
