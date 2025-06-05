const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

async function diagnoseLogoIssues() {
  console.log('🔍 GRANTS WEBSITE LOGO DIAGNOSTICS\n');
  console.log('Testing URL: https://civil-society-grants-database.netlify.app/grants');
  console.log('Timestamp:', new Date().toISOString());
  console.log('='.repeat(80) + '\n');

  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1400, height: 900 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const diagnosticReport = {
    timestamp: new Date().toISOString(),
    url: 'https://civil-society-grants-database.netlify.app/grants',
    logoRequests: [],
    errors: [],
    consoleMessages: [],
    grantCardsAnalysis: [],
    networkAnalysis: {
      totalRequests: 0,
      failedRequests: 0,
      logoRequests: 0,
      failedLogoRequests: 0
    }
  };

  try {
    const page = await browser.newPage();
    
    // Track all network requests
    const networkRequests = [];
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
        timestamp: Date.now()
      });
    });

    page.on('response', response => {
      const request = response.request();
      const url = request.url();
      
      diagnosticReport.networkAnalysis.totalRequests++;
      
      if (response.status() >= 400) {
        diagnosticReport.networkAnalysis.failedRequests++;
      }
      
      // Check if this is a logo request
      if (url.includes('/images/logos/') || url.includes('logo')) {
        diagnosticReport.networkAnalysis.logoRequests++;
        
        const logoRequest = {
          url: url,
          status: response.status(),
          statusText: response.statusText(),
          resourceType: request.resourceType(),
          headers: response.headers(),
          timestamp: new Date().toISOString()
        };
        
        diagnosticReport.logoRequests.push(logoRequest);
        
        if (response.status() >= 400) {
          diagnosticReport.networkAnalysis.failedLogoRequests++;
          console.log(`❌ Logo request failed: ${url} - Status: ${response.status()}`);
        } else {
          console.log(`✅ Logo request successful: ${url} - Status: ${response.status()}`);
        }
      }
    });

    // Capture console messages
    page.on('console', msg => {
      const logEntry = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString()
      };
      diagnosticReport.consoleMessages.push(logEntry);
      
      if (msg.type() === 'error' || msg.text().toLowerCase().includes('logo')) {
        console.log(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
      }
    });

    // Capture page errors
    page.on('pageerror', error => {
      const errorEntry = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      };
      diagnosticReport.errors.push(errorEntry);
      console.log(`[PAGE ERROR] ${error.message}`);
    });

    console.log('\n1. LOADING GRANTS PAGE...\n');
    await page.goto('https://civil-society-grants-database.netlify.app/grants', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    // Wait for grants to load
    await page.waitForSelector('.grants-page', { timeout: 30000 });
    await new Promise(resolve => setTimeout(resolve, 5000)); // Extra wait for dynamic content

    console.log('\n2. CHECKING FOR ORGANIZATION-LOGOS.JSON...\n');
    
    // Check if organization-logos.json was loaded
    const logoJsonRequest = networkRequests.find(req => 
      req.url.includes('organization-logos.json')
    );
    
    if (logoJsonRequest) {
      console.log('✅ organization-logos.json was requested');
      const logoJsonResponse = diagnosticReport.logoRequests.find(req => 
        req.url.includes('organization-logos.json')
      );
      if (logoJsonResponse) {
        console.log(`   Status: ${logoJsonResponse.status}`);
      }
    } else {
      console.log('❌ organization-logos.json was NOT requested');
    }

    console.log('\n3. ANALYZING GRANT CARDS...\n');
    
    // Analyze grant cards and their logo elements
    const grantCards = await page.evaluate(() => {
      const cards = [];
      const grantElements = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
      
      grantElements.forEach((card, index) => {
        const cardInfo = {
          index: index,
          hasLogoContainer: false,
          logoSrc: null,
          organizationName: null,
          logoElement: null,
          logoDisplay: null,
          logoVisibility: null,
          logoErrors: []
        };
        
        // Find organization name
        const orgElement = card.querySelector('p[class*="text-lg"][class*="font-medium"]');
        if (orgElement) {
          cardInfo.organizationName = orgElement.textContent.trim();
        }
        
        // Look for logo container
        const logoContainer = card.querySelector('div[class*="w-16"][class*="h-16"]');
        if (logoContainer) {
          cardInfo.hasLogoContainer = true;
          
          // Check for img element
          const img = logoContainer.querySelector('img');
          if (img) {
            cardInfo.logoElement = {
              tagName: img.tagName,
              src: img.src,
              alt: img.alt,
              naturalWidth: img.naturalWidth,
              naturalHeight: img.naturalHeight,
              clientWidth: img.clientWidth,
              clientHeight: img.clientHeight,
              complete: img.complete,
              currentSrc: img.currentSrc
            };
            cardInfo.logoSrc = img.src;
            
            // Check computed styles
            const styles = window.getComputedStyle(img);
            cardInfo.logoDisplay = styles.display;
            cardInfo.logoVisibility = styles.visibility;
            
            // Check if image loaded successfully
            if (!img.complete || img.naturalWidth === 0) {
              cardInfo.logoErrors.push('Image failed to load');
            }
            
            if (styles.display === 'none') {
              cardInfo.logoErrors.push('Image is hidden (display: none)');
            }
          } else {
            cardInfo.logoErrors.push('No img element found in logo container');
          }
        } else {
          cardInfo.logoErrors.push('No logo container found');
        }
        
        cards.push(cardInfo);
      });
      
      return cards;
    });

    diagnosticReport.grantCardsAnalysis = grantCards;

    // Summary statistics
    const totalCards = grantCards.length;
    const cardsWithLogoContainers = grantCards.filter(c => c.hasLogoContainer).length;
    const cardsWithLogos = grantCards.filter(c => c.logoSrc).length;
    const cardsWithVisibleLogos = grantCards.filter(c => 
      c.logoSrc && c.logoDisplay !== 'none' && c.logoElement?.naturalWidth > 0
    ).length;

    console.log(`Found ${totalCards} grant cards:`);
    console.log(`  - ${cardsWithLogoContainers} have logo containers`);
    console.log(`  - ${cardsWithLogos} have logo img elements`);
    console.log(`  - ${cardsWithVisibleLogos} have visible, loaded logos`);
    console.log('');

    // Display detailed findings for first 5 cards
    console.log('DETAILED ANALYSIS (First 5 cards):');
    grantCards.slice(0, 5).forEach(card => {
      console.log(`\nCard #${card.index + 1}: ${card.organizationName || 'Unknown Organization'}`);
      console.log(`  Logo container: ${card.hasLogoContainer ? 'YES' : 'NO'}`);
      if (card.logoSrc) {
        console.log(`  Logo URL: ${card.logoSrc}`);
        console.log(`  Logo loaded: ${card.logoElement?.complete ? 'YES' : 'NO'}`);
        console.log(`  Logo dimensions: ${card.logoElement?.naturalWidth}x${card.logoElement?.naturalHeight}`);
      }
      if (card.logoErrors.length > 0) {
        console.log(`  ⚠️  Issues: ${card.logoErrors.join(', ')}`);
      }
    });

    console.log('\n4. CHECKING CSS AND STYLING...\n');

    // Check for CSS rules that might hide logos
    const cssAnalysis = await page.evaluate(() => {
      const results = {
        logoContainerStyles: [],
        imgElementStyles: [],
        hiddenElements: []
      };
      
      // Check styles on logo containers
      const logoContainers = document.querySelectorAll('div[class*="w-16"][class*="h-16"]');
      logoContainers.forEach(container => {
        const styles = window.getComputedStyle(container);
        results.logoContainerStyles.push({
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          overflow: styles.overflow,
          width: styles.width,
          height: styles.height
        });
      });
      
      // Check all img elements in grant cards
      const imgs = document.querySelectorAll('[class*="rounded-xl"] img');
      imgs.forEach(img => {
        const styles = window.getComputedStyle(img);
        const rect = img.getBoundingClientRect();
        
        const imgInfo = {
          src: img.src,
          display: styles.display,
          visibility: styles.visibility,
          opacity: styles.opacity,
          width: styles.width,
          height: styles.height,
          objectFit: styles.objectFit,
          boundingRect: {
            width: rect.width,
            height: rect.height,
            visible: rect.width > 0 && rect.height > 0
          }
        };
        
        results.imgElementStyles.push(imgInfo);
        
        if (styles.display === 'none' || styles.visibility === 'hidden' || rect.width === 0) {
          results.hiddenElements.push(imgInfo);
        }
      });
      
      return results;
    });

    console.log(`CSS Analysis:`);
    console.log(`  - Found ${cssAnalysis.logoContainerStyles.length} logo containers`);
    console.log(`  - Found ${cssAnalysis.imgElementStyles.length} img elements in grant cards`);
    console.log(`  - Found ${cssAnalysis.hiddenElements.length} hidden img elements`);

    if (cssAnalysis.hiddenElements.length > 0) {
      console.log('\n  Hidden elements details:');
      cssAnalysis.hiddenElements.forEach((el, i) => {
        console.log(`    ${i + 1}. ${el.src}`);
        console.log(`       display: ${el.display}, visibility: ${el.visibility}`);
      });
    }

    console.log('\n5. TAKING SCREENSHOTS...\n');

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = '/Users/winzendwyers/grants website/tests/screenshots';
    try {
      await fs.mkdir(screenshotsDir, { recursive: true });
    } catch (err) {
      console.log('Screenshots directory already exists');
    }

    // Take full page screenshot
    const fullPagePath = path.join(screenshotsDir, `logo-diagnosis-full-${Date.now()}.png`);
    await page.screenshot({ 
      path: fullPagePath,
      fullPage: true 
    });
    console.log(`✅ Full page screenshot saved: ${fullPagePath}`);

    // Take screenshot of first grant card with logo issue
    const firstCardWithIssue = grantCards.find(card => 
      card.hasLogoContainer && (!card.logoSrc || card.logoErrors.length > 0)
    );
    
    if (firstCardWithIssue) {
      await page.evaluate((index) => {
        const cards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
        if (cards[index]) {
          cards[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, firstCardWithIssue.index);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const cardScreenshotPath = path.join(screenshotsDir, `logo-issue-card-${Date.now()}.png`);
      await page.screenshot({ 
        path: cardScreenshotPath,
        clip: await page.evaluate((index) => {
          const cards = document.querySelectorAll('[class*="rounded-xl"][class*="shadow-md"]');
          const rect = cards[index].getBoundingClientRect();
          return {
            x: rect.left - 10,
            y: rect.top - 10,
            width: rect.width + 20,
            height: rect.height + 20
          };
        }, firstCardWithIssue.index)
      });
      console.log(`✅ Problem card screenshot saved: ${cardScreenshotPath}`);
    }

    console.log('\n6. FINAL DIAGNOSIS SUMMARY\n');
    console.log('='.repeat(80));
    
    // Generate diagnosis
    const diagnosis = [];
    
    if (diagnosticReport.networkAnalysis.failedLogoRequests > 0) {
      diagnosis.push({
        issue: 'FAILED_LOGO_REQUESTS',
        severity: 'HIGH',
        description: `${diagnosticReport.networkAnalysis.failedLogoRequests} logo requests returned 404 or other errors`,
        recommendation: 'Check if logo files exist in the public/images/logos directory'
      });
    }
    
    if (!logoJsonRequest) {
      diagnosis.push({
        issue: 'LOGOS_JSON_NOT_LOADED',
        severity: 'HIGH',
        description: 'organization-logos.json file was not requested by the application',
        recommendation: 'Check if the logos JSON is being loaded in GrantsPage.js fetchData function'
      });
    }
    
    const missingLogos = grantCards.filter(card => 
      card.organizationName && !card.logoSrc && card.hasLogoContainer
    );
    
    if (missingLogos.length > 0) {
      diagnosis.push({
        issue: 'MISSING_LOGO_MAPPINGS',
        severity: 'MEDIUM',
        description: `${missingLogos.length} organizations have logo containers but no logos displayed`,
        affectedOrganizations: missingLogos.map(c => c.organizationName),
        recommendation: 'Add these organizations to organization-logos.json with their logo paths'
      });
    }
    
    const hiddenLogos = grantCards.filter(card => 
      card.logoSrc && card.logoDisplay === 'none'
    );
    
    if (hiddenLogos.length > 0) {
      diagnosis.push({
        issue: 'LOGOS_HIDDEN_BY_CSS',
        severity: 'HIGH',
        description: `${hiddenLogos.length} logos are hidden by CSS (display: none)`,
        recommendation: 'Check onError handlers in img tags that might be hiding failed images'
      });
    }

    // Print diagnosis
    diagnosis.forEach(d => {
      console.log(`\n🔴 ${d.issue} (${d.severity})`);
      console.log(`   ${d.description}`);
      console.log(`   → Recommendation: ${d.recommendation}`);
      if (d.affectedOrganizations) {
        console.log(`   Affected: ${d.affectedOrganizations.slice(0, 3).join(', ')}...`);
      }
    });

    if (diagnosis.length === 0) {
      console.log('\n✅ No major issues found with logo display');
    }

    // Save detailed report
    const reportPath = path.join(screenshotsDir, `logo-diagnosis-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(diagnosticReport, null, 2));
    console.log(`\n📄 Detailed report saved: ${reportPath}`);

  } catch (error) {
    console.error('\n❌ ERROR during diagnosis:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    console.log('\n🏁 Diagnosis complete');
  }
}

// Run the diagnosis
diagnoseLogoIssues().catch(console.error);