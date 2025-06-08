const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

async function updateBlogContentIds() {
  console.log('🔄 Updating blog post content with correct infographic IDs...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read the original content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Replace the infographic IDs
    const updatedContent = blogContent
      .replace(/id="key-statistics-infographic"/g, 'id="key-statistics"')
      .replace(/id="displacement-infographic"/g, 'id="focus-areas"')
      .replace(/id="civilian-casualties-infographic"/g, 'id="regional-impact"')
      .replace(/id="cso-response-infographic"/g, 'id="call-to-action"')
      .replace(/id="roadmap-infographic"/g, 'id="future-priorities"')
      .replace(/id="europe-support-infographic"/g, 'id="international-support"')
      .replace(/id="trends-timeline-infographic"/g, 'id="timeline"');
    
    console.log('📝 ID replacements made');
    
    // Update in database
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ 
        content: updatedContent,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'ukraine-civil-society-pulse-may-june-2025')
      .select();
    
    if (error) {
      console.error('❌ Update error:', error);
    } else {
      console.log('✅ Blog post content updated successfully!');
      
      // Also update the static file
      fs.writeFileSync(
        path.join(__dirname, '..', 'client/public/data/blog-posts.json'),
        JSON.stringify([{
          ...JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'client/public/data/blog-posts.json'), 'utf8'))[0],
          content: updatedContent
        }], null, 2)
      );
      console.log('✅ Static file also updated');
    }
    
    console.log('\n🎉 Blog post infographic IDs have been corrected!');
    console.log('The infographics should now render properly.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateBlogContentIds();