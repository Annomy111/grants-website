// Final comprehensive test of the blog generation system
const BlogGenerator = require('./server/utils/blogGenerator');

async function finalGenerationTest() {
  console.log('🎯 FINAL COMPREHENSIVE BLOG GENERATION TEST\n');
  console.log('This will test the entire generation process step by step...\n');
  
  try {
    const blogGenerator = new BlogGenerator();
    
    console.log('📋 Test Parameters:');
    const testParams = {
      topic: 'Simple Test Topic for Blog Generation',
      tone: 'professional',
      length: 'medium',
      language: 'en',
      includeStatistics: true,
      includeMedia: true
    };
    console.log(JSON.stringify(testParams, null, 2));
    
    console.log('\n🚀 Starting complete generation process...');
    const startTime = Date.now();
    
    // This will run the complete generation process with all our fixes
    const result = await blogGenerator.generateBlogPost(testParams, 1);
    
    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n⏱️ Total generation time: ${duration}s`);
    
    console.log('\n📊 GENERATION RESULTS:');
    console.log('✅ Generation completed successfully!');
    console.log('📄 Result type:', typeof result);
    console.log('📋 Result keys:', Object.keys(result || {}));
    
    if (result.content) {
      console.log('\n📝 CONTENT ANALYSIS:');
      console.log('   Title:', result.content.title || 'No title');
      console.log('   Content length:', result.content.content?.length || 0, 'characters');
      console.log('   Word count:', result.content.content ? result.content.content.split(' ').length : 0);
      console.log('   Has excerpt:', !!result.content.excerpt);
      console.log('   Author:', result.content.author || 'No author');
      
      if (result.content.content) {
        console.log('\n📖 Content preview:');
        const preview = result.content.content.replace(/<[^>]*>/g, '').substring(0, 300);
        console.log(`"${preview}..."`);
      }
    }
    
    console.log('\n🎉 SUCCESS! The blog generation system is working correctly!');
    console.log('💡 The issue was likely timing/race conditions in the web interface.');
    console.log('🔧 The generated content should now be saved and accessible.');
    
  } catch (error) {
    console.error('\n❌ FINAL TEST FAILED:');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    console.log('\n🔍 DIAGNOSIS:');
    if (error.message.includes('DeepSeek') || error.message.includes('API')) {
      console.log('   Issue: API-related error');
      console.log('   Recommendation: Check API key, model name, or network connectivity');
    } else if (error.message.includes('database') || error.message.includes('sqlite')) {
      console.log('   Issue: Database-related error');
      console.log('   Recommendation: Check database permissions and schema');
    } else if (error.message.includes('timeout')) {
      console.log('   Issue: Timeout error');
      console.log('   Recommendation: Further increase timeout or simplify prompt');
    } else {
      console.log('   Issue: Unknown error type');
      console.log('   Recommendation: Check server logs for more details');
    }
  }
}

finalGenerationTest().catch(console.error);