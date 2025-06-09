const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

// Agent 1: UX/UI Design Agent
async function designAgent(page) {
  console.log('\n🎨 AGENT 1: UX/UI Design Review\n');

  const designReport = {
    agent: 'UX/UI Design',
    timestamp: new Date().toISOString(),
    findings: [],
  };

  // Check homepage design
  await page.goto('https://civil-society-grants-database.netlify.app/', {
    waitUntil: 'networkidle2',
  });

  const homeDesign = await page.evaluate(() => {
    const findings = {
      colorScheme: [],
      typography: [],
      layout: [],
      responsiveness: [],
    };

    // Check color consistency
    const primaryColors = new Set();
    document.querySelectorAll('*').forEach(el => {
      const bgColor = window.getComputedStyle(el).backgroundColor;
      if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
        primaryColors.add(bgColor);
      }
    });
    findings.colorScheme.push(`Found ${primaryColors.size} distinct background colors`);

    // Check typography
    const fonts = new Set();
    document.querySelectorAll('*').forEach(el => {
      const font = window.getComputedStyle(el).fontFamily;
      if (font) fonts.add(font);
    });
    findings.typography.push(`${fonts.size} font families used`);

    // Check layout consistency
    const buttons = document.querySelectorAll('button');
    findings.layout.push(`${buttons.length} buttons found`);

    // Check logo display
    const logos = document.querySelectorAll('img[src*="/logos/"]');
    findings.layout.push(`${logos.length} organization logos visible`);

    return findings;
  });

  designReport.findings.push({
    page: 'Homepage',
    results: homeDesign,
  });

  // Check grants page
  await page.goto('https://civil-society-grants-database.netlify.app/grants', {
    waitUntil: 'networkidle2',
  });

  const grantsDesign = await page.evaluate(() => {
    const findings = {
      cardLayout: [],
      logoQuality: [],
      spacing: [],
    };

    // Check grant cards
    const cards = document.querySelectorAll('[class*="card"], [class*="grant"]');
    findings.cardLayout.push(`${cards.length} grant cards displayed`);

    // Check logo quality
    const logos = document.querySelectorAll('img[src*="/logos/"]');
    let highQualityLogos = 0;
    logos.forEach(img => {
      if (img.naturalWidth > 100 && img.complete) {
        highQualityLogos++;
      }
    });
    findings.logoQuality.push(`${highQualityLogos}/${logos.length} high-quality logos loaded`);

    // Check spacing consistency
    const firstCard = cards[0];
    if (firstCard) {
      const styles = window.getComputedStyle(firstCard);
      findings.spacing.push(`Card padding: ${styles.padding}`);
      findings.spacing.push(`Card margin: ${styles.margin}`);
    }

    return findings;
  });

  designReport.findings.push({
    page: 'Grants Page',
    results: grantsDesign,
  });

  console.log('✅ Design review complete');
  return designReport;
}

// Agent 2: Performance Agent
async function performanceAgent(page) {
  console.log('\n⚡ AGENT 2: Performance Review\n');

  const performanceReport = {
    agent: 'Performance',
    timestamp: new Date().toISOString(),
    findings: [],
  };

  // Enable performance metrics
  await page.evaluateOnNewDocument(() => {
    window.performanceMetrics = [];
  });

  // Measure homepage load time
  const homeStart = Date.now();
  await page.goto('https://civil-society-grants-database.netlify.app/', {
    waitUntil: 'networkidle2',
  });
  const homeLoadTime = Date.now() - homeStart;

  const homeMetrics = await page.evaluate(() => {
    const metrics = {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      resources: performance.getEntriesByType('resource').length,
      largestPaint: 0,
    };

    // Get LCP if available
    try {
      const entries = performance.getEntriesByType('largest-contentful-paint');
      if (entries.length > 0) {
        metrics.largestPaint =
          entries[entries.length - 1].renderTime || entries[entries.length - 1].loadTime;
      }
    } catch {}

    // Check image sizes
    const images = Array.from(document.querySelectorAll('img'));
    metrics.totalImages = images.length;
    metrics.logoImages = images.filter(img => img.src.includes('/logos/')).length;

    return metrics;
  });

  performanceReport.findings.push({
    page: 'Homepage',
    loadTime: `${homeLoadTime}ms`,
    metrics: homeMetrics,
  });

  // Measure grants page
  const grantsStart = Date.now();
  await page.goto('https://civil-society-grants-database.netlify.app/grants', {
    waitUntil: 'networkidle2',
  });
  const grantsLoadTime = Date.now() - grantsStart;

  const grantsMetrics = await page.evaluate(() => {
    const metrics = {
      grantCount: document.querySelectorAll('[class*="grant"], [class*="card"]').length,
      logoCount: document.querySelectorAll('img[src*="/logos/"]').length,
      loadedLogos: 0,
    };

    // Count properly loaded logos
    document.querySelectorAll('img[src*="/logos/"]').forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        metrics.loadedLogos++;
      }
    });

    return metrics;
  });

  performanceReport.findings.push({
    page: 'Grants Page',
    loadTime: `${grantsLoadTime}ms`,
    metrics: grantsMetrics,
  });

  console.log('✅ Performance review complete');
  return performanceReport;
}

