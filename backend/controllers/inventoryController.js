import BloodInventory from '../models/BloodInventory.js';
import { Op } from 'sequelize';

// @desc    Get all blood inventory
// @route   GET /api/inventory
// @access  Private
export const getAllInventory = async (req, res) => {
  try {
    const { bloodType, status, limit = 200, page = 1 } = req.query;
    let where = {};

    if (bloodType) where.bloodType = bloodType;
    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const inventory = await BloodInventory.findAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['expiryDate', 'ASC']],
    });

    const total = await BloodInventory.count({ where });

    res.status(200).json({
      success: true,
      count: inventory.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message,
    });
  }
};

// @desc    Get inventory by ID
// @route   GET /api/inventory/:id
// @access  Private
export const getInventoryById = async (req, res) => {
  try {
    const inventory = await BloodInventory.findByPk(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
    }

    res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory',
      error: error.message,
    });
  }
};

// @desc    Add blood to inventory
// @route   POST /api/inventory
// @access  Private
export const addToInventory = async (req, res) => {
  try {
    const { bloodType, quantity, donorId, expiryDate, source, notes } = req.body;

    if (!bloodType || !quantity || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Blood type, quantity, and expiry date are required',
      });
    }

    const inventory = await BloodInventory.create({
      bloodType,
      quantity: parseInt(quantity),
      donorId: donorId || null,
      expiryDate: new Date(expiryDate),
      status: 'available',
      source: source || 'admin',
      notes: notes || null,
    });

    res.status(201).json({
      success: true,
      message: 'Blood added to inventory successfully',
      data: inventory,
    });
  } catch (error) {
    console.error('Error adding to inventory:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error adding to inventory',
      error: error.message,
    });
  }
};

// @desc    Update inventory
// @route   PUT /api/inventory/:id
// @access  Private
export const updateInventory = async (req, res) => {
  try {
    const inventory = await BloodInventory.findByPk(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
    }

    await inventory.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating inventory',
      error: error.message,
    });
  }
};

// @desc    Delete inventory
// @route   DELETE /api/inventory/:id
// @access  Private
export const deleteInventory = async (req, res) => {
  try {
    const inventory = await BloodInventory.findByPk(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: 'Inventory not found',
      });
    }

    await inventory.destroy();

    res.status(200).json({
      success: true,
      message: 'Inventory deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting inventory',
      error: error.message,
    });
  }
};

// @desc    Get blood by type
// @route   GET /api/inventory/type/:bloodType
// @access  Private
export const getByBloodType = async (req, res) => {
  try {
    const { bloodType } = req.params;
    const { status = 'available' } = req.query;

    const inventory = await BloodInventory.findAll({
      where: {
        bloodType,
        status: status || 'available',
      },
      order: [['expiryDate', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching inventory by blood type',
      error: error.message,
    });
  }
};

// @desc    Get expiring units
// @route   GET /api/inventory/expiring
// @access  Private
export const getExpiringUnits = async (req, res) => {
  try {
    const days = req.query.days || 7;
    const expiryThreshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const inventory = await BloodInventory.findAll({
      where: {
        status: 'available',
        expiryDate: {
          [Op.lte]: expiryThreshold,
          [Op.gte]: new Date(),
        },
      },
      order: [['expiryDate', 'ASC']],
    });

    res.status(200).json({
      success: true,
      count: inventory.length,
      data: inventory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching expiring units',
      error: error.message,
    });
  }
};