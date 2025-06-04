import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const path = event.path.replace('/.netlify/functions/blog', '');
  const method = event.httpMethod;

  try {
    // Route: GET /blog (get all published posts)
    if (method === 'GET' && path === '') {
      return await getBlogPosts(event.headers, headers);
    }

    // Route: GET /blog/:id (get specific post)
    if (method === 'GET' && path.match(/^\/\d+$/)) {
      const postId = path.substring(1);
      return await getBlogPost(postId, headers);
    }

    // Route: GET /blog/slug/:slug (get post by slug)
    if (method === 'GET' && path.startsWith('/slug/')) {
      const slug = path.substring(6);
      return await getBlogPostBySlug(slug, headers);
    }

    // Route: POST /blog (create new post - admin only)
    if (method === 'POST' && path === '') {
      return await createBlogPost(JSON.parse(event.body), event.headers, headers);
    }

    // Route: PUT /blog/:id (update post - admin only)
    if (method === 'PUT' && path.match(/^\/\d+$/)) {
      const postId = path.substring(1);
      return await updateBlogPost(postId, JSON.parse(event.body), event.headers, headers);
    }

    // Route: DELETE /blog/:id (delete post - admin only)
    if (method === 'DELETE' && path.match(/^\/\d+$/)) {
      const postId = path.substring(1);
      return await deleteBlogPost(postId, event.headers, headers);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' }),
    };

  } catch (error) {
    console.error('Blog function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};

// Get blog posts (all for admin, published for public)
async function getBlogPosts(requestHeaders, headers) {
  try {
    // Check if user is admin
    const user = await verifyAdmin(requestHeaders);
    
    let query = supabase
      .from('blog_posts')
      .select('*');
    
    // If not admin, only show published posts
    if (!user) {
      query = query.eq('status', 'published');
    }
    
    const { data: posts, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(posts || []),
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch blog posts' }),
    };
  }
}

// Get specific blog post by ID
async function getBlogPost(postId, headers) {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Post not found' }),
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch blog post' }),
    };
  }
}

// Get blog post by slug
async function getBlogPostBySlug(slug, headers) {
  try {
    const { data: post, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Post not found' }),
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error('Error fetching blog post by slug:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch blog post' }),
    };
  }
}

// Verify admin authentication
async function verifyAdmin(requestHeaders) {
  const authHeader = requestHeaders.authorization || requestHeaders.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const { data: userData, error } = await supabase.auth.getUser(token);

    if (error || !userData.user) {
      return null;
    }

    // Check user role
    const { data: userRole } = await supabase
      .from('app_users')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    if (!userRole || (userRole.role !== 'admin' && userRole.role !== 'editor')) {
      return null;
    }

    return userData.user;
  } catch (error) {
    console.error('Admin verification error:', error);
    return null;
  }
}

// Create new blog post (admin only)
async function createBlogPost(body, requestHeaders, headers) {
  const user = await verifyAdmin(requestHeaders);
  
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const { title, content, excerpt, category, tags, featured_image, status } = body;

    if (!title || !content) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Title and content are required' }),
      };
    }

    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const newPost = {
      title,
      slug,
      content,
      excerpt,
      author_id: user.id,
      category,
      tags,
      featured_image,
      status: status || 'draft',
      published_at: status === 'published' ? new Date().toISOString() : null
    };

    const { data: post, error } = await supabase
      .from('blog_posts')
      .insert(newPost)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error('Error creating blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to create blog post' }),
    };
  }
}

// Update blog post (admin only)
async function updateBlogPost(postId, body, requestHeaders, headers) {
  const user = await verifyAdmin(requestHeaders);
  
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const { title, content, excerpt, category, tags, featured_image, status } = body;

    const updateData = {
      updated_at: new Date().toISOString()
    };

    if (title) {
      updateData.title = title;
      updateData.slug = title.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data: post, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Post not found' }),
        };
      }
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error('Error updating blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to update blog post' }),
    };
  }
}

// Delete blog post (admin only)
async function deleteBlogPost(postId, requestHeaders, headers) {
  const user = await verifyAdmin(requestHeaders);
  
  if (!user) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized' }),
    };
  }

  try {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw error;
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Post deleted successfully' }),
    };
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to delete blog post' }),
    };
  }
}