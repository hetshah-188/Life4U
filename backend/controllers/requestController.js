import BloodRequest from '../models/BloodRequest.js';
import BloodInventory from '../models/BloodInventory.js';
import User from '../models/User.js';
import { Op } from 'sequelize';

// @desc    Get all requests
// @route   GET /api/requests
// @access  Private
export const getAllRequests = async (req, res) => {
  try {
    const { status, bloodType, urgency, limit = 20, page = 1 } = req.query;
    let where = {};

    if (status) where.status = status;
    if (bloodType && bloodType !== 'any') where.bloodType = bloodType;
    if (urgency) where.urgency = urgency;

    const offset = (page - 1) * limit;

    const requests = await BloodRequest.findAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['requiredByDate', 'ASC'], ['urgency', 'DESC']],
    });

    const total = await BloodRequest.count({ where });

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message,
    });
  }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching request',
      error: error.message,
    });
  }
};

// @desc    Create blood request
// @route   POST /api/requests
// @access  Private
export const createRequest = async (req, res) => {
  try {
    const { bloodType, units, reason, purpose, description, urgency, requiredByDate, recipientName, recipientAge, recipientGender, hospitalName, doctorName, address, city, state, pincode } = req.body;

    const quantity = req.body.quantity || units;
    const requestReason = reason || purpose || 'general';

    if (!bloodType || !quantity || !requiredByDate) {
      return res.status(400).json({
        success: false,
        message: 'Blood type, quantity/units, and required date are required',
      });
    }

    // Validate reason is in enum
    const validReasons = ['surgery', 'accident', 'disease', 'blood_transfusion', 'emergency', 'general'];
    if (!validReasons.includes(requestReason)) {
      return res.status(400).json({
        success: false,
        message: `Invalid reason. Must be one of: ${validReasons.join(', ')}`,
      });
    }

    const user = await User.findByPk(req.user.id);

    const request = await BloodRequest.create({
      requesterId: req.user.id,
      requesterName: user.name,
      requesterPhone: user.phone,
      requesterEmail: user.email,
      bloodType,
      quantity,
      reason: requestReason,
      description,
      urgency: urgency || 'routine',
      requiredByDate: new Date(requiredByDate),
      recipientName,
      recipientAge,
      recipientGender,
      hospitalName,
      doctorName,
      address,
      city,
      state,
      pincode,
      status: 'pending',
      requestDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Blood request created successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message,
    });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private (Admin/Staff)
export const updateRequestStatus = async (req, res) => {
  try {
    const { status, rejectionReason, approverNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    let updateData = {
      status,
      approvedBy: req.user.id,
    };

    if (status === 'rejected') {
      updateData.rejectionReason = rejectionReason;
    }

    if (status === 'fulfilled') {
      updateData.fulfillmentDate = new Date();
    }

    if (status === 'approved') {
      updateData.approvedDate = new Date();
    }

    const request = await BloodRequest.findByPk(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    await request.update(updateData);

    res.status(200).json({
      success: true,
      message: `Request ${status} successfully`,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating request status',
      error: error.message,
    });
  }
};

// @desc    Allocate blood units to request
// @route   PUT /api/requests/:id/allocate
// @access  Private (Admin/Staff)
export const allocateBloodUnits = async (req, res) => {
  try {
    const { inventoryIds } = req.body;

    if (!inventoryIds || !Array.isArray(inventoryIds)) {
      return res.status(400).json({
        success: false,
        message: 'Inventory IDs array is required',
      });
    }

    const request = await BloodRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    for (const inventoryId of inventoryIds) {
      const unit = await BloodInventory.findByPk(inventoryId);

      if (!unit) {
        return res.status(404).json({
          success: false,
          message: `Inventory unit ${inventoryId} not found`,
        });
      }

      if (unit.bloodType !== request.bloodType) {
        return res.status(400).json({
          success: false,
          message: `Blood type mismatch for unit ${inventoryId}`,
        });
      }

      await unit.update({ status: 'reserved' });
    }

    await request.update({
      status: 'approved',
      approvedDate: new Date(),
    });

    res.status(200).json({
      success: true,
      message: 'Blood units allocated successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error allocating blood units',
      error: error.message,
    });
  }
};

// @desc    Get requests by status
// @route   GET /api/requests/status/:status
// @access  Private
export const getRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const validStatuses = ['pending', 'approved', 'rejected', 'fulfilled', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const offset = (page - 1) * limit;

    const requests = await BloodRequest.findAll({
      where: { status },
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['requiredByDate', 'ASC']],
    });

    const total = await BloodRequest.count({ where: { status } });

    res.status(200).json({
      success: true,
      count: requests.length,
      total,
      status,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message,
    });
  }
};

// @desc    Get user's own requests
// @route   GET /api/requests/my
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.findAll({
      where: { requesterId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching your requests',
      error: error.message,
    });
  }
};

// @desc    Cancel request
// @route   DELETE /api/requests/:id
// @access  Private
export const cancelRequest = async (req, res) => {
  try {
    const request = await BloodRequest.findByPk(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found',
      });
    }

    await request.update({ status: 'cancelled' });

    res.status(200).json({
      success: true,
      message: 'Request cancelled successfully',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling request',
      error: error.message,
    });
  }
};