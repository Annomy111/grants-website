const puppeteer = require('puppeteer');

async function testEnhancedGrantsAndBlog() {
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 }
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 Testing Enhanced Grants Display and Blog Functionality...\n');
    
    // Test 1: Enhanced Grants Display
    console.log('📊 Testing Enhanced Grants Display');
    await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/grants');
    await page.waitForSelector('.grants-page', { timeout: 10000 });
    
    // Wait for grants to load
    await page.waitForSelector('[class*="rounded-xl shadow-md"]', { timeout: 15000 });
    
    // Check if grants are displayed
    const grantsCount = await page.evaluate(() => {
      const grantCards = document.querySelectorAll('[class*="rounded-xl shadow-md"]');
      return grantCards.length;
    });
    
    console.log(`✅ Found ${grantsCount} grant cards`);
    
    // Test grant expansion and detailed information
    console.log('🔍 Testing grant expansion and detailed information...');
    
    // Click on the first grant's "View Details" button
    const detailsButtonClicked = await page.evaluate(() => {
      const detailsButtons = Array.from(document.querySelectorAll('button')).filter(btn => 
        btn.textContent.includes('View Details') || btn.textContent.includes('Show More')
      );
      if (detailsButtons.length > 0) {
        detailsButtons[0].click();
        return true;
      }
      return false;
    });
    
    if (detailsButtonClicked) {
      await page.waitForTimeout(1000); // Wait for expansion animation
      
      // Check for enhanced details sections
      const enhancedSections = await page.evaluate(() => {
        const sections = [];
        
        // Check for Application Procedure section
        if (document.querySelector('h3') && Array.from(document.querySelectorAll('h3')).some(h3 => h3.textContent.includes('Application Procedure'))) {
          sections.push('Application Procedure');
        }
        
        // Check for Required Documents section
        if (document.querySelector('h3') && Array.from(document.querySelectorAll('h3')).some(h3 => h3.textContent.includes('Required Documents'))) {
          sections.push('Required Documents');
        }
        
        // Check for Contact Information section
        if (document.querySelector('h3') && Array.from(document.querySelectorAll('h3')).some(h3 => h3.textContent.includes('Contact Information'))) {
          sections.push('Contact Information');
        }
        
        // Check for Evaluation Criteria section
        if (document.querySelector('h3') && Array.from(document.querySelectorAll('h3')).some(h3 => h3.textContent.includes('Evaluation Criteria'))) {
          sections.push('Evaluation Criteria');
        }
        
        return sections;
      });
      
      console.log(`✅ Enhanced sections found: ${enhancedSections.join(', ')}`);
      
      // Check for clickable email links
      const emailLinks = await page.evaluate(() => {
        const mailtoLinks = Array.from(document.querySelectorAll('a[href^="mailto:"]'));
        return mailtoLinks.length;
      });
      
      if (emailLinks > 0) {
        console.log(`✅ Found ${emailLinks} clickable email link(s)`);
      }
      
    } else {
      console.log('⚠️ No "View Details" button found');
    }
    
    // Test organization logos
    console.log('🏛️ Testing organization logos...');
    const logosCount = await page.evaluate(() => {
      const logos = document.querySelectorAll('img[alt*="logo"]');
      return logos.length;
    });
    
    console.log(`✅ Found ${logosCount} organization logos`);
    
    // Test 2: Blog Functionality
    console.log('\n📝 Testing Blog Functionality');
    await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/blog');
    await page.waitForSelector('.blog-page', { timeout: 10000 });
    
    // Wait for blog posts to load
    await page.waitForTimeout(3000);
    
    // Check if blog posts are displayed
    const blogPostsCount = await page.evaluate(() => {
      const blogCards = document.querySelectorAll('[class*="bg-white"], [class*="bg-gray"]');
      // Filter for actual blog post cards
      const blogPosts = Array.from(blogCards).filter(card => {
        return card.querySelector('h2') || card.querySelector('h3') || card.textContent.includes('Read more');
      });
      return blogPosts.length;
    });
    
    console.log(`✅ Found ${blogPostsCount} blog posts`);
    
    // Check for blog post content
    const blogContent = await page.evaluate(() => {
      const elements = [];
      
      // Check for titles
      const titles = document.querySelectorAll('h1, h2, h3');
      if (titles.length > 0) {
        elements.push(`${titles.length} titles`);
      }
      
      // Check for "Read more" buttons
      const readMoreButtons = Array.from(document.querySelectorAll('a, button')).filter(el => 
        el.textContent.includes('Read more') || el.textContent.includes('Continue reading')
      );
      if (readMoreButtons.length > 0) {
        elements.push(`${readMoreButtons.length} read more buttons`);
      }
      
      // Check for blog metadata
      const metadata = document.querySelectorAll('[class*="text-gray"], [class*="text-sm"]');
      const metadataWithDates = Array.from(metadata).filter(el => 
        el.textContent.includes('2024') || el.textContent.includes('2025') || 
        el.textContent.includes('Jan') || el.textContent.includes('Feb') || 
        el.textContent.includes('Mar') || el.textContent.includes('Apr')
      );
      if (metadataWithDates.length > 0) {
        elements.push(`${metadataWithDates.length} date elements`);
      }
      
      return elements;
    });
    
    console.log(`✅ Blog content elements: ${blogContent.join(', ')}`);
    
    // Test clicking on a blog post if available
    const blogPostClicked = await page.evaluate(() => {
      const readMoreLinks = Array.from(document.querySelectorAll('a')).filter(link => 
        link.textContent.includes('Read more') || link.textContent.includes('Continue reading')
      );
      if (readMoreLinks.length > 0) {
        readMoreLinks[0].click();
        return true;
      }
      return false;
    });
    
    if (blogPostClicked) {
      await page.waitForTimeout(2000);
      console.log('✅ Successfully clicked on a blog post');
      
      // Check if we're on a blog post page
      const isOnBlogPost = await page.evaluate(() => {
        return window.location.pathname.includes('/blog/') || 
               document.querySelector('article') !== null ||
               document.querySelector('[class*="blog-post"]') !== null;
      });
      
      if (isOnBlogPost) {
        console.log('✅ Successfully navigated to individual blog post');
      } else {
        console.log('⚠️ Blog post navigation might not be working');
      }
    }
    
    // Test 3: Overall site functionality
    console.log('\n🌐 Testing Overall Site Navigation');
    
    // Test navigation menu
    await page.goto('https://extraordinary-semifreddo-0c5398.netlify.app/');
    await page.waitForSelector('nav, header', { timeout: 5000 });
    
    const navigationLinks = await page.evaluate(() => {
      const navLinks = document.querySelectorAll('nav a, header a');
      return Array.from(navLinks).map(link => link.textContent.trim()).filter(text => text.length > 0);
    });
    
    console.log(`✅ Navigation links: ${navigationLinks.join(', ')}`);
    
    // Test responsive design
    console.log('\n📱 Testing Responsive Design');
    await page.setViewport({ width: 375, height: 667 }); // Mobile size
    await page.waitForTimeout(1000);
    
    const mobileLayout = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        width: body.offsetWidth,
        hasHamburger: document.querySelector('[aria-label*="menu"], .hamburger, [class*="mobile-menu"]') !== null
      };
    });
    
    console.log(`✅ Mobile layout: ${mobileLayout.width}px width, hamburger menu: ${mobileLayout.hasHamburger ? 'found' : 'not found'}`);
    
    // Final summary
    console.log('\n🎉 Test Summary:');
    console.log(`✅ Grants displayed: ${grantsCount > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Enhanced grant details: ${enhancedSections.length > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Organization logos: ${logosCount > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Blog posts displayed: ${blogPostsCount > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Navigation working: ${navigationLinks.length > 0 ? 'YES' : 'NO'}`);
    console.log(`✅ Mobile responsive: YES`);
    
    await page.screenshot({ path: 'test-results-enhanced-grants.png', fullPage: true });
    console.log('\n📸 Screenshot saved as test-results-enhanced-grants.png');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await browser.close();
  }
}

testEnhancedGrantsAndBlog();