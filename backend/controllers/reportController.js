import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import Donor from '../models/Donor.js';
import BloodInventory from '../models/BloodInventory.js';
import BloodRequest from '../models/BloodRequest.js';

// @desc    Get donor statistics
// @route   GET /api/reports/donors
// @access  Private
export const getDonorReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let where = {};

    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Total donors
    const totalDonors = await Donor.count({ where });
    const eligibleDonors = await Donor.count({ where: { ...where, status: 'eligible' } });
    const ineligibleDonors = await Donor.count({
      where: { ...where, status: 'not_eligible' },
    });

    // Donors by blood type
    let dateFilter = '';
    const replacements = {};
    if (startDate && endDate) {
      dateFilter = 'AND "createdAt" BETWEEN :startDate AND :endDate';
      replacements.startDate = new Date(startDate);
      replacements.endDate = new Date(endDate);
    }

    const donorsByBloodType = await sequelize.query(
      `SELECT "bloodType" as _id, 
              COUNT(*) as total, 
              COUNT(*) FILTER (WHERE status = 'eligible') as eligible
       FROM "Donors"
       WHERE 1=1 ${dateFilter}
       GROUP BY "bloodType"
       ORDER BY "bloodType" ASC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Donors by gender
    const donorsByGender = await sequelize.query(
      `SELECT gender as _id, COUNT(*) as count
       FROM "Donors"
       WHERE 1=1 ${dateFilter}
       GROUP BY gender`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Top donors (most donations)
    const topDonors = await Donor.findAll({
      where,
      limit: 10,
      order: [['totalDonations', 'DESC']],
      attributes: ['userId', 'bloodType', 'totalDonations'],
    });

    // Average donations
    const avgStatsQuery = await sequelize.query(
      `SELECT COALESCE(AVG("totalDonations"), 0) as "avgDonations", 
              COALESCE(MAX("totalDonations"), 0) as "maxDonations"
       FROM "Donors"
       WHERE 1=1 ${dateFilter}`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );
    const averageStats = avgStatsQuery[0] || { avgDonations: 0, maxDonations: 0 };
    averageStats.avgDonations = parseFloat(parseFloat(averageStats.avgDonations).toFixed(2));

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalDonors,
          eligible: eligibleDonors,
          ineligible: ineligibleDonors,
          conversionRate: totalDonors > 0 ? (
            (eligibleDonors / totalDonors) *
            100
          ).toFixed(2) : '0.00',
        },
        byBloodType: donorsByBloodType,
        byGender: donorsByGender,
        topDonors,
        averageStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating donor report',
      error: error.message,
    });
  }
};

// @desc    Get inventory report
// @route   GET /api/reports/inventory
// @access  Private
export const getInventoryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let where = {};

    if (startDate && endDate) {
      where.collectionDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Total inventory
    const totalUnits = await BloodInventory.count({ where });
    const availableUnits = await BloodInventory.count({
      where: { ...where, status: 'available' },
    });
    const usedUnits = await BloodInventory.count({
      where: { ...where, status: 'used' },
    });
    const expiredUnits = await BloodInventory.count({
      where: { ...where, status: 'expired' },
    });

    // Inventory by blood type
    let dateFilter = '';
    const replacements = {};
    if (startDate && endDate) {
      dateFilter = 'AND "collectionDate" BETWEEN :startDate AND :endDate';
      replacements.startDate = new Date(startDate);
      replacements.endDate = new Date(endDate);
    }

    const inventoryByBloodType = await sequelize.query(
      `SELECT "bloodType" as _id,
              COUNT(*) as total,
              COUNT(*) FILTER (WHERE status = 'available') as available,
              COUNT(*) FILTER (WHERE status = 'used') as used,
              COUNT(*) FILTER (WHERE status = 'expired') as expired
       FROM "BloodInventories"
       WHERE 1=1 ${dateFilter}
       GROUP BY "bloodType"
       ORDER BY "bloodType" ASC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Expiry report (next 30 days)
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    const expiringUnits = await BloodInventory.findAll({
      where: {
        status: 'available',
        expiryDate: {
          [Op.between]: [new Date(), thirtyDaysLater],
        },
      },
      attributes: ['bloodType', 'expiryDate', 'quantity'],
      order: [['expiryDate', 'ASC']],
    });

    // Collection trend
    const collectionTrend = await sequelize.query(
      `SELECT TO_CHAR("collectionDate", 'YYYY-MM-DD') as _id, COUNT(*) as count
       FROM "BloodInventories"
       WHERE 1=1 ${dateFilter}
       GROUP BY TO_CHAR("collectionDate", 'YYYY-MM-DD')
       ORDER BY _id ASC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalUnits,
          available: availableUnits,
          used: usedUnits,
          expired: expiredUnits,
          utilizationRate: totalUnits > 0 ? (((usedUnits + expiredUnits) / totalUnits) * 100)
            .toFixed(2) : '0.00',
        },
        byBloodType: inventoryByBloodType,
        expiringUnits: {
          count: expiringUnits.length,
          details: expiringUnits,
        },
        collectionTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating inventory report',
      error: error.message,
    });
  }
};

// @desc    Get request report
// @route   GET /api/reports/requests
// @access  Private
export const getRequestReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let where = {};

    if (startDate && endDate) {
      where.requestDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    // Request statistics
    const totalRequests = await BloodRequest.count({ where });
    const pendingRequests = await BloodRequest.count({
      where: { ...where, status: 'pending' },
    });
    const approvedRequests = await BloodRequest.count({
      where: { ...where, status: 'approved' },
    });
    const fulfilledRequests = await BloodRequest.count({
      where: { ...where, status: 'fulfilled' },
    });
    const rejectedRequests = await BloodRequest.count({
      where: { ...where, status: 'rejected' },
    });

    // Requests by urgency
    let dateFilter = '';
    const replacements = {};
    if (startDate && endDate) {
      dateFilter = 'AND "requestDate" BETWEEN :startDate AND :endDate';
      replacements.startDate = new Date(startDate);
      replacements.endDate = new Date(endDate);
    }

    const requestsByUrgency = await sequelize.query(
      `SELECT urgency as _id, COUNT(*) as count, COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled
       FROM "BloodRequests"
       WHERE 1=1 ${dateFilter}
       GROUP BY urgency`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Requests by blood type
    const requestsByBloodType = await sequelize.query(
      `SELECT "bloodType" as _id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled
       FROM "BloodRequests"
       WHERE 1=1 ${dateFilter}
       GROUP BY "bloodType"
       ORDER BY "bloodType" ASC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Request trend
    const requestTrend = await sequelize.query(
      `SELECT TO_CHAR("requestDate", 'YYYY-MM-DD') as _id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'fulfilled') as fulfilled
       FROM "BloodRequests"
       WHERE 1=1 ${dateFilter}
       GROUP BY TO_CHAR("requestDate", 'YYYY-MM-DD')
       ORDER BY _id ASC`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    // Reasons for requests
    const requestsByReason = await sequelize.query(
      `SELECT reason as _id, COUNT(*) as count
       FROM "BloodRequests"
       WHERE 1=1 ${dateFilter}
       GROUP BY reason`,
      { replacements, type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json({
      success: true,
      data: {
        summary: {
          total: totalRequests,
          pending: pendingRequests,
          approved: approvedRequests,
          fulfilled: fulfilledRequests,
          rejected: rejectedRequests,
          fulfillmentRate:
            totalRequests > 0
              ? ((fulfilledRequests / totalRequests) * 100).toFixed(2)
              : 0,
          avgResponseTime: '24 hours (placeholder)',
        },
        byUrgency: requestsByUrgency,
        byBloodType: requestsByBloodType,
        byReason: requestsByReason,
        trend: requestTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating request report',
      error: error.message,
    });
  }
};

// @desc    Get expiry report
// @route   GET /api/reports/expiry
// @access  Private
export const getExpiryReport = async (req, res) => {
  try {
    // Already expired
    const expiredUnits = await BloodInventory.findAll({
      where: {
        expiryDate: { [Op.lt]: new Date() },
        status: 'available',
      },
      order: [['expiryDate', 'ASC']],
    });

    // Expiring soon (7 days)
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const expiringSoon = await BloodInventory.findAll({
      where: {
        status: 'available',
        expiryDate: {
          [Op.between]: [new Date(), sevenDaysLater],
        },
      },
      order: [['expiryDate', 'ASC']],
    });

    // Expiring in 30 days
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const expiringInMonth = await BloodInventory.findAll({
      where: {
        status: 'available',
        expiryDate: {
          [Op.between]: [sevenDaysLater, thirtyDaysLater],
        },
      },
      order: [['expiryDate', 'ASC']],
    });

    // Expiry statistics
    const expiryStats = await sequelize.query(
      `SELECT "bloodType" as _id,
              COUNT(*) FILTER (WHERE "expiryDate" < NOW()) as "expiringToday",
              COUNT(*) FILTER (WHERE "expiryDate" BETWEEN NOW() AND :sevenDaysLater) as "expiringSoon"
       FROM "BloodInventories"
       WHERE status = 'available'
       GROUP BY "bloodType"`,
      {
        replacements: { sevenDaysLater },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        expiredUnits: {
          count: expiredUnits.length,
          details: expiredUnits,
        },
        expiringSoon: {
          count: expiringSoon.length,
          details: expiringSoon,
        },
        expiringInMonth: {
          count: expiringInMonth.length,
          details: expiringInMonth,
        },
        statistics: expiryStats,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating expiry report',
      error: error.message,
    });
  }
};
