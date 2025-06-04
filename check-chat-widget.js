#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Chat Widget UI/UX Analysis');
console.log('=' .repeat(50));

// Read the chat widget component
const chatWidgetPath = path.join(__dirname, 'client/src/components/GrantsChatWidget.js');
const chatWidgetContent = fs.readFileSync(chatWidgetPath, 'utf8');

console.log('\n1. 📱 RESPONSIVE DESIGN ANALYSIS');
console.log('-'.repeat(30));

// Check for responsive design patterns
const responsiveClasses = [
  'max-w-\\[calc\\(100vw-3rem\\)\\]',
  'max-h-\\[calc\\(100vh-8rem\\)\\]',
  'w-96',
  'h-96',
  'fixed',
  'bottom-6',
  'right-6'
];

responsiveClasses.forEach(className => {
  if (chatWidgetContent.includes(className)) {
    console.log(`✅ Found responsive class: ${className}`);
  } else {
    console.log(`❌ Missing responsive class: ${className}`);
  }
});

// Check for mobile-specific issues
const mobileIssues = [];

if (chatWidgetContent.includes('w-96') && !chatWidgetContent.includes('max-w-')) {
  mobileIssues.push('Fixed width (384px) may be too wide for mobile screens');
}

if (!chatWidgetContent.includes('sm:') && !chatWidgetContent.includes('md:')) {
  mobileIssues.push('No breakpoint-specific styling found');
}

console.log('\n🚨 Mobile Issues:');
mobileIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n2. 🎨 Z-INDEX AND POSITIONING');
console.log('-'.repeat(30));

// Check z-index values
const zIndexMatches = chatWidgetContent.match(/z-\d+/g) || [];
console.log('Z-index values found:', zIndexMatches);

if (zIndexMatches.includes('z-50') && zIndexMatches.includes('z-40')) {
  console.log('✅ Proper z-index hierarchy (button: z-50, widget: z-40)');
} else {
  console.log('❌ Z-index hierarchy may cause stacking issues');
}

console.log('\n3. ⌨️ ACCESSIBILITY ANALYSIS');
console.log('-'.repeat(30));

// Check accessibility features
const a11yFeatures = [
  'aria-label',
  'onKeyPress',
  'disabled',
  'tabIndex',
  'role'
];

const a11yIssues = [];

if (!chatWidgetContent.includes('aria-label')) {
  a11yIssues.push('Missing aria-label for screen readers');
}

if (!chatWidgetContent.includes('onKeyPress') && !chatWidgetContent.includes('onKeyDown')) {
  a11yIssues.push('No keyboard navigation support detected');
}

if (!chatWidgetContent.includes('Enter')) {
  a11yIssues.push('Enter key handling may be missing');
}

console.log('🔍 A11y Issues:');
a11yIssues.forEach(issue => console.log(`  - ${issue}`));

console.log('\n4. 🎮 INTERACTION STATES');
console.log('-'.repeat(30));

// Check for loading and error states
const interactionStates = [
  'isLoading',
  'isTyping',
  'disabled',
  'error',
  'hover:',
  'focus:'
];

interactionStates.forEach(state => {
  if (chatWidgetContent.includes(state)) {
    console.log(`✅ ${state} state handled`);
  } else {
    console.log(`⚠️  ${state} state not found`);
  }
});

console.log('\n5. 🌐 API ENDPOINT ANALYSIS');
console.log('-'.repeat(30));

// Check API endpoint
if (chatWidgetContent.includes('/.netlify/functions/chat')) {
  console.log('✅ Using Netlify functions endpoint');
} else {
  console.log('❌ API endpoint not found or incorrect');
}

// Check timeout handling
if (chatWidgetContent.includes('timeout:')) {
  const timeoutMatch = chatWidgetContent.match(/timeout:\s*(\d+)/);
  if (timeoutMatch) {
    const timeout = parseInt(timeoutMatch[1]);
    console.log(`✅ Request timeout set to ${timeout}ms`);
    if (timeout > 30000) {
      console.log('⚠️  Timeout is quite long (>30s), users may get impatient');
    }
  }
} else {
  console.log('❌ No timeout configured for API requests');
}

console.log('\n6. 📦 UI COMPONENT STRUCTURE');
console.log('-'.repeat(30));

// Check component structure
const structureChecks = [
  { name: 'Toggle Button', pattern: /ChatBubbleLeftRightIcon|XMarkIcon/ },
  { name: 'Chat Header', pattern: /Chat Header|SparklesIcon/ },
  { name: 'Messages Area', pattern: /Messages Area|overflow-y-auto/ },
  { name: 'Input Area', pattern: /Input Area|PaperAirplaneIcon/ },
  { name: 'Typing Indicator', pattern: /Typing Indicator|animate-bounce/ },
  { name: 'Error Handling', pattern: /error.*message|catch.*error/ }
];

structureChecks.forEach(check => {
  if (check.pattern.test(chatWidgetContent)) {
    console.log(`✅ ${check.name} implemented`);
  } else {
    console.log(`❌ ${check.name} missing or incomplete`);
  }
});

console.log('\n7. 🎯 UX FLOW ANALYSIS');
console.log('-'.repeat(30));

// Check UX flow elements
const uxElements = [
  'welcome message',
  'suggestions',
  'scroll.*bottom',
  'formatMessage',
  'timestamp'
];

uxElements.forEach(element => {
  if (new RegExp(element, 'i').test(chatWidgetContent)) {
    console.log(`✅ ${element} feature implemented`);
  } else {
    console.log(`⚠️  ${element} feature not found`);
  }
});

console.log('\n8. 🚨 POTENTIAL ISSUES SUMMARY');
console.log('-'.repeat(30));

const potentialIssues = [
  {
    issue: 'Mobile Width Problem',
    description: 'Fixed width (w-96 = 384px) may overflow on small screens',
    severity: 'HIGH',
    solution: 'Add responsive width classes like w-full sm:w-96'
  },
  {
    issue: 'Scroll Container Height',
    description: 'Fixed height (h-64) may not adapt well to content',
    severity: 'MEDIUM',
    solution: 'Use dynamic height based on viewport'
  },
  {
    issue: 'API Error Handling',
    description: 'Single timeout value may not cover all network conditions',
    severity: 'MEDIUM',
    solution: 'Implement retry logic with exponential backoff'
  },
  {
    issue: 'Keyboard Navigation',
    description: 'Limited keyboard support beyond Enter key',
    severity: 'LOW',
    solution: 'Add Escape key to close, Tab navigation between suggestions'
  }
];

potentialIssues.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.issue} [${item.severity}]`);
  console.log(`   Description: ${item.description}`);
  console.log(`   Solution: ${item.solution}`);
});

console.log('\n🎯 RECOMMENDATIONS');
console.log('-'.repeat(30));

const recommendations = [
  '1. 📱 Mobile First: Replace fixed width with responsive alternatives',
  '2. ⚡ Performance: Add debouncing for rapid message sending',
  '3. 🎨 Animation: Add smooth transitions for better perceived performance',
  '4. 🔄 State Management: Implement message persistence across sessions',
  '5. 🎯 UX: Add message status indicators (sending, sent, failed)',
  '6. ♿ A11y: Add ARIA live regions for screen reader announcements',
  '7. 🌐 I18n: Ensure all user-facing text is translatable',
  '8. 📊 Analytics: Add interaction tracking for usage insights'
];

recommendations.forEach(rec => console.log(rec));

console.log('\n✅ Analysis Complete!');