import Donor from '../models/Donor.js';
import User from '../models/User.js';
import Donation from '../models/Donation.js';

// @desc    Get all donors
// @route   GET /api/donors
// @access  Private
export const getAllDonors = async (req, res) => {
  try {
    const { status, bloodType, userId, limit = 200, page = 1 } = req.query;
    let where = {};

    if (userId) {
      where.userId = userId;
      if (status) where.status = status;
    } else if (status) {
      // Only filter by status when explicitly requested
      where.status = status;
    }
    // If no userId and no status: return all donors (admin view)
    if (bloodType) where.bloodType = bloodType;

    const offset = (page - 1) * limit;

    const donors = await Donor.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']],
    });

    const total = await Donor.count({ where });

    res.status(200).json({
      success: true,
      count: donors.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: donors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donors',
      error: error.message,
    });
  }
};

// @desc    Get donor by ID
// @route   GET /api/donors/:id
// @access  Private
export const getDonorById = async (req, res) => {
  try {
    const donor = await Donor.findByPk(req.params.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone'] }]
    });

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    res.status(200).json({
      success: true,
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donor',
      error: error.message,
    });
  }
};

// @desc    Create donor profile
// @route   POST /api/donors
// @access  Private
export const createDonor = async (req, res) => {
  try {
    const { bloodType, dateOfBirth, weight, height, gender, hasHighBloodPressure, hasDiabetes, hasHeartDisease, hasBleeding, hasInfection, medications, allergies } = req.body;

    if (!bloodType || !dateOfBirth || !weight || !height || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Blood type, date of birth, weight, height, and gender are required',
      });
    }

    const existingDonor = await Donor.findOne({ where: { userId: req.user.id } });
    if (existingDonor) {
      return res.status(400).json({
        success: false,
        message: 'Donor profile already exists for this user',
      });
    }

    const donor = await Donor.create({
      userId: req.user.id,
      bloodType,
      dateOfBirth: new Date(dateOfBirth),
      weight,
      height,
      gender,
      hasHighBloodPressure,
      hasDiabetes,
      hasHeartDisease,
      hasBleeding,
      hasInfection,
      medications,
      allergies,
      status: 'eligible',
      totalDonations: 0,
    });

    res.status(201).json({
      success: true,
      message: 'Donor profile created successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating donor profile',
      error: error.message,
    });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/:id
// @access  Private
export const updateDonor = async (req, res) => {
  try {
    const donor = await Donor.findByPk(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    if (donor.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this donor profile',
      });
    }

    await donor.update(req.body);

    res.status(200).json({
      success: true,
      message: 'Donor profile updated successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donor profile',
      error: error.message,
    });
  }
};

// @desc    Delete donor
// @route   DELETE /api/donors/:id
// @access  Private (Admin only)
export const deleteDonor = async (req, res) => {
  try {
    const donor = await Donor.findByPk(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    await donor.destroy();

    res.status(200).json({
      success: true,
      message: 'Donor deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting donor',
      error: error.message,
    });
  }
};

// @desc    Get donation history
// @route   GET /api/donors/:id/history
// @access  Private
export const getDonationHistory = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { donorId: req.params.id },
      order: [['donationDate', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: donations.length,
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation history',
      error: error.message,
    });
  }
};

// @desc    Update donor status
// @route   PUT /api/donors/:id/status
// @access  Private (Admin/Staff only)
export const updateDonorStatus = async (req, res) => {
  try {
    const { status, reasonForIneligibility } = req.body;

    const donor = await Donor.findByPk(req.params.id);

    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    await donor.update({ status, reasonForIneligibility });

    res.status(200).json({
      success: true,
      message: 'Donor status updated successfully',
      data: donor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donor status',
      error: error.message,
    });
  }
};