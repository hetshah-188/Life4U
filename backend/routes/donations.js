import express from 'express';
import {
  getAllDonations,
  getDonationById,
  createDonation,
  updateDonation,
  getDonationHistoryByDonor,
  deleteDonation,
  getDonationStats,
  getMyDonations,
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/donations
// router.get('/', protect, getAllDonations);
router.get('/', protect, getAllDonations);

// @route   GET /api/donations/my
// @desc    Get current user's donations (MUST be before /:id)
router.get('/my', protect, getMyDonations);

// @route   POST /api/donations
router.post('/', protect, authorize('admin', 'staff', 'donor'), createDonation);

// @route   GET /api/donations/stats
router.get('/stats', protect, getDonationStats);

// @route   GET /api/donations/:id
router.get('/:id', protect, getDonationById);

// @route   PUT /api/donations/:id
router.put('/:id', protect, authorize('admin', 'staff', 'hospital'), updateDonation);

// @route   GET /api/donations/donor/:donorId
router.get('/donor/:donorId', protect, getDonationHistoryByDonor);

// @route   DELETE /api/donations/:id
router.delete('/:id', protect, authorize('admin', 'staff'), deleteDonation);

export default router;