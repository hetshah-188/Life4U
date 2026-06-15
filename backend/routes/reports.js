import express from 'express';
import {
  getDonorReport,
  getInventoryReport,
  getRequestReport,
  getExpiryReport,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All report routes are restricted to Admin and Staff

// @route   GET /api/reports/donors
// @desc    Get donor statistics and report
router.get('/donors', protect, authorize('admin', 'staff'), getDonorReport);

// @route   GET /api/reports/inventory
// @desc    Get inventory report
router.get('/inventory', protect, authorize('admin', 'staff'), getInventoryReport);

// @route   GET /api/reports/requests
// @desc    Get blood request report
router.get('/requests', protect, authorize('admin', 'staff'), getRequestReport);

// @route   GET /api/reports/expiry
// @desc    Get blood expiry report
router.get('/expiry', protect, authorize('admin', 'staff'), getExpiryReport);

export default router;
