const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function convertRtfToText() {
  const rtfPath = path.join(__dirname, '..', 'update db grants.rtf');
  const txtPath = '/tmp/update_db_grants.txt';
  
  try {
    await execAsync(`textutil -convert txt "${rtfPath}" -output "${txtPath}"`);
    return fs.readFileSync(txtPath, 'utf8');
  } catch (error) {
    console.error('Error converting RTF to text:', error);
    throw error;
  }
}

function parseStructuredGrants(text) {
  const grants = [];
  const lines = text.split('\n');
  
  // Find all grant entries that follow "Grant ##:" pattern
  const grantPattern = /^Grant \d+:\s+(.+)/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const grantMatch = line.match(grantPattern);
    
    if (grantMatch) {
      const grant = {
        grant_name: grantMatch[1].trim(),
        funding_organization: '',
        country_region: '',
        eligibility_criteria: '',
        focus_areas: '',
        grant_amount: '',
        application_deadline: '',
        duration: '',
        website_link: '',
        status: 'active',
        contact_email: '',
        application_procedure: '',
        language_requirements: '',
        co_funding: '',
        recurrence: ''
      };
      
      // Parse the structured fields that follow
      let j = i + 1;
      while (j < lines.length && !lines[j].match(grantPattern)) {
        const fieldLine = lines[j].trim();
        
        // Funding Organization
        if (fieldLine.includes('Funding Organization:')) {
          const match = fieldLine.match(/Funding Organization:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.funding_organization = cleanText(match[1]);
        }
        
        // Country/Region
        if (fieldLine.includes('Country/Region:')) {
          const match = fieldLine.match(/Country\/Region:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.country_region = cleanText(match[1]);
        }
        
        // Eligibility
        if (fieldLine.includes('Eligibility:')) {
          const match = fieldLine.match(/Eligibility:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) {
            grant.eligibility_criteria = cleanText(match[1]);
            // Continue reading multi-line eligibility
            let k = j + 1;
            while (k < lines.length && lines[k].trim() && !lines[k].includes('•') && !lines[k].includes(':')) {
              grant.eligibility_criteria += ' ' + cleanText(lines[k].trim());
              k++;
            }
          }
        }
        
        // Focus Areas
        if (fieldLine.includes('Focus Areas:')) {
          const match = fieldLine.match(/Focus Areas:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) {
            grant.focus_areas = cleanText(match[1]);
            // Continue reading multi-line focus areas
            let k = j + 1;
            while (k < lines.length && lines[k].trim() && !lines[k].includes('•') && !lines[k].includes(':')) {
              grant.focus_areas += ' ' + cleanText(lines[k].trim());
              k++;
            }
          }
        }
        
        // Grant Amount
        if (fieldLine.includes('Grant Amount:')) {
          const match = fieldLine.match(/Grant Amount:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.grant_amount = cleanText(match[1]);
        }
        
        // Application Deadline
        if (fieldLine.includes('Application Deadline:')) {
          const match = fieldLine.match(/Application Deadline:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) {
            grant.application_deadline = cleanText(match[1]);
            // Check if expired
            if (match[1].toLowerCase().includes('closed') || match[1].toLowerCase().includes('expired')) {
              grant.status = 'inactive';
            }
          }
        }
        
        // Duration
        if (fieldLine.includes('Duration:') || fieldLine.includes('Project Duration:')) {
          const match = fieldLine.match(/(?:Project )?Duration:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.duration = cleanText(match[1]);
        }
        
        // Website
        if (fieldLine.includes('Website:')) {
          const match = fieldLine.match(/Website:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) {
            let url = match[1].trim();
            // Extract URL from text
            const urlMatch = url.match(/https?:\/\/[^\s\]]+/);
            if (urlMatch) {
              grant.website_link = urlMatch[0];
            } else {
              // Clean brackets and get text
              url = url.replace(/^\[/, '').replace(/\].*$/, '');
              grant.website_link = url;
            }
          }
        }
        
        // Contact
        if (fieldLine.includes('Contact:')) {
          const emailMatch = fieldLine.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
          if (emailMatch) {
            grant.contact_email = emailMatch[1];
          }
        }
        
        // Application Language
        if (fieldLine.includes('Application Language:')) {
          const match = fieldLine.match(/Application Language:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.language_requirements = cleanText(match[1]);
        }
        
        // Co-funding
        if (fieldLine.includes('Co-funding Requirement:')) {
          const match = fieldLine.match(/Co-funding Requirement:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.co_funding = cleanText(match[1]);
        }
        
        // Recurrence
        if (fieldLine.includes('Recurrence:')) {
          const match = fieldLine.match(/Recurrence:\s*(.+?)(?:\s*[\.•]|$)/);
          if (match) grant.recurrence = cleanText(match[1]);
        }
        
        j++;
      }
      
      // Only add if we found meaningful content
      if (grant.funding_organization || grant.focus_areas) {
        grants.push(grant);
      }
    }
  }
  
  return grants;
}

function cleanText(text) {
  // Remove reference numbers like [1], <sup>1</sup>, etc.
  return text
    .replace(/\[\d+\]/g, '')
    .replace(/<sup>\d+<\/sup>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumberedGrants(text) {
  const grants = [];
  const lines = text.split('\n');
  
  // Also look for numbered entries like "1. Grant Name"
  const numberedPattern = /^(\d+)\.\s+(.+?)(?:\s*[-–]\s*(.+))?$/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const match = line.match(numberedPattern);
    
    if (match && match[2].includes('Grant')) {
      const grant = {
        grant_name: match[2].trim(),
        funding_organization: match[3] ? match[3].trim() : '',
        country_region: '',
        eligibility_criteria: '',
        focus_areas: '',
        grant_amount: '',
        application_deadline: '',
        duration: '',
        website_link: '',
        status: 'active'
      };
      
      // Look for details in the following lines
      let j = i + 1;
      while (j < lines.length && !lines[j].match(/^\d+\./)) {
        const fieldLine = lines[j].trim();
        
        if (fieldLine.includes('Expired') || fieldLine.includes('Closed')) {
          grant.status = 'inactive';
        }
        
        // Extract URL if present
        const urlMatch = fieldLine.match(/https?:\/\/[^\s]+/);
        if (urlMatch) {
          grant.website_link = urlMatch[0];
        }
        
        j++;
      }
      
      grants.push(grant);
    }
  }
  
  return grants;
}

function convertToCSV(grants) {
  // CSV headers matching the expected format
  const headers = [
    'Grant Name',
    'Funding Organization',
    'Country/Region',
    'Eligibility Criteria',
    'Focus Areas',
    'Grant Amount',
    'Application Deadline',
    'Duration',
    'Website Link'
  ];
  
  // Create CSV content
  let csv = headers.join(',') + '\n';
  
  grants.forEach(grant => {
    const row = [
      escapeCSV(grant.grant_name),
      escapeCSV(grant.funding_organization),
      escapeCSV(grant.country_region),
      escapeCSV(grant.eligibility_criteria),
      escapeCSV(grant.focus_areas),
      escapeCSV(grant.grant_amount),
      escapeCSV(grant.application_deadline),
      escapeCSV(grant.duration),
      escapeCSV(grant.website_link)
    ];
    csv += row.join(',') + '\n';
  });
  
  return csv;
}

function escapeCSV(value) {
  if (!value) return '';
  // Escape quotes and wrap in quotes if contains comma, newline, or quotes
  value = value.toString();
  if (value.includes('"')) {
    value = value.replace(/"/g, '""');
  }
  if (value.includes(',') || value.includes('\n') || value.includes('"')) {
    value = `"${value}"`;
  }
  return value;
}

async function main() {
  console.log('🚀 Starting structured grants parsing...');
  
  try {
    // Convert RTF to text
    console.log('📄 Converting RTF to text...');
    const text = await convertRtfToText();
    console.log('✅ RTF converted successfully');
    
    // Parse structured grants
    console.log('🔍 Parsing structured grants...');
    const structuredGrants = parseStructuredGrants(text);
    console.log(`✅ Found ${structuredGrants.length} structured grants`);
    
    // Also parse numbered grants
    console.log('🔍 Parsing numbered grants...');
    const numberedGrants = parseNumberedGrants(text);
    console.log(`✅ Found ${numberedGrants.length} numbered grants`);
    
    // Combine and deduplicate
    const allGrants = [...structuredGrants];
    const grantNames = new Set(structuredGrants.map(g => g.grant_name));
    
    numberedGrants.forEach(grant => {
      if (!grantNames.has(grant.grant_name)) {
        allGrants.push(grant);
      }
    });
    
    console.log(`✅ Total unique grants: ${allGrants.length}`);
    
    // Convert to CSV
    console.log('📊 Converting to CSV format...');
    const csv = convertToCSV(allGrants);
    
    // Save CSV file
    const outputPath = path.join(__dirname, '..', 'data', 'ukraine_grants_2025.csv');
    fs.writeFileSync(outputPath, csv);
    console.log(`✅ CSV saved to: ${outputPath}`);
    
    // Save JSON for inspection
    const jsonPath = path.join(__dirname, '..', 'data', 'ukraine_grants_2025.json');
    fs.writeFileSync(jsonPath, JSON.stringify(allGrants, null, 2));
    console.log(`✅ JSON saved to: ${jsonPath}`);
    
    // Display sample grants
    console.log('\n📋 Sample grants:');
    allGrants.slice(0, 5).forEach((grant, index) => {
      console.log(`\n${index + 1}. ${grant.grant_name}`);
      console.log(`   Organization: ${grant.funding_organization}`);
      console.log(`   Deadline: ${grant.application_deadline}`);
      console.log(`   Amount: ${grant.grant_amount}`);
      console.log(`   Status: ${grant.status}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { parseStructuredGrants, parseNumberedGrants, convertToCSV };