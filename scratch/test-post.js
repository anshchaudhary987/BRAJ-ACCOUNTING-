const http = require('http');

const data = JSON.stringify({
  name: "New Test Company",
  state: "Delhi",
  gstin: "07AAAAA0000A1Z5",
  pan: "AAAAA0000A",
  financialYearStart: "2024-04-01",
  booksBeginningDate: "2024-04-01"
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/company',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('BODY:', body);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
