-- Create blog_posts table that's referenced in the code
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  author_id UUID REFERENCES auth.users(id),
  category VARCHAR(100),
  tags TEXT[],
  featured_image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- Enable RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read published posts" ON blog_posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Admin can manage all posts" ON blog_posts
    FOR ALL USING (
        current_setting('role') = 'service_role' OR
        EXISTS (
            SELECT 1 FROM app_users au 
            WHERE au.user_id = auth.uid() 
            AND au.role IN ('admin', 'editor')
        )
    );

-- Insert a sample blog post
INSERT INTO blog_posts (title, slug, content, excerpt, category, status, published_at) VALUES
('Welcome to Civil Society Grants', 
 'welcome-to-civil-society-grants',
 '# Welcome to Civil Society Grants

This is our first blog post! Here you will find updates about new grants, funding opportunities, and success stories from civil society organizations.

## What to Expect

- **Grant Updates**: Latest funding opportunities
- **Success Stories**: How organizations are making a difference
- **Resources**: Guides and tips for grant applications
- **Community**: Connect with other civil society organizations

Stay tuned for more updates!',
 'Welcome to our new blog featuring grant updates, success stories, and resources for civil society organizations.',
 'announcements',
 'published',
 NOW()
);