import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { SeoSettingsService } from '@/lib/supabase';

export type SeoPageKey =
  | 'home'
  | 'tools'
  | 'about'
  | 'compare'
  | 'products'
  | 'product-detail'
  | 'blog'
  | 'blog-post'
  | 'contact'
  | 'testimonials'
  | 'privacy-policy'
  | 'refund-policy'
  | 'terms-conditions'
  | 'dmca';

export interface PageSeo {
  title: string;
  description: string;
  keywords?: string;
}

interface SeoContextValue {
  seoMap: Record<SeoPageKey, PageSeo>;
  defaultSeo: Record<SeoPageKey, PageSeo>;
  updatePageSeo: (page: SeoPageKey, seo: PageSeo) => void;
  resetPageSeo: (page: SeoPageKey) => void;
  resetAll: () => void;
  getSeoFor: (page: SeoPageKey) => PageSeo;
}

const defaultSeo: Record<SeoPageKey, PageSeo> = {
  home: {
    title: 'Kings Subscriptions - Premium Digital Subscriptions & Services',
  description: 'Get ChatGPT Plus, Canva Pro, Adobe Suite & 15+ premium tools at Huge Discounts with instant delivery and 24/7 support.',
    keywords: 'chatgpt plus discount, canva pro cheap, adobe creative cloud deal',
  },
  tools: {
    title: 'Premium Tools & Subscriptions | Kings Subscriptions',
    description: 'Browse verified premium tools with flexible plans and genuine renewals. Pick the perfect option for your workflow.',
    keywords: 'premium tools marketplace, shared accounts, cheapest ai tools',
  },
  about: {
    title: 'About Kings Subscriptions',
    description: 'Learn how Kings Subscriptions delivers affordable premium tools with transparent policies and dedicated support.',
  },
  compare: {
    title: 'Compare Premium Tools | Kings Subscriptions',
    description: 'Compare pricing, features, and reviews to find the best subscription for your business in minutes.',
  },
  products: {
    title: 'All Products | Kings Subscriptions',
    description: 'Explore every premium subscription we offer across AI, streaming, design, and business categories.',
  },
  'product-detail': {
    title: 'Premium Subscription Details | Kings Subscriptions',
    description: 'View plan options, features, and FAQs for our premium subscriptions with instant access and warranty.',
  },
  blog: {
    title: 'Knowledge Hub | Kings Subscriptions',
    description: 'Guides, case studies, and tool comparisons to help you save money and scale your workflow.',
  },
  'blog-post': {
    title: 'Kings Subscriptions Blog Article',
    description: 'Read expert insights on saving money on premium subscriptions and building efficient workflows.',
  },
  contact: {
    title: 'Contact Kings Subscriptions',
    description: 'Need help choosing a plan? Talk to our support team via WhatsApp, email, or live chat.',
  },
  testimonials: {
    title: 'Customer Reviews | Kings Subscriptions',
    description: 'See how creators and agencies are saving thousands with our managed premium subscriptions.',
  },
  'privacy-policy': {
    title: 'Privacy Policy | Kings Subscriptions',
    description: 'Understand how Kings Subscriptions handles your data and keeps your information secure.',
  },
  'refund-policy': {
    title: 'Refund Policy | Kings Subscriptions',
    description: 'Review our hassle-free refund and replacement policy for premium accounts.',
  },
  'terms-conditions': {
    title: 'Terms & Conditions | Kings Subscriptions',
    description: 'Read the terms governing the use of Kings Subscriptions services and premium accounts.',
  },
  dmca: {
    title: 'DMCA Policy | Kings Subscriptions',
    description: 'Report intellectual property concerns and review our DMCA compliance process.',
  },
};

const SeoContext = createContext<SeoContextValue | undefined>(undefined);

