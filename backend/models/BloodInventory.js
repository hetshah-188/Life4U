import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BloodInventory = sequelize.define('BloodInventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.ENUM('bags', 'units', 'ml'),
    defaultValue: 'bags',
  },
  volume: {
    type: DataTypes.INTEGER,
    defaultValue: 450,
  },
  collectionDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  donorId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Donors',
      key: 'id',
    },
  },
  donorName: DataTypes.STRING,
  donorPhone: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM('available', 'reserved', 'used', 'expired', 'discarded', 'quarantine'),
    defaultValue: 'available',
  },
  bloodTyping: DataTypes.STRING,
  rhesusFactor: DataTypes.STRING,
  hiv: {
    type: DataTypes.ENUM('negative', 'positive', 'pending'),
    defaultValue: 'pending',
  },
  hepatitisB: {
    type: DataTypes.ENUM('negative', 'positive', 'pending'),
    defaultValue: 'pending',
  },
  hepatitisC: {
    type: DataTypes.ENUM('negative', 'positive', 'pending'),
    defaultValue: 'pending',
  },
  syphilis: {
    type: DataTypes.ENUM('negative', 'positive', 'pending'),
    defaultValue: 'pending',
  },
  malaria: {
    type: DataTypes.ENUM('negative', 'positive', 'pending'),
    defaultValue: 'pending',
  },
  testDate: DataTypes.DATE,
  testRemarks: DataTypes.TEXT,
  storageLocation: DataTypes.STRING,
  storageShelf: DataTypes.STRING,
  temperature: DataTypes.DECIMAL(5, 2),
  usedForRequestId: {
    type: DataTypes.UUID,
    references: {
      model: 'BloodRequests',
      key: 'id',
    },
  },
  recipientName: DataTypes.STRING,
  usedDate: DataTypes.DATE,
  discardReason: DataTypes.TEXT,
  notes: DataTypes.TEXT,
  source: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'admin',
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['bloodType', 'status'] },
    { fields: ['expiryDate'] },
    { fields: ['status'] },
  ],
});

export default BloodInventory;