const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/auth/role',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTEzNmNjYi01ZTQ4LTRiMGQtYTc0My05NWQyNGE3NWZiOGYiLCJyb2xlIjoiZHJpdmVyIiwidG9rZW5UeXBlIjoiYWNjZXNzIiwianRpIjoiMmFhODdiZGEtZjY2Zi00YWMyLTk1YmEtNjdmODBkNjgyZjhiIiwiaWF0IjoxNzgyNDY5OTU1LCJleHAiOjE3ODI0NzA4NTV9.xlOs3HA5zwqQSsM6nVLsTIAVayohMAhdxwIIqZkQWDM'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('auth/role:', res.statusCode, data));
});
req.write(JSON.stringify({ role: 'driver', userId: '5e136ccb-5e48-4b0d-a743-95d24a75fb8f' }));
req.end();
