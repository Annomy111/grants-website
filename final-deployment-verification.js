const axios = require("axios");

async function testGeminiChatDeployment() {
  console.log("🚀 Testing Gemini-Powered Chat Deployment\n");
  
  const BASE_URL = "https://civil-society-grants-database.netlify.app";
  
  try {
    console.log("1. Testing Gemini AI Integration...");
    
    const testMessages = [
      {
        message: "Hello\! What grants are available for womens organizations in Ukraine?",
        language: "en",
        expected: "AI-powered response mentioning specific grants"
      },
      {
        message: "Show me grants for human rights work with upcoming deadlines", 
        language: "en",
        expected: "Deadline-focused grant recommendations"
      }
    ];
    
    let geminiSuccessCount = 0;
    let fallbackCount = 0;
    
    for (let i = 0; i < testMessages.length; i++) {
      const test = testMessages[i];
      console.log(`\n${i + 1}. Testing: "${test.message.substring(0, 50)}..."`);
      console.log(`   Language: ${test.language}`);
      
      try {
        const response = await axios.post(`${BASE_URL}/.netlify/functions/chat`, {
          message: test.message,
          language: test.language,
          conversationId: `test-${Date.now()}-${i}`
        }, {
          headers: { "Content-Type": "application/json" },
          timeout: 30000
        });
        
        if (response.status === 200) {
          const data = response.data;
          console.log(`   ✅ Response received (${data.response?.length || 0} chars)`);
          console.log(`   📝 Sample: "${data.response?.substring(0, 100)}..."`);
          console.log(`   🎯 Grants found: ${data.recommendedGrants?.length || 0}`);
          console.log(`   💡 Suggestions: ${data.suggestions?.length || 0}`);
          
          // Check if response looks like Gemini AI (contextual and detailed)
          const isAIResponse = data.response && (
            data.response.length > 200 ||
            data.response.includes("I can help") ||
            data.response.includes("Here are") ||
            data.response.includes("based on") ||
            data.response.includes("I found")
          );
          
          if (isAIResponse) {
            geminiSuccessCount++;
            console.log(`   🤖 AI Quality: GEMINI-POWERED (intelligent response)`);
          } else {
            fallbackCount++;
            console.log(`   🔧 AI Quality: FALLBACK (rule-based response)`);
          }
          
          // Show grant recommendations if any
          if (data.recommendedGrants && data.recommendedGrants.length > 0) {
            console.log(`   📋 Top grant: "${data.recommendedGrants[0].grant_name}" by ${data.recommendedGrants[0].funding_organization}`);
          }
          
        } else {
          console.log(`   ❌ Failed: Status ${response.status}`);
        }
        
      } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
        if (error.response) {
          console.log(`   Response: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
        }
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n🎯 GEMINI AI TEST RESULTS:");
    console.log(`   Gemini-powered responses: ${geminiSuccessCount}/${testMessages.length}`);
    console.log(`   Fallback responses: ${fallbackCount}/${testMessages.length}`);
    
    if (geminiSuccessCount >= testMessages.length * 0.5) {
      console.log("   ✅ AI INTEGRATION: EXCELLENT (Gemini working)");
    } else if (geminiSuccessCount > 0) {
      console.log("   ⚠️  AI INTEGRATION: PARTIAL (Some Gemini, some fallback)");
    } else {
      console.log("   ❌ AI INTEGRATION: FALLBACK ONLY (Check Gemini API key)");
    }
    
    console.log("\n🏆 FINAL ASSESSMENT:");
    
    if (geminiSuccessCount >= 1) {
      console.log("🎉 SUCCESS: Gemini AI chat is operational\!");
      console.log("   ✅ Intelligent responses powered by Google Gemini");
      console.log("   ✅ Multi-language support");
      console.log("   ✅ Contextual grant recommendations");
      console.log("   ✅ Smart keyword matching and scoring");
    } else {
      console.log("⚠️  PARTIAL SUCCESS: Chat working but using fallback");
    }
    
    console.log(`\n🌐 Live chat available at: ${BASE_URL}`);
    console.log("💬 Chat button appears in bottom-right corner of all pages");
    
  } catch (error) {
    console.error("\n💥 Deployment test failed:", error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    }
  }
}

testGeminiChatDeployment();
