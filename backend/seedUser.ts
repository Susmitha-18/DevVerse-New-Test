/**
 * Seed User Script — DevVerse
 * Creates a default developer account in the local MongoDB database.
 */

import mongoose from 'mongoose';
import { User } from './src/models/User.model';
import { env } from './src/config/env';
import { UserRole } from './src/types/user.types';

async function seed() {
  const email = 'susmithasivakumar1832006@gmail.com';
  const username = 'susmitha';
  const fullName = 'Susmitha Sivakumar';
  const password = 'Password123!';

  console.log(`Connecting to database: ${env.MONGODB_URI}`);
  await mongoose.connect(env.MONGODB_URI);

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log(`User ${email} already exists.`);
    // Make sure password is correct and role is admin
    existing.password = password;
    existing.role = UserRole.ADMIN;
    await existing.save();
    console.log(`✅ User ${email} has been updated with Password: "${password}" and Role: ADMIN`);
  } else {
    const newUser = new User({
      fullName,
      username,
      email,
      password,
      role: UserRole.ADMIN,
    });
    await newUser.save();
    console.log(`✅ Created default user:`);
    console.log(`   Email:    ${email}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role:     ADMIN`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
