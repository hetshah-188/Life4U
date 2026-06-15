import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BloodRequest = sequelize.define('BloodRequest', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  requesterId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  requesterName: DataTypes.STRING,
  requesterPhone: DataTypes.STRING,
  requesterEmail: DataTypes.STRING,
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'any'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unit: {
    type: DataTypes.ENUM('bags', 'units', 'ml'),
    defaultValue: 'bags',
  },
  reason: {
    type: DataTypes.ENUM('surgery', 'accident', 'disease', 'blood_transfusion', 'emergency', 'general'),
    allowNull: false,
  },
  description: DataTypes.TEXT,
  urgency: {
    type: DataTypes.ENUM('routine', 'urgent', 'emergency'),
    defaultValue: 'routine',
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected', 'fulfilled', 'expired', 'cancelled'),
    defaultValue: 'pending',
  },
  requestDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  requiredByDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  approvedDate: DataTypes.DATE,
  rejectionReason: DataTypes.TEXT,
  fulfillmentDate: DataTypes.DATE,
  recipientName: DataTypes.STRING,
  recipientAge: DataTypes.INTEGER,
  recipientGender: DataTypes.STRING,
  hospitalName: DataTypes.STRING,
  doctorName: DataTypes.STRING,
  medicalReason: DataTypes.TEXT,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  pincode: DataTypes.STRING,
  approvedBy: {
    type: DataTypes.UUID,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  notes: DataTypes.TEXT,
  priority: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['bloodType'] },
    { fields: ['requiredByDate'] },
    { fields: ['urgency'] },
    { fields: ['requesterId'] },
  ],
});

export default BloodRequest;