// Agent 3: Accessibility Agent
async function accessibilityAgent(page) {
  console.log('\n♿ AGENT 3: Accessibility Review\n');

  const accessibilityReport = {
    agent: 'Accessibility',
    timestamp: new Date().toISOString(),
    findings: [],
  };

  await page.goto('https://civil-society-grants-database.netlify.app/', {
    waitUntil: 'networkidle2',
  });

  const a11yChecks = await page.evaluate(() => {
    const findings = {
      altTexts: { total: 0, missing: 0 },
      headings: [],
      contrast: [],
      interactive: [],
    };

    // Check alt texts
    const images = document.querySelectorAll('img');
    findings.altTexts.total = images.length;
    images.forEach(img => {
      if (!img.alt || img.alt.trim() === '') {
        findings.altTexts.missing++;
      }
    });

    // Check heading hierarchy
    ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
      const count = document.querySelectorAll(tag).length;
      if (count > 0) {
        findings.headings.push(`${tag}: ${count}`);
      }
    });

    // Check interactive elements
    const buttons = document.querySelectorAll('button');
    const links = document.querySelectorAll('a');
    findings.interactive.push(`Buttons: ${buttons.length}`);
    findings.interactive.push(`Links: ${links.length}`);

    // Check ARIA labels
    const ariaElements = document.querySelectorAll('[aria-label], [aria-describedby]');
    findings.interactive.push(`ARIA elements: ${ariaElements.length}`);

    return findings;
  });

  accessibilityReport.findings.push({
    page: 'Homepage',
    results: a11yChecks,
  });

  console.log('✅ Accessibility review complete');
  return accessibilityReport;
}

