import axios from 'axios';

const runTest = async () => {
  try {
    console.log('1. Attempting login as rahul.donor@example.com...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'rahul.donor@example.com',
      password: 'password123',
    });

    const token = loginRes.data.token;
    const user = loginRes.data.data;
    console.log(`✅ Login succeeded! Token obtained. User: ${user.name} (Role: ${user.role})`);

    // 2. Fetch donor profile to get donor ID
    console.log('2. Fetching donor profile info...');
    const donorRes = await axios.get('http://localhost:5000/api/donors', {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId: user.id }
    });
    
    if (!donorRes.data.success || donorRes.data.data.length === 0) {
      throw new Error('No donor profile found for user!');
    }
    const donor = donorRes.data.data[0];
    console.log(`✅ Donor profile fetched. Donor ID: ${donor.id}, Current Total Donations: ${donor.totalDonations}`);

    // 3. Create a pending donation appointment
    console.log('3. Posting pending donation (appointment)...');
    const bookingRes = await axios.post('http://localhost:5000/api/donations', {
      donorId: donor.id,
      bloodType: user.bloodType || 'O+',
      units: 1,
      hospital: 'Westside Pulse Station',
      weight: donor.weight || 70,
      notes: 'Appointment. Stream: Plasma',
      status: 'pending',
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Booking response status:', bookingRes.status);
    console.log('✅ Response Body:', JSON.stringify(bookingRes.data, null, 2));

    // 4. Verify that totalDonations did NOT increment for pending status
    console.log('4. Re-fetching donor profile to verify stats...');
    const donorResCheck = await axios.get('http://localhost:5000/api/donors', {
      headers: { Authorization: `Bearer ${token}` },
      params: { userId: user.id }
    });
    const donorCheck = donorResCheck.data.data[0];
    console.log(`✅ Donor check - Total Donations: ${donorCheck.totalDonations}`);
    if (donorCheck.totalDonations === donor.totalDonations) {
      console.log('🎉 SUCCESS: totalDonations was NOT incremented for a pending appointment!');
    } else {
      console.error('❌ FAILURE: totalDonations was incremented for a pending appointment!');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

runTest();
