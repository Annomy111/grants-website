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

function parseGrantsFromText(text) {
  const grants = [];
  
  // Look for grant entries with various patterns
  // Pattern 1: Numbered grants (e.g., "1. Grant Name")
  // Pattern 2: Bullet points with grant info
  // Pattern 3: "Grant Name:" format
  
  // Split text into sections
  const lines = text.split('\n');
  let currentGrant = null;
  let inGrantSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for grant patterns
    // Pattern: "Grant ##: Name" or numbered list
    const grantMatch = line.match(/^(?:Grant\s+)?(\d+)[.:]\s+(.+?)(?:\s*[-–]\s*(.+))?$/);
    const bulletMatch = line.match(/^[•◦]\s+(.+?)(?:\s*[-–]\s*(.+))?$/);
    
    if (grantMatch || (bulletMatch && lines[i-1]?.includes('Grant'))) {
      // Save previous grant if exists
      if (currentGrant && currentGrant.grant_name) {
        grants.push(currentGrant);
      }
      
      // Start new grant
      currentGrant = {
        grant_name: '',
        funding_organization: '',
        country_region: '',
        eligibility_criteria: '',
        focus_areas: '',
        grant_amount: '',
        application_deadline: '',
        duration: '',
        website_link: '',
        status: 'active',
        description_en: '',
        contact_email: '',
        application_procedure: '',
        language_requirements: '',
        co_funding: '',
        recurrence: ''
      };
      
      if (grantMatch) {
        currentGrant.grant_name = grantMatch[2].trim();
        if (grantMatch[3]) {
          currentGrant.funding_organization = grantMatch[3].trim();
        }
      } else if (bulletMatch) {
        currentGrant.grant_name = bulletMatch[1].trim();
      }
      
      inGrantSection = true;
    }
    
    // Parse grant details if we're in a grant section
    if (inGrantSection && currentGrant) {
      // Funding Organization
      if (line.includes('Funding Organization:') || line.includes('Funder:')) {
        const match = line.match(/(?:Funding Organization|Funder):\s*(.+)/);
        if (match) currentGrant.funding_organization = match[1].trim();
      }
      
      // Country/Region
      if (line.includes('Country/Region:') || line.includes('Region:')) {
        const match = line.match(/(?:Country\/Region|Region):\s*(.+)/);
        if (match) currentGrant.country_region = match[1].trim();
      }
      
      // Eligibility
      if (line.includes('Eligibility:')) {
        const match = line.match(/Eligibility:\s*(.+)/);
        if (match) currentGrant.eligibility_criteria = match[1].trim();
        // Continue reading multi-line eligibility
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/^\s*(Focus Areas|Grant Amount|Application Deadline|Duration|Website|Contact):/)) {
          if (lines[j].trim()) {
            currentGrant.eligibility_criteria += ' ' + lines[j].trim();
          }
          j++;
        }
      }
      
      // Focus Areas
      if (line.includes('Focus Areas:') || line.includes('Focus areas:')) {
        const match = line.match(/Focus [Aa]reas:\s*(.+)/);
        if (match) currentGrant.focus_areas = match[1].trim();
        // Continue reading multi-line focus areas
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/^\s*(Grant Amount|Application Deadline|Duration|Website|Contact):/)) {
          if (lines[j].trim() && !lines[j].includes(':')) {
            currentGrant.focus_areas += ' ' + lines[j].trim();
          }
          j++;
        }
      }
      
      // Grant Amount
      if (line.includes('Grant Amount:') || line.includes('Grant amount:')) {
        const match = line.match(/Grant [Aa]mount:\s*(.+)/);
        if (match) currentGrant.grant_amount = match[1].trim();
      }
      
      // Application Deadline
      if (line.includes('Application Deadline:') || line.includes('Application deadline:') || line.includes('Deadline:')) {
        const match = line.match(/(?:Application )?[Dd]eadline:\s*(.+)/);
        if (match) {
          currentGrant.application_deadline = match[1].trim();
          // Check if it says "Closed" or "Expired"
          if (match[1].toLowerCase().includes('closed') || match[1].toLowerCase().includes('expired')) {
            currentGrant.status = 'inactive';
          }
        }
      }
      
      // Duration
      if (line.includes('Duration:') || line.includes('Project Duration:')) {
        const match = line.match(/(?:Project )?Duration:\s*(.+)/);
        if (match) currentGrant.duration = match[1].trim();
      }
      
      // Website
      if (line.includes('Website:') || line.includes('Link:') || line.includes('URL:')) {
        const match = line.match(/(?:Website|Link|URL):\s*(.+)/);
        if (match) {
          let url = match[1].trim();
          // Clean up URL formatting
          url = url.replace(/^\[/, '').replace(/\].*$/, '');
          // Extract URL from text if it contains description
          const urlMatch = url.match(/https?:\/\/[^\s\]]+/);
          if (urlMatch) {
            currentGrant.website_link = urlMatch[0];
          } else {
            currentGrant.website_link = url;
          }
        }
      }
      
      // Contact Email
      if (line.includes('Contact:') || line.includes('Email:')) {
        const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
        if (emailMatch) {
          currentGrant.contact_email = emailMatch[1];
        }
      }
      
      // Application Language
      if (line.includes('Application Language:') || line.includes('Language:')) {
        const match = line.match(/(?:Application )?Language:\s*(.+)/);
        if (match) currentGrant.language_requirements = match[1].trim();
      }
      
      // Co-funding
      if (line.includes('Co-funding:') || line.includes('Co-financing:')) {
        const match = line.match(/Co-(?:funding|financing):\s*(.+)/);
        if (match) currentGrant.co_funding = match[1].trim();
      }
      
      // Recurrence
      if (line.includes('Recurrence:')) {
        const match = line.match(/Recurrence:\s*(.+)/);
        if (match) currentGrant.recurrence = match[1].trim();
      }
      
      // Check for section end
      if (line.match(/^(Grant \d+:|^\d+\.|^[•◦]\s+\w+.*Grant)/) && i > 0) {
        inGrantSection = false;
      }
    }
  }
  
  // Save last grant
  if (currentGrant && currentGrant.grant_name) {
    grants.push(currentGrant);
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
  console.log('🚀 Starting RTF to CSV conversion...');
  
  try {
    // Convert RTF to text
    console.log('📄 Converting RTF to text...');
    const text = await convertRtfToText();
    console.log('✅ RTF converted successfully');
    
    // Parse grants from text
    console.log('🔍 Parsing grants from text...');
    const grants = parseGrantsFromText(text);
    console.log(`✅ Found ${grants.length} grants`);
    
    // Convert to CSV
    console.log('📊 Converting to CSV format...');
    const csv = convertToCSV(grants);
    
    // Save CSV file
    const outputPath = path.join(__dirname, '..', 'data', 'new_grants_2025.csv');
    fs.writeFileSync(outputPath, csv);
    console.log(`✅ CSV saved to: ${outputPath}`);
    
    // Save JSON for inspection
    const jsonPath = path.join(__dirname, '..', 'data', 'new_grants_2025.json');
    fs.writeFileSync(jsonPath, JSON.stringify(grants, null, 2));
    console.log(`✅ JSON saved to: ${jsonPath}`);
    
    // Display sample grants
    console.log('\n📋 Sample grants:');
    grants.slice(0, 3).forEach((grant, index) => {
      console.log(`\n${index + 1}. ${grant.grant_name}`);
      console.log(`   Organization: ${grant.funding_organization}`);
      console.log(`   Deadline: ${grant.application_deadline}`);
      console.log(`   Amount: ${grant.grant_amount}`);
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

module.exports = { convertRtfToText, parseGrantsFromText, convertToCSV };