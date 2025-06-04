const puppeteer = require('puppeteer');

class BrowserConsoleTest {
  constructor() {
    this.browser = null;
    this.page = null;
    this.consoleMessages = [];
    this.networkRequests = [];
    this.errors = [];
  }

  async initialize() {
    console.log('🚀 Initializing browser for console testing...');
    
    try {
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: { width: 1200, height: 800 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      this.page = await this.browser.newPage();
      
      // Capture console messages
      this.page.on('console', msg => {
        const logEntry = {
          type: msg.type(),
          text: msg.text(),
          location: msg.location(),
          timestamp: new Date().toISOString()
        };
        this.consoleMessages.push(logEntry);
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
      });

      // Capture network requests
      this.page.on('request', request => {
        this.networkRequests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
          timestamp: new Date().toISOString(),
          type: 'request'
        });
      });

      this.page.on('response', response => {
        this.networkRequests.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          timestamp: new Date().toISOString(),
          type: 'response'
        });
      });

      // Capture JavaScript errors
      this.page.on('pageerror', error => {
        const errorEntry = {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        };
        this.errors.push(errorEntry);
        console.error(`[PAGE ERROR] ${error.message}`);
      });

      console.log('✅ Browser initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error.message);
      throw error;
    }
  }

  async navigateToSite() {
    console.log('🌐 Navigating to production site...');
    
    try {
      await this.page.goto('https://civil-society-grants-database.netlify.app', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      
      console.log('✅ Successfully loaded the site');
      
      // Wait for React to load
      await new Promise(resolve => setTimeout(resolve, 3000));
      
    } catch (error) {
      console.error('❌ Failed to navigate to site:', error.message);
      throw error;
    }
  }

  async testChatWidgetPresence() {
    console.log('🔍 Testing chat widget presence...');
    
    try {
      // Look for chat widget button
      const chatButton = await this.page.$('[aria-label*="chat" i], button[class*="chat" i], .chat-button, .chat-widget');
      
      if (chatButton) {
        console.log('✅ Chat widget button found');
        
        // Get button properties
        const buttonText = await this.page.evaluate(el => el.textContent, chatButton);
        const buttonClass = await this.page.evaluate(el => el.className, chatButton);
        const buttonId = await this.page.evaluate(el => el.id, chatButton);
        
        console.log(`Button text: "${buttonText}"`);
        console.log(`Button class: "${buttonClass}"`);
        console.log(`Button ID: "${buttonId}"`);
        
        return true;
      } else {
        console.log('⚠️ Chat widget button not found - checking for other chat elements');
        
        // Check for any element containing "chat"
        const chatElements = await this.page.$$eval('*', els => 
          els.filter(el => 
            el.textContent?.toLowerCase().includes('chat') || 
            el.className?.toLowerCase().includes('chat') ||
            el.id?.toLowerCase().includes('chat')
          ).map(el => ({
            tagName: el.tagName,
            className: el.className,
            id: el.id,
            textContent: el.textContent?.slice(0, 100)
          }))
        );
        
        if (chatElements.length > 0) {
          console.log('✅ Chat-related elements found:', chatElements);
          return true;
        } else {
          console.log('❌ No chat-related elements found');
          return false;
        }
      }
      
    } catch (error) {
      console.error('❌ Error testing chat widget presence:', error.message);
      return false;
    }
  }

  async testChatWidgetInteraction() {
    console.log('🖱️ Testing chat widget interaction...');
    
    try {
      // Look for chat widget button more broadly
      let chatButton = await this.page.$('button[class*="chat" i]');
      
      if (!chatButton) {
        // Try alternative selectors
        chatButton = await this.page.$('.fixed.bottom-6.right-6 button');
      }
      
      if (!chatButton) {
        // Try to find any button in bottom-right area
        chatButton = await this.page.$('button[class*="fixed" i][class*="bottom" i]');
      }
      
      if (chatButton) {
        console.log('✅ Found chat button, attempting to click...');
        
        // Click the chat button
        await chatButton.click();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Look for chat widget opened
        const chatWidget = await this.page.$('.chat-widget, [class*="chat"][class*="widget" i], .fixed.bottom-24');
        
        if (chatWidget) {
          console.log('✅ Chat widget opened successfully');
          
          // Look for input field
          const inputField = await this.page.$('input[placeholder*="chat" i], input[placeholder*="message" i], textarea[placeholder*="chat" i]');
          
          if (inputField) {
            console.log('✅ Chat input field found');
            
            // Try to type a message
            await inputField.type('Hello, can you help me find grants?');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Look for send button
            const sendButton = await this.page.$('button[type="submit"], button[aria-label*="send" i], button svg[class*="paper" i]');
            
            if (sendButton) {
              console.log('✅ Send button found, sending message...');
              
              // Monitor network requests before sending
              const requestsBeforeSend = this.networkRequests.length;
              
              await sendButton.click();
              
              // Wait for potential API call
              await new Promise(resolve => setTimeout(resolve, 5000));
              
              // Check if any API requests were made
              const newRequests = this.networkRequests.slice(requestsBeforeSend);
              const chatApiRequests = newRequests.filter(req => 
                req.url.includes('/chat') || req.url.includes('/.netlify/functions/')
              );
              
              if (chatApiRequests.length > 0) {
                console.log('✅ Chat API requests detected:', chatApiRequests.length);
                chatApiRequests.forEach(req => {
                  console.log(`  - ${req.type}: ${req.url} (${req.status || 'pending'})`);
                });
              } else {
                console.log('⚠️ No chat API requests detected');
              }
              
              // Look for response in chat
              const chatMessages = await this.page.$$eval('.chat-message, [class*="message" i], .bot-message, .user-message', 
                els => els.map(el => el.textContent?.slice(0, 200))
              );
              
              if (chatMessages.length > 0) {
                console.log('✅ Chat messages found:', chatMessages);
              } else {
                console.log('⚠️ No chat messages found after sending');
              }
              
            } else {
              console.log('❌ Send button not found');
            }
            
          } else {
            console.log('❌ Chat input field not found');
          }
          
        } else {
          console.log('❌ Chat widget did not open');
        }
        
      } else {
        console.log('❌ No chat button found for interaction');
      }
      
    } catch (error) {
      console.error('❌ Error during chat widget interaction:', error.message);
    }
  }

  async inspectNetworkRequests() {
    console.log('🌐 Analyzing network requests...');
    
    const apiRequests = this.networkRequests.filter(req => 
      req.url.includes('/.netlify/functions/') || 
      req.url.includes('/api/') ||
      req.url.includes('/chat')
    );
    
    const failedRequests = this.networkRequests.filter(req => 
      req.type === 'response' && req.status >= 400
    );
    
    console.log(`Total network requests: ${this.networkRequests.length}`);
    console.log(`API requests: ${apiRequests.length}`);
    console.log(`Failed requests: ${failedRequests.length}`);
    
    if (apiRequests.length > 0) {
      console.log('\n📡 API Requests:');
      apiRequests.forEach(req => {
        console.log(`  ${req.type}: ${req.url} ${req.status ? `(${req.status})` : ''}`);
      });
    }
    
    if (failedRequests.length > 0) {
      console.log('\n❌ Failed Requests:');
      failedRequests.forEach(req => {
        console.log(`  ${req.status}: ${req.url}`);
      });
    }
  }

  async analyzeConsoleMessages() {
    console.log('📝 Analyzing console messages...');
    
    const errorMessages = this.consoleMessages.filter(msg => msg.type === 'error');
    const warningMessages = this.consoleMessages.filter(msg => msg.type === 'warning');
    const logMessages = this.consoleMessages.filter(msg => msg.type === 'log');
    
    console.log(`Total console messages: ${this.consoleMessages.length}`);
    console.log(`Errors: ${errorMessages.length}`);
    console.log(`Warnings: ${warningMessages.length}`);
    console.log(`Logs: ${logMessages.length}`);
    
    if (errorMessages.length > 0) {
      console.log('\n🚨 Console Errors:');
      errorMessages.forEach(msg => {
        console.log(`  ${msg.text}`);
      });
    }
    
    if (warningMessages.length > 0) {
      console.log('\n⚠️ Console Warnings:');
      warningMessages.forEach(msg => {
        console.log(`  ${msg.text}`);
      });
    }
  }

  async runFullTest() {
    console.log('🧪 Starting comprehensive browser testing...');
    
    try {
      await this.initialize();
      await this.navigateToSite();
      
      // Take initial screenshot
      await this.page.screenshot({ path: 'initial-load.png', fullPage: true });
      console.log('📸 Initial screenshot saved');
      
      await this.testChatWidgetPresence();
      await this.testChatWidgetInteraction();
      
      // Take final screenshot
      await this.page.screenshot({ path: 'after-interaction.png', fullPage: true });
      console.log('📸 Final screenshot saved');
      
      await this.inspectNetworkRequests();
      await this.analyzeConsoleMessages();
      
      // Generate final report
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Test failed:', error.message);
    } finally {
      if (this.browser) {
        await this.browser.close();
        console.log('🔒 Browser closed');
      }
    }
  }

  generateReport() {
    console.log('\n📊 BROWSER TEST REPORT');
    console.log('======================');
    
    const report = {
      timestamp: new Date().toISOString(),
      consoleMessages: {
        total: this.consoleMessages.length,
        errors: this.consoleMessages.filter(m => m.type === 'error').length,
        warnings: this.consoleMessages.filter(m => m.type === 'warning').length
      },
      networkRequests: {
        total: this.networkRequests.length,
        apiRequests: this.networkRequests.filter(r => 
          r.url.includes('/.netlify/functions/') || r.url.includes('/api/')
        ).length,
        failedRequests: this.networkRequests.filter(r => 
          r.type === 'response' && r.status >= 400
        ).length
      },
      errors: this.errors.length,
      chatWidget: {
        detectedInDOM: this.consoleMessages.some(m => 
          m.text.toLowerCase().includes('chat') || 
          m.text.toLowerCase().includes('widget')
        )
      }
    };
    
    console.log('Summary:');
    console.log(`- Console errors: ${report.consoleMessages.errors}`);
    console.log(`- Console warnings: ${report.consoleMessages.warnings}`);
    console.log(`- Failed network requests: ${report.networkRequests.failedRequests}`);
    console.log(`- JavaScript errors: ${report.errors}`);
    
    if (report.consoleMessages.errors === 0 && report.networkRequests.failedRequests === 0 && report.errors === 0) {
      console.log('\n✅ BROWSER TEST PASSED - No critical issues detected');
    } else {
      console.log('\n⚠️ BROWSER TEST FOUND ISSUES - Check details above');
    }
    
    return report;
  }
}

// Run the test
async function runBrowserTest() {
  const test = new BrowserConsoleTest();
  await test.runFullTest();
}

if (require.main === module) {
  runBrowserTest().catch(console.error);
}

module.exports = { BrowserConsoleTest };