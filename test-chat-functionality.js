#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 Chat Widget Functional Analysis');
console.log('=' .repeat(50));

// Read relevant files
const chatWidgetPath = path.join(__dirname, 'client/src/components/GrantsChatWidget.js');
const netlifyFunctionPath = path.join(__dirname, 'client/netlify/functions/chat.js');
const grantsPagePath = path.join(__dirname, 'client/src/pages/GrantsPage.js');

const chatWidget = fs.readFileSync(chatWidgetPath, 'utf8');
const netlifyFunction = fs.readFileSync(netlifyFunctionPath, 'utf8');
const grantsPage = fs.readFileSync(grantsPagePath, 'utf8');

console.log('\n1. 🔌 API INTEGRATION ANALYSIS');
console.log('-'.repeat(30));

// Check API endpoint consistency
const widgetEndpoint = chatWidget.match(/['"`](\/[^'"`]*functions\/chat[^'"`]*?)['"`]/)?.[1];
const netlifyRedirect = fs.readFileSync(path.join(__dirname, 'client/netlify.toml'), 'utf8');

console.log('Widget endpoint:', widgetEndpoint || 'NOT FOUND');

if (netlifyRedirect.includes('/api/chat/grants') && netlifyRedirect.includes('/.netlify/functions/chat')) {
  console.log('✅ Netlify redirect configured correctly');
} else {
  console.log('❌ Netlify redirect configuration issue');
}

// Check if widget uses correct endpoint
if (widgetEndpoint === '/.netlify/functions/chat') {
  console.log('✅ Widget uses correct Netlify function endpoint');
} else {
  console.log('❌ Widget endpoint mismatch');
}

console.log('\n2. 🎭 STATE MANAGEMENT ISSUES');
console.log('-'.repeat(30));

// Check for potential state issues
const stateIssues = [];

// Check if welcome message loads properly
if (chatWidget.includes('useEffect') && chatWidget.includes('isOpen && messages.length === 0')) {
  console.log('✅ Welcome message logic implemented');
} else {
  stateIssues.push('Welcome message loading logic may be faulty');
}

// Check message state updates
if (chatWidget.includes('setMessages(prev => [...prev,')) {
  console.log('✅ Proper message state immutability');
} else {
  stateIssues.push('Message state updates may cause issues');
}

// Check loading state management
if (chatWidget.includes('setIsLoading(true)') && chatWidget.includes('setIsLoading(false)')) {
  console.log('✅ Loading state properly managed');
} else {
  stateIssues.push('Loading state management incomplete');
}

console.log('\n🚨 State Issues Found:');
stateIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n3. 📡 NETWORK ERROR HANDLING');
console.log('-'.repeat(30));

// Check error handling
const errorHandling = [];

if (chatWidget.includes('catch (error)')) {
  console.log('✅ Basic error handling present');
  
  if (chatWidget.includes('errorMessages')) {
    console.log('✅ Localized error messages');
  } else {
    errorHandling.push('Error messages not localized');
  }
  
  if (chatWidget.includes('error: true')) {
    console.log('✅ Error state in message object');
  } else {
    errorHandling.push('Error state not properly marked');
  }
} else {
  errorHandling.push('No error handling found');
}

// Check timeout handling
if (chatWidget.includes('timeout:')) {
  console.log('✅ Request timeout configured');
} else {
  errorHandling.push('No request timeout configured');
}

console.log('\n🚨 Error Handling Issues:');
errorHandling.forEach(issue => console.log(`  - ${issue}`));

console.log('\n4. 🎨 UI RENDERING PROBLEMS');
console.log('-'.repeat(30));

// Check for UI rendering issues
const uiIssues = [];

// Check scroll behavior
if (chatWidget.includes('scrollToBottom') && chatWidget.includes('messagesEndRef')) {
  console.log('✅ Auto-scroll to bottom implemented');
} else {
  uiIssues.push('Auto-scroll to bottom may not work');
}

// Check message formatting
if (chatWidget.includes('dangerouslySetInnerHTML')) {
  console.log('⚠️  Using dangerouslySetInnerHTML - XSS risk');
  uiIssues.push('Potential XSS vulnerability with message formatting');
} else {
  console.log('✅ Safe message rendering');
}

// Check responsive design issues
if (chatWidget.includes('w-96') && !chatWidget.includes('max-w-sm')) {
  uiIssues.push('Fixed width may overflow on mobile devices');
}

// Check dark mode handling
if (chatWidget.includes('darkMode ?') && chatWidget.includes('ThemeContext')) {
  console.log('✅ Dark mode support implemented');
} else {
  uiIssues.push('Dark mode may not work properly');
}

console.log('\n🚨 UI Issues Found:');
uiIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n5. 🔄 MESSAGE FLOW ANALYSIS');
console.log('-'.repeat(30));

// Check message flow
const messageFlowIssues = [];

// Check if suggestions work
if (chatWidget.includes('handleSuggestionClick') && chatWidget.includes('onClick={() => handleSuggestionClick(suggestion)')) {
  console.log('✅ Suggestion click handling implemented');
} else {
  messageFlowIssues.push('Suggestion clicks may not work');
}

// Check Enter key handling
if (chatWidget.includes('onKeyPress') && chatWidget.includes("e.key === 'Enter'")) {
  console.log('✅ Enter key handling for message sending');
} else {
  messageFlowIssues.push('Enter key may not send messages');
}

