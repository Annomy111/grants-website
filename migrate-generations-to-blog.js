// Script to migrate completed generation jobs to blog drafts
const Database = require('./server/database/db');

async function migrateGenerationsToBlog() {
  console.log('🔄 Migrating completed generation jobs to blog drafts...\n');
  
  try {
    // Get completed generation jobs that haven't been migrated
    console.log('🔍 Finding completed generation jobs...');
    const completedJobs = await Database.all(`
      SELECT bgj.*, u.username 
      FROM blog_generation_jobs bgj 
      LEFT JOIN users u ON bgj.created_by = u.id 
      WHERE bgj.status = 'completed' 
        AND bgj.generated_content IS NOT NULL
      ORDER BY bgj.completed_at DESC
      LIMIT 20
    `);
    
    console.log(`📊 Found ${completedJobs.length} completed jobs to migrate`);
    
    if (completedJobs.length === 0) {
      console.log('✨ No new generation jobs to migrate!');
      return;
    }
    
    // Process each job
    for (const job of completedJobs) {
      try {
        console.log(`\n📝 Processing Job ${job.id}...`);
        
        // Parse the generated content
        const generatedContent = JSON.parse(job.generated_content);
        const content = generatedContent.content;
        
        if (!content || !content.title) {
          console.log(`⚠️ Job ${job.id} missing content or title, skipping...`);
          continue;
        }
        
        // Create a unique slug
        const baseSlug = content.title
          .toLowerCase()
          .replace(/[^a-z0-9 -]/g, '')
          .replace(/\s+/g, '-')
          .substring(0, 40);
        
        const slug = `${baseSlug}-job-${job.id}-${Date.now()}`;
        
        // Extract parameters for metadata
        const params = JSON.parse(job.input_parameters || '{}');
        
        // Create excerpt
        const excerpt = content.excerpt || 
          (content.content ? 
            content.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 
            `AI-generated analysis on ${params.topic || 'civil society topics'}`);
        
        // Calculate word count
        const wordCount = content.content ? 
          content.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
        
        console.log(`  📋 Title: ${content.title}`);
        console.log(`  📏 Content: ${content.content?.length || 0} chars, ~${wordCount} words`);
        console.log(`  👤 Author: ${content.author || 'AI Generator'}`);
        console.log(`  🔗 Slug: ${slug}`);
        
        // Insert into blog_posts as draft
        const result = await Database.run(`
          INSERT INTO blog_posts (
            title, slug, content, excerpt, author_id, status,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, 'draft', ?, ?)
        `, [
          content.title,
          slug,
          content.content || '',
          excerpt,
          job.created_by || 1, // Default to admin if no user
          job.completed_at || new Date().toISOString(),
          new Date().toISOString()
        ]);
        
        const blogPostId = result.id;
        console.log(`  ✅ Saved as blog post ID: ${blogPostId}`);
        
        // Log the migration for reference
        console.log(`  📍 Available in admin blog management as draft #${blogPostId}`);
        
      } catch (jobError) {
        console.error(`❌ Failed to migrate job ${job.id}:`, jobError.message);
      }
    }
    
    console.log('\n🎉 Migration completed!');
    console.log('📍 Check your admin blog management section to review and publish the drafts.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run the migration
migrateGenerationsToBlog().then(() => {
  console.log('\n✨ Migration script finished');
  process.exit(0);
}).catch(error => {
  console.error('💥 Migration script failed:', error);
  process.exit(1);
});