// Comprehensive analysis of blog generation quality
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function analyzeBlogQuality() {
  console.log('📊 BLOG GENERATION QUALITY ANALYSIS\n');
  console.log('=====================================\n');
  
  const db = new sqlite3.Database(path.join(__dirname, 'server/database/grants.db'));
  
  // 1. Analyze existing blog posts
  console.log('1. EXISTING BLOG POSTS ANALYSIS:\n');
  
  db.all(`
    SELECT 
      id, 
      title, 
      LENGTH(content) as content_length,
      LENGTH(content) - LENGTH(REPLACE(content, ' ', '')) as word_count_approx,
      status,
      created_at
    FROM blog_posts 
    ORDER BY created_at DESC
  `, (err, posts) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Character Count: ${post.content_length}`);
      console.log(`   Approx Word Count: ${Math.round(post.word_count_approx / 5)}`); // Rough estimate
      console.log(`   Created: ${post.created_at}`);
      console.log('');
    });
    
    // 2. Check blog content quality
    console.log('\n2. CONTENT QUALITY ANALYSIS:\n');
    
    db.get(`SELECT content FROM blog_posts WHERE id = 5`, (err, row) => {
      if (err || !row) {
        console.error('Could not get blog content');
        return;
      }
      
      const content = row.content;
      
      // Quality checks
      const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
      const hasImages = content.includes('<img') || content.includes('[IMAGE');
      const imageCount = (content.match(/\[IMAGE/g) || []).length + (content.match(/<img/g) || []).length;
      const hasStatistics = content.includes('statistics-infographic') || content.includes('stat-');
      const statCount = (content.match(/stat-item/g) || []).length;
      const hasH2 = content.includes('<h2') || content.includes('##');
      const h2Count = (content.match(/<h2/g) || []).length + (content.match(/##\s/g) || []).length;
      const hasH3 = content.includes('<h3') || content.includes('###');
      const h3Count = (content.match(/<h3/g) || []).length + (content.match(/###\s/g) || []).length;
      const hasBullets = content.includes('<ul') || content.includes('<li');
      const bulletCount = (content.match(/<li/g) || []).length;
      const hasLinks = content.includes('<a href') || content.includes('http');
      const linkCount = (content.match(/<a href/g) || []).length;
      const hasMattiaVoice = content.includes('DUB') || content.includes('German-Ukrainian') || content.includes('our experience');
      const hasExpertInsight = content.includes('expert-insight') || content.includes('As Director');
      
      // Check for formatting issues
      const hasHTMLEscapes = content.includes('&lt;') || content.includes('&gt;');
      const hasBrokenImages = content.includes('[IMAGE:') && !content.includes('<img');
      const hasEmptyStats = content.includes('>N/A</');
      
      console.log('📏 LENGTH ANALYSIS:');
      console.log(`   Actual Word Count: ${wordCount} words`);
      console.log(`   Target: 3000-4000 words`);
      console.log(`   Achievement: ${Math.round(wordCount / 3500 * 100)}% of target`);
      console.log(`   ${wordCount < 2000 ? '❌ TOO SHORT!' : wordCount < 3000 ? '⚠️ Below target' : '✅ Good length'}`);
      
      console.log('\n📝 STRUCTURE ANALYSIS:');
      console.log(`   H2 Headers: ${h2Count} ${hasH2 ? '✅' : '❌'}`);
      console.log(`   H3 Headers: ${h3Count} ${hasH3 ? '✅' : '❌'}`);
      console.log(`   Bullet Points: ${bulletCount} ${hasBullets ? '✅' : '❌'}`);
      console.log(`   Links: ${linkCount} ${hasLinks ? '✅' : '❌'}`);
      
      console.log('\n🖼️ MEDIA & VISUALS:');
      console.log(`   Images: ${imageCount} ${hasImages ? '✅' : '❌'}`);
      console.log(`   Statistics: ${statCount} ${hasStatistics ? '✅' : '❌'}`);
      console.log(`   Empty Stats (N/A): ${hasEmptyStats ? '❌ YES - needs real data!' : '✅ No'}`);
      
      console.log('\n🎯 EXPERT VOICE:');
      console.log(`   Mattia/DUB References: ${hasMattiaVoice ? '✅' : '❌'}`);
      console.log(`   Expert Insights: ${hasExpertInsight ? '✅' : '❌'}`);
      
      console.log('\n⚠️ FORMATTING ISSUES:');
      console.log(`   HTML Escapes: ${hasHTMLEscapes ? '❌ Found escaped HTML' : '✅ Clean'}`);
      console.log(`   Broken Images: ${hasBrokenImages ? '❌ Image placeholders not rendered' : '✅ OK'}`);
      
      // 3. Check AI settings
      console.log('\n3. AI GENERATION SETTINGS:\n');
      
      db.all(`SELECT * FROM ai_generation_settings`, (err, settings) => {
        if (err) {
          console.error('Error:', err);
          return;
        }
        
        settings.forEach(setting => {
          if (['max_tokens', 'temperature', 'generation_model'].includes(setting.setting_name)) {
            console.log(`   ${setting.setting_name}: ${setting.setting_value}`);
          }
        });
        
        console.log('\n4. IDENTIFIED PROBLEMS:\n');
        console.log('❌ CRITICAL ISSUES:');
        console.log('   1. Blog posts are only ~775 words instead of 3000-4000 words');
        console.log('   2. Statistics show "N/A" instead of real data');
        console.log('   3. Image placeholders [IMAGE:...] not converted to HTML');
        console.log('   4. Mattia\'s expert voice is weak/missing');
        console.log('   5. Not enough depth and analysis');
        
        console.log('\n⚠️ QUALITY ISSUES:');
        console.log('   1. Content is too generic, lacks insider perspective');
        console.log('   2. Missing concrete examples and case studies');
        console.log('   3. No personal anecdotes or experiences from DUB');
        console.log('   4. Insufficient use of German-Ukrainian context');
        console.log('   5. No expert insight boxes or special formatting');
        
        console.log('\n5. RECOMMENDATIONS FOR IMPROVEMENT:\n');
        console.log('🔧 IMMEDIATE FIXES:');
        console.log('   1. Modify prompt to EXPLICITLY require 3000-4000 words');
        console.log('   2. Add word count validation after generation');
        console.log('   3. Implement proper image generation with Unsplash API');
        console.log('   4. Integrate real statistics from APIs');
        console.log('   5. Enhance Mattia persona in system prompt');
        
        console.log('\n📈 QUALITY ENHANCEMENTS:');
        console.log('   1. Add specific DUB experiences and case studies to prompt');
        console.log('   2. Include German funding program names (DAAD, GIZ, etc.)');
        console.log('   3. Reference real EU/German policy frameworks');
        console.log('   4. Add personal anecdotes template');
        console.log('   5. Include expert insight box requirements');
        console.log('   6. Add citation/reference requirements');
        
        console.log('\n💡 PROMPT IMPROVEMENTS:');
        console.log('   1. "You MUST write exactly 3000-4000 words. This is mandatory."');
        console.log('   2. "Include at least 5 specific examples from your DUB work"');
        console.log('   3. "Reference specific German organizations by name"');
        console.log('   4. "Include 3 expert insight boxes with insider knowledge"');
        console.log('   5. "Add personal experiences using \'In my experience...\'"');
        
        db.close();
      });
    });
  });
}

analyzeBlogQuality();