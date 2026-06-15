import User from '../models/User.js';
import Donor from '../models/Donor.js';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import crypto from 'crypto';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name: rawName, fullname, email, password, phone, role, dob, dateOfBirth, bloodType, address, city, state, pincode, documentId, idProof } = req.body;
    const name = rawName || fullname;

    let user = await User.findOne({ where: { email } });
    if (user) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const dobVal = dob || dateOfBirth;

    let patientId = null;
    if (role === 'recipient') {
      let isUnique = false;
      while (!isUnique) {
        patientId = `PAT-${Math.floor(100000 + Math.random() * 900000)}`;
        const existing = await User.findOne({ where: { patientId } });
        if (!existing) {
          isUnique = true;
        }
      }
    }

    user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'donor',
      bloodType,
      dateOfBirth: dobVal ? new Date(dobVal) : null,
      address,
      city,
      state,
      pincode,
      documentId: documentId ? parseInt(documentId, 10) : null,
      idProof: idProof || null,
      patientId
    });

    if (user.role === 'donor') {
      await Donor.create({
        userId: user.id,
        bloodType: bloodType || 'O+',
        dateOfBirth: dobVal ? new Date(dobVal) : new Date(),
        weight: req.body.weight || 60,
        height: req.body.height || 170,
        gender: req.body.gender || 'other',
        status: 'eligible',
      });
    }

    const token = user.getSignedJwt();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, patientId: user.patientId },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in registration', error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is not active' });
    }

    const token = user.getSignedJwt();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        patientId: user.patientId,
        bloodType: user.bloodType,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in login', error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateProfile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, pincode, dob, dateOfBirth, bloodType, weight, height, gender, password } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const dobVal = dob || dateOfBirth;
    const updateData = {
      name,
      phone,
      address,
      city,
      state,
      pincode,
      bloodType,
      dateOfBirth: dobVal ? new Date(dobVal) : user.dateOfBirth
    };
    if (password) {
      updateData.password = password;
    }
    await user.update(updateData);

    if (user.role === 'donor') {
      const donor = await Donor.findOne({ where: { userId: user.id } });
      if (donor) {
        await donor.update({
          bloodType: bloodType || donor.bloodType,
          dateOfBirth: dobVal ? new Date(dobVal) : donor.dateOfBirth,
          weight: weight || donor.weight,
          height: height || donor.height,
          gender: gender || donor.gender
        });
      }
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Logout successful. Please delete token from client.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in logout', error: error.message });
  }
};

// @desc    Get all users (admin only), optionally filtered by role
// @route   GET /api/auth/users?role=staff
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const where = {};
    if (req.query.role) where.role = req.query.role;
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
  }
};

// @desc    Request password reset OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account associated with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    console.log("------------------------------------------");
    console.log(`🔑 PASSWORD RESET OTP for ${email}: ${otp}`);
    console.log("------------------------------------------");

    res.status(200).json({
      success: true,
      message: 'OTP code generated successfully. Please check server logs.',
      otp, // return OTP in response for easier frontend testing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error in forgot-password flow', error: error.message });
  }
};

// @desc    Verify OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Please provide an email and OTP code' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify OTP code (we allow the real otp code OR '123456' as a testing bypass)
    const isValidRealOtp = user.otpCode === otp && user.otpExpires && new Date(user.otpExpires) > new Date();
    const isValidBypass = otp === '123456';

    if (!isValidRealOtp && !isValidBypass) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error verifying OTP', error: error.message });
  }
};

// @desc    Reset password using reset token
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, password } = req.body;
    if (!resetToken || !password) {
      return res.status(400).json({ success: false, message: 'Please provide reset token and password' });
    }

    const user = await User.findOne({
      where: {
        resetToken,
        resetTokenExpires: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    // Update password (triggers hook for bcrypt hashing)
    user.password = password;
    user.otpCode = null;
    user.otpExpires = null;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting password', error: error.message });
  }
};