// Agent 4: Content Quality Agent
async function contentAgent(page) {
  console.log('\n📝 AGENT 4: Content Quality Review\n');

  const contentReport = {
    agent: 'Content Quality',
    timestamp: new Date().toISOString(),
    findings: [],
  };

  // Check grants page content
  await page.goto('https://civil-society-grants-database.netlify.app/grants', {
    waitUntil: 'networkidle2',
  });

  const contentAnalysis = await page.evaluate(() => {
    const findings = {
      grants: [],
      logos: [],
      information: [],
    };

    // Analyze grant information
    const grantElements = document.querySelectorAll('[class*="grant"], [class*="card"]');
    findings.grants.push(`Total grants displayed: ${grantElements.length}`);

    // Check logo quality and branding
    const logos = document.querySelectorAll('img[src*="/logos/"]');
    const logoData = {
      total: logos.length,
      loaded: 0,
      highQuality: 0,
      formats: { svg: 0, png: 0, jpg: 0 },
    };

    logos.forEach(img => {
      if (img.complete && img.naturalWidth > 0) {
        logoData.loaded++;
        if (img.naturalWidth >= 100) {
          logoData.highQuality++;
        }

        if (img.src.includes('.svg')) logoData.formats.svg++;
        else if (img.src.includes('.png')) logoData.formats.png++;
        else if (img.src.includes('.jpg') || img.src.includes('.jpeg')) logoData.formats.jpg++;
      }
    });

    findings.logos = logoData;

    // Check text content quality
    let totalTextLength = 0;
    let elementsWithText = 0;

    grantElements.forEach(el => {
      const text = el.textContent || '';
      if (text.trim().length > 10) {
        elementsWithText++;
        totalTextLength += text.length;
      }
    });

    findings.information.push(`Grants with substantial text: ${elementsWithText}`);
    findings.information.push(
      `Average text length: ${Math.round(totalTextLength / elementsWithText)} characters`
    );

    return findings;
  });

  contentReport.findings.push({
    page: 'Grants Page',
    results: contentAnalysis,
  });

  // Check blog content
  await page.goto('https://civil-society-grants-database.netlify.app/blog', {
    waitUntil: 'networkidle2',
  });

  const blogAnalysis = await page.evaluate(() => {
    const posts = document.querySelectorAll('[class*="blog"], [class*="post"], article');
    return {
      postCount: posts.length,
      hasContent: posts.length > 0,
    };
  });

  contentReport.findings.push({
    page: 'Blog',
    results: blogAnalysis,
  });

  console.log('✅ Content quality review complete');
  return contentReport;
}

// Agent 5: Logo Success Verification Agent
async function logoVerificationAgent(page) {
  console.log('\n🎯 AGENT 5: Logo Success Verification\n');

  const logoReport = {
    agent: 'Logo Verification',
    timestamp: new Date().toISOString(),
    findings: [],
  };

  await page.goto('https://civil-society-grants-database.netlify.app/grants', {
    waitUntil: 'networkidle2',
  });

  // Comprehensive logo check
  const logoAnalysis = await page.evaluate(() => {
    const findings = {
      summary: {},
      details: [],
      quality: {},
    };

    const logos = document.querySelectorAll('img[src*="/logos/"]');
    const uniqueLogos = new Set();
    const formats = { svg: 0, png: 0, jpg: 0, other: 0 };
    const loadStatus = { loaded: 0, failed: 0, loading: 0 };
    const sizes = { small: 0, medium: 0, large: 0 };

    logos.forEach(img => {
      const filename = img.src.split('/').pop();
      uniqueLogos.add(filename);

      // Check format
      if (filename.endsWith('.svg')) formats.svg++;
      else if (filename.endsWith('.png')) formats.png++;
      else if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) formats.jpg++;
      else formats.other++;

      // Check load status
      if (img.complete) {
        if (img.naturalWidth > 0) {
          loadStatus.loaded++;

          // Check size categories
          if (img.naturalWidth < 100) sizes.small++;
          else if (img.naturalWidth < 300) sizes.medium++;
          else sizes.large++;
        } else {
          loadStatus.failed++;
        }
      } else {
        loadStatus.loading++;
      }

      // Add to details
      findings.details.push({
        filename: filename,
        displayed: img.offsetWidth > 0,
        loaded: img.complete && img.naturalWidth > 0,
        dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
        displaySize: `${img.offsetWidth}x${img.offsetHeight}`,
      });
    });

    findings.summary = {
      totalLogoElements: logos.length,
      uniqueLogos: uniqueLogos.size,
      formats: formats,
      loadStatus: loadStatus,
      sizeDistribution: sizes,
      successRate: `${((loadStatus.loaded / logos.length) * 100).toFixed(1)}%`,
    };

    // Check for any placeholder patterns
    const placeholders = Array.from(uniqueLogos).filter(filename => {
      // Typically placeholders are very small SVGs
      const img = document.querySelector(`img[src*="${filename}"]`);
      return img && img.naturalWidth < 50 && filename.endsWith('.svg');
    });

    findings.quality = {
      placeholdersDetected: placeholders.length,
      placeholderFiles: placeholders,
      highQualityLogos: loadStatus.loaded - placeholders.length,
      overallQuality:
        placeholders.length === 0
          ? 'Excellent - No placeholders'
          : 'Good - Some placeholders remain',
    };

    return findings;
  });

  logoReport.findings = logoAnalysis;

  // Specific checks for recently updated logos
  const recentLogos = [
    'luminate',
    'international-renaissance-foundation-irf',
    'mama-cash',
    'norwegian-helsinki-committee',
  ];

  const recentChecks = await page.evaluate(slugs => {
    const results = {};

    slugs.forEach(slug => {
      const img = document.querySelector(`img[src*="${slug}"]`);
      if (img) {
        results[slug] = {
          found: true,
          loaded: img.complete && img.naturalWidth > 0,
          format: img.src.split('.').pop(),
          size: `${img.naturalWidth}x${img.naturalHeight}`,
        };
      } else {
        results[slug] = { found: false };
      }
    });

    return results;
  }, recentLogos);

  logoReport.recentlyUpdated = recentChecks;

  console.log('✅ Logo verification complete');
  return logoReport;
}

