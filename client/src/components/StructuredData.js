import React from 'react';
import { Helmet } from 'react-helmet-async';

const StructuredData = ({ type, data }) => {
  const generateStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "NGO",
          "name": "Civil Society Grants Database",
          "alternateName": "Ukraine Civil Society Grants",
          "url": "https://ukrainecivilsocietygrants.org",
          "logo": "https://ukrainecivilsocietygrants.org/logo512.png",
          "description": "Comprehensive database of grants and funding opportunities for civil society organizations in Ukraine",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Prenlauer Alle 229",
            "addressLocality": "Berlin",
            "postalCode": "10405",
            "addressCountry": "DE"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+49-174-403-1399",
            "contactType": "customer service",
            "availableLanguage": ["English", "Ukrainian", "German"]
          },
          "sameAs": [
            "https://www.linkedin.com/in/fedo-hagge-kubat-36814415b/"
          ]
        };

      case 'grant':
        if (!data) return null;
        return {
          "@context": "https://schema.org",
          "@type": "Grant",
          "name": data.name,
          "description": data.description,
          "funder": {
            "@type": "Organization",
            "name": data.organization
          },
          "amount": data.amount ? {
            "@type": "MonetaryAmount",
            "value": data.amount,
            "currency": "EUR"
          } : undefined,
          "applicationDeadline": data.deadline,
          "eligibleRegion": data.region || "Ukraine",
          "url": data.url
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "https://ukrainecivilsocietygrants.org",
          "name": "Civil Society Grants Database",
          "description": "Find grants for civil society organizations in Ukraine",
          "potentialAction": {
            "@type": "SearchAction",
            "target": {
              "@type": "EntryPoint",
              "urlTemplate": "https://ukrainecivilsocietygrants.org/grants?query={search_term_string}"
            },
            "query-input": "required name=search_term_string"
          },
          "inLanguage": ["en", "uk"],
          "publisher": {
            "@type": "Person",
            "name": "Fedo Hagge-Kubat"
          }
        };

      case 'breadcrumb':
        if (!data || !data.items) return null;
        return {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": data.items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://ukrainecivilsocietygrants.org${item.url}`
          }))
        };

      case 'faq':
        if (!data || !data.questions) return null;
        return {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": data.questions.map(q => ({
            "@type": "Question",
            "name": q.question,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": q.answer
            }
          }))
        };

      case 'article':
        if (!data) return null;
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title,
          "description": data.description,
          "image": data.image,
          "author": {
            "@type": "Person",
            "name": data.author || "Civil Society Grants Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "Civil Society Grants Database",
            "logo": {
              "@type": "ImageObject",
              "url": "https://ukrainecivilsocietygrants.org/logo512.png"
            }
          },
          "datePublished": data.datePublished,
          "dateModified": data.dateModified || data.datePublished,
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url
          }
        };

      default:
        return null;
    }
  };

  const structuredData = generateStructuredData();

  if (!structuredData) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

export default StructuredData;