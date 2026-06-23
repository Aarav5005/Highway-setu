const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const bucketName = process.env.STORAGE_BUCKET;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log(`Testing connection to bucket: ${bucketName}...`);
  
  const testFileName = `test-upload-${Date.now()}.jpg`;
  const fileContent = 'This is a test file for verification.';

  // Upload
  console.log(`Uploading ${testFileName}...`);
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(testFileName, fileContent, {
      contentType: 'image/jpeg',
      upsert: true
    });

  if (uploadError) {
    console.error('Upload failed:', uploadError);
    return;
  }
  console.log('Upload successful:', uploadData);

  // Delete
  console.log(`Deleting ${testFileName}...`);
  const { data: deleteData, error: deleteError } = await supabase.storage
    .from(bucketName)
    .remove([testFileName]);

  if (deleteError) {
    console.error('Delete failed:', deleteError);
    return;
  }
  console.log('Delete successful:', deleteData);
  console.log('Storage verification completed successfully!');
}

testStorage();
