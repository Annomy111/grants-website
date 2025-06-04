const https = require('https');

function testAuthDirect() {
  console.log('🔐 Testing Auth Function Directly');
  console.log('=================================');

  const postData = JSON.stringify({
    username: 'admin',
    password: 'admin123'
  });

  const options = {
    hostname: 'civil-society-grants-database.netlify.app',
    port: 443,
    path: '/.netlify/functions/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const req = https.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    console.log(`Headers:`, res.headers);

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Response Body:', data);
      
      try {
        const parsed = JSON.parse(data);
        console.log('Parsed Response:', JSON.stringify(parsed, null, 2));
        
        if (parsed.token) {
          console.log('✅ Auth function working - got token!');
        } else {
          console.log('❌ No token in response');
        }
      } catch (e) {
        console.log('❌ Response not valid JSON');
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

testAuthDirect();