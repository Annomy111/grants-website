const axios = require('axios');

class FinalChatIntegrationTest {
  constructor() {
    this.testResults = [];
    this.errors = [];
    this.productionUrl = 'https://civil-society-grants-database.netlify.app';
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

  async testDeployedSite() {
    this.log('=== Testing Current Deployed Site ===');
    
    try {
      const response = await axios.get(this.productionUrl, { timeout: 10000 });
      
      if (response.status === 200) {
        this.log(`✅ Site accessible - Status: ${response.status}`);
        
        // Check if the HTML contains React app code
        const html = response.data;
        if (html.includes('react') || html.includes('React') || html.includes('root')) {
          this.log('✅ React app detected in HTML');
        } else {
          this.log('⚠️ React app not detected - might be an issue');
        }
        
        // Check for specific components
        if (html.includes('GrantsChatWidget') || html.includes('chat-widget')) {
          this.log('✅ Chat widget references found in HTML');
        } else {
          this.log('⚠️ Chat widget references NOT found in HTML');
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

  async testChatAPIComplete() {
    this.log('=== Testing Chat API Comprehensive Scenarios ===');
    
    const testScenarios = [
      {
        message: "Hello",
        language: "en",
        expectedResponseType: "greeting",
        description: "Basic greeting test"
      },
      {
        message: "Show me grants for human rights",
        language: "en",
        expectedResponseType: "grants_search",
        description: "Human rights grants search"
      },
      {
        message: "What grants are available for education?",
        language: "en",
        expectedResponseType: "grants_search",
        description: "Education grants search"
      },
      {
        message: "NGO funding opportunities",
        language: "en",
        expectedResponseType: "grants_search",
        description: "NGO funding search"
      },
      {
        message: "Привіт, допоможіть знайти гранти",
        language: "uk",
        expectedResponseType: "greeting_or_search",
        description: "Ukrainian mixed greeting/search"
      },
      {
        message: "Show me all grants with upcoming deadlines",
        language: "en",
        expectedResponseType: "grants_search",
        description: "Deadline-based search"
      }
    ];

    let successCount = 0;
    const results = [];

    for (const scenario of testScenarios) {
      try {
        this.log(`Testing: ${scenario.description}`);
        this.log(`Message: "${scenario.message}" (${scenario.language})`);
        
        const startTime = Date.now();
        const response = await axios.post(`${this.productionUrl}/.netlify/functions/chat`, {
          message: scenario.message,
          language: scenario.language,
          conversationHistory: []
        }, {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' }
        });
        
        const responseTime = Date.now() - startTime;
        
        if (response.status === 200 && response.data.response) {
          successCount++;
          this.log(`✅ Success (${responseTime}ms)`);
          this.log(`Response: ${response.data.response.substring(0, 100)}...`);
          
          // Analyze response quality
          const analysisResult = this.analyzeResponse(response.data, scenario);
          results.push({ scenario, response: response.data, analysis: analysisResult, responseTime });
          
          if (response.data.recommendedGrants && response.data.recommendedGrants.length > 0) {
            this.log(`✅ Found ${response.data.recommendedGrants.length} recommended grants`);
          }
          
          if (response.data.suggestions && response.data.suggestions.length > 0) {
            this.log(`✅ Provided ${response.data.suggestions.length} suggestions`);
          }
          
        } else {
          this.error(`❌ Invalid response for "${scenario.message}"`);
        }
        
      } catch (error) {
        this.error(`❌ API call failed for "${scenario.message}"`, error);
      }
      
      // Wait between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.log(`\n📊 Chat API Test Summary:`);
    this.log(`- Successful responses: ${successCount}/${testScenarios.length}`);
    this.log(`- Success rate: ${((successCount / testScenarios.length) * 100).toFixed(1)}%`);
    
    return { successCount, total: testScenarios.length, results };
  }

  analyzeResponse(responseData, scenario) {
    const analysis = {
      hasResponse: !!responseData.response,
      responseLength: responseData.response ? responseData.response.length : 0,
      hasGrants: responseData.recommendedGrants && responseData.recommendedGrants.length > 0,
      grantCount: responseData.recommendedGrants ? responseData.recommendedGrants.length : 0,
      hasSuggestions: responseData.suggestions && responseData.suggestions.length > 0,
      suggestionCount: responseData.suggestions ? responseData.suggestions.length : 0,
      hasSessionId: !!responseData.sessionId,
      hasMessageId: !!responseData.messageId,
      languageAppropriate: true
    };

    // Check if response is in expected language
    if (scenario.language === 'uk' && responseData.response) {
      // Simple check for Ukrainian characters
      const hasUkrainianChars = /[іїєґ]/.test(responseData.response);
      analysis.languageAppropriate = hasUkrainianChars;
    }

    // Calculate overall quality score
    let qualityScore = 0;
    if (analysis.hasResponse) qualityScore += 20;
    if (analysis.responseLength > 50) qualityScore += 10;
    if (analysis.hasGrants && scenario.expectedResponseType === 'grants_search') qualityScore += 30;
    if (analysis.hasSuggestions) qualityScore += 15;
    if (analysis.hasSessionId) qualityScore += 10;
    if (analysis.hasMessageId) qualityScore += 10;
    if (analysis.languageAppropriate) qualityScore += 5;

    analysis.qualityScore = qualityScore;
    
    return analysis;
  }

  async testNetworkEndpoints() {
    this.log('=== Testing Related Network Endpoints ===');
    
    const endpoints = [
      { 
        url: `${this.productionUrl}/.netlify/functions/grants`, 
        method: 'GET',
        name: 'Grants API Endpoint'
      },
      {
        url: `${this.productionUrl}/data/grants.json`,
        method: 'GET', 
        name: 'Static Grants Data'
      },
      {
        url: `${this.productionUrl}/locales/en/translation.json`,
        method: 'GET',
        name: 'English Translations'
      },
      {
        url: `${this.productionUrl}/locales/uk/translation.json`,
        method: 'GET',
        name: 'Ukrainian Translations'
      }
    ];

    let endpointSuccessCount = 0;

    for (const endpoint of endpoints) {
      try {
        const response = await axios({
          method: endpoint.method,
          url: endpoint.url,
          timeout: 5000
        });
        
        if (response.status === 200) {
          endpointSuccessCount++;
          this.log(`✅ ${endpoint.name} accessible`);
          
          // Special checks for specific endpoints
          if (endpoint.name === 'English Translations' && response.data.chat) {
            this.log('✅ Chat translations found in English file');
          }
          if (endpoint.name === 'Grants API Endpoint' && Array.isArray(response.data)) {
            this.log(`✅ Grants API returned ${response.data.length} grants`);
          }
        } else {
          this.log(`⚠️ ${endpoint.name} returned status: ${response.status}`);
        }
        
      } catch (error) {
        this.log(`❌ ${endpoint.name} failed: ${error.message}`);
      }
    }

    this.log(`\n📊 Network Endpoints Summary:`);
    this.log(`- Accessible endpoints: ${endpointSuccessCount}/${endpoints.length}`);
    
    return endpointSuccessCount === endpoints.length;
  }

  async testUserScenarios() {
    this.log('=== Testing Real User Scenarios ===');
    
    const userScenarios = [
      {
        name: "New visitor exploring options",
        conversation: [
          { message: "Hi, what kind of grants do you have?", language: "en" },
          { message: "Show me grants for women's organizations", language: "en" },
          { message: "What are the deadlines for these grants?", language: "en" }
        ]
      },
      {
        name: "Ukrainian user seeking funding",
        conversation: [
          { message: "Привіт, шукаю фінансування для правозахисної організації", language: "uk" },
          { message: "Які є терміни подачі заявок?", language: "uk" }
        ]
      },
      {
        name: "Specific requirements search",
        conversation: [
          { message: "I need grants for youth education programs", language: "en" },
          { message: "Are there any EU funding opportunities?", language: "en" },
          { message: "What about grants under $50,000?", language: "en" }
        ]
      }
    ];

    const scenarioResults = [];

    for (const scenario of userScenarios) {
      this.log(`\n👤 Testing scenario: ${scenario.name}`);
      
      let sessionId = null;
      let conversationHistory = [];
      let scenarioSuccess = true;

      for (let i = 0; i < scenario.conversation.length; i++) {
        const turn = scenario.conversation[i];
        
        try {
          this.log(`  Message ${i + 1}: "${turn.message}"`);
          
          const response = await axios.post(`${this.productionUrl}/.netlify/functions/chat`, {
            message: turn.message,
            language: turn.language,
            sessionId: sessionId,
            conversationHistory: conversationHistory.slice(-3) // Keep last 3 for context
          }, {
            timeout: 15000,
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (response.status === 200 && response.data.response) {
            sessionId = response.data.sessionId || sessionId;
            conversationHistory.push({
              user: turn.message,
              bot: response.data.response
            });
            
            this.log(`  ✅ Bot responded: ${response.data.response.substring(0, 60)}...`);
            
            if (response.data.recommendedGrants && response.data.recommendedGrants.length > 0) {
              this.log(`  ✅ Recommended ${response.data.recommendedGrants.length} grants`);
            }
          } else {
            scenarioSuccess = false;
            this.error(`  ❌ Failed to get response for message ${i + 1}`);
          }
          
        } catch (error) {
          scenarioSuccess = false;
          this.error(`  ❌ Error in conversation turn ${i + 1}`, error);
        }
        
        // Small delay between conversation turns
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      scenarioResults.push({
        name: scenario.name,
        success: scenarioSuccess,
        conversationLength: scenario.conversation.length,
        sessionId: sessionId
      });
      
      this.log(`  📋 Scenario result: ${scenarioSuccess ? 'SUCCESS' : 'FAILED'}`);
    }

    return scenarioResults;
  }

  async runFullIntegrationTest() {
    this.log('🚀 Starting Final Chat Integration Test');
    this.log(`Production URL: ${this.productionUrl}`);
    
    const startTime = Date.now();
    
    // Run all test suites
    const siteAccessible = await this.testDeployedSite();
    const networkEndpointsWorking = await this.testNetworkEndpoints();
    const chatApiResults = await this.testChatAPIComplete();
    const userScenarioResults = await this.testUserScenarios();
    
    const totalTime = Date.now() - startTime;
    
    // Generate comprehensive report
    this.generateFinalReport(totalTime, {
      siteAccessible,
      networkEndpointsWorking,
      chatApiResults,
      userScenarioResults
    });
  }

  generateFinalReport(totalTime, testResults) {
    this.log('\n' + '='.repeat(50));
    this.log('🎯 FINAL CHAT INTEGRATION TEST REPORT');
    this.log('='.repeat(50));
    
    this.log(`⏱️ Total test duration: ${(totalTime / 1000).toFixed(1)} seconds`);
    this.log(`📝 Total test steps executed: ${this.testResults.length}`);
    this.log(`❌ Total errors encountered: ${this.errors.length}`);
    
    // Site accessibility
    this.log(`\n🌐 Site Accessibility: ${testResults.siteAccessible ? '✅ PASS' : '❌ FAIL'}`);
    
    // Network endpoints
    this.log(`🔗 Network Endpoints: ${testResults.networkEndpointsWorking ? '✅ PASS' : '❌ FAIL'}`);
    
    // Chat API functionality
    const chatApiPass = testResults.chatApiResults.successCount === testResults.chatApiResults.total;
    this.log(`💬 Chat API Functionality: ${chatApiPass ? '✅ PASS' : '⚠️ PARTIAL'}`);
    this.log(`   - Success rate: ${testResults.chatApiResults.successCount}/${testResults.chatApiResults.total} (${((testResults.chatApiResults.successCount / testResults.chatApiResults.total) * 100).toFixed(1)}%)`);
    
    // User scenarios
    const successfulScenarios = testResults.userScenarioResults.filter(s => s.success).length;
    const scenariosPass = successfulScenarios === testResults.userScenarioResults.length;
    this.log(`👥 User Scenarios: ${scenariosPass ? '✅ PASS' : '⚠️ PARTIAL'}`);
    this.log(`   - Successful scenarios: ${successfulScenarios}/${testResults.userScenarioResults.length}`);
    
    // Overall assessment
    const allTestsPass = testResults.siteAccessible && testResults.networkEndpointsWorking && chatApiPass && scenariosPass;
    
    this.log(`\n🏆 OVERALL ASSESSMENT:`);
    if (allTestsPass) {
      this.log('✅ ALL TESTS PASSED - Chat widget is fully functional');
      this.log('🎉 The chat widget should now be working correctly on the live site!');
    } else if (testResults.chatApiResults.successCount > 0) {
      this.log('⚠️ PARTIAL SUCCESS - Chat API works but there may be integration issues');
      this.log('🔧 The chat widget API is functional but may need frontend integration fixes');
    } else {
      this.log('❌ TESTS FAILED - Chat widget has significant issues');
      this.log('🛠️ Major fixes needed for chat widget functionality');
    }
    
    // Critical issues
    if (this.errors.length > 0) {
      this.log('\n🚨 CRITICAL ISSUES TO ADDRESS:');
      this.errors.forEach((error, index) => {
        this.log(`${index + 1}. ${error.message}`);
      });
    }
    
    // Next steps
    this.log('\n📋 NEXT STEPS:');
    if (!testResults.siteAccessible) {
      this.log('1. 🔧 Fix site deployment issues');
    }
    if (!chatApiPass) {
      this.log('2. 🔧 Debug chat API reliability issues');
    }
    if (!allTestsPass) {
      this.log('3. 🚀 Deploy updated frontend code with chat widget integration');
      this.log('4. 🧪 Re-run tests after deployment');
    } else {
      this.log('1. ✅ All systems operational - monitor for user feedback');
      this.log('2. 📊 Consider adding analytics to track chat widget usage');
    }
    
    // Detailed results data
    const reportData = {
      timestamp: new Date().toISOString(),
      testDuration: totalTime,
      totalSteps: this.testResults.length,
      errorCount: this.errors.length,
      results: testResults,
      allTestsPass,
      recommendations: allTestsPass ? 
        ['Monitor chat widget performance', 'Collect user feedback', 'Consider adding usage analytics'] :
        ['Fix identified issues', 'Redeploy application', 'Re-run integration tests']
    };
    
    this.log('\n📄 Detailed test data available in console output');
    
    return reportData;
  }
}

// Execute the comprehensive test
async function runFinalTest() {
  const tester = new FinalChatIntegrationTest();
  
  try {
    await tester.runFullIntegrationTest();
  } catch (error) {
    console.error('❌ Integration test suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runFinalTest().catch(console.error);
}

module.exports = { FinalChatIntegrationTest };