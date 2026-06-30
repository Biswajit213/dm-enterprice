const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

// Admin emails — automatically granted admin role on first login
const ADMIN_EMAILS = ['mondaldeep0002@gmail.com', 'biswajitnas195@gmail.com'];

// Guard: don't register strategy if credentials are missing
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.warn('⚠️  Google OAuth credentials missing — Google login disabled');
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile.emails || profile.emails.length === 0) {
            return done(new Error('No email returned from Google'), null);
          }

          const email = profile.emails[0].value;
          const avatar = profile.photos?.[0]?.value || '';
          const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());

          // 1. Already linked Google account
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            let changed = false;
            if (avatar && user.avatar !== avatar) { user.avatar = avatar; changed = true; }
            // Promote to admin if in admin list but not yet admin
            if (isAdmin && user.role !== 'admin') { user.role = 'admin'; changed = true; }
            if (changed) await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          // 2. Email exists but no Google ID — link accounts
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            if (!user.avatar && avatar) user.avatar = avatar;
            user.isEmailVerified = true;
            if (isAdmin) user.role = 'admin';
            await user.save({ validateBeforeSave: false });
            return done(null, user);
          }

          // 3. Brand new user — create account
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName || email.split('@')[0],
            email,
            avatar,
            isEmailVerified: true,
            role: isAdmin ? 'admin' : 'user',
          });

          return done(null, user);
        } catch (error) {
          if (error.code === 11000) {
            const existing = await User.findOne({ email: profile.emails[0].value }).catch(() => null);
            if (existing) return done(null, existing);
          }
          return done(error, null);
        }
      }
    )
  );
}

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
