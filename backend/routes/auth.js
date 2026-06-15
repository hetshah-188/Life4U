import express from 'express';
import { check } from 'express-validator';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  getAllUsers,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('fullname', 'Full Name is required').notEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    check('phone', 'Phone is required').notEmpty(),
  ],
  register
);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists(),
  ],
  login
);

// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
router.get('/me', protect, getMe);

// @route   PUT /api/auth/updateProfile
// @desc    Update user profile
// @access  Private
router.put('/updateProfile', protect, updateProfile);

// @route   POST /api/auth/logout
// @desc    Logout
// @access  Private
router.post('/logout', protect, logout);

// @route   GET /api/auth/users
// @desc    Get all users (optionally filtered by role)
// @access  Private
router.get('/users', protect, getAllUsers);

// @route   POST /api/auth/forgot-password
// @desc    Request reset OTP
// @access  Public
router.post('/forgot-password', forgotPassword);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', verifyOtp);

// @route   POST /api/auth/reset-password
// @desc    Reset password using reset token
// @access  Public
router.post('/reset-password', resetPassword);



export default router;