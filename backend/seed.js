import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database.js';
import User from './models/User.js';
import Donor from './models/Donor.js';
import BloodBank from './models/BloodBank.js';
import BloodInventory from './models/BloodInventory.js';
import BloodRequest from './models/BloodRequest.js';
import Donation from './models/Donation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dummyDataDir = path.join(__dirname, '../dummy data');

function mongoIdToUuid(mongoId) {
  if (!mongoId) return null;
  const idStr = typeof mongoId === 'object' && mongoId['$oid'] ? mongoId['$oid'] : mongoId;
  if (typeof idStr !== 'string') return idStr;
  const hex = idStr.replace(/[^a-f0-9]/gi, '').toLowerCase();
  if (hex.length !== 24) return idStr;
  const padded = '00000000' + hex;
  return `${padded.substring(0, 8)}-${padded.substring(8, 12)}-${padded.substring(12, 16)}-${padded.substring(16, 20)}-${padded.substring(20, 32)}`;
}

function parseDate(mongoDate) {
  if (!mongoDate) return null;
  if (typeof mongoDate === 'object' && mongoDate['$date']) {
    return new Date(mongoDate['$date']);
  }
  return new Date(mongoDate);
}

const seed = async () => {
  try {
    console.log('Connecting to PostgreSQL...');
    await sequelize.authenticate();
    console.log('✅ Connected.');

    console.log('Syncing database tables (destroy and rebuild)...');
    await sequelize.sync({ force: true });
    console.log('✅ Tables Re-created.');

    // 1. Users
    console.log('Seeding Users...');
    const usersRaw = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'users.json'), 'utf8'));
    const users = usersRaw.map(u => ({
      id: mongoIdToUuid(u._id),
      name: u.name,
      email: u.email,
      password: u.password,
      phone: u.phone,
      role: u.role,
      status: u.status || 'active',
      isVerified: u.isVerified || false,
      address: u.address,
      city: u.city,
      state: u.state,
      pincode: u.pincode,
      createdAt: parseDate(u.createdAt) || new Date(),
      updatedAt: parseDate(u.updatedAt) || new Date(),
      patientId: u.role === 'recipient' ? `PAT-${Math.floor(100000 + Math.random() * 900000)}` : null
    }));
    await User.bulkCreate(users, { hooks: false });
    console.log(`✅ Loaded ${users.length} Users.`);

    // 2. Donors
    console.log('Seeding Donors...');
    const donorsRaw = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'donors.json'), 'utf8'));
    const donors = donorsRaw.map(d => ({
      id: mongoIdToUuid(d._id),
      userId: mongoIdToUuid(d.userId),
      bloodType: d.bloodType,
      dateOfBirth: parseDate(d.dateOfBirth),
      weight: d.weight,
      height: d.height,
      gender: d.gender,
      hasHighBloodPressure: d.medicalHistory?.hasHighBloodPressure || false,
      hasDiabetes: d.medicalHistory?.hasDiabetes || false,
      hasHeartDisease: d.medicalHistory?.hasHeartDisease || false,
      hasBleeding: d.medicalHistory?.hasBleeding || false,
      hasInfection: d.medicalHistory?.hasInfection || false,
      medications: d.medicalHistory?.medications || '',
      allergies: d.medicalHistory?.allergies || '',
      lastCheckupDate: parseDate(d.medicalHistory?.lastCheckupDate),
      totalDonations: d.donationHistory?.totalDonations || 0,
      lastDonationDate: parseDate(d.donationHistory?.lastDonationDate),
      nextEligibleDate: parseDate(d.donationHistory?.nextEligibleDate),
      status: d.status || 'eligible',
      reasonForIneligibility: d.reasonForIneligibility || '',
      address: d.location?.address || '',
      city: d.location?.city || '',
      state: d.location?.state || '',
      pincode: d.location?.pincode || '',
      availability: d.availability || 'on_demand',
      preferredDonationCenter: d.preferredDonationCenter || '',
      contactPreference: d.contactPreference || 'phone',
      rewardPoints: d.rewardPoints || 0,
      createdAt: parseDate(d.createdAt) || new Date(),
      updatedAt: parseDate(d.updatedAt) || new Date()
    }));
    await Donor.bulkCreate(donors);
    console.log(`✅ Loaded ${donors.length} Donors.`);

    // 3. Blood Banks
    console.log('Seeding Blood Banks...');
    const banksRaw = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'blood_banks.json'), 'utf8'));
    const banks = banksRaw.map(b => ({
      id: mongoIdToUuid(b._id),
      name: b.name,
      email: b.email,
      phone: b.phone,
      registrationNumber: b.registrationNumber,
      licenseNumber: b.licenseNumber,
      licenseExpiryDate: parseDate(b.licenseExpiryDate),
      street: b.address?.street || '',
      city: b.address?.city || '',
      state: b.address?.state || '',
      pincode: b.address?.pincode || '',
      country: b.address?.country || '',
      latitude: b.coordinates?.latitude || 0,
      longitude: b.coordinates?.longitude || 0,
      mondayOpen: b.operatingHours?.monday?.open || '08:00 AM',
      mondayClose: b.operatingHours?.monday?.close || '08:00 PM',
      tuesdayOpen: b.operatingHours?.tuesday?.open || '08:00 AM',
      tuesdayClose: b.operatingHours?.tuesday?.close || '08:00 PM',
      wednesdayOpen: b.operatingHours?.wednesday?.open || '08:00 AM',
      wednesdayClose: b.operatingHours?.wednesday?.close || '08:00 PM',
      thursdayOpen: b.operatingHours?.thursday?.open || '08:00 AM',
      thursdayClose: b.operatingHours?.thursday?.close || '08:00 PM',
      fridayOpen: b.operatingHours?.friday?.open || '08:00 AM',
      fridayClose: b.operatingHours?.friday?.close || '08:00 PM',
      saturdayOpen: b.operatingHours?.saturday?.open || '09:00 AM',
      saturdayClose: b.operatingHours?.saturday?.close || '05:00 PM',
      sundayOpen: b.operatingHours?.sunday?.open || '10:00 AM',
      sundayClose: b.operatingHours?.sunday?.close || '02:00 PM',
      maxStorage: b.capacity?.maxStorage || 5000,
      currentUsage: b.capacity?.currentUsage || 0,
      storageTemperature: b.capacity?.storageTemperature || 4,
      staffCount: b.staffCount || 0,
      isAccredited: b.accreditation?.isAccredited || false,
      accreditationBody: b.accreditation?.accreditationBody || '',
      accreditationValidUntil: parseDate(b.accreditation?.validUntil),
      totalUnits: b.inventory?.totalUnits || 0,
      emergencyContactName: b.emergencyContact?.name || '',
      emergencyContactPhone: b.emergencyContact?.phone || '',
      emergencyContactEmail: b.emergencyContact?.email || '',
      website: b.website || '',
      facebook: b.socialMedia?.facebook || '',
      twitter: b.socialMedia?.twitter || '',
      instagram: b.socialMedia?.instagram || '',
      services: b.services?.join(',') || '',
      certifications: b.certifications?.join(',') || '',
      status: b.status || 'active',
      notes: b.notes || '',
      createdAt: parseDate(b.createdAt) || new Date(),
      updatedAt: parseDate(b.updatedAt) || new Date()
    }));
    await BloodBank.bulkCreate(banks);
    console.log(`✅ Loaded ${banks.length} Blood Banks.`);

    // 4. Blood Requests
    console.log('Seeding Blood Requests...');
    const requestsRaw = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'blood_requests.json'), 'utf8'));
    const requests = requestsRaw.map(r => ({
      id: mongoIdToUuid(r._id),
      requesterId: mongoIdToUuid(r.requesterId),
      requesterName: r.requesterName,
      requesterPhone: r.requesterPhone,
      requesterEmail: r.requesterEmail,
      bloodType: r.bloodType,
      quantity: r.quantity,
      unit: r.unit || 'bags',
      reason: r.reason || 'general',
      description: r.description || '',
      urgency: r.urgency || 'routine',
      status: r.status || 'pending',
      requestDate: parseDate(r.requestDate) || new Date(),
      requiredByDate: parseDate(r.requiredByDate),
      approvedDate: parseDate(r.approvedDate),
      rejectionReason: r.rejectionReason || '',
      fulfillmentDate: parseDate(r.fulfillmentDate),
      recipientName: r.recipientDetails?.name || '',
      recipientAge: r.recipientDetails?.age || null,
      recipientGender: r.recipientDetails?.gender || '',
      hospitalName: r.recipientDetails?.hospitalName || r.location?.hospital || '',
      doctorName: r.recipientDetails?.doctorName || '',
      medicalReason: r.recipientDetails?.medicalReason || '',
      address: r.location?.address || '',
      city: r.location?.city || '',
      state: r.location?.state || '',
      pincode: r.location?.pincode || '',
      approvedBy: mongoIdToUuid(r.approvedBy),
      priority: r.priority || 0,
      createdAt: parseDate(r.createdAt) || new Date(),
      updatedAt: parseDate(r.updatedAt) || new Date()
    }));
    await BloodRequest.bulkCreate(requests);
    console.log(`✅ Loaded ${requests.length} Blood Requests.`);

    // 5. Blood Inventory
    console.log('Seeding Blood Inventory...');
    const inventoryRaw = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'blood_inventory.json'), 'utf8'));
    const inventory = inventoryRaw.map(i => ({
      id: mongoIdToUuid(i._id),
      bloodType: i.bloodType,
      quantity: i.quantity,
      unit: i.unit || 'bags',
      volume: i.volume || 450,
      collectionDate: parseDate(i.collectionDate),
      expiryDate: parseDate(i.expiryDate),
      donorId: mongoIdToUuid(i.donorId),
      donorName: i.donorName,
      donorPhone: i.donorPhone,
      status: i.status || 'available',
      bloodTyping: i.testResults?.bloodTyping || '',
      rhesusFactor: i.testResults?.rhesusFactor || '',
      hiv: i.testResults?.hiv || 'pending',
      hepatitisB: i.testResults?.hepatitisB || 'pending',
      hepatitisC: i.testResults?.hepatitisC || 'pending',
      syphilis: i.testResults?.syphilis || 'pending',
      malaria: i.testResults?.malaria || 'pending',
      testDate: parseDate(i.testResults?.testDate),
      testRemarks: i.testResults?.remarks || '',
      storageLocation: i.storage?.location || '',
      storageShelf: i.storage?.shelf || '',
      temperature: i.storage?.temperature || 4,
      createdAt: parseDate(i.createdAt) || new Date(),
      updatedAt: parseDate(i.updatedAt) || new Date()
    }));
    await BloodInventory.bulkCreate(inventory);
    console.log(`✅ Loaded ${inventory.length} Blood Inventory items.`);

    // 6. Donations
    console.log('Seeding Donations...');
    const donationsRaw = JSON.parse(fs.readFileSync(path.join(dummyDataDir, 'donations.json'), 'utf8'));
    
    const donations = [];
    for (const d of donationsRaw) {
      const uId = mongoIdToUuid(d.donorId);
      const donor = await Donor.findOne({ where: { userId: uId } });
      const donorIdVal = donor ? donor.id : uId;
      
      donations.push({
        id: mongoIdToUuid(d._id),
        donorId: donorIdVal,
        bloodType: d.bloodType,
        units: d.units || 1,
        hospital: d.hospital || '',
        donationDate: parseDate(d.donationDate),
        status: d.status || 'pending',
        weight: d.weight || null,
        pointsEarned: d.pointsEarned || 10,
        notes: d.notes || '',
        createdAt: parseDate(d.createdAt) || new Date(),
        updatedAt: parseDate(d.updatedAt) || new Date()
      });
    }
    await Donation.bulkCreate(donations);
    console.log(`✅ Loaded ${donations.length} Donations.`);

    console.log('\n🎉 Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seed();
