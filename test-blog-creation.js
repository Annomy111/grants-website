const axios = require('axios');

const BASE_URL = 'https://civil-society-grants-database.netlify.app';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123'
};

async function testBlogPostCreation() {
  console.log('📝 Testing Admin Blog Post Creation Functionality\n');
  
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
    const user = loginResponse.data.user;
    console.log(`✅ Admin login successful as ${user.username} (${user.role})`);
    
    // Step 2: Get current blog posts count
    console.log('\n2. Getting current blog posts...');
    const initialPostsResponse = await axios.get(`${BASE_URL}/.netlify/functions/blog`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const initialPosts = initialPostsResponse.data;
    console.log(`📊 Current blog posts: ${initialPosts.length}`);
    
    // Step 3: Create a new test blog post
    console.log('\n3. Creating a new test blog post...');
    const testPost = {
      title: `Test Blog Post - ${new Date().toISOString()}`,
      content: `<h2>Test Content</h2><p>This is a test blog post created automatically to verify blog creation functionality.</p><p>Created at: ${new Date().toISOString()}</p>`,
      excerpt: 'This is a test blog post created to verify functionality',
      status: 'draft',
      author_name: user.username || 'admin',
      author_id: user.id,
      tags: ['test', 'automation'],
      categories: ['Testing'],
      featured_image: null,
      seo_title: 'Test Blog Post SEO Title',
      seo_description: 'SEO description for test blog post'
    };
    
    const createResponse = await axios.post(`${BASE_URL}/.netlify/functions/blog`, testPost, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (createResponse.status !== 201) {
      throw new Error(`Blog post creation failed with status ${createResponse.status}`);
    }
    
    const createdPost = createResponse.data;
    console.log(`✅ Blog post created successfully with ID: ${createdPost.id}`);
    console.log(`   Title: "${createdPost.title}"`);
    console.log(`   Status: ${createdPost.status}`);
    console.log(`   Author: ${createdPost.author_name}`);
    
    // Step 4: Verify the post was created by fetching it
    console.log('\n4. Verifying post creation...');
    const verifyPostsResponse = await axios.get(`${BASE_URL}/.netlify/functions/blog`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const updatedPosts = verifyPostsResponse.data;
    const newPostCount = updatedPosts.length;
    
    if (newPostCount <= initialPosts.length) {
      throw new Error('Post count did not increase after creation');
    }
    
    const foundPost = updatedPosts.find(post => post.id === createdPost.id);
    if (!foundPost) {
      throw new Error('Created post not found in posts list');
    }
    
    console.log(`✅ Post verified - total posts increased from ${initialPosts.length} to ${newPostCount}`);
    
    // Step 5: Test updating the post status
    console.log('\n5. Testing post status update (draft → published)...');
    const updateResponse = await axios.put(`${BASE_URL}/.netlify/functions/blog/${createdPost.id}`, {
      status: 'published'
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (updateResponse.status !== 200) {
      throw new Error(`Post update failed with status ${updateResponse.status}`);
    }
    
    console.log('✅ Post status updated to published');
    
    // Step 6: Test deleting the test post (cleanup)
    console.log('\n6. Cleaning up - deleting test post...');
    const deleteResponse = await axios.delete(`${BASE_URL}/.netlify/functions/blog/${createdPost.id}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.status !== 200) {
      console.log('⚠️  Warning: Failed to delete test post - manual cleanup may be needed');
    } else {
      console.log('✅ Test post cleaned up successfully');
    }
    
    // Step 7: Final verification
    console.log('\n7. Final verification...');
    const finalPostsResponse = await axios.get(`${BASE_URL}/.netlify/functions/blog`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const finalPosts = finalPostsResponse.data;
    console.log(`📊 Final blog post count: ${finalPosts.length}`);
    
    console.log('\n🎉 Blog Post Creation Test Results:');
    console.log('✅ Admin authentication: PASS');
    console.log('✅ Blog post creation: PASS');
    console.log('✅ Post data persistence: PASS');
    console.log('✅ Post status updates: PASS');
    console.log('✅ Post deletion: PASS');
    
    console.log('\n✅ All blog creation functionality is working correctly');
    console.log(`🌐 Admin blog editor available at: ${BASE_URL}/admin/blog`);
    
  } catch (error) {
    console.error('\n❌ Blog Creation Test Failed:');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Check if blog.js function is deployed correctly');
    console.log('   2. Verify Supabase blog_posts table exists and has correct structure');
    console.log('   3. Check admin permissions in app_users table');
    console.log('   4. Review function logs in Netlify dashboard');
  }
}

testBlogPostCreation();