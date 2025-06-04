// Check blog posts in database
async function checkBlogPosts() {
  console.log('📊 Checking Blog Posts in Database...\n');
  
  try {
    // Login
    const loginRes = await fetch('http://localhost:5001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const { token } = await loginRes.json();
    
    // Get blog posts
    const blogRes = await fetch('http://localhost:5001/api/blog?status=all', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const posts = await blogRes.json();
    
    console.log(`Found ${posts.length} blog post(s):\n`);
    
    posts.forEach((post, i) => {
      console.log(`${i + 1}. ${post.title}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Author: ${post.author_name || 'Unknown'}`);
      console.log(`   Created: ${post.created_at}`);
      console.log(`   Content Length: ${post.content?.length || 0} characters`);
      if (post.content) {
        console.log(`   Content Preview: ${post.content.substring(0, 150)}...`);
      }
      console.log('');
    });
    
    // Also check blog generation jobs
    const jobsRes = await fetch('http://localhost:5001/api/blog-generation/dashboard', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (jobsRes.ok) {
      const jobsData = await jobsRes.json();
      console.log(`📋 Blog Generation Jobs: ${jobsData.recentJobs?.length || 0} recent jobs`);
      if (jobsData.recentJobs?.length > 0) {
        jobsData.recentJobs.slice(0, 3).forEach((job, i) => {
          console.log(`${i + 1}. Job ${job.id}: ${job.status} (${job.job_type})`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking blog posts:', error.message);
  }
}

checkBlogPosts().catch(console.error);