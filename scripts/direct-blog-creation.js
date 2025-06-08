const axios = require('axios');
const fs = require('fs');
const path = require('path');

async function createBlogPostDirectly() {
  try {
    console.log('Creating blog post using direct API approach...\n');
    
    // Read blog content
    const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');
    
    // Blog post data
    const blogPost = {
      title: "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)",
      slug: 'ukraine-civil-society-pulse-may-june-2025',
      content: blogContent,
      excerpt: "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.",
      category: 'Reports',
      tags: ['Ukraine', 'Civil Society', 'Human Rights', 'Humanitarian Aid', 'EU Integration'],
      author_name: 'Fedo',
      status: 'published',
      published_at: new Date().toISOString()
    };
    
    // First, let's try to create it directly in Supabase
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = 'https://tsgdbuehwqxfizekqexj.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log('Attempting to insert blog post directly into Supabase...');
    
    const { data, error } = await supabase
      .from('blog_posts')
      .insert([blogPost])
      .select();
    
    if (error) {
      console.error('Supabase error:', error);
      
      // Try using the API endpoint instead
      console.log('\nTrying API endpoint approach...');
      
      const response = await axios.post(
        'https://civil-society-grants-database.netlify.app/.netlify/functions/blog',
        blogPost,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer hardcoded-admin-token'
          }
        }
      );
      
      console.log('API Response:', response.data);
    } else {
      console.log('✅ Blog post created successfully!');
      console.log('Data:', data);
    }
    
    console.log('\nBlog post URL: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025');
    
  } catch (error) {
    console.error('Error creating blog post:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

createBlogPostDirectly();