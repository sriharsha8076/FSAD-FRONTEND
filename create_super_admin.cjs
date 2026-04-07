const https = require('https');

const data = JSON.stringify({
  name: 'Harsha (Creator)',
  email: 'harsha21@saams.com',
  password: 'Harsha@0821',
  role: 'SUPER_ADMIN',
  dob: '2000-01-01',
  mobileNo: '9999999999'
});

const options = {
  hostname: 'fsad-backend-production.up.railway.app',
  port: 443,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let responseBody = '';
  res.on('data', (chunk) => {
    responseBody += chunk;
  });
  res.on('end', () => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Response: ${responseBody}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
