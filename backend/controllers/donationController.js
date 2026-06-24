import Donation from '../models/Donation.js';
import Donor from '../models/Donor.js';
import User from '../models/User.js';
import fs from 'fs';

// @desc    Get all donations
// @route   GET /api/donations
// @access  Private
export const getAllDonations = async (req, res) => {
  try {
    const { status = 'completed', limit = 20, page = 1 } = req.query;
    let where = {};

    if (status) where.status = status;

    const offset = (page - 1) * limit;

    const donations = await Donation.findAll({
      where,
      include: [{
        model: Donor,
        as: 'donor',
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'dateOfBirth'] }]
      }],
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [['donationDate', 'DESC']],
    });

    const total = await Donation.count({ where });

    res.status(200).json({
      success: true,
      count: donations.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: donations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donations',
      error: error.message,
    });
  }
};

// @desc    Get donation by ID
// @route   GET /api/donations/:id
// @access  Private
export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id, {
      include: [{
        model: Donor,
        as: 'donor',
        include: [{ model: User, as: 'user', attributes: ['name', 'email', 'phone', 'address', 'city', 'state', 'pincode', 'dateOfBirth'] }]
      }]
    });

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    res.status(200).json({
      success: true,
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation',
      error: error.message,
    });
  }
};

// @desc    Record a donation
// @route   POST /api/donations
// @access  Private
export const createDonation = async (req, res) => {
  try {
    const { donorId, bloodType, units, hospital, weight, notes } = req.body;

    if (!donorId || !bloodType || !units) {
      return res.status(400).json({
        success: false,
        message: 'Donor ID, blood type, and units are required',
      });
    }

    const donor = await Donor.findByPk(donorId);
    if (!donor) {
      return res.status(404).json({
        success: false,
        message: 'Donor not found',
      });
    }

    // Determine points earned based on donation stream (notes)
    let points = 200; // Default: Whole Blood
    const notesStr = notes || '';
    if (notesStr.includes('Platelets')) {
      points = 300;
    } else if (notesStr.includes('Plasma')) {
      points = 250;
    } else if (notesStr.includes('Whole Blood')) {
      points = 200;
    }

    const donation = await Donation.create({
      donorId,
      bloodType,
      units,
      hospital,
      weight,
      notes,
      status: req.body.status || 'completed',
      donationDate: req.body.donationDate ? new Date(req.body.donationDate) : new Date(),
      pointsEarned: points,
    });

    // Update donor's donation count and reward points only if completed
    if (donation.status === 'completed') {
      await donor.increment('totalDonations');
      await donor.increment('rewardPoints', { by: points });
      await donor.update({ lastDonationDate: new Date() });
    }

    res.status(201).json({
      success: true,
      message: 'Donation recorded successfully',
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error recording donation',
      error: error.message,
    });
  }
};

// @desc    Update donation status
// @route   PUT /api/donations/:id
// @access  Private
export const updateDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    const oldStatus = donation.status;
    await donation.update(req.body);

    if (req.body.status === 'completed' && oldStatus !== 'completed') {
      const donor = await Donor.findByPk(donation.donorId);
      if (donor) {
        await donor.increment('totalDonations');
        await donor.increment('rewardPoints', { by: donation.pointsEarned || 200 });
        await donor.update({ lastDonationDate: new Date() });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Donation updated successfully',
      data: donation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating donation',
      error: error.message,
    });
  }
};

// @desc    Get donation history for donor
// @route   GET /api/donations/donor/:donorId
// @access  Private
export const getDonationHistoryByDonor = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      where: { donorId: req.params.donorId },
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

// @desc    Delete donation
// @route   DELETE /api/donations/:id
// @access  Private
export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findByPk(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: 'Donation not found',
      });
    }

    await donation.destroy();

    res.status(200).json({
      success: true,
      message: 'Donation deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting donation',
      error: error.message,
    });
  }
};

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Private
export const getDonationStats = async (req, res) => {
  try {
    const totalDonations = await Donation.count();
    const completedDonations = await Donation.count({ where: { status: 'completed' } });
    const pendingDonations = await Donation.count({ where: { status: 'pending' } });
    const cancelledDonations = await Donation.count({ where: { status: 'cancelled' } });

    res.status(200).json({
      success: true,
      stats: {
        total: totalDonations,
        completed: completedDonations,
        pending: pendingDonations,
        cancelled: cancelledDonations,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching donation statistics',
      error: error.message,
    });
  }
};

// @desc    Get logged in user's donations
// @route   GET /api/donations/my
// @access  Private
export const getMyDonations = async (req, res) => {
  try {
    const donor = await Donor.findOne({ where: { userId: req.user.id } });
    if (!donor) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const donations = await Donation.findAll({
      where: { donorId: donor.id },
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
      message: 'Error fetching your donations',
      error: error.message,
    });
  }
};