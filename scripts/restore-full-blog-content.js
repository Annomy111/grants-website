const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

async function restoreFullContent() {
  console.log('🔄 Restoring full blog content with correct infographic IDs...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read the original full content
    const originalContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Update with correct IDs
    const fullContent = originalContent
      .replace(/<div id="[^"]*" class="infographic-container my-8"><\/div>/g, (match) => {
        if (match.includes('key-statistics')) return '<div id="key-statistics" class="infographic-container my-8"></div>';
        if (match.includes('focus-areas')) return '<div id="focus-areas" class="infographic-container my-8"></div>';
        if (match.includes('timeline')) return '<div id="timeline" class="infographic-container my-8"></div>';
        if (match.includes('regional-impact')) return '<div id="regional-impact" class="infographic-container my-8"></div>';
        if (match.includes('international-support')) return '<div id="international-support" class="infographic-container my-8"></div>';
        if (match.includes('future-priorities')) return '<div id="future-priorities" class="infographic-container my-8"></div>';
        if (match.includes('call-to-action')) return '<div id="call-to-action" class="infographic-container my-8"></div>';
        return match;
      });
    
    console.log('📝 Updating blog post with full content and correct IDs...');
    
    // Update in database
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ 
        content: fullContent,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'ukraine-civil-society-pulse-may-june-2025')
      .select();
    
    if (error) {
      console.error('❌ Update error:', error);
    } else {
      console.log('✅ Blog post content restored successfully!');
      console.log('Content length:', fullContent.length, 'characters');
      
      // Count infographics
      const infographicCount = (fullContent.match(/class="infographic-container/g) || []).length;
      console.log('Infographics in content:', infographicCount);
    }
    
    console.log('\n🎉 Full blog content has been restored with correct infographic IDs!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

restoreFullContent();