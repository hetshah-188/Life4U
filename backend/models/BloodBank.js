import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BloodBank = sequelize.define('BloodBank', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  registrationNumber: DataTypes.STRING,
  licenseNumber: DataTypes.STRING,
  licenseExpiryDate: DataTypes.DATE,
  street: DataTypes.STRING,
  city: DataTypes.STRING,
  state: DataTypes.STRING,
  pincode: DataTypes.STRING,
  country: DataTypes.STRING,
  latitude: DataTypes.DECIMAL(10, 8),
  longitude: DataTypes.DECIMAL(11, 8),
  mondayOpen: DataTypes.STRING,
  mondayClose: DataTypes.STRING,
  tuesdayOpen: DataTypes.STRING,
  tuesdayClose: DataTypes.STRING,
  wednesdayOpen: DataTypes.STRING,
  wednesdayClose: DataTypes.STRING,
  thursdayOpen: DataTypes.STRING,
  thursdayClose: DataTypes.STRING,
  fridayOpen: DataTypes.STRING,
  fridayClose: DataTypes.STRING,
  saturdayOpen: DataTypes.STRING,
  saturdayClose: DataTypes.STRING,
  sundayOpen: DataTypes.STRING,
  sundayClose: DataTypes.STRING,
  maxStorage: DataTypes.INTEGER,
  currentUsage: DataTypes.INTEGER,
  storageTemperature: DataTypes.DECIMAL(5, 2),
  staffCount: DataTypes.INTEGER,
  isAccredited: DataTypes.BOOLEAN,
  accreditationBody: DataTypes.STRING,
  accreditationValidUntil: DataTypes.DATE,
  totalUnits: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  emergencyContactName: DataTypes.STRING,
  emergencyContactPhone: DataTypes.STRING,
  emergencyContactEmail: DataTypes.STRING,
  website: DataTypes.STRING,
  facebook: DataTypes.STRING,
  twitter: DataTypes.STRING,
  instagram: DataTypes.STRING,
  services: DataTypes.TEXT,
  certifications: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active',
  },
  notes: DataTypes.TEXT,
}, {
  timestamps: true,
  indexes: [
    { fields: ['city', 'status'] },
  ],
});

export default BloodBank;