// Main review function
async function runWebsiteReview() {
  console.log('🤖 5-AGENT WEBSITE REVIEW SYSTEM ACTIVATED');
  console.log('==========================================');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // Run all agents sequentially to avoid conflicts
    const reports = [];

    // Give deployment time to complete
    console.log('\n⏳ Waiting for deployment to complete...');
    await new Promise(resolve => setTimeout(resolve, 30000));

    console.log('\n🚀 Starting agent reviews...');

    reports.push(await designAgent(await browser.newPage()));
    reports.push(await performanceAgent(await browser.newPage()));
    reports.push(await accessibilityAgent(await browser.newPage()));
    reports.push(await contentAgent(await browser.newPage()));
    reports.push(await logoVerificationAgent(await browser.newPage()));

    // Compile final report
    const finalReport = {
      timestamp: new Date().toISOString(),
      websiteUrl: 'https://civil-society-grants-database.netlify.app/',
      overallStatus: 'REVIEW COMPLETE',
      agentReports: reports,
      summary: {
        design: '🎨 Design review completed',
        performance: '⚡ Performance metrics collected',
        accessibility: '♿ Accessibility checks performed',
        content: '📝 Content quality assessed',
        logos: '🎯 Logo implementation verified',
      },
    };

    // Save report
    const reportPath = path.join(__dirname, `../website-review-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(finalReport, null, 2));

    // Print summary
    console.log('\n📊 REVIEW SUMMARY');
    console.log('=================');

    // Logo specific summary
    const logoReport = reports.find(r => r.agent === 'Logo Verification');
    if (logoReport && logoReport.findings.summary) {
      const summary = logoReport.findings.summary;
      console.log('\n🎯 Logo Implementation:');
      console.log(`- Total logo elements: ${summary.totalLogoElements}`);
      console.log(`- Unique logos: ${summary.uniqueLogos}`);
      console.log(`- Successfully loaded: ${summary.loadStatus.loaded}`);
      console.log(`- Success rate: ${summary.successRate}`);
      console.log(
        `- Formats: SVG (${summary.formats.svg}), PNG (${summary.formats.png}), JPG (${summary.formats.jpg})`
      );
      console.log(`- Quality: ${logoReport.findings.quality.overallQuality}`);
    }

    // Performance summary
    const perfReport = reports.find(r => r.agent === 'Performance');
    if (perfReport) {
      console.log('\n⚡ Performance:');
      perfReport.findings.forEach(finding => {
        console.log(`- ${finding.page} load time: ${finding.loadTime}`);
      });
    }

    // Design summary
    const designReport = reports.find(r => r.agent === 'UX/UI Design');
    if (designReport) {
      console.log('\n🎨 Design Quality:');
      designReport.findings.forEach(finding => {
        if (finding.page === 'Grants Page' && finding.results.logoQuality) {
          console.log(`- ${finding.results.logoQuality[0]}`);
        }
      });
    }

    console.log(`\n📄 Full report saved to: ${reportPath}`);
  } catch (error) {
    console.error('❌ Review error:', error);
  } finally {
    await browser.close();
  }
}

// Execute review
runWebsiteReview().catch(console.error);
