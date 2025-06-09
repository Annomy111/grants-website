// Sitemap generator utility
// This can be run during build time or as a separate script

const generateSitemap = (grants = [], blogPosts = []) => {
  const baseUrl = 'https://ukrainecivilsocietygrants.org';
  const currentDate = new Date().toISOString();

  // Static pages
  const staticPages = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/grants', changefreq: 'daily', priority: 0.9 },
    { url: '/blog', changefreq: 'weekly', priority: 0.8 },
    { url: '/about', changefreq: 'monthly', priority: 0.7 },
  ];

  // Language variants
  const languages = ['en', 'uk'];
  
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

  // Add static pages with language alternates
  staticPages.forEach(page => {
    languages.forEach(lang => {
      xml += '  <url>\n';
      xml += `    <loc>${baseUrl}${lang === 'en' ? '' : '/' + lang}${page.url}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      
      // Add language alternates
      languages.forEach(altLang => {
        xml += `    <xhtml:link rel="alternate" hreflang="${altLang}" href="${baseUrl}${altLang === 'en' ? '' : '/' + altLang}${page.url}"/>\n`;
      });
      
      xml += '  </url>\n';
    });
  });

  // Add grant detail pages
  grants.forEach(grant => {
    if (grant.grant_name || grant['Grant Name']) {
      const grantName = encodeURIComponent(grant.grant_name || grant['Grant Name']);
      languages.forEach(lang => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${lang === 'en' ? '' : '/' + lang}/grants/${grantName}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += '    <changefreq>weekly</changefreq>\n';
        xml += '    <priority>0.6</priority>\n';
        xml += '  </url>\n';
      });
    }
  });

  // Add blog posts
  blogPosts.forEach(post => {
    if (post.slug) {
      languages.forEach(lang => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${lang === 'en' ? '' : '/' + lang}/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${post.updated_at || post.created_at || currentDate}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.5</priority>\n';
        xml += '  </url>\n';
      });
    }
  });

  xml += '</urlset>';

  return xml;
};

// Export for use in build scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = generateSitemap;
}

export default generateSitemap;