const puppeteer = require('puppeteer');

async function testFixedGrantDetails() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🔍 Testing FIXED Grant Details with Database API...\n');
    
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for React and API to load
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Check if we're loading from API now
    const apiCheck = await page.evaluate(() => {
      // Look for console logs
      const bodyText = document.body.innerText;
      return {
        hasApiEndpointMessage: bodyText.includes('Loaded data from API endpoint'),
        hasStaticDataMessage: bodyText.includes('Loading'),
        currentUrl: window.location.href
      };
    });
    
    console.log('API Loading Check:', apiCheck);
    
    // Get the first grant card and test expansion
    const grantDetailTest = await page.evaluate(() => {
      const grantCards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
      if (grantCards.length === 0) return { error: 'No grant cards found' };
      
      // Get the first real grant card (not the sidebar)
      let targetCard = null;
      for (let i = 0; i < grantCards.length; i++) {
        const card = grantCards[i];
        const title = card.querySelector('h2');
        if (title && !title.textContent.includes('Filters') && !title.textContent.includes('Search')) {
          targetCard = card;
          break;
        }
      }
      
      if (!targetCard) return { error: 'No valid grant card found' };
      
      // Get grant info
      const grantTitle = targetCard.querySelector('h2')?.textContent || 'No title';
      const organization = targetCard.querySelector('[class*="text-blue"]')?.textContent || 'No org';
      
      // Look for View Details button
      const expandButton = targetCard.querySelector('button');
      if (!expandButton) return { error: 'No expand button found' };
      
      return {
        success: true,
        grantTitle: grantTitle,
        organization: organization,
        hasExpandButton: true,
        buttonText: expandButton.textContent
      };
    });
    
    console.log('Grant Card Test:', grantDetailTest);
    
    if (grantDetailTest.success) {
      // Click the expand button
      console.log(`\n📋 Expanding grant: ${grantDetailTest.grantTitle}`);
      
      await page.evaluate(() => {
        const grantCards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
        for (let i = 0; i < grantCards.length; i++) {
          const card = grantCards[i];
          const title = card.querySelector('h2');
          if (title && !title.textContent.includes('Filters') && !title.textContent.includes('Search')) {
            const button = card.querySelector('button');
            if (button) {
              button.click();
              break;
            }
          }
        }
      });
      
      // Wait for expansion
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Check for enhanced sections
      const enhancedSections = await page.evaluate(() => {
        const sections = [];
        const headings = Array.from(document.querySelectorAll('h3'));
        
        headings.forEach(h3 => {
          const text = h3.textContent.toUpperCase();
          if (text.includes('APPLICATION PROCEDURE')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Application Procedure', 
              hasContent: content.length > 50,
              preview: content.substring(0, 100) + '...'
            });
          }
          if (text.includes('REQUIRED DOCUMENTS')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Required Documents', 
              hasContent: content.length > 20,
              preview: content.substring(0, 100) + '...'
            });
          }
          if (text.includes('CONTACT INFORMATION')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Contact Information', 
              hasContent: content.length > 10,
              preview: content.substring(0, 100) + '...'
            });
          }
          if (text.includes('EVALUATION CRITERIA')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Evaluation Criteria', 
              hasContent: content.length > 20,
              preview: content.substring(0, 100) + '...'
            });
          }
          if (text.includes('DESCRIPTION')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Description', 
              hasContent: content.length > 50,
              preview: content.substring(0, 100) + '...'
            });
          }
          if (text.includes('ADDITIONAL REQUIREMENTS')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Additional Requirements', 
              hasContent: content.length > 20,
              preview: content.substring(0, 100) + '...'
            });
          }
          if (text.includes('REPORTING REQUIREMENTS')) {
            const content = h3.nextElementSibling?.textContent || h3.parentElement?.textContent || '';
            sections.push({ 
              type: 'Reporting Requirements', 
              hasContent: content.length > 20,
              preview: content.substring(0, 100) + '...'
            });
          }
        });
        
        return {
          totalSections: sections.length,
          sections: sections,
          emailLinks: document.querySelectorAll('a[href^="mailto:"]').length,
          coloredSections: document.querySelectorAll('[class*="bg-purple"], [class*="bg-blue"], [class*="bg-green"], [class*="bg-yellow"], [class*="bg-orange"], [class*="bg-indigo"]').length
        };
      });
      
      console.log('\n🎯 Enhanced Sections Analysis:');
      console.log(`Total sections found: ${enhancedSections.totalSections}`);
      console.log(`Email links: ${enhancedSections.emailLinks}`);
      console.log(`Color-coded elements: ${enhancedSections.coloredSections}`);
      
      enhancedSections.sections.forEach(section => {
        console.log(`\n✅ ${section.type}:`);
        console.log(`   Has substantial content: ${section.hasContent ? 'YES' : 'NO'}`);
        console.log(`   Preview: ${section.preview}`);
      });
      
      // Take screenshot
      await page.screenshot({ path: 'fixed-grant-details-test.png', fullPage: true });
      console.log('\n📸 Screenshot saved as fixed-grant-details-test.png');
      
      console.log('\n🎉 FINAL RESULTS:');
      console.log(`✅ Using API data: ${apiCheck.hasApiEndpointMessage ? 'YES' : 'UNKNOWN'}`);
      console.log(`✅ Enhanced sections: ${enhancedSections.totalSections > 0 ? 'YES' : 'NO'} (${enhancedSections.totalSections} found)`);
      console.log(`✅ Detailed content: ${enhancedSections.sections.some(s => s.hasContent) ? 'YES' : 'NO'}`);
      console.log(`✅ Contact emails: ${enhancedSections.emailLinks > 0 ? 'YES' : 'NO'}`);
      console.log(`✅ Color styling: ${enhancedSections.coloredSections > 0 ? 'YES' : 'NO'}`);
      
      if (enhancedSections.sections.some(s => s.hasContent)) {
        console.log('\n🎉 SUCCESS! The detailed grant information is now showing properly!');
      } else {
        console.log('\n⚠️ Issue: Sections found but content seems limited');
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testFixedGrantDetails();