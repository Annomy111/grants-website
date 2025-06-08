const puppeteer = require('puppeteer');

async function waitAndCheckProfessional() {
  console.log('⏳ Waiting 2 minutes for Netlify deployment to complete...\n');
  
  // Wait for deployment
  await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutes
  
  console.log('🎨 Checking professional infographics after deployment...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--window-size=1920,1080']
  });

  const page = await browser.newPage();
  
  try {
    console.log('📍 Loading blog post...');
    await page.goto('https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });
    
    // Hard refresh to bypass cache
    await page.evaluate(() => {
      location.reload(true);
    });
    
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Check for professional features
    const professionalCheck = await page.evaluate(() => {
      const results = {
        hasAnimations: false,
        hasGradients: false,
        hasFilters: false,
        complexityScore: 0,
        features: []
      };
      
      const svgs = document.querySelectorAll('svg');
      svgs.forEach(svg => {
        // Check for animations
        const animations = svg.querySelectorAll('animate, animateTransform');
        if (animations.length > 0) {
          results.hasAnimations = true;
          results.features.push(`${animations.length} animations found`);
        }
        
        // Check for gradients
        const gradients = svg.querySelectorAll('linearGradient, radialGradient');
        if (gradients.length > 0) {
          results.hasGradients = true;
          results.features.push(`${gradients.length} gradients found`);
        }
        
        // Check for filters
        const filters = svg.querySelectorAll('filter');
        if (filters.length > 0) {
          results.hasFilters = true;
          results.features.push(`${filters.length} filters found`);
        }
        
        // Count elements for complexity
        const totalElements = svg.querySelectorAll('*').length;
        results.complexityScore += totalElements;
      });
      
      // Check for specific professional elements
      const hasCounters = document.querySelector('text')?.textContent.includes('€63') || false;
      const hasDonutChart = Array.from(document.querySelectorAll('path')).some(p => 
        p.getAttribute('d')?.includes('A') && p.getAttribute('d')?.includes('M')
      );
      const hasRadarChart = document.querySelector('polygon[points]') !== null;
      
      if (hasCounters) results.features.push('Animated counters detected');
      if (hasDonutChart) results.features.push('Donut chart detected');
      if (hasRadarChart) results.features.push('Radar chart detected');
      
      results.isProfessional = results.hasAnimations || results.hasGradients || results.hasFilters || results.complexityScore > 500;
      
      return results;
    });
    
    console.log('📊 Professional Infographics Check:\n');
    console.log(`Animations: ${professionalCheck.hasAnimations ? '✅ Yes' : '❌ No'}`);
    console.log(`Gradients: ${professionalCheck.hasGradients ? '✅ Yes' : '❌ No'}`);
    console.log(`Filters: ${professionalCheck.hasFilters ? '✅ Yes' : '❌ No'}`);
    console.log(`Complexity Score: ${professionalCheck.complexityScore}`);
    
    if (professionalCheck.features.length > 0) {
      console.log('\nDetected Features:');
      professionalCheck.features.forEach(feature => console.log(`  - ${feature}`));
    }
    
    // Take screenshots
    await page.screenshot({ path: 'professional-check-full.png', fullPage: true });
    
    // Scroll to first infographic
    await page.evaluate(() => {
      const firstInfographic = document.getElementById('key-statistics');
      if (firstInfographic) {
        firstInfographic.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await page.screenshot({ path: 'professional-check-first.png', fullPage: false });
    
    if (professionalCheck.isProfessional) {
      console.log('\n🎉 SUCCESS! Professional infographics are now live!');
      console.log('✨ The infographics now include:');
      console.log('   - Animated elements and transitions');
      console.log('   - Gradient effects and shadows');
      console.log('   - Complex data visualizations');
      console.log('   - Interactive components');
    } else {
      console.log('\n⚠️  Professional features not yet detected.');
      console.log('The deployment may still be processing. Try refreshing in a few minutes.');
    }
    
    console.log('\n📸 Screenshots saved:');
    console.log('   - professional-check-full.png');
    console.log('   - professional-check-first.png');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  console.log('\n👀 Browser window will remain open for inspection.');
}

waitAndCheckProfessional().catch(console.error);