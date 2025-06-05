const axios = require('axios');

const BASE_URL = 'https://civil-society-grants-database.netlify.app';

async function testLiveChatWidget() {
  console.log('🎯 Testing Live Chat Widget Functionality\n');
  
  try {
    // Test 1: Chat API endpoint directly
    console.log('1. Testing chat API endpoint...');
    const chatResponse = await axios.post(`${BASE_URL}/.netlify/functions/chat`, {
      message: "Hi, show me grants for NGOs working on human rights",
      conversationId: `test-${Date.now()}`
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000
    });
    
    if (chatResponse.status === 200) {
      const response = chatResponse.data;
      console.log('✅ Chat API: Working correctly');
      console.log(`   Response length: ${response.response?.length || 0} characters`);
      console.log(`   Grants found: ${response.recommendedGrants?.length || 0}`);
      
      if (response.response) {
        console.log(`   Sample response: "${response.response.substring(0, 100)}..."`);
      }
      
      if (response.recommendedGrants && response.recommendedGrants.length > 0) {
        console.log(`   Sample grant: "${response.recommendedGrants[0].grant_name}"`);
      }
    }
    
    // Test 2: Test different message types
    console.log('\n2. Testing various chat scenarios...');
    
    const testMessages = [
      "What grants are available for women's organizations?",
      "Show me education funding opportunities",
      "Привіт, які є гранти для молодіжних організацій?", // Ukrainian
      "What are the upcoming deadlines?",
      "I need funding under $10,000"
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < testMessages.length; i++) {
      try {
        const testResponse = await axios.post(`${BASE_URL}/.netlify/functions/chat`, {
          message: testMessages[i],
          conversationId: `test-scenario-${i}-${Date.now()}`
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });
        
        if (testResponse.status === 200 && testResponse.data.response) {
          successCount++;
          console.log(`   ✅ Scenario ${i + 1}: ${testResponse.data.response.length} char response`);
        }
      } catch (error) {
        console.log(`   ❌ Scenario ${i + 1}: Failed - ${error.message}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 Chat Scenarios Results: ${successCount}/${testMessages.length} successful`);
    
    // Test 3: Verify grants data availability
    console.log('\n3. Verifying grants database access...');
    const grantsResponse = await axios.get(`${BASE_URL}/data/grants.json`);
    
    if (grantsResponse.status === 200) {
      const grants = grantsResponse.data;
      console.log(`✅ Grants database: ${grants.length} grants available`);
      
      // Check data quality
      const grantsWithNames = grants.filter(g => g.grant_name && g.grant_name.trim());
      const grantsWithOrgs = grants.filter(g => g.funding_organization && g.funding_organization.trim());
      
      console.log(`   Grants with names: ${grantsWithNames.length}/${grants.length}`);
      console.log(`   Grants with organizations: ${grantsWithOrgs.length}/${grants.length}`);
    }
    
    // Test 4: Frontend accessibility check
    console.log('\n4. Testing frontend integration...');
    
    // Test if main pages are accessible
    const pages = ['/', '/grants', '/about', '/blog'];
    let pageSuccessCount = 0;
    
    for (const page of pages) {
      try {
        const pageResponse = await axios.get(`${BASE_URL}${page}`, {
          timeout: 10000,
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ChatWidgetTest/1.0)' }
        });
        
        if (pageResponse.status === 200 && pageResponse.data.includes('react')) {
          pageSuccessCount++;
          console.log(`   ✅ Page ${page}: Accessible`);
        }
      } catch (error) {
        console.log(`   ❌ Page ${page}: ${error.message}`);
      }
    }
    
    console.log(`\n📊 Page Accessibility: ${pageSuccessCount}/${pages.length} pages accessible`);
    
    // Summary
    console.log('\n🎉 CHAT WIDGET TEST SUMMARY');
    console.log('================================');
    
    const totalTests = 3; // API, scenarios success rate, grants data
    let passedTests = 0;
    
    if (chatResponse.status === 200) {
      passedTests++;
      console.log('✅ Chat API endpoint: WORKING');
    }
    
    if (successCount >= testMessages.length * 0.8) { // 80% success rate
      passedTests++;
      console.log('✅ Chat scenarios: WORKING');
    } else {
      console.log('⚠️  Chat scenarios: PARTIAL');
    }
    
    if (grantsResponse.status === 200) {
      passedTests++;
      console.log('✅ Grants database: WORKING');
    }
    
    console.log(`\nOverall Status: ${passedTests}/${totalTests} components working`);
    
    if (passedTests === totalTests) {
      console.log('\n🚀 SUCCESS: Chat widget is fully functional!');
      console.log('\n📱 User Instructions:');
      console.log('1. Visit any page on the site');
      console.log('2. Look for blue chat button in bottom-right corner');
      console.log('3. Click to open chat widget');
      console.log('4. Type questions about grants and funding');
      console.log('5. Receive AI-powered responses with grant recommendations');
      
      console.log('\n💬 Example questions to try:');
      console.log('• "What grants are available for NGOs?"');
      console.log('• "Show me education funding opportunities"');
      console.log('• "I need funding under $50,000"');
      console.log('• "What are the upcoming deadlines?"');
    } else {
      console.log('\n⚠️  Some components need attention - check individual test results above');
    }
    
  } catch (error) {
    console.error('\n💥 Critical error during testing:', error.message);
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testLiveChatWidget();