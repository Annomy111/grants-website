// Direct API test
async function directAPICheck() {
  console.log('🔍 Direct API Check for Blog Posts...\n');
  
  try {
    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful\n');
    
    // 2. Check blog posts
    console.log('2. Fetching blog posts...');
    const blogRes = await fetch('http://localhost:5001/api/blog?status=all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const posts = await blogRes.json();
    console.log(`\nFound ${posts.length} blog post(s):\n`);
    
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   ID: ${post.id}`);
      console.log('');
    });
    
    if (posts.length === 0) {
      console.log('❌ NO BLOG POSTS IN DATABASE!');
      console.log('\nThis is why you can\'t see any posts.');
      console.log('Let me check the blog generation jobs...\n');
      
      // Check generation jobs
      const jobsRes = await fetch('http://localhost:5001/api/blog-generation/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        console.log('Blog Generation Jobs:');
        console.log(`Recent jobs: ${jobsData.recentJobs?.length || 0}`);
        
        if (jobsData.recentJobs?.length > 0) {
          jobsData.recentJobs.slice(0, 5).forEach((job, i) => {
            console.log(`${i + 1}. Job ${job.id}: ${job.status} (${job.job_type})`);
            if (job.error_message) {
              console.log(`   Error: ${job.error_message}`);
            }
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

directAPICheck().catch(console.error);