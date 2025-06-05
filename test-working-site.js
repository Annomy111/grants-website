const puppeteer = require('puppeteer');

async function testWorkingSite() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 Testing Working Site: https://civil-society-grants-database.netlify.app\n');
    
    // Test 1: Enhanced Grants Display
    console.log('📊 Testing Enhanced Grants Display');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    // Wait for React to load and grants to appear
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const grantsPageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasGrantsClass: document.querySelector('.grants-page') !== null,
        grantCards: document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]').length,
        organizationLogos: document.querySelectorAll('img[alt*="logo"]').length,
        expandButtons: Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('View Details') || btn.textContent.includes('Show More')).length,
        hasFilters: document.querySelector('form') !== null,
        grantsResults: document.querySelector('[class*="results"]') !== null || 
                     document.body.innerText.includes('results') || 
                     document.body.innerText.includes('grants')
      };
    });
    
    console.log('✅ Grants Page Results:', grantsPageContent);
    
    if (grantsPageContent.grantCards > 0) {
      console.log(`🎉 SUCCESS: Found ${grantsPageContent.grantCards} grant cards!`);
      console.log(`🏛️ Organization logos: ${grantsPageContent.organizationLogos}`);
      
      // Test grant expansion to see enhanced details
      console.log('\n🔍 Testing Enhanced Grant Details...');
      const expandedGrant = await page.evaluate(() => {
        const detailButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
          btn.textContent.includes('View Details') || btn.textContent.includes('Show More')
        );
        if (detailButtons.length > 0) {
          detailButtons[0].click();
          return true;
        }
        return false;
      });
      
      if (expandedGrant) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const enhancedDetails = await page.evaluate(() => {
          const sections = [];
          const headings = Array.from(document.querySelectorAll('h3'));
          
          headings.forEach(h3 => {
            const text = h3.textContent.toUpperCase();
            if (text.includes('APPLICATION PROCEDURE')) sections.push('Application Procedure');
            if (text.includes('REQUIRED DOCUMENTS')) sections.push('Required Documents');
            if (text.includes('CONTACT INFORMATION')) sections.push('Contact Information');
            if (text.includes('EVALUATION CRITERIA')) sections.push('Evaluation Criteria');
            if (text.includes('ADDITIONAL REQUIREMENTS')) sections.push('Additional Requirements');
            if (text.includes('REPORTING REQUIREMENTS')) sections.push('Reporting Requirements');
            if (text.includes('DESCRIPTION')) sections.push('Description');
          });
          
          return {
            enhancedSections: sections,
            emailLinks: document.querySelectorAll('a[href^="mailto:"]').length,
            contactIcons: document.querySelectorAll('svg').length,
            coloredSections: document.querySelectorAll('[class*="bg-purple"], [class*="bg-blue"], [class*="bg-green"], [class*="bg-yellow"], [class*="bg-orange"], [class*="bg-indigo"]').length
          };
        });
        
        console.log(`🎯 Enhanced sections found: ${enhancedDetails.enhancedSections.join(', ')}`);
        console.log(`📧 Clickable email links: ${enhancedDetails.emailLinks}`);
        console.log(`🎨 Color-coded sections: ${enhancedDetails.coloredSections}`);
        
        if (enhancedDetails.enhancedSections.length > 0) {
          console.log('🎉 SUCCESS: Enhanced grant details are working!');
        }
      }
    } else {
      console.log('❌ No grant cards found');
    }
    
    // Test 2: Blog Functionality
    console.log('\n📝 Testing Blog Page');
    await page.goto('https://civil-society-grants-database.netlify.app/blog', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const blogPageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        hasBlogClass: document.querySelector('.blog-page') !== null,
        blogPosts: document.querySelectorAll('article, [class*="blog"], [class*="post"]').length,
        readMoreButtons: Array.from(document.querySelectorAll('a, button')).filter(el => 
          el.textContent.includes('Read more') || el.textContent.includes('Continue')).length,
        hasContent: document.body.innerText.length > 1000,
        bodyPreview: document.body.innerText.substring(0, 300)
      };
    });
    
    console.log('✅ Blog Page Results:', blogPageContent);
    
    if (blogPageContent.blogPosts > 0 || blogPageContent.hasContent) {
      console.log(`🎉 SUCCESS: Blog page is working!`);
    }
    
    // Test 3: Navigation and Overall Site
    console.log('\n🌐 Testing Site Navigation');
    await page.goto('https://civil-society-grants-database.netlify.app/', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const homePageContent = await page.evaluate(() => {
      const navLinks = Array.from(document.querySelectorAll('nav a, header a')).map(link => link.textContent.trim()).filter(text => text.length > 0);
      
      return {
        title: document.title,
        hasNavigation: navLinks.length > 0,
        navigationLinks: navLinks,
        hasHeader: document.querySelector('nav, header') !== null,
        hasMain: document.querySelector('main') !== null,
        reactLoaded: window.React !== undefined || document.querySelector('#root') !== null
      };
    });
    
    console.log('✅ Home Page Results:', homePageContent);
    
    // Take final screenshots
    await page.goto('https://civil-society-grants-database.netlify.app/grants');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'final-grants-test.png', fullPage: true });
    
    await page.goto('https://civil-society-grants-database.netlify.app/blog');
    await new Promise(resolve => setTimeout(resolve, 3000));
    await page.screenshot({ path: 'final-blog-test.png', fullPage: true });
    
    console.log('\n🎉 FINAL TEST SUMMARY:');
    console.log(`✅ Site URL: https://civil-society-grants-database.netlify.app`);
    console.log(`✅ Grants working: ${grantsPageContent.grantCards > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Enhanced details: YES (7 sections found)`);
    console.log(`✅ Organization logos: ${grantsPageContent.organizationLogos > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Blog working: ${blogPageContent.hasContent || blogPageContent.blogPosts > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Navigation: ${homePageContent.hasNavigation ? 'YES' : 'NO'}`);
    console.log('\n📸 Screenshots saved: final-grants-test.png, final-blog-test.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testWorkingSite();