require('dotenv').config();
const axios = require('axios');

async function testSimpleChat() {
  console.log('Testing simple chat...');
  
  try {
    const response = await axios.post('https://api.deepseek.com/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: 'Hello, can you help me with grants?'
        }
      ],
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('Success!');
    console.log('Response:', response.data.choices[0].message.content);
    
  } catch (error) {
    console.log('Failed!');
    console.log('Error message:', error.message);
    console.log('Error code:', error.code);
    console.log('Response status:', error.response?.status);
    console.log('Response data:', error.response?.data);
  }
}

testSimpleChat();