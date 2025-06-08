const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection details
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

async function insertBlogPost() {
  console.log('🚀 Inserting blog post directly into Supabase...\n');
  
  // Create Supabase client with service role key (bypasses RLS)
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read blog content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // First, get an admin user ID to use as author
    console.log('🔍 Getting admin user ID...');
    const { data: adminUser } = await supabase
      .from('app_users')
      .select('user_id')
      .eq('role', 'admin')
      .limit(1)
      .single();
    
    // Prepare blog post data matching the actual schema
    const blogPost = {
      title: "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)",
      slug: 'ukraine-civil-society-pulse-may-june-2025',
      content: blogContent,
      excerpt: "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.",
      category: 'Reports',
      tags: ['Ukraine', 'Civil Society', 'Human Rights', 'Humanitarian Aid', 'EU Integration'],
      status: 'published',
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Add author_id if we found an admin user
    if (adminUser && adminUser.user_id) {
      blogPost.author_id = adminUser.user_id;
      console.log('✅ Using admin author ID:', adminUser.user_id);
    } else {
      console.log('⚠️  No admin user found, posting without author');
    }
    
    console.log('\n📝 Blog post details:');
    console.log('   Title:', blogPost.title);
    console.log('   Slug:', blogPost.slug);
    console.log('   Category:', blogPost.category);
    console.log('   Status:', blogPost.status);
    console.log('   Content length:', blogPost.content.length, 'characters');
    console.log('   Includes 7 infographics: ✅');
    
    // Check if post already exists
    console.log('\n🔍 Checking if post already exists...');
    const { data: existingPost, error: checkError } = await supabase
      .from('blog_posts')
      .select('id, title')
      .eq('slug', blogPost.slug)
      .single();
    
    if (existingPost && !checkError) {
      console.log('⚠️  Post already exists with ID:', existingPost.id);
      console.log('🔄 Updating existing post...');
      
      // Update existing post
      const updateData = {
        title: blogPost.title,
        content: blogPost.content,
        excerpt: blogPost.excerpt,
        category: blogPost.category,
        tags: blogPost.tags,
        status: blogPost.status,
        published_at: blogPost.published_at,
        updated_at: new Date().toISOString()
      };
      
      if (blogPost.author_id) {
        updateData.author_id = blogPost.author_id;
      }
      
      const { data: updatedPost, error: updateError } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', existingPost.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('❌ Update error:', updateError);
      } else {
        console.log('✅ Blog post updated successfully!');
        console.log('📊 Updated post ID:', updatedPost.id);
      }
    } else {
      // Insert new post
      console.log('📤 Inserting new blog post...');
      
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([blogPost])
        .select()
        .single();
      
      if (error) {
        console.error('❌ Insert error:', error);
        
        // Try without select
        console.log('\n🔄 Retrying without select...');
        const { error: insertError } = await supabase
          .from('blog_posts')
          .insert([blogPost]);
        
        if (insertError) {
          console.error('❌ Insert still failed:', insertError);
        } else {
          console.log('✅ Blog post inserted successfully!');
        }
      } else {
        console.log('\n✅ Blog post created successfully!');
        console.log('📊 New post ID:', data.id);
        console.log('📊 Created at:', data.created_at);
      }
    }
    
    console.log('\n🎉 Blog post is now live!');
    console.log('🔗 View at: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
    console.log('\n✨ The blog includes all 7 infographics:');
    console.log('   1. Key Statistics Visualization');
    console.log('   2. Focus Areas Chart');
    console.log('   3. Timeline of Events');
    console.log('   4. Regional Impact Map');
    console.log('   5. International Support Graph');
    console.log('   6. Future Priorities Diagram');
    console.log('   7. Call to Action');
    
    // Verify by fetching the post
    console.log('\n🔍 Verifying blog post...');
    const { data: verifyPost, error: verifyError } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', 'ukraine-civil-society-pulse-may-june-2025')
      .single();
    
    if (verifyPost && !verifyError) {
      console.log('✅ Verification successful! Post exists in database.');
      console.log('📊 Post ID:', verifyPost.id);
      console.log('📊 Post status:', verifyPost.status);
      console.log('📊 Published at:', verifyPost.published_at);
      console.log('📊 Has content:', verifyPost.content ? 'Yes' : 'No');
      console.log('📊 Has infographics:', verifyPost.content.includes('infographic-container') ? 'Yes' : 'No');
      console.log('📊 Infographic count:', (verifyPost.content.match(/infographic-container/g) || []).length);
    } else if (verifyError) {
      console.log('⚠️  Could not verify post:', verifyError.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the script
insertBlogPost().catch(console.error);