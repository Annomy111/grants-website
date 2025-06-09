import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEOHead = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  additionalMeta = [],
}) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  
  // Default values
  const siteTitle = 'Civil Society Grants Database';
  const defaultDescription = currentLanguage === 'uk' 
    ? 'Знайдіть гранти для громадянського суспільства в Україні та міжнародні можливості фінансування. Понад 107 активних грантів на суму €63M+.'
    : 'Find grants for civil society in Ukraine and international funding opportunities. Over 107 active grants worth €63M+.';
  const defaultKeywords = currentLanguage === 'uk'
    ? 'гранти україна, громадянське суспільство, фінансування НГО, міжнародні гранти, європейські гранти'
    : 'ukraine grants, civil society funding, NGO funding, international grants, european grants';
  const defaultOgImage = '/images/og-image-default.jpg';
  
  // Build full title
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  
  // Canonical URL
  const baseUrl = 'https://ukrainecivilsocietygrants.org';
  const canonical = canonicalUrl || `${baseUrl}${window.location.pathname}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={currentLanguage} />
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Language Alternates */}
      <link rel="alternate" hreflang="en" href={`${baseUrl}/en${window.location.pathname.replace(/^\/[a-z]{2}/, '')}`} />
      <link rel="alternate" hreflang="uk" href={`${baseUrl}/uk${window.location.pathname.replace(/^\/[a-z]{2}/, '')}`} />
      <link rel="alternate" hreflang="x-default" href={`${baseUrl}${window.location.pathname.replace(/^\/[a-z]{2}/, '')}`} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${baseUrl}${ogImage || defaultOgImage}`} />
      <meta property="og:locale" content={currentLanguage === 'uk' ? 'uk_UA' : 'en_US'} />
      <meta property="og:site_name" content={siteTitle} />
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage || defaultOgImage}`} />
      
      {/* Additional Tags */}
      <meta name="robots" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      <meta name="googlebot" content={noindex ? 'noindex,nofollow' : 'index,follow'} />
      
      {/* Geo Tags for Ukraine */}
      <meta name="geo.region" content="UA" />
      <meta name="geo.placename" content="Ukraine" />
      
      {/* Additional custom meta tags */}
      {additionalMeta.map((meta, index) => (
        <meta key={index} {...meta} />
      ))}
    </Helmet>
  );
};

export default SEOHead;