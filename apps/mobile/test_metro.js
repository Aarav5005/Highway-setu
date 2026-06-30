const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8081,
  path: '/index.bundle?platform=android&dev=true',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Metro:', res.statusCode, data.substring(0, 500)));
});
req.on('error', e => console.error(e));
req.end();
