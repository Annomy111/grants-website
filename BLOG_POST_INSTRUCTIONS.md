# Instructions to Add Ukraine Civil Society Blog Post

Since the API authentication is having issues with Supabase, please follow these manual steps:

## Step 1: Login to Admin Panel

1. Go to: https://civil-society-grants-database.netlify.app/admin/login
2. Username: `admin`
3. Password: `admin123`

## Step 2: Navigate to Blog Section

1. Once logged in, click on "Blog Posts" in the left sidebar
2. Click the "New Post" or "+" button

## Step 3: Fill in the Blog Post Details

Copy and paste the following information into the form:

### Title:

```
Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)
```

### Slug (URL):

```
ukraine-civil-society-pulse-may-june-2025
```

### Excerpt:

```
Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations. This comprehensive report examines the challenges and inspiring resilience demonstrated during May-June 2025.
```

### Category:

```
Reports
```

### Tags (comma separated):

```
Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration
```

### Author Name:

```
Fedo
```

### Status:

```
published
```

### Content:

Copy everything from the file: `/Users/winzendwyers/grants website/ukraine-civil-society-blog-content.txt`

## Step 4: Save and Publish

1. Click "Save" or "Publish" button
2. The blog post should now be live at: https://civil-society-grants-database.netlify.app/blog/ukraine-civil-society-pulse-may-june-2025

## Important Notes:

- The infographics will automatically render when you view the blog post
- The infographic placeholders (`<div class="infographic-container" id="..."></div>`) should remain in the content exactly as they are
- The blog post includes 7 professional infographics that visualize the data
- The infographics support both light and dark modes

## Troubleshooting:

If you can't login with admin/admin123:

1. The Supabase database might be down
2. Try again in a few minutes
3. If it persists, you may need to check your Supabase dashboard

The infographics are already integrated into your website code and will display automatically when the blog post is viewed.
