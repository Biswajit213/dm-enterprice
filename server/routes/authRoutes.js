const express = require('express');
const passport = require('passport');
const router = express.Router();
const {
  register, login, logout, getProfile, updateProfile,
  forgotPassword, resetPassword, verifyEmail,
  googleCallback, registerValidation, loginValidation,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const validate = require('../middleware/validate');

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', logout);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Profile
router.get('/profile', protect, getProfile);
router.put('/profile', protect, upload.single('avatar'), updateProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false,
  prompt: 'select_account', // Always show account picker
}));

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) {
        console.error('Google OAuth error:', err.message);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_auth_failed`);
      }
      if (!user) {
        return res.redirect(`${process.env.CLIENT_URL}/login?error=google_no_user`);
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

module.exports = router;
