const http = require('http');

async function hit(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1' + path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTEzNmNjYi01ZTQ4LTRiMGQtYTc0My05NWQyNGE3NWZiOGYiLCJyb2xlIjoiZHJpdmVyIiwidG9rZW5UeXBlIjoiYWNjZXNzIiwianRpIjoiMmFhODdiZGEtZjY2Zi00YWMyLTk1YmEtNjdmODBkNjgyZjhiIiwiaWF0IjoxNzgyNDY5OTU1LCJleHAiOjE3ODI0NzA4NTV9.xlOs3HA5zwqQSsM6nVLsTIAVayohMAhdxwIIqZkQWDM'
      }
    }, res => {
        let d='';
        res.on('data', c=>d+=c);
        res.on('end', () => resolve({s: res.statusCode, d}));
    });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  const endpoints = [
    {p: '/auth/send-otp', m: 'POST', b: {phoneE164: '+919999999999'}},
    {p: '/auth/verify-otp', m: 'POST', b: {phoneE164: '+919999999999', otpCode: '123456', verificationToken: 'test-token'}},
    {p: '/auth/me', m: 'GET'},
    {p: '/trips/active', m: 'GET'},
    {p: '/trips/history', m: 'GET'},
    {p: '/location/nearby-dhabas?lat=28&lng=77', m: 'GET'},
    {p: '/location/trip-pois?from_lat=28&from_lng=77&to_lat=29&to_lng=78', m: 'GET'}
  ];
  for (const e of endpoints) {
    const res = await hit(e.p, e.m, e.b);
    if (res.s === 500) console.log('500 ON:', e.p, res.d);
    else console.log('OK:', e.p, res.s);
  }
})();
