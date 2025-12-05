const express = require('express');
const passport = require('passport');
const {
  register,
  login,
  getMe,
  googleSuccess,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:5173/login?error=auth_failed',
    session: true
  }),
  googleSuccess
);

module.exports = router;
