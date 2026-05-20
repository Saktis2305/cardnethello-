const http = require('http');

http.get('http://localhost:3000/api/config?retry=true', (res) => {
  let data = '';
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`BODY: ${data}`);
  });
}).on('error', (e) => {
  console.error(`Got error: ${e.message}`);
});