// Check input validation
if (chatWidget.includes('!messageText.trim()') || chatWidget.includes('!inputValue.trim()')) {
  console.log('✅ Empty message validation');
} else {
  messageFlowIssues.push('No validation for empty messages');
}

console.log('\n🚨 Message Flow Issues:');
messageFlowIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n6. 🌍 INTERNATIONALIZATION');
console.log('-'.repeat(30));

// Check i18n implementation
const i18nIssues = [];

if (chatWidget.includes('useTranslation') && chatWidget.includes("t('")) {
  console.log('✅ React i18next integration');
} else {
  i18nIssues.push('Translation system not properly integrated');
}

if (chatWidget.includes('LanguageContext') && chatWidget.includes('language')) {
  console.log('✅ Language context usage');
} else {
  i18nIssues.push('Language context not properly used');
}

// Check if API calls include language parameter
if (chatWidget.includes('language: language') || chatWidget.includes('language,')) {
  console.log('✅ Language parameter sent to API');
} else {
  i18nIssues.push('Language not sent to API');
}

console.log('\n🚨 I18n Issues:');
i18nIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n7. 🔧 PERFORMANCE CONCERNS');
console.log('-'.repeat(30));

const performanceIssues = [];

// Check for unnecessary re-renders
if (chatWidget.includes('useCallback')) {
  console.log('✅ useCallback for optimization');
} else {
  performanceIssues.push('No useCallback optimization found');
}

// Check conversation history management
if (chatWidget.includes('conversationHistory: messages.slice(-5)')) {
  console.log('✅ Limited conversation history sent to API');
} else {
  performanceIssues.push('Full conversation history may be sent (performance issue)');
}

// Check for debouncing
if (!chatWidget.includes('debounce') && !chatWidget.includes('throttle')) {
  performanceIssues.push('No debouncing/throttling for rapid message sending');
}

console.log('\n🚨 Performance Issues:');
performanceIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n8. 🎯 FUNCTIONAL TEST SCENARIOS');
console.log('-'.repeat(30));

const testScenarios = [
  {
    scenario: 'Chat Widget Opening',
    steps: [
      '1. Click chat button',
      '2. Widget should open with welcome message',
      '3. Suggestions should be displayed'
    ],
    expectedIssues: ['Welcome message may not appear on first load']
  },
  {
    scenario: 'Message Sending',
    steps: [
      '1. Type message in input',
      '2. Press Enter or click send',
      '3. Message appears in chat',
      '4. Loading indicator shows',
      '5. Response appears'
    ],
    expectedIssues: ['API timeout after 30 seconds', 'No retry logic']
  },
  {
    scenario: 'Mobile Usage',
    steps: [
      '1. Open on mobile device',
      '2. Chat widget should be responsive',
      '3. Input should be accessible'
    ],
    expectedIssues: ['Fixed width may overflow screen', 'Input may be blocked by virtual keyboard']
  },
  {
    scenario: 'Error Handling',
    steps: [
      '1. Send message with network disconnected',
      '2. Error message should appear',
      '3. User should be able to retry'
    ],
    expectedIssues: ['No automatic retry', 'Error message may not be clear']
  }
];

testScenarios.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.scenario}:`);
  test.steps.forEach(step => console.log(`   ${step}`));
  console.log('   Expected Issues:');
  test.expectedIssues.forEach(issue => console.log(`     - ${issue}`));
});

console.log('\n9. 🎯 CRITICAL ISSUES TO FIX');
console.log('-'.repeat(30));

const criticalIssues = [
  {
    priority: 'HIGH',
    issue: 'Mobile Responsiveness',
    description: 'Fixed width (384px) will overflow on devices < 400px wide',
    fix: 'Replace w-96 with w-full max-w-sm sm:w-96'
  },
  {
    priority: 'HIGH', 
    issue: 'API Endpoint Mismatch',
    description: 'Potential mismatch between widget endpoint and Netlify function',
    fix: 'Verify /.netlify/functions/chat endpoint is working'
  },
  {
    priority: 'MEDIUM',
    issue: 'XSS Vulnerability',
    description: 'Using dangerouslySetInnerHTML for message content',
    fix: 'Use a safe markdown renderer or sanitize HTML'
  },
  {
    priority: 'MEDIUM',
    issue: 'No Retry Logic',
    description: 'Single API call with no retry on failure',
    fix: 'Implement exponential backoff retry logic'
  },
  {
    priority: 'LOW',
    issue: 'Performance Optimization',
    description: 'Missing debouncing and advanced optimizations',
    fix: 'Add debouncing for rapid message sending'
  }
];

criticalIssues.forEach((item, index) => {
  console.log(`\n${index + 1}. [${item.priority}] ${item.issue}`);
  console.log(`   Issue: ${item.description}`);
  console.log(`   Fix: ${item.fix}`);
});

console.log('\n✅ Functional Analysis Complete!');
console.log('\n🎯 NEXT STEPS:');
console.log('1. Test actual chat widget in browser');
console.log('2. Verify API endpoint connectivity'); 
console.log('3. Fix mobile responsiveness issues');
console.log('4. Implement better error handling');
console.log('5. Add comprehensive testing');