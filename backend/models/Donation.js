import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  donorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Donors',
      key: 'id',
    },
  },
  bloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: false,
  },
  units: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
  hospital: DataTypes.STRING,
  donationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'rejected'),
    defaultValue: 'pending',
  },
  weight: DataTypes.INTEGER,
  pointsEarned: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
  },
  notes: DataTypes.TEXT,
}, {
  timestamps: true,
  indexes: [
    { fields: ['donorId'] },
    { fields: ['status'] },
    { fields: ['bloodType'] },
  ],
});

export default Donation;