export const SeoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [seoMap, setSeoMap] = useState<Record<SeoPageKey, PageSeo>>(defaultSeo);
  const [isLoading, setIsLoading] = useState(true);

  // Load SEO settings from Supabase on mount
  useEffect(() => {
    loadSeoSettings();
  }, []);

  // Subscribe to real-time changes from Supabase
  useEffect(() => {
    const unsubscribe = SeoSettingsService.subscribeToChanges((supabaseSettings) => {
      console.log('🔄 SEO settings synced from Supabase (cross-browser sync)');
      const mergedSettings = { ...defaultSeo, ...supabaseSettings };
      setSeoMap(mergedSettings);
    });

    return unsubscribe;
  }, []);

  const loadSeoSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const supabaseSettings = await SeoSettingsService.getSeoSettings();
      const mergedSettings = { ...defaultSeo, ...supabaseSettings };
      setSeoMap(mergedSettings);
      console.log('✅ SEO settings loaded from Supabase');
    } catch (error) {
      console.error('Failed to load SEO settings from Supabase:', error);
      setSeoMap(defaultSeo);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updatePageSeo = useCallback(async (page: SeoPageKey, seo: PageSeo) => {
    try {
      const newSeoMap = { ...seoMap, [page]: seo };
      const success = await SeoSettingsService.updateSeoSettings(newSeoMap);

      if (success) {
        setSeoMap(newSeoMap);
        console.log('✅ SEO settings updated in Supabase and synced across browsers');
      } else {
        throw new Error('Failed to update SEO settings in database');
      }
    } catch (error) {
      console.error('Failed to update SEO settings:', error);
      // Don't update local state if database update fails
    }
  }, [seoMap]);

  const resetPageSeo = useCallback(async (page: SeoPageKey) => {
    try {
      const newSeoMap = { ...seoMap, [page]: defaultSeo[page] };
      const success = await SeoSettingsService.updateSeoSettings(newSeoMap);

      if (success) {
        setSeoMap(newSeoMap);
        console.log('✅ SEO page reset in Supabase');
      } else {
        throw new Error('Failed to reset SEO page in database');
      }
    } catch (error) {
      console.error('Failed to reset SEO page:', error);
    }
  }, [seoMap]);

  const resetAll = useCallback(async () => {
    try {
      const success = await SeoSettingsService.updateSeoSettings(defaultSeo);

      if (success) {
        setSeoMap(defaultSeo);
        console.log('✅ All SEO settings reset in Supabase');
      } else {
        throw new Error('Failed to reset all SEO settings in database');
      }
    } catch (error) {
      console.error('Failed to reset all SEO settings:', error);
    }
  }, []);

  const getSeoFor = useCallback((page: SeoPageKey) => seoMap[page] ?? defaultSeo[page], [seoMap]);

  const value = useMemo<SeoContextValue>(() => ({
    seoMap,
    defaultSeo,
    updatePageSeo,
    resetPageSeo,
    resetAll,
    getSeoFor,
  }), [getSeoFor, resetAll, resetPageSeo, seoMap, updatePageSeo]);

  return <SeoContext.Provider value={value}>{children}</SeoContext.Provider>;
};

export const useSeoContext = (): SeoContextValue => {
  const context = useContext(SeoContext);
  if (!context) {
    throw new Error('useSeoContext must be used within a SeoProvider');
  }
  return context;
};

export const useSeo = (
  page: SeoPageKey,
  defaults?: Partial<PageSeo>,
) => {
  const { getSeoFor } = useSeoContext();
  const seo = useMemo(() => ({
    ...getSeoFor(page),
    ...defaults,
  }), [defaults, getSeoFor, page]);

  useEffect(() => {
    if (seo.title) {
      document.title = seo.title;
    }
    if (typeof document !== 'undefined') {
      const descriptionTag = document.querySelector('meta[name="description"]');
      if (descriptionTag && seo.description) {
        descriptionTag.setAttribute('content', seo.description);
      }
      const keywordsTag = document.querySelector('meta[name="keywords"]');
      if (keywordsTag && seo.keywords) {
        keywordsTag.setAttribute('content', seo.keywords);
      } else if (!keywordsTag && seo.keywords) {
        const el = document.createElement('meta');
        el.setAttribute('name', 'keywords');
        el.setAttribute('content', seo.keywords);
        document.head.appendChild(el);
      }
    }
  }, [seo.description, seo.keywords, seo.title]);

  return seo;
};
