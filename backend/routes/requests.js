import express from 'express';
import {
  getAllRequests,
  getRequestById,
  createRequest,
  updateRequestStatus,
  allocateBloodUnits,
  getRequestsByStatus,
  cancelRequest,
  getMyRequests,
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ⚠️ Static routes MUST come before parameterized routes

// @route   GET /api/requests/status/:status
router.get('/status/:status', protect, getRequestsByStatus);

// @route   GET /api/requests/my
// @desc    Get current user's own requests (MUST be before /:id)
router.get('/my', protect, getMyRequests);

// @route   GET /api/requests
router.get('/', protect, getAllRequests);

// @route   POST /api/requests
router.post('/', protect, createRequest);

// @route   GET /api/requests/:id
router.get('/:id', protect, getRequestById);

// @route   PUT /api/requests/:id/cancel
// @desc    Cancel a request (matches frontend api.js)
router.put('/:id/cancel', protect, cancelRequest);

// @route   PUT /api/requests/:id/status
// @desc    Update request status (Admin/Staff)
router.put('/:id/status', protect, authorize('admin', 'staff'), updateRequestStatus);

// @route   PUT /api/requests/:id
router.put('/:id', protect, authorize('admin', 'staff'), updateRequestStatus);

// @route   PUT /api/requests/:id/allocate
router.put('/:id/allocate', protect, authorize('admin', 'staff'), allocateBloodUnits);

// @route   DELETE /api/requests/:id
router.delete('/:id', protect, cancelRequest);

export default router;
