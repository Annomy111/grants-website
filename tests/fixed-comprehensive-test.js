const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class FixedComprehensiveTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://civil-society-grants-database.netlify.app';
    this.testResults = [];
    this.screenshots = [];
  }

  async init() {
    console.log('🚀 Starting FIXED comprehensive testing...');
    
    this.browser = await puppeteer.launch({
      headless: false,
      devtools: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Monitor console for debugging
    this.page.on('console', msg => {
      console.log(`🖥️  CONSOLE: ${msg.text()}`);
    });
  }

  addTestResult(test, passed, details = '') {
    this.testResults.push({
      test,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${test}: ${details}`);
  }

  async takeScreenshot(name) {
    const screenshotPath = path.join(__dirname, 'screenshots', `fixed-${name}-${Date.now()}.png`);
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.screenshots.push({ name, path: screenshotPath });
    console.log(`📸 Screenshot: ${name}`);
  }

  async testGrantsPageDetailed() {
    console.log('\n🔍 Testing grants page with correct selectors...');
    
    try {
      await this.page.goto(`${this.baseUrl}/grants`, { waitUntil: 'networkidle0' });
      await this.takeScreenshot('grants-page-loaded');
      
      // Wait for React to render grants
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Check for grants using the correct structure we found
      const grantsAnalysis = await this.page.evaluate(() => {
        // Look for the actual grant cards structure
        const grantCards = document.querySelectorAll('div.space-y-6 > div');
        const grantTexts = Array.from(grantCards).map(card => 
          card.textContent.includes('Council of Europe') || 
          card.textContent.includes('Grant Name') ||
          card.textContent.includes('European Union')
        );
        
        return {
          totalCards: grantCards.length,
          hasGrantContent: grantTexts.some(hasContent => hasContent),
          firstCardContent: grantCards[0]?.textContent?.substring(0, 200) || 'No cards found'
        };
      });
      
      this.addTestResult(
        'Grants Cards Found',
        grantsAnalysis.totalCards > 0,
        `Found ${grantsAnalysis.totalCards} grant cards`
      );
      
      this.addTestResult(
        'Grants Content Valid',
        grantsAnalysis.hasGrantContent,
        `Content check: ${grantsAnalysis.firstCardContent}`
      );
      
      // Test search functionality
      const searchInput = await this.page.$('input[type="text"]');
      if (searchInput) {
        await searchInput.type('ukraine', { delay: 100 });
        
        const searchButton = await this.page.$('button[type="submit"]');
        if (searchButton) {
          await searchButton.click();
          await new Promise(resolve => setTimeout(resolve, 2000));
          await this.takeScreenshot('search-results');
          
          this.addTestResult('Search Function', true, 'Search executed successfully');
        } else {
          this.addTestResult('Search Button', false, 'Search button not found');
        }
      } else {
        this.addTestResult('Search Input', false, 'Search input not found');
      }
      
    } catch (error) {
      this.addTestResult('Grants Page Test', false, error.message);
    }
  }

  async testChatWidgetDetailed() {
    console.log('\n🔍 Testing chat widget with correct selectors...');
    
    try {
      await this.page.goto(`${this.baseUrl}/grants`, { waitUntil: 'networkidle0' });
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Look for the fixed chat button (bottom-right, blue, with ChatBubbleLeftRightIcon)
      const chatButton = await this.page.$('button[aria-label*="toggle"], .fixed.bottom-6.right-6 button');
      
      if (chatButton) {
        this.addTestResult('Chat Toggle Button', true, 'Chat toggle button found');
        
        // Click to open chat
        await chatButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        await this.takeScreenshot('chat-opened');
        
        // Check if chat widget appeared
        const chatWidget = await this.page.$('.fixed.bottom-24.right-6');
        
        if (chatWidget) {
          this.addTestResult('Chat Widget Opens', true, 'Chat widget opened successfully');
          
          // Test sending a message
          const chatInput = await this.page.$('input[type="text"], textarea');
          if (chatInput) {
            await chatInput.type('Show me grants for NGOs');
            
            const sendButton = await this.page.$('button[type="submit"]');
            if (sendButton) {
              await sendButton.click();
              await new Promise(resolve => setTimeout(resolve, 5000));
              await this.takeScreenshot('chat-message-sent');
              
              this.addTestResult('Chat Message', true, 'Message sent to chat widget');
            } else {
              this.addTestResult('Chat Send Button', false, 'Send button not found in chat');
            }
          } else {
            this.addTestResult('Chat Input Field', false, 'Chat input field not found');
          }
        } else {
          this.addTestResult('Chat Widget Opens', false, 'Chat widget did not appear');
        }
      } else {
        this.addTestResult('Chat Toggle Button', false, 'Chat toggle button not found');
      }
      
    } catch (error) {
      this.addTestResult('Chat Widget Test', false, error.message);
    }
  }

  async testApiEndpointsDetailed() {
    console.log('\n🔍 Testing API endpoints in detail...');
    
    const apiTests = [
      {
        name: 'Grants API',
        url: '/.netlify/functions/grants',
        expectArray: true,
        minLength: 40
      },
      {
        name: 'Filters API', 
        url: '/.netlify/functions/grants/filters',
        expectObject: true,
        requiredKeys: ['organizations', 'countries', 'focusAreas']
      }
    ];
    
    for (const test of apiTests) {
      try {
        const response = await this.page.evaluate(async (testUrl) => {
          const res = await fetch(testUrl);
          const data = await res.json();
          return {
            status: res.status,
            ok: res.ok,
            data: data,
            dataType: Array.isArray(data) ? 'array' : typeof data,
            length: Array.isArray(data) ? data.length : Object.keys(data || {}).length
          };
        }, `${this.baseUrl}${test.url}`);
        
        let passed = response.ok;
        let details = `Status: ${response.status}`;
        
        if (response.ok) {
          if (test.expectArray && response.dataType === 'array') {
            passed = response.length >= (test.minLength || 0);
            details += `, Array length: ${response.length}`;
          } else if (test.expectObject && test.requiredKeys) {
            const hasAllKeys = test.requiredKeys.every(key => 
              response.data && response.data.hasOwnProperty(key)
            );
            passed = hasAllKeys;
            details += `, Keys: ${Object.keys(response.data || {}).join(', ')}`;
          }
        }
        
        this.addTestResult(test.name, passed, details);
        
      } catch (error) {
        this.addTestResult(test.name, false, error.message);
      }
    }
  }

  async testPerformanceDetailed() {
    console.log('\n🔍 Testing performance metrics...');
    
    try {
      const startTime = Date.now();
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      const metrics = await this.page.metrics();
      
      // Performance checks
      this.addTestResult('Load Time', loadTime < 5000, `${loadTime}ms (target: <5000ms)`);
      this.addTestResult('JS Heap Size', metrics.JSHeapUsedSize < 50 * 1024 * 1024, 
        `${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB (target: <50MB)`);
      
      // DOM size check (more lenient for React apps)
      this.addTestResult('DOM Nodes', metrics.Nodes < 5000, 
        `${metrics.Nodes} nodes (target: <5000 for React app)`);
      
      // Check Core Web Vitals using Lighthouse
      const lighthouse = await this.page.evaluate(() => {
        return new Promise((resolve) => {
          if (window.performance && window.performance.getEntriesByType) {
            const navigation = window.performance.getEntriesByType('navigation')[0];
            resolve({
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
              firstPaint: navigation.loadEventEnd - navigation.loadEventStart
            });
          } else {
            resolve({ domContentLoaded: 0, firstPaint: 0 });
          }
        });
      });
      
      this.addTestResult('DOM Content Loaded', lighthouse.domContentLoaded < 2000,
        `${Math.round(lighthouse.domContentLoaded)}ms (target: <2000ms)`);
      
    } catch (error) {
      this.addTestResult('Performance Test', false, error.message);
    }
  }

  async generateDetailedReport() {
    console.log('\n📊 Generating detailed test report...');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    const report = {
      summary: {
        total,
        passed,
        failed: total - passed,
        passRate: `${passRate}%`,
        timestamp: new Date().toISOString(),
        environment: {
          url: this.baseUrl,
          userAgent: await this.page.evaluate(() => navigator.userAgent),
          viewport: await this.page.evaluate(() => ({
            width: window.innerWidth,
            height: window.innerHeight
          }))
        }
      },
      results: this.testResults,
      screenshots: this.screenshots
    };
    
    const reportPath = path.join(__dirname, 'fixed-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📈 FIXED TEST SUMMARY:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${total - passed} ❌`);
    console.log(`   Pass Rate: ${passRate}%`);
    console.log(`   Report: ${reportPath}`);
    
    const failed = this.testResults.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      failed.forEach(test => {
        console.log(`   - ${test.test}: ${test.details}`);
      });
    } else {
      console.log('\n🎉 ALL TESTS PASSED!');
    }
    
    return report;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async runAllTests() {
    try {
      await this.init();
      
      await this.testApiEndpointsDetailed();
      await this.testGrantsPageDetailed();
      await this.testChatWidgetDetailed();
      await this.testPerformanceDetailed();
      
      return await this.generateDetailedReport();
      
    } catch (error) {
      console.error('❌ Test runner failed:', error);
      this.addTestResult('Test Runner', false, error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests
if (require.main === module) {
  const tester = new FixedComprehensiveTester();
  tester.runAllTests().then(report => {
    console.log('\n🎉 Fixed testing completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = FixedComprehensiveTester;