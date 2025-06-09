# SEO Guide for Civil Society Grants Database

## Overview
This guide outlines SEO best practices implemented in the project and provides guidance for maintaining and improving search engine visibility.

## SEO Components

### 1. SEOHead Component (`client/src/components/SEOHead.js`)
Dynamic meta tag management for all pages:
- Title tags with site name appending
- Meta descriptions (English/Ukrainian)
- Open Graph tags for social sharing
- Twitter Card meta tags
- Canonical URLs
- Language alternates (hreflang tags)

**Usage:**
```jsx
<SEOHead
  title="Browse Available Grants"
  description="Find funding opportunities for Ukrainian civil society"
  keywords="grants, ukraine, ngo funding"
  ogImage="/images/grants-hero.jpg"
  ogType="website"
/>
```

### 2. StructuredData Component (`client/src/components/StructuredData.js`)
JSON-LD structured data for rich snippets:
- Organization schema
- Grant/FinancialProduct schema
- Article schema for blog posts
- BreadcrumbList schema
- WebSite schema with search action

**Usage:**
```jsx
<StructuredData 
  type="grant" 
  data={{
    name: grant.name,
    organization: grant.organization,
    deadline: grant.deadline
  }}
/>
```

## SEO Best Practices

### Page Titles
- Keep under 60 characters
- Include primary keyword
- Format: `Page Title | Site Name`
- Unique for each page

### Meta Descriptions
- Keep under 160 characters
- Include call-to-action
- Mention key statistics (107 grants, €63M+ funding)
- Localized for each language

### URL Structure
- Clean, descriptive URLs
- Language prefix for internationalization: `/uk/grants`
- Avoid special characters
- Use hyphens for word separation

### Content Optimization
1. **Headings Structure**
   - One H1 per page
   - Logical H2-H6 hierarchy
   - Include keywords naturally

2. **Image Optimization**
   - Descriptive alt text
   - Optimized file sizes
   - Use WebP format where possible
   - Lazy loading implemented

3. **Internal Linking**
   - Link related grants
   - Cross-link blog posts
   - Use descriptive anchor text

### Technical SEO

#### robots.txt
Located at `client/public/robots.txt`:
- Allows all pages except admin areas
- Includes sitemap location
- Sets crawl delay for bot protection

#### Sitemap
- Static sitemap at `client/public/sitemap.xml`
- Dynamic generation available via `generateSitemap.js`
- Includes all public pages and top grants
- Language alternatives included

#### Performance Optimization
- Code splitting with React.lazy()
- Image lazy loading
- Minified production builds
- CDN usage for static assets

### International SEO
- hreflang tags for English/Ukrainian
- Localized content and meta tags
- Language detection and switching
- Separate URLs for each language

## Monitoring and Tools

### Recommended Tools
1. **Google Search Console**
   - Monitor search performance
   - Submit sitemap
   - Check for crawl errors

2. **Google PageSpeed Insights**
   - Monitor Core Web Vitals
   - Get optimization suggestions

3. **Schema Markup Validator**
   - Test structured data
   - Ensure proper implementation

### Key Metrics to Track
- Organic traffic growth
- Search rankings for target keywords
- Click-through rates
- Core Web Vitals scores
- Mobile usability

## Content Strategy

### Target Keywords
**English:**
- ukraine grants
- civil society funding ukraine
- ngo grants ukraine
- media grants ukraine
- development funding ukraine

**Ukrainian:**
- гранти україна
- фінансування нго
- громадянське суспільство гранти
- гранти для медіа
- міжнародні гранти

### Blog Content
- Grant application tips
- Success stories
- Funding trends
- Organization spotlights
- Regular updates (monthly pulse reports)

## Implementation Checklist

- [ ] Add Google Search Console verification
- [ ] Submit sitemap to search engines
- [ ] Set up Google Analytics
- [ ] Monitor Core Web Vitals
- [ ] Regular content updates
- [ ] Build quality backlinks
- [ ] Optimize page load speed
- [ ] Ensure mobile responsiveness
- [ ] Test all structured data
- [ ] Monitor 404 errors

## Future Improvements

1. **Dynamic Sitemap Generation**
   - Automate sitemap updates
   - Include all grant detail pages
   - Add blog post URLs

2. **Advanced Schema Markup**
   - FAQ schema for common questions
   - Event schema for deadlines
   - Review schema for grant feedback

3. **Content Expansion**
   - Grant application guides
   - Video content integration
   - Infographics and data visualizations

4. **Technical Enhancements**
   - Implement AMP for blog posts
   - Add Web Push notifications
   - Improve server-side rendering

## Resources

- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)
- [Web.dev SEO Guide](https://web.dev/learn/seo/)
- [Google Search Central](https://developers.google.com/search)