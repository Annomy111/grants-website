const axios = require('axios');

const PRODUCTION_URL = 'https://civil-society-grants-database.netlify.app';
const CHAT_API_URL = `${PRODUCTION_URL}/.netlify/functions/chat`;

class LiveChatTester {
  constructor() {
    this.testResults = [];
    this.errors = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, message, type };
    this.testResults.push(logEntry);
    console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    const errorEntry = { timestamp, message, error: error?.message || error, type: 'error' };
    this.errors.push(errorEntry);
    console.error(`[${timestamp}] [ERROR] ${message}`, error ? error.message : '');
  }

  async testSiteAccessibility() {
    this.log('=== Testing Site Accessibility ===');
    
    try {
      const response = await axios.get(PRODUCTION_URL, { 
        timeout: 10000 
      });
      
      if (response.status === 200) {
        this.log(`✅ Site accessible - Status: ${response.status}`);
        const html = response.data;
        
        // Check if chat widget code is present
        if (html.includes('GrantsChatWidget') || html.includes('chat')) {
          this.log('✅ Chat widget code detected in HTML');
        } else {
          this.log('⚠️ Chat widget code not found in HTML');
        }
        
        return true;
      } else {
        this.error(`❌ Site not accessible - Status: ${response.status}`);
        return false;
      }
    } catch (error) {
      this.error('❌ Failed to access site', error);
      return false;
    }
  }

  async testChatAPIDirectly() {
    this.log('=== Testing Chat API Directly ===');
    
    const testMessages = [
      {
        message: "Hello",
        language: "en",
        description: "Basic greeting test"
      },
      {
        message: "Show me grants for NGOs",
        language: "en", 
        description: "Grant search test"
      },
      {
        message: "Привіт",
        language: "uk",
        description: "Ukrainian greeting test"
      },
      {
        message: "Покажіть гранти для НГО",
        language: "uk",
        description: "Ukrainian grant search test"
      }
    ];

    for (const testCase of testMessages) {
      try {
        this.log(`Testing: ${testCase.description} - "${testCase.message}"`);
        
        const startTime = Date.now();
        const response = await axios.post(CHAT_API_URL, {
          message: testCase.message,
          language: testCase.language,
          conversationHistory: []
        }, {
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200) {
          this.log(`✅ API Response successful (${responseTime}ms)`);
          this.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
          
          // Validate response structure
          if (response.data.response) {
            this.log('✅ Response contains message text');
          } else {
            this.log('⚠️ Response missing message text');
          }
          
          if (response.data.sessionId) {
            this.log('✅ Session ID provided');
          } else {
            this.log('⚠️ No session ID provided');
          }
          
          if (response.data.recommendedGrants) {
            this.log(`✅ Recommended grants: ${response.data.recommendedGrants.length} items`);
          }
          
        } else {
          this.error(`❌ API returned status ${response.status}`);
        }
        
      } catch (error) {
        this.error(`❌ API call failed for "${testCase.message}"`, error);
        
        if (error.response) {
          this.log(`Response status: ${error.response.status}`);
          this.log(`Response data: ${JSON.stringify(error.response.data, null, 2)}`);
        }
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async testChatAPIErrors() {
    this.log('=== Testing Chat API Error Handling ===');
    
    const errorTests = [
      {
        payload: {},
        description: "Empty payload"
      },
      {
        payload: { message: "" },
        description: "Empty message"
      },
      {
        payload: { message: "test", invalidField: "invalid" },
        description: "Invalid field"
      }
    ];

    for (const test of errorTests) {
      try {
        this.log(`Testing error case: ${test.description}`);
        
        const response = await axios.post(CHAT_API_URL, test.payload, {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        this.log(`Response status: ${response.status}`);
        this.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
        
      } catch (error) {
        if (error.response && error.response.status >= 400) {
          this.log(`✅ Properly handled error case - Status: ${error.response.status}`);
          this.log(`Error response: ${JSON.stringify(error.response.data, null, 2)}`);
        } else {
          this.error(`❌ Unexpected error for "${test.description}"`, error);
        }
      }
    }
  }

  async testChatAPIPerformance() {
    this.log('=== Testing Chat API Performance ===');
    
    const performanceTests = [];
    const testMessage = "Show me grants for human rights organizations";
    
    // Run 5 concurrent requests
    for (let i = 0; i < 5; i++) {
      performanceTests.push(this.measureResponseTime(testMessage, i + 1));
    }
    
    try {
      const results = await Promise.all(performanceTests);
      const responseTimes = results.filter(r => r.success).map(r => r.responseTime);
      
      if (responseTimes.length > 0) {
        const avgTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
        const maxTime = Math.max(...responseTimes);
        const minTime = Math.min(...responseTimes);
        
        this.log(`✅ Performance test completed:`);
        this.log(`   - Successful requests: ${responseTimes.length}/5`);
        this.log(`   - Average response time: ${avgTime.toFixed(0)}ms`);
        this.log(`   - Min response time: ${minTime}ms`);
        this.log(`   - Max response time: ${maxTime}ms`);
        
        if (avgTime > 10000) {
          this.log('⚠️ Average response time is high (>10s)');
        }
      } else {
        this.error('❌ All performance test requests failed');
      }
    } catch (error) {
      this.error('❌ Performance test failed', error);
    }
  }

  async measureResponseTime(message, requestId) {
    try {
      const startTime = Date.now();
      const response = await axios.post(CHAT_API_URL, {
        message: message,
        language: "en",
        conversationHistory: []
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const responseTime = Date.now() - startTime;
      this.log(`Request ${requestId}: ${responseTime}ms - Status: ${response.status}`);
      
      return { success: true, responseTime, requestId };
    } catch (error) {
      this.error(`Request ${requestId} failed`, error);
      return { success: false, requestId, error: error.message };
    }
  }

  async testNetworkConnectivity() {
    this.log('=== Testing Network Connectivity ===');
    
    // Test various endpoints
    const endpoints = [
      { url: `${PRODUCTION_URL}/.netlify/functions/grants`, name: 'Grants API' },
      { url: `${PRODUCTION_URL}/.netlify/functions/auth`, name: 'Auth API' },
      { url: `${PRODUCTION_URL}/data/grants.json`, name: 'Grants Data' }
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await axios.head(endpoint.url, { 
          timeout: 5000 
        });
        
        if (response.status === 200) {
          this.log(`✅ ${endpoint.name} accessible - Status: ${response.status}`);
        } else {
          this.log(`⚠️ ${endpoint.name} returned status: ${response.status}`);
        }
      } catch (error) {
        this.log(`❌ ${endpoint.name} not accessible - ${error.message}`);
      }
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Live Chat Widget Testing');
    this.log(`Target URL: ${PRODUCTION_URL}`);
    this.log(`Chat API: ${CHAT_API_URL}`);
    
    const startTime = Date.now();
    
    // Run all test suites
    await this.testSiteAccessibility();
    await this.testNetworkConnectivity();
    await this.testChatAPIDirectly();
    await this.testChatAPIErrors();
    await this.testChatAPIPerformance();
    
    const totalTime = Date.now() - startTime;
    
    // Generate summary report
    this.generateSummaryReport(totalTime);
  }

  generateSummaryReport(totalTime) {
    this.log('=== SUMMARY REPORT ===');
    this.log(`Total test duration: ${(totalTime / 1000).toFixed(1)} seconds`);
    this.log(`Total test steps: ${this.testResults.length}`);
    this.log(`Errors encountered: ${this.errors.length}`);
    
    if (this.errors.length > 0) {
      this.log('\n🚨 CRITICAL ISSUES FOUND:');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error.message}`);
        if (error.error) {
          this.log(`   Details: ${error.error}`);
        }
      });
    }
    
    // Categorize issues
    const apiErrors = this.errors.filter(e => e.message.includes('API'));
    const networkErrors = this.errors.filter(e => e.message.includes('network') || e.message.includes('accessible'));
    const performanceIssues = this.testResults.filter(r => r.message.includes('high') || r.message.includes('slow'));
    
    this.log('\n📊 TEST RESULTS BREAKDOWN:');
    this.log(`- API Issues: ${apiErrors.length}`);
    this.log(`- Network Issues: ${networkErrors.length}`);
    this.log(`- Performance Issues: ${performanceIssues.length}`);
    
    if (this.errors.length === 0) {
      this.log('\n✅ ALL TESTS PASSED - Chat widget appears to be functioning correctly');
    } else {
      this.log('\n❌ ISSUES DETECTED - Chat widget may have functional problems');
    }
    
    // Save detailed report
    const reportData = {
      timestamp: new Date().toISOString(),
      testDuration: totalTime,
      totalSteps: this.testResults.length,
      errorCount: this.errors.length,
      testResults: this.testResults,
      errors: this.errors,
      summary: {
        apiErrors: apiErrors.length,
        networkErrors: networkErrors.length,
        performanceIssues: performanceIssues.length
      }
    };
    
    console.log('\n📄 DETAILED REPORT DATA:');
    console.log(JSON.stringify(reportData, null, 2));
  }
}

// Run the tests
async function runLiveTesting() {
  const tester = new LiveChatTester();
  
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runLiveTesting().catch(console.error);
}

module.exports = { LiveChatTester };