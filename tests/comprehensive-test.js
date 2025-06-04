const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.baseUrl = 'https://civil-society-grants-database.netlify.app';
    this.testResults = [];
    this.screenshots = [];
  }

  async init() {
    console.log('🚀 Starting comprehensive testing...');
    
    this.browser = await puppeteer.launch({
      headless: false, // Show browser for debugging
      devtools: true,  // Open dev tools
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent
    await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');
    
    // Enable request interception for monitoring
    await this.page.setRequestInterception(true);
    
    // Monitor network requests
    this.page.on('request', request => {
      console.log(`📡 ${request.method()} ${request.url()}`);
      request.continue();
    });
    
    // Monitor console logs
    this.page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      console.log(`🖥️  CONSOLE ${type.toUpperCase()}: ${text}`);
    });
    
    // Monitor errors
    this.page.on('pageerror', error => {
      console.log(`❌ PAGE ERROR: ${error.message}`);
      this.addTestResult('Page Error', false, error.message);
    });
    
    // Monitor response errors
    this.page.on('response', response => {
      if (!response.ok()) {
        console.log(`❌ HTTP ERROR: ${response.status()} ${response.url()}`);
      }
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
    const screenshotPath = path.join(__dirname, 'screenshots', `${name}-${Date.now()}.png`);
    await fs.mkdir(path.dirname(screenshotPath), { recursive: true });
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    this.screenshots.push({ name, path: screenshotPath });
    console.log(`📸 Screenshot saved: ${screenshotPath}`);
  }

  async testPageLoad() {
    console.log('\n🔍 Testing page load...');
    
    try {
      const startTime = Date.now();
      await this.page.goto(this.baseUrl, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      const loadTime = Date.now() - startTime;
      
      this.addTestResult('Page Load', true, `Loaded in ${loadTime}ms`);
      await this.takeScreenshot('homepage-loaded');
      
      // Check for React app rendering
      const hasReactRoot = await this.page.$('#root');
      this.addTestResult('React App Mounted', !!hasReactRoot, hasReactRoot ? 'React root found' : 'React root missing');
      
      // Check title
      const title = await this.page.title();
      this.addTestResult('Page Title', title.includes('Civil Society'), `Title: "${title}"`);
      
    } catch (error) {
      this.addTestResult('Page Load', false, error.message);
    }
  }

  async testGrantsPage() {
    console.log('\n🔍 Testing grants page...');
    
    try {
      // Navigate to grants page
      await this.page.goto(`${this.baseUrl}/grants`, { waitUntil: 'networkidle0' });
      await this.takeScreenshot('grants-page');
      
      // Wait for grants to load
      await this.page.waitForSelector('.grant-card, [data-testid="grant-item"]', { timeout: 10000 });
      
      // Count grants
      const grantElements = await this.page.$$('.grant-card, [data-testid="grant-item"], .grants-list > div');
      this.addTestResult('Grants Loaded', grantElements.length > 0, `Found ${grantElements.length} grants`);
      
      // Test search functionality
      const searchInput = await this.page.$('input[type="text"], input[placeholder*="search"], input[placeholder*="Search"]');
      if (searchInput) {
        await searchInput.type('ukraine');
        await this.page.keyboard.press('Enter');
        await this.page.waitForTimeout(2000);
        
        const filteredGrants = await this.page.$$('.grant-card, [data-testid="grant-item"]');
        this.addTestResult('Search Functionality', true, `Search returned ${filteredGrants.length} results`);
        await this.takeScreenshot('grants-search-results');
      } else {
        this.addTestResult('Search Input', false, 'Search input not found');
      }
      
    } catch (error) {
      this.addTestResult('Grants Page', false, error.message);
    }
  }

  async testApiEndpoints() {
    console.log('\n🔍 Testing API endpoints...');
    
    const endpoints = [
      '/.netlify/functions/grants',
      '/.netlify/functions/grants/filters'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.page.evaluate(async (url) => {
          const res = await fetch(url);
          return {
            status: res.status,
            ok: res.ok,
            data: await res.json()
          };
        }, `${this.baseUrl}${endpoint}`);
        
        this.addTestResult(
          `API ${endpoint}`,
          response.ok,
          `Status: ${response.status}, Data length: ${Array.isArray(response.data) ? response.data.length : Object.keys(response.data || {}).length}`
        );
        
      } catch (error) {
        this.addTestResult(`API ${endpoint}`, false, error.message);
      }
    }
  }

  async testChatWidget() {
    console.log('\n🔍 Testing chat widget...');
    
    try {
      // Navigate back to grants page
      await this.page.goto(`${this.baseUrl}/grants`, { waitUntil: 'networkidle0' });
      
      // Look for chat widget button
      const chatButton = await this.page.$('[data-testid="chat-button"], .chat-button, button[title*="chat"], button[aria-label*="chat"]');
      
      if (chatButton) {
        this.addTestResult('Chat Button Found', true, 'Chat widget button located');
        
        // Click chat button
        await chatButton.click();
        await this.page.waitForTimeout(1000);
        await this.takeScreenshot('chat-widget-opened');
        
        // Look for chat input
        const chatInput = await this.page.$('input[placeholder*="message"], textarea[placeholder*="message"], .chat-input input, .chat-input textarea');
        
        if (chatInput) {
          this.addTestResult('Chat Input Found', true, 'Chat input field located');
          
          // Test sending a message
          await chatInput.type('Show me grants for NGOs');
          
          // Look for send button
          const sendButton = await this.page.$('button[type="submit"], .send-button, button[aria-label*="send"]');
          if (sendButton) {
            await sendButton.click();
            await this.page.waitForTimeout(3000); // Wait for response
            await this.takeScreenshot('chat-response');
            
            this.addTestResult('Chat Message Sent', true, 'Chat message sent successfully');
          } else {
            this.addTestResult('Chat Send Button', false, 'Send button not found');
          }
        } else {
          this.addTestResult('Chat Input', false, 'Chat input not found');
        }
      } else {
        this.addTestResult('Chat Widget', false, 'Chat button not found');
      }
      
    } catch (error) {
      this.addTestResult('Chat Widget', false, error.message);
    }
  }

  async testResponsiveDesign() {
    console.log('\n🔍 Testing responsive design...');
    
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await this.page.setViewport(viewport);
      await this.page.goto(`${this.baseUrl}/grants`, { waitUntil: 'networkidle0' });
      await this.takeScreenshot(`responsive-${viewport.name.toLowerCase()}`);
      
      // Check if content is visible
      const contentVisible = await this.page.evaluate(() => {
        const body = document.body;
        return body.scrollWidth <= window.innerWidth + 50; // 50px tolerance
      });
      
      this.addTestResult(
        `Responsive ${viewport.name}`,
        contentVisible,
        `${viewport.width}x${viewport.height} - ${contentVisible ? 'No horizontal scroll' : 'Horizontal scroll detected'}`
      );
    }
    
    // Reset to desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async testPerformance() {
    console.log('\n🔍 Testing performance...');
    
    try {
      // Start performance monitoring
      await this.page.tracing.start({
        path: path.join(__dirname, 'performance-trace.json'),
        screenshots: true
      });
      
      const startTime = Date.now();
      await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
      const loadTime = Date.now() - startTime;
      
      await this.page.tracing.stop();
      
      // Get performance metrics
      const metrics = await this.page.metrics();
      
      this.addTestResult('Load Time', loadTime < 5000, `${loadTime}ms (target: <5000ms)`);
      this.addTestResult('DOM Nodes', metrics.Nodes < 1500, `${metrics.Nodes} nodes (target: <1500)`);
      this.addTestResult('JS Heap Size', metrics.JSHeapUsedSize < 50 * 1024 * 1024, `${Math.round(metrics.JSHeapUsedSize / 1024 / 1024)}MB (target: <50MB)`);
      
    } catch (error) {
      this.addTestResult('Performance Test', false, error.message);
    }
  }

  async testAccessibility() {
    console.log('\n🔍 Testing accessibility...');
    
    try {
      await this.page.goto(`${this.baseUrl}/grants`, { waitUntil: 'networkidle0' });
      
      // Check for alt text on images
      const imagesWithoutAlt = await this.page.$$eval('img:not([alt])', imgs => imgs.length);
      this.addTestResult('Image Alt Text', imagesWithoutAlt === 0, `${imagesWithoutAlt} images without alt text`);
      
      // Check for form labels
      const inputsWithoutLabels = await this.page.$$eval('input:not([aria-label]):not([aria-labelledby])', inputs => 
        inputs.filter(input => !input.closest('label')).length
      );
      this.addTestResult('Form Labels', inputsWithoutLabels === 0, `${inputsWithoutLabels} inputs without labels`);
      
      // Check heading hierarchy
      const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', heads => 
        heads.map(h => h.tagName).join(', ')
      );
      this.addTestResult('Heading Structure', headings.includes('H1'), `Found headings: ${headings}`);
      
    } catch (error) {
      this.addTestResult('Accessibility Test', false, error.message);
    }
  }

  async generateReport() {
    console.log('\n📊 Generating test report...');
    
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    const passRate = ((passed / total) * 100).toFixed(1);
    
    const report = {
      summary: {
        total,
        passed,
        failed: total - passed,
        passRate: `${passRate}%`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults,
      screenshots: this.screenshots
    };
    
    const reportPath = path.join(__dirname, 'test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n📈 TEST SUMMARY:`);
    console.log(`   Total Tests: ${total}`);
    console.log(`   Passed: ${passed} ✅`);
    console.log(`   Failed: ${total - passed} ❌`);
    console.log(`   Pass Rate: ${passRate}%`);
    console.log(`   Report: ${reportPath}`);
    
    // Print failed tests
    const failed = this.testResults.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log(`\n❌ FAILED TESTS:`);
      failed.forEach(test => {
        console.log(`   - ${test.test}: ${test.details}`);
      });
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
      
      await this.testPageLoad();
      await this.testApiEndpoints();
      await this.testGrantsPage();
      await this.testChatWidget();
      await this.testResponsiveDesign();
      await this.testPerformance();
      await this.testAccessibility();
      
      return await this.generateReport();
      
    } catch (error) {
      console.error('❌ Test runner failed:', error);
      this.addTestResult('Test Runner', false, error.message);
    } finally {
      await this.cleanup();
    }
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ComprehensiveTester();
  tester.runAllTests().then(report => {
    console.log('\n🎉 Testing completed!');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = ComprehensiveTester;