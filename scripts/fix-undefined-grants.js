#!/usr/bin/env node

/**
 * Script to fix grants with undefined or null grant_name
 * Attempts to extract grant names from other fields like description or eligibility
 * Also checks and fixes funding_organization field
 */

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Create readline interface for user confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

/**
 * Extract grant name from description or other fields
 */
function extractGrantName(grant) {
  let extractedName = null;
  
  // Try to extract from description_en first
  if (grant.description_en) {
    // Look for patterns like "The XYZ Grant" or "XYZ Program"
    const patterns = [
      /^The (.+?(?:Grant|Program|Fund|Initiative|Fellowship|Award|Scholarship))/i,
      /^(.+?(?:Grant|Program|Fund|Initiative|Fellowship|Award|Scholarship))/i,
      /^"(.+?)"/,  // Quoted text at start
      /^'(.+?)'/,  // Single quoted text at start
      /^([A-Z][^.!?]{10,50})(?:[.!?]|$)/  // First sentence if capitalized
    ];
    
    for (const pattern of patterns) {
      const match = grant.description_en.match(pattern);
      if (match) {
        extractedName = match[1].trim();
        break;
      }
    }
  }
  
  // Try description_uk if no name found
  if (!extractedName && grant.description_uk) {
    // Look for Ukrainian patterns
    const patterns = [
      /^(.+?(?:грант|програма|фонд|ініціатива))/i,
      /^"(.+?)"/,
      /^'(.+?)'/,
      /^([А-ЯЇІЄҐ][^.!?]{10,50})(?:[.!?]|$)/
    ];
    
    for (const pattern of patterns) {
      const match = grant.description_uk.match(pattern);
      if (match) {
        extractedName = match[1].trim();
        break;
      }
    }
  }
  
  // Try to extract from eligibility if still no name
  if (!extractedName && grant.eligibility_criteria_en) {
    const match = grant.eligibility_criteria_en.match(/(?:for|of|the)\s+(.+?(?:Grant|Program|Fund|Initiative))/i);
    if (match) {
      extractedName = match[1].trim();
    }
  }
  
  // Clean up the extracted name
  if (extractedName) {
    // Remove extra whitespace
    extractedName = extractedName.replace(/\s+/g, ' ').trim();
    
    // Ensure proper capitalization
    extractedName = extractedName.split(' ')
      .map(word => {
        // Keep acronyms in caps
        if (word.length <= 3 && word === word.toUpperCase()) {
          return word;
        }
        // Capitalize first letter
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join(' ');
    
    // Limit length
    if (extractedName.length > 100) {
      extractedName = extractedName.substring(0, 97) + '...';
    }
  }
  
  return extractedName;
}

/**
 * Extract organization name from various fields
 */
function extractOrganization(grant) {
  // First check if organization already exists and is valid
  if (grant.organization && grant.organization !== 'undefined' && grant.organization !== 'null') {
    return grant.organization;
  }
  
  let extractedOrg = null;
  
  // Try to extract from description
  if (grant.description_en) {
    const patterns = [
      /(?:by|from|offered by|provided by|funded by)\s+(?:the\s+)?([A-Z][A-Za-z\s&]+(?:Foundation|Fund|Organization|Institute|Agency|Council|Trust|Association|Center|Centre))/i,
      /^([A-Z][A-Za-z\s&]+(?:Foundation|Fund|Organization|Institute|Agency|Council|Trust|Association|Center|Centre))/i
    ];
    
    for (const pattern of patterns) {
      const match = grant.description_en.match(pattern);
      if (match) {
        extractedOrg = match[1].trim();
        break;
      }
    }
  }
  
  // Try website URL
  if (!extractedOrg && grant.website) {
    // Extract from domain name
    const urlMatch = grant.website.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+)\./);
    if (urlMatch) {
      // Convert domain to organization name
      extractedOrg = urlMatch[1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
  }
  
  // Clean up the extracted organization
  if (extractedOrg) {
    extractedOrg = extractedOrg.replace(/\s+/g, ' ').trim();
  }
  
  return extractedOrg;
}

/**
 * Main function to fix undefined grants
 */
async function fixUndefinedGrants() {
  console.log('🔍 Fetching grants with undefined or null grant_name...\n');
  
  try {
    // Query grants where grant_name is null, undefined, or empty
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .or('grant_name.is.null,grant_name.eq.undefined,grant_name.eq.')
      .order('id');
    
    if (error) {
      console.error('❌ Error fetching grants:', error);
      return;
    }
    
    if (!grants || grants.length === 0) {
      console.log('✅ No grants found with undefined or null grant_name!');
      return;
    }
    
    console.log(`Found ${grants.length} grants with undefined/null grant_name\n`);
    
    // Process each grant and prepare updates
    const updates = [];
    
    for (const grant of grants) {
      const update = {
        id: grant.id,
        original: {
          grant_name: grant.grant_name,
          organization: grant.organization
        },
        proposed: {}
      };
      
      // Extract grant name
      const extractedName = extractGrantName(grant);
      if (extractedName) {
        update.proposed.grant_name = extractedName;
      }
      
      // Extract/fix organization
      const extractedOrg = extractOrganization(grant);
      if (extractedOrg && extractedOrg !== grant.organization) {
        update.proposed.organization = extractedOrg;
      }
      
      // Only include if we have something to update
      if (Object.keys(update.proposed).length > 0) {
        updates.push(update);
      }
    }
    
    if (updates.length === 0) {
      console.log('❌ Could not extract names for any of the grants');
      return;
    }
    
    // Display proposed updates
    console.log(`\n📋 Proposed updates for ${updates.length} grants:\n`);
    console.log('─'.repeat(80));
    
    for (const update of updates) {
      console.log(`Grant ID: ${update.id}`);
      
      if (update.proposed.grant_name) {
        console.log(`  Grant Name: ${update.original.grant_name || 'null'} → ${update.proposed.grant_name}`);
      }
      
      if (update.proposed.organization) {
        console.log(`  Organization: ${update.original.organization || 'null'} → ${update.proposed.organization}`);
      }
      
      console.log('─'.repeat(80));
    }
    
    // Ask for confirmation
    const answer = await askQuestion('\n🤔 Do you want to apply these updates? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
      console.log('\n❌ Update cancelled');
      return;
    }
    
    // Apply updates
    console.log('\n🔄 Applying updates...\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const update of updates) {
      const { error } = await supabase
        .from('grants')
        .update(update.proposed)
        .eq('id', update.id);
      
      if (error) {
        console.error(`❌ Error updating grant ${update.id}:`, error);
        errorCount++;
      } else {
        console.log(`✅ Updated grant ${update.id}`);
        successCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully updated: ${successCount} grants`);
    console.log(`   ❌ Failed updates: ${errorCount} grants`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  } finally {
    rl.close();
  }
}

// Run the script
fixUndefinedGrants();