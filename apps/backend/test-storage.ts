import { env } from './src/config/env';

async function testStorage() {
  const serviceKey = env.SUPABASE_SERVICE_KEY;
  if (!serviceKey || !env.SUPABASE_URL) {
    console.error('Storage provider is not configured');
    return;
  }

  const url = `${env.SUPABASE_URL}/storage/v1/bucket`;
  console.log('Fetching buckets from:', url);
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Failed to fetch buckets:', response.status, errorText);
    return;
  }

  const buckets = await response.json();
  console.log('Buckets:', buckets.map((b: any) => b.name));

  // Check if dhabas bucket exists
  const hasDhabas = buckets.some((b: any) => b.name === 'dhabas');
  if (!hasDhabas) {
    console.log('Bucket "dhabas" does not exist. Creating...');
    const createRes = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: 'dhabas', name: 'dhabas', public: true }),
    });
    if (!createRes.ok) {
      console.error('Failed to create bucket:', await createRes.text());
    } else {
      console.log('Bucket created successfully!');
    }
  }
}

testStorage().catch(console.error);
