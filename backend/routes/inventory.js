import express from 'express';
import {
  getAllInventory,
  getInventoryById,
  addToInventory,
  updateInventory,
  deleteInventory,
  getByBloodType,
  getExpiringUnits,
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/inventory
router.get('/', protect, getAllInventory);

// @route   POST /api/inventory
router.post('/', protect, authorize('admin', 'staff'), addToInventory);

// @route   GET /api/inventory/expiring
router.get('/expiring', protect, getExpiringUnits);

// @route   GET /api/inventory/type/:bloodType
router.get('/type/:bloodType', protect, getByBloodType);

// @route   GET /api/inventory/:id
router.get('/:id', protect, getInventoryById);

// @route   PUT /api/inventory/:id
router.put('/:id', protect, authorize('admin', 'staff'), updateInventory);

// @route   DELETE /api/inventory/:id
router.delete('/:id', protect, authorize('admin', 'staff'), deleteInventory);

export default router;