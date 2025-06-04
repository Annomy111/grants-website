// Check the full output quality
async function checkFullOutput() {
  console.log('🔍 Checking Full Blog Output Quality...\n');
  
  const BASE_URL = 'http://localhost:5001';
  
  try {
    // Login
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    
    // Generate with DeepSeek R1
    const generateResponse = await fetch(`${BASE_URL}/api/blog-generation/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        parameters: {
          topic: "German-Ukrainian Civil Society Partnership Evolution",
          tone: "professional",
          length: "long",
          language: "en",
          includeStatistics: true,
          includeMedia: true
        }
      })
    });
    
    if (generateResponse.ok) {
      const data = await generateResponse.json();
      
      console.log('📋 FULL OUTPUT ANALYSIS:');
      console.log('Title:', data.title);
      console.log('Author:', data.author);
      console.log('Content Length:', data.content?.length || 0, 'characters');
      console.log('Summary Length:', data.summary?.length || 0, 'characters');
      
      // Check for quality indicators
      const content = data.content || '';
      const wordCount = content.split(/\s+/).length;
      const hasExpertVoice = content.includes('Mattia') || content.includes('DUB');
      const hasSpecifics = content.includes('€') || content.includes('EU') || content.includes('Germany');
      const hasProperHTML = content.includes('<h1>') && content.includes('<h2>') && content.includes('<p>');
      
      console.log('\n🎯 QUALITY METRICS:');
      console.log('- Word Count:', wordCount, 'words');
      console.log('- Expert Voice Present:', hasExpertVoice ? '✅' : '❌');
      console.log('- Specific Details:', hasSpecifics ? '✅' : '❌');
      console.log('- Proper HTML:', hasProperHTML ? '✅' : '❌');
      
      // Show first 1000 characters
      console.log('\n📖 CONTENT PREVIEW:');
      console.log(content.substring(0, 1000) + '...\n');
      
      // Show last 500 characters
      console.log('📜 CONTENT ENDING:');
      console.log('...' + content.substring(content.length - 500));
      
    } else {
      console.log('❌ Generation failed');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkFullOutput().catch(console.error);