import { signAccessToken } from './src/auth/token-service';

async function run() {
  console.log('--- 1. POST /api/v1/auth/send-otp ---');
  try {
    const res1 = await fetch('http://localhost:3000/api/v1/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneE164: '+919999999999' })
    });
    console.log('Status:', res1.status);
    console.log('Body:', await res1.json());
  } catch (err) {
    console.error('Failed:', err);
  }

  console.log('\n--- 2. GET /api/v1/location/nearby ---');
  try {
    // Generate an access token for a normal user
    const normalToken = signAccessToken({ userId: '11111111-1111-1111-1111-111111111111', role: 'driver' });
    const res2 = await fetch('http://localhost:3000/api/v1/location/nearby?lat=28.6139&lng=77.2090&radius=10&type=dhaba', {
      headers: { 'Authorization': `Bearer ${normalToken}` }
    });
    console.log('Status:', res2.status);
    console.log('Body:', await res2.json());
  } catch (err) {
    console.error('Failed:', err);
  }

  console.log('\n--- 3. GET /api/v1/admin/stats ---');
  try {
    // Generate an access token for an admin
    const adminToken = signAccessToken({ userId: '22222222-2222-2222-2222-222222222222', role: 'admin' });
    const res3 = await fetch('http://localhost:3000/api/v1/admin/stats', {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    console.log('Status:', res3.status);
    console.log('Body:', await res3.json());
  } catch (err) {
    console.error('Failed:', err);
  }
}

run();
