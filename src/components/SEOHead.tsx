import { useEffect } from 'react';
import { useSeo } from '@/context/SeoContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image = '/images/default-seo-image.jpg',
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = []
}) => {
  const currentUrl = url || window.location.href;
  const siteName = 'King Subscription';
  const twitterHandle = '@kingsubscription';

  useEffect(() => {
    // Set basic meta tags
    const setMetaTag = (name: string, content: string, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let element = document.querySelector(selector) as HTMLMetaElement;

      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        if (property) {
          element.setAttribute('property', name);
        } else {
          element.name = name;
        }
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Basic SEO meta tags
    if (title) {
      document.title = `${title} | ${siteName}`;
      setMetaTag('title', title);
    }

    if (description) {
      setMetaTag('description', description);
    }

    if (keywords) {
      setMetaTag('keywords', keywords);
    }

    // Open Graph meta tags
    setMetaTag('og:title', title || siteName, true);
  setMetaTag('og:description', description || 'Premium Subscriptions at Discounted and Reasonable Prices', true);
    setMetaTag('og:image', image.startsWith('http') ? image : `${window.location.origin}${image}`, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', siteName, true);

    // Twitter Card meta tags
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', title || siteName, true);
  setMetaTag('twitter:description', description || 'Premium Subscriptions at Discounted and Reasonable Prices', true);
    setMetaTag('twitter:image', image.startsWith('http') ? image : `${window.location.origin}${image}`, true);
    setMetaTag('twitter:site', twitterHandle, true);

    // Article specific meta tags
    if (type === 'article' && publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) {
        setMetaTag('article:modified_time', modifiedTime, true);
      }
      if (author) {
        setMetaTag('article:author', author, true);
      }
      if (section) {
        setMetaTag('article:section', section, true);
      }
      if (tags.length > 0) {
        tags.forEach(tag => {
          setMetaTag('article:tag', tag, true);
        });
      }
    }

    // Additional SEO meta tags
    setMetaTag('robots', 'index, follow');
    setMetaTag('googlebot', 'index, follow');
    setMetaTag('language', 'English');
    setMetaTag('revisit-after', '7 days');
    setMetaTag('author', author || 'King Subscription Team');

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = currentUrl;

    // Structured Data (JSON-LD)
    const structuredData: any = {
      '@context': 'https://schema.org',
      '@type': type === 'website' ? 'WebSite' : type === 'article' ? 'Article' : 'Product',
      name: title || siteName,
  description: description || 'Premium Subscriptions at Discounted and Reasonable Prices',
      url: currentUrl,
      image: image.startsWith('http') ? image : `${window.location.origin}${image}`,
      publisher: {
        '@type': 'Organization',
        name: siteName,
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/images/logo.png`
        }
      }
    };

    if (type === 'article') {
      if (publishedTime) structuredData.datePublished = publishedTime;
      if (modifiedTime) structuredData.dateModified = modifiedTime;
      if (author) structuredData.author = { '@type': 'Person', name: author };
    }

    // Remove existing structured data
    const existingStructuredData = document.querySelector('script[type="application/ld+json"]');
    if (existingStructuredData) {
      existingStructuredData.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [title, description, keywords, image, currentUrl, type, publishedTime, modifiedTime, author, section, tags]);

  return null; // This component doesn't render anything
};

export default SEOHead;
