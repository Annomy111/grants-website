const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = 'https://adpddtbsstunjotxaldb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcGRkdGJzc3R1bmpvdHhhbGRiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDUyNDQyNiwiZXhwIjoyMDU2MTAwNDI2fQ.Kk7UCYqa543oR7W0MRPHqytv8LBhbaq_zaMf32n2ZjM';

// Markdown to HTML converter (simple version)
function convertMarkdownToHTML(markdown) {
  let html = markdown;
  
  // Convert headings
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Convert bold text
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Convert italic text  
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Convert lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li>.*<\/li>\n)+/g, (match) => {
    return '<ul>\n' + match + '</ul>\n';
  });
  
  // Convert paragraphs
  html = html.split('\n\n').map(para => {
    // Skip if it's already an HTML tag or an infographic container
    if (para.trim().startsWith('<') || para.trim() === '') {
      return para;
    }
    // Skip if it's a list
    if (para.includes('<ul>') || para.includes('<li>')) {
      return para;
    }
    return `<p>${para}</p>`;
  }).join('\n\n');
  
  // Clean up any double-wrapped lists
  html = html.replace(/<p>(<ul>[\s\S]*?<\/ul>)<\/p>/g, '$1');
  
  return html;
}

async function updateBlogToHTML() {
  console.log('🔄 Converting blog content to proper HTML...\n');
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    // Read the original content
    const originalContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // First update the IDs to correct ones
    let content = originalContent
      .replace(/id="key-statistics-infographic"/g, 'id="key-statistics"')
      .replace(/id="displacement-infographic"/g, 'id="focus-areas"')
      .replace(/id="civilian-casualties-infographic"/g, 'id="regional-impact"')
      .replace(/id="cso-response-infographic"/g, 'id="call-to-action"')
      .replace(/id="roadmap-infographic"/g, 'id="future-priorities"')
      .replace(/id="europe-support-infographic"/g, 'id="international-support"')
      .replace(/id="trends-timeline-infographic"/g, 'id="timeline"');
    
    // Convert to HTML
    const htmlContent = convertMarkdownToHTML(content);
    
    console.log('📝 Sample of converted content:');
    console.log(htmlContent.substring(0, 500) + '...\n');
    
    // Update in database
    const { data, error } = await supabase
      .from('blog_posts')
      .update({ 
        content: htmlContent,
        updated_at: new Date().toISOString()
      })
      .eq('slug', 'ukraine-civil-society-pulse-may-june-2025')
      .select();
    
    if (error) {
      console.error('❌ Update error:', error);
    } else {
      console.log('✅ Blog post updated with HTML formatting!');
      
      // Count elements
      const h2Count = (htmlContent.match(/<h2>/g) || []).length;
      const h3Count = (htmlContent.match(/<h3>/g) || []).length;
      const h4Count = (htmlContent.match(/<h4>/g) || []).length;
      const pCount = (htmlContent.match(/<p>/g) || []).length;
      const ulCount = (htmlContent.match(/<ul>/g) || []).length;
      const strongCount = (htmlContent.match(/<strong>/g) || []).length;
      
      console.log('\n📊 HTML elements in content:');
      console.log(`  H2 headings: ${h2Count}`);
      console.log(`  H3 headings: ${h3Count}`);
      console.log(`  H4 headings: ${h4Count}`);
      console.log(`  Paragraphs: ${pCount}`);
      console.log(`  Lists: ${ulCount}`);
      console.log(`  Bold text: ${strongCount}`);
    }
    
    console.log('\n🎉 Blog content has been converted to proper HTML!');
    console.log('Headings, lists, and formatting should now display correctly.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateBlogToHTML();