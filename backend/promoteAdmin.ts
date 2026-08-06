/**
 * Promote Admin Script — DevVerse
 * Sets specified user email role to 'admin' in MongoDB Atlas.
 */

import mongoose from 'mongoose';
import { User } from './src/models/User.model';
import { env } from './src/config/env';
import { UserRole } from './src/types/user.types';

async function promote() {
  const targetEmail = process.argv[2] || 'susmithasivakumar1832006@gmail.com';
  console.log(`Connecting to MongoDB Atlas to promote: ${targetEmail}`);

  await mongoose.connect(env.MONGODB_URI);

  const user = await User.findOne({ email: targetEmail.toLowerCase() });
  if (!user) {
    console.error(`User not found: ${targetEmail}`);
    process.exit(1);
  }

  user.role = UserRole.ADMIN;
  await user.save();

  console.log(`✅ SUCCESS: User ${user.email} (@${user.username}) promoted to Role = ADMIN`);
  await mongoose.disconnect();
}

promote().catch((err) => {
  console.error(err);
  process.exit(1);
});
