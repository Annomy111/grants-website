const puppeteer = require('puppeteer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   REACT_APP_SUPABASE_URL or SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✓' : '✗');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Agent 1: Deadline Checker
async function deadlineCheckerAgent(grants) {
  console.log('\n📅 AGENT 1: Deadline Checker\n');

  const results = {
    agent: 'Deadline Checker',
    timestamp: new Date().toISOString(),
    findings: {
      expired: [],
      expiringSoon: [],
      noDeadline: [],
      updated: 0,
    },
  };

  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const grant of grants) {
    if (!grant.deadline || grant.deadline === 'Rolling' || grant.deadline === 'Ongoing') {
      results.findings.noDeadline.push({
        id: grant.id,
        name: grant.grant_name,
        deadline: grant.deadline,
      });
      continue;
    }

    try {
      // Parse various deadline formats
      let deadlineDate;
      if (grant.deadline.match(/\d{4}-\d{2}-\d{2}/)) {
        deadlineDate = new Date(grant.deadline);
      } else if (grant.deadline.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) {
        const parts = grant.deadline.split('/');
        deadlineDate = new Date(
          `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
        );
      } else {
        // Try to parse other formats
        deadlineDate = new Date(grant.deadline);
      }

      if (isNaN(deadlineDate.getTime())) {
        results.findings.noDeadline.push({
          id: grant.id,
          name: grant.grant_name,
          deadline: grant.deadline,
          reason: 'Unparseable date format',
        });
        continue;
      }

      // Check if expired
      if (deadlineDate < today) {
        results.findings.expired.push({
          id: grant.id,
          name: grant.grant_name,
          deadline: grant.deadline,
          expiredDays: Math.floor((today - deadlineDate) / (24 * 60 * 60 * 1000)),
        });

        // Update status to expired
        const { error } = await supabase
          .from('grants')
          .update({ status: 'expired', updated_at: new Date().toISOString() })
          .eq('id', grant.id);

        if (!error) results.findings.updated++;
      } else if (deadlineDate < thirtyDaysFromNow) {
        results.findings.expiringSoon.push({
          id: grant.id,
          name: grant.grant_name,
          deadline: grant.deadline,
          daysRemaining: Math.floor((deadlineDate - today) / (24 * 60 * 60 * 1000)),
        });
      }
    } catch (error) {
      console.error(`Error processing deadline for grant ${grant.id}:`, error.message);
    }
  }

  console.log(`✅ Checked ${grants.length} grants`);
  console.log(`   Expired: ${results.findings.expired.length}`);
  console.log(`   Expiring soon: ${results.findings.expiringSoon.length}`);
  console.log(`   Updated: ${results.findings.updated}`);

  return results;
}

// Agent 2: Link Validator
async function linkValidatorAgent(grants, browser) {
  console.log('\n🔗 AGENT 2: Link Validator\n');

  const results = {
    agent: 'Link Validator',
    timestamp: new Date().toISOString(),
    findings: {
      brokenLinks: [],
      redirects: [],
      slowLinks: [],
      checked: 0,
      updated: 0,
    },
  };

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(15000);

  // Sample grants to check (checking all would take too long)
  const grantsToCheck = grants.slice(0, 20);

  for (const grant of grantsToCheck) {
    if (!grant.website && !grant.application_url) continue;

    const urlsToCheck = [
      { type: 'website', url: grant.website },
      { type: 'application', url: grant.application_url },
    ].filter(item => item.url);

    for (const { type, url } of urlsToCheck) {
      try {
        console.log(`   Checking ${grant.grant_name} - ${type}: ${url}`);
        const startTime = Date.now();

        const response = await page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: 10000,
        });

        const loadTime = Date.now() - startTime;
        const status = response.status();

        results.findings.checked++;

        if (status >= 400) {
          results.findings.brokenLinks.push({
            id: grant.id,
            name: grant.grant_name,
            type: type,
            url: url,
            status: status,
          });

          // Update grant to mark broken link
          if (type === 'website') {
            await supabase
              .from('grants')
              .update({ website_status: 'broken', updated_at: new Date().toISOString() })
              .eq('id', grant.id);
          }
          results.findings.updated++;
        } else if (status >= 300 && status < 400) {
          results.findings.redirects.push({
            id: grant.id,
            name: grant.grant_name,
            type: type,
            url: url,
            finalUrl: page.url(),
          });
        }

        if (loadTime > 5000) {
          results.findings.slowLinks.push({
            id: grant.id,
            name: grant.grant_name,
            type: type,
            url: url,
            loadTime: `${(loadTime / 1000).toFixed(1)}s`,
          });
        }
      } catch (error) {
        results.findings.brokenLinks.push({
          id: grant.id,
          name: grant.grant_name,
          type: type,
          url: url,
          error: error.message,
        });
      }
    }
  }

  await page.close();

  console.log(`✅ Checked ${results.findings.checked} links`);
  console.log(`   Broken: ${results.findings.brokenLinks.length}`);
  console.log(`   Redirects: ${results.findings.redirects.length}`);
  console.log(`   Slow: ${results.findings.slowLinks.length}`);

  return results;
}

// Agent 3: Grant Amount Validator
async function amountValidatorAgent(grants) {
  console.log('\n💰 AGENT 3: Grant Amount Validator\n');

  const results = {
    agent: 'Amount Validator',
    timestamp: new Date().toISOString(),
    findings: {
      invalidAmounts: [],
      missingAmounts: [],
      suspiciousAmounts: [],
      updated: 0,
    },
  };

  for (const grant of grants) {
    // Check for missing amounts
    if (!grant.grant_size_min && !grant.grant_size_max && !grant.grant_size) {
      results.findings.missingAmounts.push({
        id: grant.id,
        name: grant.grant_name,
      });
      continue;
    }

    // Validate min/max relationship
    if (grant.grant_size_min && grant.grant_size_max) {
      const min = parseFloat(grant.grant_size_min);
      const max = parseFloat(grant.grant_size_max);

      if (min > max) {
        results.findings.invalidAmounts.push({
          id: grant.id,
          name: grant.grant_name,
          issue: 'Min amount greater than max',
          min: min,
          max: max,
        });

        // Fix by swapping
        await supabase
          .from('grants')
          .update({
            grant_size_min: max,
            grant_size_max: min,
            updated_at: new Date().toISOString(),
          })
          .eq('id', grant.id);

        results.findings.updated++;
      }

      // Check for suspicious amounts
      if (max > 10000000) {
        // More than 10 million
        results.findings.suspiciousAmounts.push({
          id: grant.id,
          name: grant.grant_name,
          amount: max,
          issue: 'Unusually high amount',
        });
      }
    }
  }

  console.log(`✅ Validated ${grants.length} grant amounts`);
  console.log(`   Invalid: ${results.findings.invalidAmounts.length}`);
  console.log(`   Missing: ${results.findings.missingAmounts.length}`);
  console.log(`   Suspicious: ${results.findings.suspiciousAmounts.length}`);

  return results;
}

// Agent 4: Organization Consistency Checker
async function organizationCheckerAgent(grants) {
  console.log('\n🏢 AGENT 4: Organization Consistency Checker\n');

  const results = {
    agent: 'Organization Checker',
    timestamp: new Date().toISOString(),
    findings: {
      inconsistentNames: [],
      missingLogos: [],
      duplicateOrgs: [],
      updated: 0,
    },
  };

  // Group grants by organization
  const orgGroups = {};
  grants.forEach(grant => {
    const org = grant.funding_organization || 'Unknown';
    if (!orgGroups[org]) {
      orgGroups[org] = [];
    }
    orgGroups[org].push(grant);
  });

  // Check each organization group
  for (const [org, orgGrants] of Object.entries(orgGroups)) {
    // Check for consistent data within organization
    const websites = new Set(orgGrants.map(g => g.website).filter(Boolean));
    const logos = new Set(orgGrants.map(g => g.logo_url).filter(Boolean));

    if (websites.size > 1) {
      results.findings.inconsistentNames.push({
        organization: org,
        issue: 'Multiple different websites',
        websites: Array.from(websites),
        grantCount: orgGrants.length,
      });
    }

    if (logos.size === 0) {
      results.findings.missingLogos.push({
        organization: org,
        grantCount: orgGrants.length,
        grantIds: orgGrants.map(g => g.id),
      });
    } else if (logos.size > 1) {
      results.findings.inconsistentNames.push({
        organization: org,
        issue: 'Multiple different logos',
        logos: Array.from(logos),
        grantCount: orgGrants.length,
      });
    }
  }

  // Check for similar organization names that might be duplicates
  const orgNames = Object.keys(orgGroups);
  for (let i = 0; i < orgNames.length; i++) {
    for (let j = i + 1; j < orgNames.length; j++) {
      const similarity = calculateSimilarity(orgNames[i], orgNames[j]);
      if (similarity > 0.8) {
        results.findings.duplicateOrgs.push({
          org1: orgNames[i],
          org2: orgNames[j],
          similarity: (similarity * 100).toFixed(1) + '%',
        });
      }
    }
  }

  console.log(`✅ Checked ${Object.keys(orgGroups).length} organizations`);
  console.log(`   Inconsistent: ${results.findings.inconsistentNames.length}`);
  console.log(`   Missing logos: ${results.findings.missingLogos.length}`);
  console.log(`   Possible duplicates: ${results.findings.duplicateOrgs.length}`);

  return results;
}

// Agent 5: Geographic Focus Validator
async function geographicValidatorAgent(grants) {
  console.log('\n🌍 AGENT 5: Geographic Focus Validator\n');

  const results = {
    agent: 'Geographic Validator',
    timestamp: new Date().toISOString(),
    findings: {
      missingGeography: [],
      invalidCountries: [],
      updated: 0,
    },
  };

  const validRegions = [
    'Global',
    'Europe',
    'Eastern Europe',
    'Ukraine',
    'Asia',
    'Africa',
    'Americas',
  ];
  const validCountries = [
    'Ukraine',
    'Poland',
    'Romania',
    'Moldova',
    'Georgia',
    'Armenia',
    'Belarus',
  ];

  for (const grant of grants) {
    if (!grant.geographic_focus) {
      results.findings.missingGeography.push({
        id: grant.id,
        name: grant.grant_name,
      });

      // Try to infer from description
      if (grant.description_en && grant.description_en.toLowerCase().includes('ukraine')) {
        await supabase
          .from('grants')
          .update({
            geographic_focus: 'Ukraine',
            updated_at: new Date().toISOString(),
          })
          .eq('id', grant.id);

        results.findings.updated++;
      }
    } else {
      // Validate geographic focus
      const isValid =
        validRegions.includes(grant.geographic_focus) ||
        validCountries.includes(grant.geographic_focus);

      if (!isValid) {
        results.findings.invalidCountries.push({
          id: grant.id,
          name: grant.grant_name,
          geographic_focus: grant.geographic_focus,
        });
      }
    }
  }

  console.log(`✅ Validated geographic focus for ${grants.length} grants`);
  console.log(`   Missing: ${results.findings.missingGeography.length}`);
  console.log(`   Invalid: ${results.findings.invalidCountries.length}`);
  console.log(`   Updated: ${results.findings.updated}`);

  return results;
}

// Agent 6: Content Quality Checker
async function contentQualityAgent(grants) {
  console.log('\n📝 AGENT 6: Content Quality Checker\n');

  const results = {
    agent: 'Content Quality',
    timestamp: new Date().toISOString(),
    findings: {
      shortDescriptions: [],
      missingEligibility: [],
      missingFocusAreas: [],
      duplicateContent: [],
      updated: 0,
    },
  };

  const contentHashes = new Map();

  for (const grant of grants) {
    // Check description length
    if (grant.description_en && grant.description_en.length < 50) {
      results.findings.shortDescriptions.push({
        id: grant.id,
        name: grant.grant_name,
        descriptionLength: grant.description_en.length,
      });
    }

    // Check for missing eligibility
    if (!grant.eligibility_criteria_en || grant.eligibility_criteria_en.length < 20) {
      results.findings.missingEligibility.push({
        id: grant.id,
        name: grant.grant_name,
      });
    }

    // Check for missing focus areas
    if (!grant.focus_areas_en || grant.focus_areas_en.length < 10) {
      results.findings.missingFocusAreas.push({
        id: grant.id,
        name: grant.grant_name,
      });
    }

    // Check for duplicate content
    if (grant.description_en) {
      const contentHash = grant.description_en.substring(0, 100);
      if (contentHashes.has(contentHash)) {
        results.findings.duplicateContent.push({
          id1: contentHashes.get(contentHash),
          id2: grant.id,
          content: contentHash,
        });
      } else {
        contentHashes.set(contentHash, grant.id);
      }
    }
  }

  console.log(`✅ Checked content quality for ${grants.length} grants`);
  console.log(`   Short descriptions: ${results.findings.shortDescriptions.length}`);
  console.log(`   Missing eligibility: ${results.findings.missingEligibility.length}`);
  console.log(`   Missing focus areas: ${results.findings.missingFocusAreas.length}`);
  console.log(`   Duplicate content: ${results.findings.duplicateContent.length}`);

  return results;
}

// Agent 7: Application Status Checker
async function applicationStatusAgent(grants, browser) {
  console.log('\n🚦 AGENT 7: Application Status Checker\n');

  const results = {
    agent: 'Application Status',
    timestamp: new Date().toISOString(),
    findings: {
      closedApplications: [],
      openApplications: [],
      uncertainStatus: [],
      checked: 0,
      updated: 0,
    },
  };

  const page = await browser.newPage();
  await page.setDefaultNavigationTimeout(10000);

  // Sample of grants with application URLs
  const grantsWithApps = grants.filter(g => g.application_url).slice(0, 15);

  for (const grant of grantsWithApps) {
    try {
      console.log(`   Checking application status for ${grant.grant_name}`);

      await page.goto(grant.application_url, {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Look for indicators that applications are closed
      const pageContent = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return {
          text: text.substring(0, 5000),
          hasClosed:
            text.includes('closed') ||
            text.includes('deadline passed') ||
            text.includes('no longer accepting'),
          hasOpen:
            text.includes('apply now') ||
            text.includes('submit application') ||
            text.includes('open for applications'),
          hasDeadline: text.match(/deadline:?\s*([^\n]+)/i),
        };
      });

      results.findings.checked++;

      if (pageContent.hasClosed) {
        results.findings.closedApplications.push({
          id: grant.id,
          name: grant.grant_name,
          url: grant.application_url,
        });

        // Update status
        await supabase
          .from('grants')
          .update({
            status: 'closed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', grant.id);

        results.findings.updated++;
      } else if (pageContent.hasOpen) {
        results.findings.openApplications.push({
          id: grant.id,
          name: grant.grant_name,
        });
      } else {
        results.findings.uncertainStatus.push({
          id: grant.id,
          name: grant.grant_name,
        });
      }
    } catch (error) {
      console.error(`   Error checking ${grant.grant_name}:`, error.message);
      results.findings.uncertainStatus.push({
        id: grant.id,
        name: grant.grant_name,
        error: error.message,
      });
    }
  }

  await page.close();

  console.log(`✅ Checked ${results.findings.checked} application pages`);
  console.log(`   Closed: ${results.findings.closedApplications.length}`);
  console.log(`   Open: ${results.findings.openApplications.length}`);
  console.log(`   Uncertain: ${results.findings.uncertainStatus.length}`);

  return results;
}

// Utility function to calculate string similarity
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;

  if (longer.length === 0) return 1.0;

  const editDistance = getEditDistance(longer, shorter);
  return (longer.length - editDistance) / parseFloat(longer.length);
}

function getEditDistance(str1, str2) {
  const matrix = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

// Main execution
async function runDatabaseVerification() {
  console.log('🤖 7-AGENT DATABASE VERIFICATION SYSTEM');
  console.log('======================================');
  console.log(`Started at: ${new Date().toISOString()}\n`);

  try {
    // Fetch all grants from database
    console.log('📥 Fetching grants from database...');
    const { data: grants, error } = await supabase.from('grants').select('*').order('grant_name');

    if (error) {
      throw error;
    }

    console.log(`✅ Fetched ${grants.length} grants\n`);

    // Launch browser for agents that need it
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Run all agents in parallel
    console.log('🚀 Launching all 7 agents simultaneously...\n');

    const agentPromises = [
      deadlineCheckerAgent(grants),
      linkValidatorAgent(grants, browser),
      amountValidatorAgent(grants),
      organizationCheckerAgent(grants),
      geographicValidatorAgent(grants),
      contentQualityAgent(grants),
      applicationStatusAgent(grants, browser),
    ];

    const results = await Promise.all(agentPromises);

    await browser.close();

    // Compile comprehensive report
    const report = {
      timestamp: new Date().toISOString(),
      totalGrants: grants.length,
      agents: results,
      summary: {
        totalIssuesFound: 0,
        totalUpdates: 0,
        criticalIssues: [],
      },
    };

    // Calculate summary statistics
    results.forEach(agentResult => {
      const findings = agentResult.findings;

      // Count issues
      Object.keys(findings).forEach(key => {
        if (Array.isArray(findings[key])) {
          report.summary.totalIssuesFound += findings[key].length;
        }
      });

      // Count updates
      if (findings.updated) {
        report.summary.totalUpdates += findings.updated;
      }

      // Identify critical issues
      if (agentResult.agent === 'Deadline Checker' && findings.expired.length > 0) {
        report.summary.criticalIssues.push(
          `${findings.expired.length} grants have expired deadlines`
        );
      }
      if (agentResult.agent === 'Link Validator' && findings.brokenLinks.length > 0) {
        report.summary.criticalIssues.push(`${findings.brokenLinks.length} broken links found`);
      }
    });

    // Save detailed report
    const reportPath = path.join(__dirname, `../database-verification-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

    // Print summary
    console.log('\n📊 VERIFICATION COMPLETE');
    console.log('=======================');
    console.log(`Total grants analyzed: ${grants.length}`);
    console.log(`Total issues found: ${report.summary.totalIssuesFound}`);
    console.log(`Total database updates: ${report.summary.totalUpdates}`);

    if (report.summary.criticalIssues.length > 0) {
      console.log('\n⚠️  CRITICAL ISSUES:');
      report.summary.criticalIssues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    }

    console.log('\n📈 AGENT PERFORMANCE:');
    results.forEach(result => {
      console.log(`\n${result.agent}:`);
      Object.keys(result.findings).forEach(key => {
        if (Array.isArray(result.findings[key])) {
          console.log(`   ${key}: ${result.findings[key].length}`);
        } else if (typeof result.findings[key] === 'number') {
          console.log(`   ${key}: ${result.findings[key]}`);
        }
      });
    });

    console.log(`\n📄 Full report saved to: ${reportPath}`);

    return report;
  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  }
}

// Execute if run directly
if (require.main === module) {
  runDatabaseVerification()
    .then(() => {
      console.log('\n✅ Database verification completed successfully');
      process.exit(0);
    })
    .catch(err => {
      console.error('\n❌ Database verification failed:', err);
      process.exit(1);
    });
}

module.exports = { runDatabaseVerification };
