import { uploadToStorage } from './src/integrations/storage.js';
import { env } from './src/config/env.js';

async function run() {
  const fileData = Buffer.from('Hello, world!');
  const mimeType = 'image/jpeg';
  
  console.log('Testing Supabase storage upload...');
  try {
    const url = await uploadToStorage({
      bucket: env.STORAGE_BUCKET,
      path: `test-${Date.now()}.txt`,
      body: fileData,
      contentType: mimeType
    });
    console.log('Upload success! URL:', url);
    
    // Now delete it using fetch
    const fileName = url.split('/').pop();
    const deleteUrl = `${env.SUPABASE_URL}/storage/v1/object/${env.STORAGE_BUCKET}/${fileName}`;
    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      }
    });
    
    if (!res.ok) {
      console.error('Delete failed:', await res.text());
    } else {
      console.log('Delete success!');
    }
  } catch (err) {
    console.error('Failed:', err);
  }
}

run();
