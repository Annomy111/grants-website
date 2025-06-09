#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function removeDuplicates() {
  console.log('🔍 Starting duplicate removal process...\n');

  try {
    // Fetch all grants
    console.log('📊 Fetching all grants from database...');
    const { data: grants, error } = await supabase
      .from('grants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching grants:', error);
      return;
    }

    console.log(`✅ Found ${grants.length} total grants\n`);

    // Group grants by name AND organization
    const grantGroups = {};
    
    grants.forEach(grant => {
      // Create a unique key using both grant name and organization
      const key = `${grant.grant_name || 'NO_NAME'}|${grant.funding_organization || 'NO_ORG'}`.toLowerCase().trim();
      
      if (!grantGroups[key]) {
        grantGroups[key] = [];
      }
      grantGroups[key].push(grant);
    });

    // Find and process duplicates
    let totalDuplicates = 0;
    let duplicatesToRemove = [];
    const duplicateDetails = [];

    console.log('🔍 Analyzing duplicate grants...\n');

    Object.entries(grantGroups).forEach(([key, duplicateGrants]) => {
      if (duplicateGrants.length > 1) {
        // Sort by created_at descending (newest first)
        duplicateGrants.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });

        const keepGrant = duplicateGrants[0]; // Keep the newest
        const removeGrants = duplicateGrants.slice(1); // Remove the rest

        duplicateDetails.push({
          grantName: keepGrant.grant_name || 'Unknown Grant',
          organization: keepGrant.funding_organization || 'Unknown Organization',
          totalCopies: duplicateGrants.length,
          keeping: {
            id: keepGrant.id,
            createdAt: keepGrant.created_at,
            deadline: keepGrant.deadline
          },
          removing: removeGrants.map(g => ({
            id: g.id,
            createdAt: g.created_at,
            deadline: g.deadline
          }))
        });

        totalDuplicates += removeGrants.length;
        duplicatesToRemove.push(...removeGrants.map(g => g.id));
      }
    });

    // Display duplicate analysis
    if (duplicateDetails.length === 0) {
      console.log('✨ No duplicates found! Your database is clean.\n');
      return;
    }

    console.log(`📊 Duplicate Analysis Results:`);
    console.log(`   Total duplicate groups: ${duplicateDetails.length}`);
    console.log(`   Total duplicates to remove: ${totalDuplicates}\n`);

    console.log('📋 Duplicate Details:\n');
    
    duplicateDetails.forEach((detail, index) => {
      console.log(`${index + 1}. Grant: "${detail.grantName}"`);
      console.log(`   Organization: ${detail.organization}`);
      console.log(`   Total copies: ${detail.totalCopies}`);
      console.log(`   Keeping: ID ${detail.keeping.id} (created: ${new Date(detail.keeping.createdAt).toLocaleDateString()})`);
      console.log(`   Removing: ${detail.removing.length} duplicate(s)`);
      detail.removing.forEach(r => {
        console.log(`     - ID ${r.id} (created: ${new Date(r.createdAt).toLocaleDateString()})`);
      });
      console.log('');
    });

    // Ask for confirmation
    console.log('⚠️  WARNING: This will permanently delete duplicate grants from the database.');
    console.log('Do you want to proceed? (yes/no): ');

    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('', answer => {
        readline.close();
        resolve(answer.toLowerCase().trim());
      });
    });

    if (answer !== 'yes' && answer !== 'y') {
      console.log('\n❌ Operation cancelled. No changes were made.');
      return;
    }

    // Perform deletion
    console.log('\n🗑️  Removing duplicates...');
    
    // Delete in batches to avoid timeout
    const batchSize = 50;
    let deleted = 0;

    for (let i = 0; i < duplicatesToRemove.length; i += batchSize) {
      const batch = duplicatesToRemove.slice(i, i + batchSize);
      
      const { error: deleteError, count } = await supabase
        .from('grants')
        .delete()
        .in('id', batch);

      if (deleteError) {
        console.error(`❌ Error deleting batch: ${deleteError.message}`);
        console.log(`   Attempted to delete IDs: ${batch.join(', ')}`);
      } else {
        deleted += count || batch.length;
        console.log(`   Deleted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(duplicatesToRemove.length / batchSize)} (${deleted}/${totalDuplicates} grants)`);
      }
    }

    // Verify results
    console.log('\n📊 Verifying results...');
    
    const { data: remainingGrants, error: verifyError } = await supabase
      .from('grants')
      .select('id')
      .order('created_at', { ascending: false });

    if (verifyError) {
      console.error('❌ Error verifying results:', verifyError);
    } else {
      console.log(`\n✅ Success! Database now contains ${remainingGrants.length} grants`);
      console.log(`   Removed ${deleted} duplicate grants`);
    }

    // Additional statistics
    console.log('\n📈 Final Statistics:');
    console.log(`   Original total grants: ${grants.length}`);
    console.log(`   Duplicate grants removed: ${deleted}`);
    console.log(`   Remaining grants: ${remainingGrants ? remainingGrants.length : 'Unknown'}`);
    console.log(`   Unique grant groups processed: ${Object.keys(grantGroups).length}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the script
removeDuplicates().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});