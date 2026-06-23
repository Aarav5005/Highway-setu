const { StorageClient } = require('@supabase/storage-js');
require('dotenv').config();

const storage = new StorageClient(`${process.env.SUPABASE_URL}/storage/v1`, {
  apikey: process.env.SUPABASE_SERVICE_KEY,
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
});

async function run() {
  const bucketName = process.env.STORAGE_BUCKET;
  const fileName = `test-upload-${Date.now()}.txt`;
  
  console.log('Testing upload...');
  const { data: uploadData, error: uploadError } = await storage
    .from(bucketName)
    .upload(fileName, 'Hello world', {
      contentType: 'text/plain',
      upsert: true
    });
    
  if (uploadError) {
    console.error('Upload failed:', uploadError);
    return;
  }
  console.log('Upload success:', uploadData);
  
  console.log('Testing delete...');
  const { data: deleteData, error: deleteError } = await storage
    .from(bucketName)
    .remove([fileName]);
    
  if (deleteError) {
    console.error('Delete failed:', deleteError);
    return;
  }
  console.log('Delete success:', deleteData);
}

run().catch(console.error);
