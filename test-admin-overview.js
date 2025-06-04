const axios = require('axios');

const BASE_URL = 'https://civil-society-grants-database.netlify.app';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function testAdminOverview() {
  console.log('🔐 Testing Admin Dashboard Overview Functionality\n');
  
  try {
    // Step 1: Admin login
    console.log('1. Attempting admin login...');
    const loginResponse = await axios.post(`${BASE_URL}/.netlify/functions/auth/login`, {
      username: ADMIN_CREDENTIALS.username,
      password: ADMIN_CREDENTIALS.password
    });
    
    if (loginResponse.status !== 200 || !loginResponse.data.token) {
      throw new Error('Admin login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Admin login successful');
    
    // Step 2: Test grants API with authentication
    console.log('\n2. Testing grants API with authentication...');
    const grantsResponse = await axios.get(`${BASE_URL}/.netlify/functions/grants`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (grantsResponse.status !== 200) {
      throw new Error(`Grants API failed with status ${grantsResponse.status}`);
    }
    
    const grants = grantsResponse.data;
    console.log(`✅ Grants API working - Retrieved ${grants.length} grants`);
    
    if (grants.length > 0) {
      console.log(`   Sample grant: "${grants[0].grant_name}" by ${grants[0].funding_organization}`);
      
      // Calculate upcoming deadlines for verification
      const today = new Date();
      const upcomingDeadlines = grants.filter(grant => {
        if (!grant.application_deadline) return false;
        const deadline = new Date(grant.application_deadline);
        return deadline > today;
      }).length;
      
      console.log(`   Upcoming deadlines: ${upcomingDeadlines}`);
    }
    
    // Step 3: Test blog API with authentication
    console.log('\n3. Testing blog API with authentication...');
    const blogResponse = await axios.get(`${BASE_URL}/.netlify/functions/blog`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (blogResponse.status !== 200) {
      throw new Error(`Blog API failed with status ${blogResponse.status}`);
    }
    
    const posts = blogResponse.data;
    console.log(`✅ Blog API working - Retrieved ${posts.length} blog posts`);
    
    if (posts.length > 0) {
      console.log(`   Sample post: "${posts[0].title}" by ${posts[0].author_name}`);
      
      const publishedPosts = posts.filter(post => post.status === 'published').length;
      console.log(`   Published posts: ${publishedPosts}/${posts.length}`);
    }
    
    // Step 4: Verify admin overview data structure
    console.log('\n4. Verifying admin overview data availability...');
    
    const overviewStats = {
      totalGrants: grants.length,
      upcomingDeadlines: grants.filter(grant => {
        if (!grant.application_deadline) return false;
        const deadline = new Date(grant.application_deadline);
        return deadline > new Date();
      }).length,
      totalPosts: posts.length,
      publishedPosts: posts.filter(post => post.status === 'published').length
    };
    
    console.log('📊 Overview Statistics:');
    console.log(`   Total Grants: ${overviewStats.totalGrants}`);
    console.log(`   Upcoming Deadlines: ${overviewStats.upcomingDeadlines}`);
    console.log(`   Total Blog Posts: ${overviewStats.totalPosts}`);
    console.log(`   Published Posts: ${overviewStats.publishedPosts}`);
    
    // Step 5: Check recent items
    console.log('\n5. Checking recent items for dashboard...');
    const recentGrants = grants.slice(0, 5);
    const recentPosts = posts.slice(0, 5);
    
    console.log(`   Recent grants (${recentGrants.length}):${recentGrants.length === 0 ? ' None' : ''}`);
    recentGrants.forEach((grant, i) => {
      console.log(`     ${i + 1}. ${grant.grant_name} - Deadline: ${grant.application_deadline || 'N/A'}`);
    });
    
    console.log(`   Recent posts (${recentPosts.length}):${recentPosts.length === 0 ? ' None' : ''}`);
    recentPosts.forEach((post, i) => {
      console.log(`     ${i + 1}. ${post.title} - Status: ${post.status}`);
    });
    
    console.log('\n🎉 Admin Dashboard Overview Test Results:');
    
    if (overviewStats.totalGrants === 0 && overviewStats.totalPosts === 0) {
      console.log('⚠️  WARNING: No data available for dashboard display');
      console.log('   The admin overview will show zeros for all statistics');
    } else {
      console.log('✅ Dashboard should display statistics and recent items correctly');
    }
    
    console.log('\n✅ All admin dashboard API endpoints are working correctly');
    console.log(`🌐 Admin dashboard available at: ${BASE_URL}/admin/dashboard`);
    
  } catch (error) {
    console.error('\n❌ Admin Overview Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
  }
}

testAdminOverview();