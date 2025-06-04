const puppeteer = require('puppeteer');

async function quickDebug() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto('https://civil-society-grants-database.netlify.app/grants', { 
      waitUntil: 'networkidle0' 
    });
    
    // Wait for React to render
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get actual DOM structure
    const analysis = await page.evaluate(() => {
      // Find all elements that might contain grants
      const allDivs = Array.from(document.querySelectorAll('div'));
      const grantsContainer = allDivs.find(div => 
        div.textContent.includes('Council of Europe') || 
        div.textContent.includes('Grant Name') ||
        div.textContent.includes('grant')
      );
      
      // Get chat button info
      const buttons = Array.from(document.querySelectorAll('button')).map(btn => ({
        text: btn.textContent.trim(),
        classes: btn.className
      }));
      
      return {
        grantsContainerFound: !!grantsContainer,
        grantsContainerClasses: grantsContainer?.className || 'Not found',
        grantsContainerTag: grantsContainer?.tagName || 'Not found',
        grantsText: grantsContainer?.textContent?.substring(0, 200) || 'Not found',
        totalButtons: buttons.length,
        chatButtons: buttons.filter(btn => 
          btn.text.toLowerCase().includes('chat') || 
          btn.classes.includes('chat')
        ),
        allButtons: buttons
      };
    });
    
    console.log('🔍 QUICK DEBUG RESULTS:');
    console.log('========================');
    console.log(`Grants container found: ${analysis.grantsContainerFound}`);
    console.log(`Grants container classes: ${analysis.grantsContainerClasses}`);
    console.log(`Grants container tag: ${analysis.grantsContainerTag}`);
    console.log(`Grants text sample: ${analysis.grantsText}`);
    console.log(`Total buttons: ${analysis.totalButtons}`);
    console.log(`Chat buttons found: ${analysis.chatButtons.length}`);
    
    console.log('\n🔘 ALL BUTTONS:');
    analysis.allButtons.forEach((btn, i) => {
      if (btn.text) {
        console.log(`  ${i+1}. "${btn.text}" (${btn.classes})`);
      }
    });
    
  } finally {
    await browser.close();
  }
}

quickDebug();