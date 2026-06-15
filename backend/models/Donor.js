import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Donor = sequelize.define('Donor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  weight: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  hasHighBloodPressure: DataTypes.BOOLEAN,
  hasDiabetes: DataTypes.BOOLEAN,
  hasHeartDisease: DataTypes.BOOLEAN,
  hasBleeding: DataTypes.BOOLEAN,
  hasInfection: DataTypes.BOOLEAN,
  medications: DataTypes.TEXT,
  allergies: DataTypes.TEXT,
  lastCheckupDate: DataTypes.DATE,
  totalDonations: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  lastDonationDate: DataTypes.DATE,
  nextEligibleDate: DataTypes.DATE,
  status: {
    type: DataTypes.ENUM('eligible', 'not_eligible', 'suspended', 'inactive'),
    defaultValue: 'eligible',
  },
  reasonForIneligibility: DataTypes.TEXT,
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  pincode: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8),
  availability: {
    type: DataTypes.ENUM('always', 'weekends', 'specific_days', 'on_demand'),
    defaultValue: 'on_demand',
  },
  preferredDonationCenter: DataTypes.STRING,
  contactPreference: {
    type: DataTypes.ENUM('phone', 'email', 'sms'),
    defaultValue: 'phone',
  },
  certificateIssued: DataTypes.BOOLEAN,
  rewardPoints: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['bloodType'] },
    { fields: ['status'] },
  ],
});

Object.defineProperty(Donor.prototype, 'age', {
  get() {
    const today = new Date();
    let age = today.getFullYear() - this.dateOfBirth.getFullYear();
    const monthDiff = today.getMonth() - this.dateOfBirth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < this.dateOfBirth.getDate())) {
      age--;
    }
    return age;
  },
});

export default Donor;