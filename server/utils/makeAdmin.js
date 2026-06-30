/**
 * Usage: node utils/makeAdmin.js your@email.com
 * Promotes the specified user to admin role in the database.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const email = process.argv[2];

if (!email) {
  console.error('Usage: node utils/makeAdmin.js your@email.com');
  process.exit(1);
}

const run = async () => {
  await connectDB();
  try {
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.error(`No user found with email: ${email}`);
      process.exit(1);
    }

    console.log(`✅ Success! "${user.name}" (${user.email}) is now an admin.`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
