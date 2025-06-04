require('dotenv').config();

console.log('Working directory:', process.cwd());
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('DEEPSEEK_API_KEY length:', process.env.DEEPSEEK_API_KEY?.length || 0);
console.log('First 10 chars:', process.env.DEEPSEEK_API_KEY?.substring(0, 10) || 'none');

// Test a simple API call
const axios = require('axios');

async function testDeepSeek() {
  try {
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 20
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('API test success:', response.data.choices[0].message.content);
  } catch (error) {
    console.log('API test failed:', error.message);
    console.log('Error code:', error.code);
    console.log('Response status:', error.response?.status);
    console.log('Response data:', error.response?.data);
  }
}

testDeepSeek();