const puppeteer = require('puppeteer');

async function investigateGrantInfo() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔍 Investigating Grant Information Display...\n');
    
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Check what data is actually being loaded
    const dataAnalysis = await page.evaluate(() => {
      // Check if grants data is loaded
      const grantCards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
      
      if (grantCards.length === 0) return { error: 'No grant cards found' };
      
      // Analyze the first few grant cards
      const grantsData = [];
      
      for (let i = 0; i < Math.min(3, grantCards.length); i++) {
        const card = grantCards[i];
        
        // Extract visible information
        const grantInfo = {
          index: i,
          title: card.querySelector('h2')?.textContent || 'No title',
          organization: card.querySelector('[class*="text-blue"]')?.textContent || 'No org',
          amount: '',
          deadline: '',
          description: '',
          focusAreas: '',
          eligibility: '',
          hasExpandButton: false,
          expandedSections: []
        };
        
        // Find amount
        const amountEl = Array.from(card.querySelectorAll('*')).find(el => 
          el.textContent.includes('€') || el.textContent.includes('$') || 
          el.textContent.includes('Amount') || el.textContent.includes('varies')
        );
        grantInfo.amount = amountEl?.textContent || 'Not found';
        
        // Find deadline
        const deadlineEl = Array.from(card.querySelectorAll('*')).find(el => 
          el.textContent.includes('2025') || el.textContent.includes('2024') ||
          el.textContent.includes('Deadline')
        );
        grantInfo.deadline = deadlineEl?.textContent || 'Not found';
        
        // Check for expand button
        const expandBtn = card.querySelector('button');
        if (expandBtn && (expandBtn.textContent.includes('View Details') || expandBtn.textContent.includes('Show More'))) {
          grantInfo.hasExpandButton = true;
        }
        
        // Check visible text content
        const cardText = card.textContent;
        grantInfo.totalTextLength = cardText.length;
        grantInfo.hasDetailedInfo = cardText.includes('Application Procedure') || 
                                   cardText.includes('Required Documents') ||
                                   cardText.includes('Contact Information');
        
        grantsData.push(grantInfo);
      }
      
      return {
        totalGrants: grantCards.length,
        grantsAnalysis: grantsData,
        pageSource: document.body.innerText.substring(0, 1000)
      };
    });
    
    console.log('📊 Current Data Analysis:', JSON.stringify(dataAnalysis, null, 2));
    
    // Now try to expand a grant and see what happens
    console.log('\n🔍 Testing Grant Expansion...');
    
    const expansionTest = await page.evaluate(() => {
      const expandButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('View Details') || btn.textContent.includes('Show More')
      );
      
      if (expandButtons.length === 0) {
        return { error: 'No expand buttons found' };
      }
      
      // Click the first expand button
      expandButtons[0].click();
      
      return { success: 'Clicked expand button' };
    });
    
    console.log('Expansion result:', expansionTest);
    
    // Wait for expansion and check what appears
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const expandedContent = await page.evaluate(() => {
      // Look for enhanced sections
      const sections = [];
      const headings = Array.from(document.querySelectorAll('h3'));
      
      headings.forEach(h3 => {
        const text = h3.textContent.toUpperCase();
        if (text.includes('APPLICATION PROCEDURE')) {
          const content = h3.parentElement?.textContent || h3.nextElementSibling?.textContent || 'No content';
          sections.push({ type: 'Application Procedure', content: content.substring(0, 200) });
        }
        if (text.includes('REQUIRED DOCUMENTS')) {
          const content = h3.parentElement?.textContent || h3.nextElementSibling?.textContent || 'No content';
          sections.push({ type: 'Required Documents', content: content.substring(0, 200) });
        }
        if (text.includes('CONTACT INFORMATION')) {
          const content = h3.parentElement?.textContent || h3.nextElementSibling?.textContent || 'No content';
          sections.push({ type: 'Contact Information', content: content.substring(0, 200) });
        }
        if (text.includes('DESCRIPTION')) {
          const content = h3.parentElement?.textContent || h3.nextElementSibling?.textContent || 'No content';
          sections.push({ type: 'Description', content: content.substring(0, 200) });
        }
      });
      
      return {
        sectionsFound: sections.length,
        sections: sections,
        totalEmailLinks: document.querySelectorAll('a[href^="mailto:"]').length,
        expandedCardText: document.querySelector('[class*="rounded-xl"][class*="shadow-md"]')?.textContent?.substring(0, 500) || 'No expanded card found'
      };
    });
    
    console.log('\n📋 Expanded Content Analysis:', JSON.stringify(expandedContent, null, 2));
    
    // Take a screenshot to see the current state
    await page.screenshot({ path: 'grant-info-investigation.png', fullPage: true });
    console.log('\n📸 Screenshot saved as grant-info-investigation.png');
    
    // Check what data is being fetched from the API
    console.log('\n🌐 Checking Data Source...');
    const apiCheck = await page.evaluate(() => {
      // Check if we can see what API endpoint is being used
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasApiCalls = document.body.innerText.includes('/.netlify/functions') || 
                         document.body.innerText.includes('/api/') ||
                         window.location.search.includes('debug');
      
      return {
        hasApiCalls: hasApiCalls,
        currentUrl: window.location.href,
        bodyIncludes: {
          netlifyFunctions: document.body.innerText.includes('/.netlify/functions'),
          apiEndpoint: document.body.innerText.includes('/api/'),
          dataFolder: document.body.innerText.includes('/data/')
        }
      };
    });
    
    console.log('API Check:', apiCheck);
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  } finally {
    await browser.close();
  }
}

investigateGrantInfo();