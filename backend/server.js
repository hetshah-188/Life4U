import dotenv from 'dotenv';
dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET env var is not set. Exiting.');
  process.exit(1);
}
if (!process.env.DATABASE_URL && !process.env.DB_PASSWORD) {
  console.error('FATAL: DB_PASSWORD env var is not set. Exiting.');
  process.exit(1);
}

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import sequelize from './config/database.js';

import User from './models/User.js';
import Donor from './models/Donor.js';
import Donation from './models/Donation.js';

// Define associations centrally to avoid circular imports in ESM
User.hasOne(Donor, { foreignKey: 'userId', as: 'donor' });
Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

import authRoutes from './routes/auth.js';
import donorRoutes from './routes/donors.js';
import donationRoutes from './routes/donations.js';
import inventoryRoutes from './routes/inventory.js';
import requestRoutes from './routes/requests.js';
import bloodbankRoutes from './routes/bloodbank.js';
import reportRoutes from './routes/reports.js';
import { getAdminStats } from './controllers/bloodbankController.js';
import { protect, authorize } from './middleware/auth.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://life4u.me', 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL Connected');
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✅ Models Synced');
  } catch (error) {
    console.error(`❌ Database Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/bloodbank', bloodbankRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/admin/stats', protect, authorize('admin', 'staff'), getAdminStats);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to BBMS Backend API',
    version: '1.0.0',
    status: 'Server is running',
    database: 'PostgreSQL (Sequelize ORM)',
    endpoints: {
      auth: '/api/auth',
      donors: '/api/donors',
      donations: '/api/donations',
      inventory: '/api/inventory',
      requests: '/api/requests',
      bloodbank: '/api/bloodbank',
      reports: '/api/reports',
      adminStats: '/api/admin/stats',
    },
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API: http://localhost:${PORT}/api\n`);
});

export default app;