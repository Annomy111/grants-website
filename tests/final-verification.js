const puppeteer = require('puppeteer');

async function finalVerification() {
  console.log('🎯 FINAL VERIFICATION TEST');
  console.log('=========================');
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    // Test 1: Logo fix
    console.log('\n🔍 Testing logo fix...');
    await page.goto('https://civil-society-grants-database.netlify.app');
    
    const logoError = await page.evaluate(() => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(false);
        img.onerror = () => resolve(true);
        img.src = '/logo192.png';
      });
    });
    
    console.log(`📱 Logo192.png error: ${logoError ? '❌ Still broken' : '✅ Fixed'}`);
    
    // Test 2: Grants loading
    console.log('\n🔍 Testing grants loading...');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { waitUntil: 'networkidle0' });
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const grantsTest = await page.evaluate(() => {
      const cards = document.querySelectorAll('div.space-y-6 > div');
      const hasGrantContent = Array.from(cards).some(card => 
        card.textContent.includes('Council of Europe') || 
        card.textContent.includes('European Union')
      );
      
      return {
        cardCount: cards.length,
        hasContent: hasGrantContent
      };
    });
    
    console.log(`📊 Grants: ${grantsTest.cardCount} cards, Content: ${grantsTest.hasContent ? '✅' : '❌'}`);
    
    // Test 3: API endpoints
    console.log('\n🔍 Testing API endpoints...');
    const apiTest = await page.evaluate(async () => {
      try {
        const grantsRes = await fetch('/.netlify/functions/grants');
        const grantsData = await grantsRes.json();
        
        const filtersRes = await fetch('/.netlify/functions/grants/filters');
        const filtersData = await filtersRes.json();
        
        return {
          grantsOk: grantsRes.ok,
          grantsCount: Array.isArray(grantsData) ? grantsData.length : 0,
          filtersOk: filtersRes.ok,
          hasFilters: filtersData && filtersData.organizations && filtersData.countries
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log(`🔌 Grants API: ${apiTest.grantsOk ? '✅' : '❌'} (${apiTest.grantsCount} grants)`);
    console.log(`🔌 Filters API: ${apiTest.filtersOk ? '✅' : '❌'} (${apiTest.hasFilters ? 'valid' : 'invalid'})`);
    
    // Test 4: Chat widget
    console.log('\n🔍 Testing chat widget...');
    const chatTest = await page.evaluate(() => {
      // Look for fixed bottom-right elements that could be chat
      const fixedElements = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = getComputedStyle(el);
        return style.position === 'fixed' && 
               (el.className.includes('bottom') || el.className.includes('right'));
      });
      
      // Look for any chat-related content
      const hasChatText = document.body.innerHTML.toLowerCase().includes('chat');
      
      return {
        fixedElements: fixedElements.length,
        hasChatText,
        elementClasses: fixedElements.map(el => el.className)
      };
    });
    
    console.log(`💬 Chat widget: ${chatTest.fixedElements > 0 ? '✅' : '❌'} (${chatTest.fixedElements} fixed elements)`);
    console.log(`💬 Chat content: ${chatTest.hasChatText ? '✅' : '❌'}`);
    
    // Test 5: Performance
    console.log('\n🔍 Testing performance...');
    const startTime = Date.now();
    await page.goto('https://civil-society-grants-database.netlify.app', { waitUntil: 'networkidle0' });
    const loadTime = Date.now() - startTime;
    
    console.log(`⚡ Load time: ${loadTime}ms ${loadTime < 3000 ? '✅' : '❌'}`);
    
    // Final summary
    console.log('\n📋 FINAL SUMMARY:');
    console.log('================');
    
    const issues = [];
    if (logoError) issues.push('Logo error');
    if (!grantsTest.hasContent) issues.push('Grants not loading');
    if (!apiTest.grantsOk) issues.push('Grants API broken');
    if (!apiTest.filtersOk) issues.push('Filters API broken');
    if (chatTest.fixedElements === 0) issues.push('Chat widget missing');
    if (loadTime >= 3000) issues.push('Slow load time');
    
    if (issues.length === 0) {
      console.log('🎉 ALL TESTS PASSED! Website is production ready!');
    } else {
      console.log(`❌ ${issues.length} issues found:`);
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return {
      passed: issues.length === 0,
      issues,
      metrics: {
        logoFixed: !logoError,
        grantsLoading: grantsTest.hasContent,
        grantsCount: grantsTest.cardCount,
        apiWorking: apiTest.grantsOk && apiTest.filtersOk,
        chatPresent: chatTest.fixedElements > 0,
        loadTime
      }
    };
    
  } finally {
    await browser.close();
  }
}

finalVerification().then(result => {
  console.log('\n🏁 Final verification completed!');
  process.exit(result.passed ? 0 : 1);
});