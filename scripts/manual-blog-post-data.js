const fs = require('fs');
const path = require('path');

// Read blog content
const blogContent = fs.readFileSync(path.join(__dirname, '..', 'ukraine-civil-society-blog-content.txt'), 'utf8');

// Create a JSON file with all the blog post data for easy copying
const blogData = {
  title: "Ukraine's Civil Society Pulse: Resilience, Advocacy, and Action (May-June 2025)",
  slug: "ukraine-civil-society-pulse-may-june-2025",
  excerpt: "Over three years into Russia's full-scale invasion, Ukrainian civil society remains a critical pillar of the nation's resistance, adaptation, and democratic aspirations.",
  content: blogContent,
  category: "Reports",
  tags: "Ukraine, Civil Society, Human Rights, Humanitarian Aid, EU Integration",
  author: "Fedo",
  status: "published"
};

// Save to JSON file
fs.writeFileSync(
  path.join(__dirname, '..', 'blog-post-data.json'),
  JSON.stringify(blogData, null, 2)
);

console.log('Blog post data saved to blog-post-data.json');
console.log('\nYou can now:');
console.log('1. Go to: https://civil-society-grants-database.netlify.app/admin/login');
console.log('2. Login with: admin / admin123');
console.log('3. Navigate to Blog Posts → New Post');
console.log('4. Copy and paste the data from blog-post-data.json');
console.log('\nTitle:', blogData.title);
console.log('Slug:', blogData.slug);
console.log('Category:', blogData.category);
console.log('Tags:', blogData.tags);
console.log('Status:', blogData.status);