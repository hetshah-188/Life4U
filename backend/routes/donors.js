import express from 'express';
import {
  getAllDonors,
  getDonorById,
  createDonor,
  updateDonor,
  deleteDonor,
  getDonationHistory,
  updateDonorStatus,
} from '../controllers/donorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/donors
// @desc    Get all donors
router.get('/', protect, getAllDonors);

// @route   POST /api/donors
// @desc    Create donor profile
router.post('/', protect, createDonor);

// @route   GET /api/donors/:id
// @desc    Get donor by ID
router.get('/:id', protect, getDonorById);

// @route   PUT /api/donors/:id
// @desc    Update donor profile
router.put('/:id', protect, updateDonor);

// @route   DELETE /api/donors/:id
// @desc    Delete donor (Admin only)
router.delete('/:id', protect, authorize('admin'), deleteDonor);

// @route   GET /api/donors/:id/history
// @desc    Get donation history
router.get('/:id/history', protect, getDonationHistory);

// @route   PUT /api/donors/:id/status
// @desc    Update donor status (Admin/Staff only)
router.put('/:id/status', protect, authorize('admin', 'staff'), updateDonorStatus);

export default router;
