import BloodBank from '../models/BloodBank.js';
import BloodInventory from '../models/BloodInventory.js';
import Donor from '../models/Donor.js';
import BloodRequest from '../models/BloodRequest.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

export const getBloodBankInfo = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne();
    if (!bloodBank) {
      return res.status(404).json({
        success: false,
        message: 'Blood bank information not found',
      });
    }
    res.status(200).json({
      success: true,
      data: bloodBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching blood bank info',
      error: error.message,
    });
  }
};

export const updateBloodBankInfo = async (req, res) => {
  try {
    let bloodBank = await BloodBank.findOne();
    if (!bloodBank) {
      bloodBank = await BloodBank.create(req.body);
    } else {
      await bloodBank.update(req.body);
    }
    res.status(200).json({
      success: true,
      message: 'Blood bank information updated successfully',
      data: bloodBank,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating blood bank info',
      error: error.message,
    });
  }
};

export const getBloodBankStats = async (req, res) => {
  try {
    const totalDonors = await Donor.count();
    const totalUnits = await BloodInventory.count();
    const availableUnits = await BloodInventory.count({ where: { status: 'available' } });
    const usedUnits = await BloodInventory.count({ where: { status: 'used' } });
    const expiredUnits = await BloodInventory.count({ where: { status: 'expired' } });
    const totalRequests = await BloodRequest.count();
    const pendingRequests = await BloodRequest.count({ where: { status: 'pending' } });
    const fulfilledRequests = await BloodRequest.count({ where: { status: 'fulfilled' } });
    const rejectedRequests = await BloodRequest.count({ where: { status: 'rejected' } });

    const bloodTypeDistribution = await sequelize.query(`SELECT "bloodType", COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'available') as available FROM "BloodInventories" GROUP BY "bloodType" ORDER BY "bloodType"`, { type: sequelize.QueryTypes.SELECT });
    const donorsByBloodType = await sequelize.query(`SELECT "bloodType", COUNT(*) as count, COUNT(*) FILTER (WHERE status = 'eligible') as eligible FROM "Donors" GROUP BY "bloodType" ORDER BY "bloodType"`, { type: sequelize.QueryTypes.SELECT });

    res.status(200).json({
      success: true,
      data: {
        donors: { total: totalDonors, byBloodType: donorsByBloodType },
        inventory: { total: totalUnits, available: availableUnits, used: usedUnits, expired: expiredUnits, byBloodType: bloodTypeDistribution },
        requests: { total: totalRequests, pending: pendingRequests, fulfilled: fulfilledRequests, rejected: rejectedRequests, fulfillmentRate: totalRequests > 0 ? ((fulfilledRequests / totalRequests) * 100).toFixed(2) : 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching statistics', error: error.message });
  }
};

export const getStorageCapacity = async (req, res) => {
  try {
    const bloodBank = await BloodBank.findOne();
    if (!bloodBank) {
      return res.status(404).json({ success: false, message: 'Blood bank information not found' });
    }
    const totalUnits = await BloodInventory.count();
    const maxCapacity = bloodBank.maxStorage || 0;
    const usagePercentage = maxCapacity > 0 ? ((totalUnits / maxCapacity) * 100).toFixed(2) : 0;
    res.status(200).json({
      success: true,
      data: {
        maxCapacity,
        currentUsage: totalUnits,
        availableSpace: Math.max(0, maxCapacity - totalUnits),
        usagePercentage,
        storageTemperature: bloodBank.storageTemperature,
        status: usagePercentage > 90 ? 'critical' : usagePercentage > 70 ? 'high' : 'normal',
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching capacity info', error: error.message });
  }
};

export const getDashboardSummary = async (req, res) => {
  try {
    const availableUnits = await BloodInventory.count({ where: { status: 'available' } });
    const pendingRequests = await BloodRequest.count({ where: { status: 'pending' } });
    const activeDonors = await Donor.count({ where: { status: 'eligible' } });
    const recentRequests = await BloodRequest.findAll({ limit: 5, order: [['createdAt', 'DESC']], attributes: ['id', 'bloodType', 'quantity', 'status', 'urgency', 'requiredByDate'] });
    const expiringUnits = await BloodInventory.findAll({ where: { status: 'available', expiryDate: { [Op.gte]: new Date(), [Op.lte]: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } }, attributes: ['id', 'bloodType', 'quantity', 'expiryDate'] });
    res.status(200).json({
      success: true,
      data: {
        summary: { availableUnits, pendingRequests, activeDonors },
        recentRequests,
        expiringUnits: { count: expiringUnits.length, units: expiringUnits },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching dashboard summary', error: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalDonors = await Donor.count();
    const availableUnits = await BloodInventory.count({ where: { status: 'available' } });
    const pendingRequests = await BloodRequest.count({ where: { status: 'pending' } });
    const totalHospitals = await User.count({ where: { role: 'staff' } });
    res.status(200).json({
      success: true,
      stats: {
        totalBloodUnits: availableUnits,
        pendingRequests: pendingRequests,
        totalDonors: totalDonors,
        totalHospitals: totalHospitals,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching admin stats', error: error.message });
  }
};