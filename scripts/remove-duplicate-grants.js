#!/usr/bin/env node

require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Please ensure REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to calculate similarity between two strings (Levenshtein distance)
function calculateSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1, str2) {
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
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

async function findAndRemoveDuplicates() {
  console.log('🔍 Fetching all grants from database...\n');
  
  // Fetch all grants
  const { data: grants, error } = await supabase
    .from('grants')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching grants:', error);
    return;
  }
  
  console.log(`📊 Total grants in database: ${grants.length}\n`);
  
  // Find exact duplicates
  const duplicateGroups = new Map();
  const processedKeys = new Set();
  
  grants.forEach(grant => {
    const key = `${grant.name?.toLowerCase().trim()}_${grant.funding_organization?.toLowerCase().trim()}`;
    
    if (!processedKeys.has(key)) {
      processedKeys.add(key);
      duplicateGroups.set(key, [grant]);
    } else {
      duplicateGroups.get(key).push(grant);
    }
  });
  
  // Filter to only keep groups with duplicates
  const exactDuplicates = Array.from(duplicateGroups.entries())
    .filter(([_, group]) => group.length > 1)
    .map(([key, group]) => ({
      key,
      grants: group.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }));
  
  console.log('=== EXACT DUPLICATES ===');
  console.log(`Found ${exactDuplicates.length} groups of exact duplicates\n`);
  
  let totalDuplicatesToRemove = 0;
  const idsToRemove = [];
  
  exactDuplicates.forEach(({ grants }) => {
    console.log(`📌 Grant: "${grants[0].name}" by ${grants[0].funding_organization}`);
    console.log(`   Found ${grants.length} copies:`);
    
    grants.forEach((grant, index) => {
      const status = index === 0 ? '✅ KEEP' : '❌ REMOVE';
      console.log(`   ${status} - ID: ${grant.id}, Created: ${new Date(grant.created_at).toLocaleDateString()}`);
      
      if (index > 0) {
        idsToRemove.push(grant.id);
        totalDuplicatesToRemove++;
      }
    });
    console.log('');
  });
  
  // Find similar grants (potential duplicates)
  console.log('\n=== SIMILAR GRANTS (Potential Duplicates) ===');
  console.log('Checking for grants with similar names (85%+ similarity)...\n');
  
  const similarityThreshold = 0.85;
  const checkedPairs = new Set();
  const similarGrants = [];
  
  for (let i = 0; i < grants.length; i++) {
    for (let j = i + 1; j < grants.length; j++) {
      const grant1 = grants[i];
      const grant2 = grants[j];
      
      // Skip if same organization (already checked in exact duplicates)
      if (grant1.funding_organization === grant2.funding_organization) continue;
      
      const pairKey = [grant1.id, grant2.id].sort().join('_');
      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);
      
      const similarity = calculateSimilarity(grant1.name, grant2.name);
      
      if (similarity >= similarityThreshold) {
        similarGrants.push({
          grant1,
          grant2,
          similarity: (similarity * 100).toFixed(1)
        });
      }
    }
  }
  
  if (similarGrants.length > 0) {
    console.log(`Found ${similarGrants.length} pairs of similar grants:\n`);
    
    similarGrants
      .sort((a, b) => b.similarity - a.similarity)
      .forEach(({ grant1, grant2, similarity }) => {
        console.log(`📊 ${similarity}% similarity:`);
        console.log(`   1️⃣  "${grant1.name}" by ${grant1.funding_organization}`);
        console.log(`   2️⃣  "${grant2.name}" by ${grant2.funding_organization}`);
        console.log('');
      });
  } else {
    console.log('No similar grants found above the threshold.\n');
  }
  
  // Summary
  console.log('=== SUMMARY ===');
  console.log(`Total grants: ${grants.length}`);
  console.log(`Exact duplicate groups found: ${exactDuplicates.length}`);
  console.log(`Total duplicates to remove: ${totalDuplicatesToRemove}`);
  console.log(`Grants after cleanup: ${grants.length - totalDuplicatesToRemove}`);
  console.log(`Similar grant pairs found: ${similarGrants.length}\n`);
  
  // Remove duplicates if confirmed
  if (totalDuplicatesToRemove > 0) {
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(`\n🗑️  Do you want to remove ${totalDuplicatesToRemove} duplicate grants? (yes/no): `, async (answer) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        console.log('\n🚀 Removing duplicates...');
        
        const { error: deleteError } = await supabase
          .from('grants')
          .delete()
          .in('id', idsToRemove);
        
        if (deleteError) {
          console.error('❌ Error removing duplicates:', deleteError);
        } else {
          console.log(`✅ Successfully removed ${totalDuplicatesToRemove} duplicate grants!`);
        }
      } else {
        console.log('❌ Operation cancelled. No grants were removed.');
      }
      
      rl.close();
      process.exit(0);
    });
  } else {
    console.log('✅ No exact duplicates found. Database is clean!');
    process.exit(0);
  }
}

// Run the script
findAndRemoveDuplicates().catch(console.error);