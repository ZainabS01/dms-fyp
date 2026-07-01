const http = require('http');

const data = JSON.stringify({
  email: 'zainabminhas294@gmail.com'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/send-otp',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let responseData = '';
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Response Body:', responseData);
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error);
});

req.write(data);
req.end();
