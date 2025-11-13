import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Settings,
  Package,
  Users,
  MessageSquare,
  Globe,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Save,
  Upload,
  Eye,
  PenTool,
  BarChart,
  Zap,
  Crown,
  BookOpen,
  FilePlus2,
  Clock,
  LogOut
} from 'lucide-react';
import { useProductsContext } from '@/context/ProductsContext';
import { useSettings } from '@/context/SettingsContext';
import { useBlogContext } from '@/context/BlogContext';
import { usePopup, POPUP_PAGE_OPTIONS, type PopupSettings } from '@/context/PopupContext';
import { useSeoContext, type PageSeo, type SeoPageKey } from '@/context/SeoContext';
import { useAuth } from '@/context/AuthContext';
import { useCustomPages, type CustomPage } from '@/context/CustomPagesContext';
import { useHero } from '@/context/HeroContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { useAdminSettings } from '@/context/AdminSettingsContext';
import { useStaticPages } from '@/context/StaticPagesContext';
import { useGiveaway } from '@/context/GiveawayContext';
import StaticPagesEditor from '@/components/StaticPagesEditor';
import CategoryManagement from '@/components/CategoryManagement';
import CommerceManagement from '@/components/CommerceManagement';
import ReviewManagement from '@/components/ReviewManagement';
import SiteContentManagement from '@/components/SiteContentManagement';

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string;
  coverImage: string;
  content: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  published: boolean;
};

const formatBlogDate = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toLocaleDateString();
};

const AdminDashboard: React.FC = () => {
  const { logout } = useAuth();
  const { settings, updateSettings, isLoading: settingsLoading, error: settingsError } = useSettings();
  const { products } = useProductsContext();
  const { posts: blogPosts, createPost, updatePost, deletePost, togglePublished, categories: blogCategories } = useBlogContext();
  const { accounts: giveawayAccounts, addAccount: addGiveawayAccount, deleteAccount: deleteGiveawayAccount, isLoading: giveawayLoading, error: giveawayError } = useGiveaway();

  const makeEmptyBlogForm = (): BlogFormState => ({
    title: '',
    slug: '',
    excerpt: '',
    author: '',
    category: '',
    tags: '',
    coverImage: '',
    content: '',
    readTime: '5 min read',
    metaTitle: '',
    metaDescription: '',
    published: false,
  });

  const [blogForm, setBlogForm] = useState<BlogFormState>(() => makeEmptyBlogForm());
  const [editingBlogSlug, setEditingBlogSlug] = useState<string | null>(null);
  const [blogMessage, setBlogMessage] = useState('');

  // Custom Pages state
  const { pages: customPages, addPage, updatePage, deletePage } = useCustomPages();
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    metaTitle: '',
    metaDescription: '',
    published: false,
  });
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState('');

  // Giveaway state
  const [giveawayForm, setGiveawayForm] = useState({ email: '', password: '' });
  const [giveawayMessage, setGiveawayMessage] = useState('');

  // Custom Pages handlers
  const handleResetPageForm = () => {
    setEditingPageId(null);
    setPageForm({
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDescription: '',
      published: false,
    });
    setPageMessage('');
  };

  const handleEditPage = (page: CustomPage) => {
    setEditingPageId(page.id);
    setPageForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      published: page.published,
    });
    setPageMessage('');
  };

  const handlePageSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pageForm.title.trim()) {
      setPageMessage('Title is required.');
      return;
    }
    if (!pageForm.slug.trim()) {
      setPageMessage('Slug is required.');
      return;
    }
    if (!pageForm.content.trim()) {
      setPageMessage('Content is required.');
      return;
    }

    try {
      if (editingPageId) {
        const success = await updatePage({
          id: editingPageId,
          title: pageForm.title.trim(),
          slug: pageForm.slug.trim(),
          content: pageForm.content.trim(),
          metaTitle: pageForm.metaTitle.trim() || undefined,
          metaDescription: pageForm.metaDescription.trim() || undefined,
          published: pageForm.published,
        });
        if (success) {
          setPageMessage('Page updated successfully.');
        } else {
          setPageMessage('Failed to update page.');
        }
      } else {
        const success = await addPage({
          title: pageForm.title.trim(),
          slug: pageForm.slug.trim(),
          content: pageForm.content.trim(),
          metaTitle: pageForm.metaTitle.trim() || undefined,
          metaDescription: pageForm.metaDescription.trim() || undefined,
          published: pageForm.published,
        });
        if (success) {
          setPageMessage('Page created successfully.');
          handleResetPageForm();
        } else {
          setPageMessage('Failed to create page.');
        }
      }
    } catch (error) {
      console.error('Failed to save page:', error);
      setPageMessage('Failed to save page. Please try again.');
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        const success = await deletePage(pageId);
        if (success) {
          setPageMessage('Page deleted successfully.');
        } else {
          setPageMessage('Failed to delete page.');
        }
      } catch (error) {
        console.error('Failed to delete page:', error);
        setPageMessage('Failed to delete page. Please try again.');
      }
    }
  };

  // Giveaway handlers
  const handleGiveawaySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGiveawayMessage('');
    if (!giveawayForm.email || !giveawayForm.password) {
      setGiveawayMessage('Email and password are required.');
      return;
    }

    const success = await addGiveawayAccount(giveawayForm.email, giveawayForm.password);
    if (success) {
      setGiveawayMessage('Account added successfully.');
      setGiveawayForm({ email: '', password: '' });
    } else {
      setGiveawayMessage(giveawayError || 'Failed to add account.');
    }
  };

  const handleDeleteGiveaway = async (id: number) => {
    if (confirm('Are you sure you want to delete this giveaway account?')) {
      const success = await deleteGiveawayAccount(id);
      if (success) {
        setGiveawayMessage('Account deleted successfully.');
      } else {
        setGiveawayMessage(giveawayError || 'Failed to delete account.');
      }
    }
  };


  // Error and loading states from contexts
  const popupError = usePopup().error;

  // Settings Contexts
  const { settings: heroSettings, updateSettings: updateHeroSettings } = useHero();
  const { settings: siteSettings, updateSettings: updateSiteSettings } = useSiteSettings();
  const { settings: adminSettings, updateSettings: updateAdminSettings } = useAdminSettings();

  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber);
  const [supportEmail, setSupportEmail] = useState('itxahmadjan@gmail.com');
  const [siteLogo, setSiteLogo] = useState('');
  const [heroTitle, setHeroTitle] = useState('STOP BLEEDING MONEY On Overpriced Software!');
  const [heroSubtitle, setHeroSubtitle] = useState('10,000+ Smart Entrepreneurs have already ditched expensive subscriptions...');
  const [metaDescription, setMetaDescription] = useState(adminSettings?.meta_description || 'Get premium AI & SEO tools at Huge Discounts! ChatGPT Plus, Canva Pro, Adobe Creative Suite & 15+ tools. Instant access, 24/7 support.');

  const [localSiteSettings, setLocalSiteSettings] = useState({
    siteName: siteSettings?.site_name || 'King Subscription',
    tagline: siteSettings?.tagline || 'Premium AI & SEO Tools at Huge Discounts',
    logoUrl: siteSettings?.logo_url || '',
  });

  const [heroForm, setHeroForm] = useState({
    title: heroSettings?.title || 'STOP BLEEDING MONEY On Overpriced Software!',
    subtitle: heroSettings?.subtitle || '10,000+ Smart Entrepreneurs have already ditched expensive subscriptions...',
  });

  const [whatsappDirectOrder, setWhatsappDirectOrder] = useState<boolean>(adminSettings?.whatsapp_direct_order ?? false);

  useEffect(() => {
    if (adminSettings) {
      setWhatsappDirectOrder(adminSettings.whatsapp_direct_order);
      setWhatsappNumber(adminSettings.whatsapp_number);
    }
  }, [adminSettings]);

// Popup/Announcement Settings
  const { settings: popupSettings, updateSettings: persistPopupSettings, resetSettings: resetPopupSettings, isLoading: popupLoading } = usePopup();
  const [popupDraft, setPopupDraft] = useState(popupSettings);
  const popupPagesSelected = useMemo(() => new Set(popupDraft.pages), [popupDraft.pages]);

  useEffect(() => {
    setPopupDraft(popupSettings);
  }, [popupSettings]);

  const togglePopupPage = useCallback((page: string) => {
    setPopupDraft((prev) => {
      if (page === '*') {
        return { ...prev, pages: prev.pages.includes('*') ? [] : ['*'] };
      }
      const currentPages = prev.pages.includes('*') ? [] : prev.pages;
      const exists = currentPages.includes(page);
      const nextPages = exists
        ? currentPages.filter((value) => value !== page)
        : [...currentPages, page];
      return {
        ...prev,
        pages: nextPages.filter((value, index, array) => array.indexOf(value) === index),
      };
    });
  }, []);

  useEffect(() => {
    if (!editingBlogSlug) {
      setBlogForm(makeEmptyBlogForm());
      return;
    }

    const post = blogPosts.find((item) => item.slug === editingBlogSlug);
    if (post) {
      setBlogForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        author: post.author,
        category: post.category,
        tags: post.tags.join(', '),
        coverImage: post.coverImage,
        content: post.content.join('\n\n'),

        readTime: post.readTime,
        metaTitle: post.metaTitle || '',
        metaDescription: post.metaDescription || '',
        published: post.published,
      });
      setBlogMessage('');
    }
  }, [blogPosts, editingBlogSlug]);

  const handlePopupDraftChange = useCallback((key: keyof PopupSettings, value: PopupSettings[keyof PopupSettings]) => {
    setPopupDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handlePopupSave = useCallback(async () => {
    const { metrics, lastDismissedAt, lastShownAt, ...plain } = popupDraft;
    try {
      await persistPopupSettings(plain);
      alert('Popup settings saved successfully!');
    } catch (error) {
      console.error('Failed to save popup settings:', error);
      alert('Failed to save popup settings. Please try again.');
    }
  }, [persistPopupSettings, popupDraft]);

  const handlePopupReset = useCallback(() => {
    resetPopupSettings();
  }, [resetPopupSettings]);

  // SEO configuration
  const { defaultSeo: seoDefaults, updatePageSeo, resetPageSeo, resetAll, getSeoFor } = useSeoContext();
  const seoPageOptions: { label: string; value: SeoPageKey }[] = [
    { label: 'Home', value: 'home' },
    { label: 'Tools', value: 'tools' },
    { label: 'About', value: 'about' },
    { label: 'Compare', value: 'compare' },
    { label: 'All Products', value: 'products' },
    { label: 'Product Detail', value: 'product-detail' },
    { label: 'Blog Listing', value: 'blog' },
    { label: 'Blog Post', value: 'blog-post' },
    { label: 'Contact', value: 'contact' },
    { label: 'Testimonials', value: 'testimonials' },
    { label: 'Privacy Policy', value: 'privacy-policy' },
    { label: 'Refund Policy', value: 'refund-policy' },
    { label: 'Terms & Conditions', value: 'terms-conditions' },
    { label: 'DMCA', value: 'dmca' },
  ];
  const [activeSeoPage, setActiveSeoPage] = useState<SeoPageKey>('home');
  const activeSeoConfig = useMemo(() => getSeoFor(activeSeoPage), [activeSeoPage, getSeoFor]);
  const [seoDraft, setSeoDraft] = useState<PageSeo>(activeSeoConfig);

  useEffect(() => {
    setSeoDraft(activeSeoConfig);
  }, [activeSeoConfig]);

  const handleSeoInputChange = useCallback((key: keyof PageSeo, value: string) => {
    setSeoDraft((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const handleSeoSave = useCallback(() => {
    updatePageSeo(activeSeoPage, {
      title: seoDraft.title.trim(),
      description: seoDraft.description.trim(),
      keywords: seoDraft.keywords?.trim() || undefined,
    });
  }, [activeSeoPage, seoDraft.description, seoDraft.keywords, seoDraft.title, updatePageSeo]);

  const handleSeoReset = useCallback(() => {
    resetPageSeo(activeSeoPage);
  }, [activeSeoPage, resetPageSeo]);

  const seoPreviewPath = useMemo(() => {
    switch (activeSeoPage) {
      case 'home':
        return '/';
      case 'product-detail':
        return '/product/demo-product';
      case 'blog-post':
        return '/blog/sample-article';
      case 'privacy-policy':
        return '/privacy-policy';
      case 'refund-policy':
        return '/refund-policy';
      case 'terms-conditions':
        return '/terms-conditions';
      default:
        return `/${activeSeoPage.replace('-', '/')}`;
    }
  }, [activeSeoPage]);


  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    categories: [],
    publishedBlogPosts: 0,
    draftBlogPosts: 0,
    averageDiscount: 0,
    totalSavings: 0,
    popupMetrics: { impressions: 0, clicks: 0, dismissals: 0 },
    popupConversion: 0,
    topProducts: [],
  });
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics data');
        }
        const data = await response.json();
        setAnalytics(data[0] || analytics);
      } catch (error) {
        setAnalyticsError('Failed to load analytics data');
      } finally {
        setAnalyticsLoading(false);
      }
    };
    fetchAnalyticsData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await updateSettings({
        whatsappNumber: whatsappNumber.trim(),
        whatsappDirectOrder,
      });

      alert('✅ Settings saved successfully and synced across all browsers!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('⚠️ Settings saved locally only (server sync failed). Changes will sync when connection is restored.');
    }
  };

  const handleAddProduct = () => {
    // Navigate to add product form
    alert('Add Product form would open here');
  };

  const handleEditProduct = (productId: string) => {
    alert(`Edit product ${productId} form would open here`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      alert(`Product ${productId} would be deleted`);
    }
  };

  const handleResetBlogForm = () => {
    setEditingBlogSlug(null);
    setBlogForm(makeEmptyBlogForm());
    setBlogMessage('');
  };

  const handleBlogSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!blogForm.title.trim()) {
      setBlogMessage('Title is required.');
      return;
    }
    if (!blogForm.excerpt.trim()) {
      setBlogMessage('Please add a short excerpt.');
      return;
    }
    if (!blogForm.author.trim()) {
      setBlogMessage('Author name is required.');
      return;
    }

    const tags = blogForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean);
    const contentParagraphs = blogForm.content
      .split(/\r?\n\s*\r?\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);

    const input = {
      title: blogForm.title.trim(),
      slug: blogForm.slug.trim() || undefined,
      excerpt: blogForm.excerpt.trim(),
      author: blogForm.author.trim(),
      category: blogForm.category.trim() || 'General',
      tags,
      coverImage: blogForm.coverImage.trim() || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      content: contentParagraphs.length > 0 ? contentParagraphs : [blogForm.excerpt.trim()],
      readTime: blogForm.readTime.trim() || '5 min read',
      metaTitle: blogForm.metaTitle.trim() || undefined,
      metaDescription: blogForm.metaDescription.trim() || undefined,
      published: blogForm.published,
    };

    try {
      if (editingBlogSlug) {
        const updated = await updatePost(editingBlogSlug, input);
        if (!updated) {
          setBlogMessage('Unable to update blog post.');
          return;
        }
        setBlogMessage('Blog post updated successfully.');
      } else {
        await createPost(input);
        setBlogMessage(blogForm.published ? 'Blog post published successfully.' : 'Blog post saved as draft.');
      }

      handleResetBlogForm();
    } catch (error) {
      console.error('Failed to save blog post:', error);
      setBlogMessage('Failed to save blog post. Please try again.');
    }
  };

  const handleEditBlogPost = (slug: string) => {
    setEditingBlogSlug(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteBlogPost = async (slug: string) => {
    if (confirm('Delete this blog post?')) {
      try {
        await deletePost(slug);
        if (editingBlogSlug === slug) {
          handleResetBlogForm();
        }
        setBlogMessage('Blog post deleted.');
      } catch (error) {
        console.error('Failed to delete blog post:', error);
        setBlogMessage('Failed to delete blog post. Please try again.');
      }
    }
  };

  const handleTogglePublishBlog = async (slug: string) => {
    try {
      await togglePublished(slug);
      setBlogMessage('Blog post visibility updated.');
    } catch (error) {
      console.error('Failed to toggle blog post publish status:', error);
      setBlogMessage('Failed to update blog post visibility. Please try again.');
    }
  };

  const blogStats = {
    total: blogPosts.length,
    published: blogPosts.filter((post) => post.published).length,
  };

  const blogCategoryHint = blogCategories.filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <Crown className="mr-3 h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your subscription business with complete control
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700" disabled={settingsLoading || popupLoading}>
              <Save className="mr-2 h-4 w-4" />
              {(settingsLoading || popupLoading) ? 'Saving...' : 'Save All Changes'}
            </Button>
            <Button onClick={logout} variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Loading Indicator */}
        {(settingsLoading || popupLoading) && (
          <div className="mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Loading settings from server...
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Alerts */}
        {(settingsError || popupError) && (
          <div className="mb-6 space-y-2">
            {settingsError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Settings Warning:</strong> {settingsError}
                    </p>
                  </div>
                </div>
              </div>
            )}
            {popupError && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Popup Warning:</strong> {popupError}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="settings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-12">
            <TabsTrigger value="settings" className="flex items-center text-xs">
              <Settings className="mr-1 h-3 w-3" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center text-xs">
              <Package className="mr-1 h-3 w-3" />
              Products
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center text-xs">
              <PenTool className="mr-1 h-3 w-3" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center text-xs">
              <MessageSquare className="mr-1 h-3 w-3" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="commerce" className="flex items-center text-xs">
              <DollarSign className="mr-1 h-3 w-3" />
              Commerce
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center text-xs">
              <Globe className="mr-1 h-3 w-3" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center text-xs">
              <FilePlus2 className="mr-1 h-3 w-3" />
              Content
            </TabsTrigger>
            <TabsTrigger value="popups" className="flex items-center text-xs">
              <Zap className="mr-1 h-3 w-3" />
              Popups
            </TabsTrigger>
            <TabsTrigger value="blog" className="flex items-center text-xs">
              <BookOpen className="mr-1 h-3 w-3" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center text-xs">
              <PenTool className="mr-1 h-3 w-3" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="static" className="flex items-center text-xs">
              <FilePlus2 className="mr-1 h-3 w-3" />
              Static
            </TabsTrigger>
            <TabsTrigger value="giveaway" className="flex items-center text-xs">
              <Crown className="mr-1 h-3 w-3" />
              Giveaway
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center text-xs">
              <BarChart className="mr-1 h-3 w-3" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Contact Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input
                      id="whatsapp"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      onBlur={() => updateSettings({ whatsappNumber: whatsappNumber.trim() })}
                      placeholder="+923276847960"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This number will be used for all WhatsApp buttons and links
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="email">Support Email</Label>
                    <Input
                      id="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="itxahmadjan@gmail.com"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Globe className="mr-2 h-5 w-5" />
                    Site Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={localSiteSettings.siteName}
                      onChange={(e) => setLocalSiteSettings({...localSiteSettings, siteName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Tagline</Label>
                    <Input
                      id="tagline"
                      value={localSiteSettings.tagline}
                      onChange={(e) => setLocalSiteSettings({...localSiteSettings, tagline: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="logo">Site Logo URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="logo"
                        value={siteLogo}
                        onChange={(e) => setSiteLogo(e.target.value)}
                        placeholder="/images/SiteLogo.jpg"
                      />
                      <Button size="sm" variant="outline">
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Meta Description Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaDescription">Site Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    rows={3}
                    placeholder="Get premium AI & SEO tools at Huge Discounts! ChatGPT Plus, Canva Pro, Adobe Creative Suite & 15+ tools. Instant access, 24/7 support."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This description appears in search engine results and social media shares. Keep it under 160 characters.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Current length: {metaDescription.length} characters
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={async () => {
                      const success = await updateAdminSettings({ meta_description: metaDescription.trim() });
                      if (success) {
                        alert('✅ Meta description updated successfully!');
                      } else {
                        alert('❌ Failed to update meta description');
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Meta Description
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Section Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Textarea
                    id="heroTitle"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Textarea
                    id="heroSubtitle"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

                          <Card>
                <CardHeader>
                  <CardTitle>Site Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>WhatsApp Direct Order</Label>
                      <p className="text-sm text-gray-500">Skip form and open WhatsApp directly</p>
                    </div>
                    <Switch
                      checked={whatsappDirectOrder}
                      onCheckedChange={(checked) => {
                        setWhatsappDirectOrder(checked as boolean);
                        updateSettings({ whatsappDirectOrder: Boolean(checked) });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
          </TabsContent>

          {/* Products Management Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col items-center justify-center min-h-[200px]">
              <h2 className="text-2xl font-bold mb-4">Product Management</h2>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg shadow-lg"
                onClick={() => window.location.href = '/productcontroller'}
              >
                Access Product Controller
              </Button>
              <p className="mt-4 text-gray-500 text-center max-w-md">
                Use the Product Controller for advanced product management, secure access, and full CRUD features.
              </p>
            </div>
          </TabsContent>

          {/* SEO Management Tab */}
          <TabsContent value="seo" className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">SEO Management</h2>
                <p className="text-sm text-muted-foreground">Edit meta data for each page to keep search snippets sharp and consistent.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => resetAll()}>Reset All</Button>
                <Button onClick={handleSeoSave}>Save Changes</Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Page configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label htmlFor="seo-page">Select page</Label>
                    <Select value={activeSeoPage} onValueChange={(value) => setActiveSeoPage(value as SeoPageKey)}>
                      <SelectTrigger id="seo-page">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {seoPageOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Title length</Label>
                    <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{seoDraft.title.length} characters</div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Description length</Label>
                    <div className="rounded-md border bg-muted/40 px-3 py-2 text-sm">{seoDraft.description.length} characters</div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="seo-title">Meta title</Label>
                  <Input
                    id="seo-title"
                    value={seoDraft.title}
                    onChange={(event) => handleSeoInputChange('title', event.target.value)}
                    placeholder="Kings Subscriptions - Premium Tools at Huge Discounts"
                  />
                  <p className="text-xs text-muted-foreground">Keep titles under 60 characters for best results.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="seo-description">Meta description</Label>
                  <Textarea
                    id="seo-description"
                    rows={3}
                    value={seoDraft.description}
                    onChange={(event) => handleSeoInputChange('description', event.target.value)}
                    placeholder="Explain the value of this page in 1–2 sentences."
                  />
                  <p className="text-xs text-muted-foreground">Ideal meta descriptions are between 140–160 characters.</p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="seo-keywords">Keywords (optional)</Label>
                  <Input
                    id="seo-keywords"
                    value={seoDraft.keywords ?? ''}
                    onChange={(event) => handleSeoInputChange('keywords', event.target.value)}
                    placeholder="chatgpt plus, canva pro, premium tools"
                  />
                  <p className="text-xs text-muted-foreground">Comma separated keywords help organise your content but are optional.</p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleSeoReset}>Reset page</Button>
                  <Button onClick={handleSeoSave}>Save page SEO</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search preview</CardTitle>
                <p className="text-sm text-muted-foreground">See how this page might appear on Google.</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 rounded-xl border bg-muted/40 p-4">
                  <p className="text-xs text-green-600">kingssubs.com{seoPreviewPath}</p>
                  <p className="text-base font-semibold text-blue-700 dark:text-blue-400">{seoDraft.title || seoDefaults[activeSeoPage].title}</p>
                  <p className="text-sm text-muted-foreground">{seoDraft.description || seoDefaults[activeSeoPage].description}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Popups & Announcements Tab */}
          <TabsContent value="popups" className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Popups & Announcements</h2>
                <p className="text-sm text-muted-foreground">Control the promotional message, targeting, and frequency without touching code.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePopupReset} disabled={popupLoading}>Reset</Button>
                <Button onClick={handlePopupSave} disabled={popupLoading}>
                  {popupLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Popup Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="popup-enabled">Enable popup</Label>
                    <Switch
                      id="popup-enabled"
                      checked={popupDraft.enabled}
                      onCheckedChange={(checked) => handlePopupDraftChange('enabled', checked)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="popup-title">Title</Label>
                    <Input
                      id="popup-title"
                      value={popupDraft.title}
                      onChange={(event) => handlePopupDraftChange('title', event.target.value)}
                      placeholder="Unlock 10% off today"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="popup-message">Message</Label>
                    <Textarea
                      id="popup-message"
                      rows={3}
                      value={popupDraft.message}
                      onChange={(event) => handlePopupDraftChange('message', event.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="popup-button-text">Button label</Label>
                      <Input
                        id="popup-button-text"
                        value={popupDraft.buttonText}
                        onChange={(event) => handlePopupDraftChange('buttonText', event.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="popup-button-href">Button link</Label>
                      <Input
                        id="popup-button-href"
                        value={popupDraft.buttonHref}
                        onChange={(event) => handlePopupDraftChange('buttonHref', event.target.value)}
                        placeholder="https://wa.me/92327..."
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 md:grid-cols-3">
                    <div className="grid gap-2">
                      <Label>Theme</Label>
                      <Select value={popupDraft.theme} onValueChange={(value) => handlePopupDraftChange('theme', value as PopupSettings['theme'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Trigger</Label>
                      <Select value={popupDraft.trigger} onValueChange={(value) => handlePopupDraftChange('trigger', value as PopupSettings['trigger'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delay">After delay</SelectItem>
                          <SelectItem value="scroll">On scroll (50%)</SelectItem>
                          <SelectItem value="exit-intent">Exit intent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label>Frequency</Label>
                      <Select value={popupDraft.frequency} onValueChange={(value) => handlePopupDraftChange('frequency', value as PopupSettings['frequency'])}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Every visit</SelectItem>
                          <SelectItem value="once-per-session">Once per session</SelectItem>
                          <SelectItem value="once-per-day">Once per day</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {popupDraft.trigger === 'delay' && (
                    <div className="grid gap-2">
                      <Label htmlFor="popup-delay">Delay (seconds)</Label>
                      <Input
                        id="popup-delay"
                        type="number"
                        min={1}
                        value={popupDraft.delaySeconds}
                        onChange={(event) => handlePopupDraftChange('delaySeconds', Number(event.target.value))}
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="popup-timer">Show countdown timer</Label>
                    <Switch
                      id="popup-timer"
                      checked={popupDraft.showTimer}
                      onCheckedChange={(checked) => handlePopupDraftChange('showTimer', checked)}
                    />
                  </div>
                  {popupDraft.showTimer && (
                    <div className="grid gap-2">
                      <Label htmlFor="popup-timer-duration">Timer duration (minutes)</Label>
                      <Input
                        id="popup-timer-duration"
                        type="number"
                        min={1}
                        value={popupDraft.timerDuration}
                        onChange={(event) => handlePopupDraftChange('timerDuration', Number(event.target.value))}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Display on pages</Label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {POPUP_PAGE_OPTIONS.map((option) => {
                        const checked = popupPagesSelected.has(option.value) || (popupPagesSelected.has('*') && option.value !== '*');
                        return (
                          <label key={option.value} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Checkbox
                              checked={popupPagesSelected.has('*') ? option.value === '*' : checked}
                              onCheckedChange={() => togglePopupPage(option.value)}
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preview & Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`rounded-2xl border p-5 shadow-inner ${popupDraft.theme === 'dark' ? 'bg-zinc-950 text-zinc-100 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{popupDraft.title || 'Your headline here'}</h3>
                        <p className="text-sm text-muted-foreground">{popupDraft.message || 'Add a compelling message to convert visitors.'}</p>
                      </div>
                      <Badge variant={popupDraft.enabled ? 'default' : 'secondary'}>{popupDraft.enabled ? 'Active' : 'Disabled'}</Badge>
                    </div>
                    <Button size="sm" className="mt-4 w-full">{popupDraft.buttonText || 'Call to action'}</Button>
                    {popupDraft.showTimer && (
                      <div className="mt-3 text-xs text-amber-600 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Offer ends in {popupDraft.timerDuration} minutes
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Total impressions</span>
                      <span>{popupSettings.metrics.impressions}</span>
                    </div>
                    <Progress value={popupSettings.metrics.impressions ? (popupSettings.metrics.clicks / popupSettings.metrics.impressions) * 100 : 0} />
                    <div className="flex items-center justify-between">
                      <span>Clicks</span>
                      <span>{popupSettings.metrics.clicks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Dismissals</span>
                      <span>{popupSettings.metrics.dismissals}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Conversion rate</span>
                      <span>{analytics.popupConversion}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          {/* Blog Management Tab */}
          <TabsContent value="blog" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.5fr,2fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePlus2 className="h-5 w-5" />
                    {editingBlogSlug ? 'Edit Blog Post' : 'Create Blog Post'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {blogMessage && (
                    <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                      {blogMessage}
                    </div>
                  )}
                  <form className="space-y-4" onSubmit={handleBlogSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_title">Title</Label>
                      <Input
                        id="blog_title"
                        value={blogForm.title}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, title: event.target.value }))}
                        placeholder="ChatGPT Plus vs Gemini Advanced"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_slug">Slug (optional)</Label>
                      <Input
                        id="blog_slug"
                        value={blogForm.slug}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, slug: event.target.value }))}
                        placeholder="chatgpt-plus-vs-gemini"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_excerpt">Excerpt</Label>
                      <Textarea
                        id="blog_excerpt"
                        rows={3}
                        value={blogForm.excerpt}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, excerpt: event.target.value }))}
                        placeholder="Short summary shown on the blog listing..."
                        required
                      />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="blog_author">Author</Label>
                        <Input
                          id="blog_author"
                          value={blogForm.author}
                          onChange={(event) => setBlogForm((prev) => ({ ...prev, author: event.target.value }))}
                          placeholder="Ahmad Hassan"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="blog_category">Category</Label>
                        <Input
                          id="blog_category"
                          value={blogForm.category}
                          onChange={(event) => setBlogForm((prev) => ({ ...prev, category: event.target.value }))}
                          placeholder="AI Tools"
                        />
                        {blogCategoryHint && (
                          <p className="text-xs text-muted-foreground">Existing: {blogCategoryHint}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_tags">Tags (comma separated)</Label>
                      <Input
                        id="blog_tags"
                        value={blogForm.tags}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, tags: event.target.value }))}
                        placeholder="ai tools, automation, growth"
                      />
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label htmlFor="blog_cover">Cover image URL</Label>
                        <Input
                          id="blog_cover"
                          value={blogForm.coverImage}
                          onChange={(event) => setBlogForm((prev) => ({ ...prev, coverImage: event.target.value }))}
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="blog_read_time">Read time</Label>
                        <Input
                          id="blog_read_time"
                          value={blogForm.readTime}
                          onChange={(event) => setBlogForm((prev) => ({ ...prev, readTime: event.target.value }))}
                          placeholder="6 min read"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_content">Content</Label>
                      <Textarea
                        id="blog_content"
                        rows={8}
                        value={blogForm.content}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, content: event.target.value }))}
                        placeholder="Write each paragraph on a new line..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_meta_title">SEO Meta Title</Label>
                      <Input
                        id="blog_meta_title"
                        value={blogForm.metaTitle}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, metaTitle: event.target.value }))}
                        placeholder="ChatGPT Plus vs Gemini | King Subs"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="blog_meta_description">SEO Meta Description</Label>
                      <Textarea
                        id="blog_meta_description"
                        rows={3}
                        value={blogForm.metaDescription}
                        onChange={(event) => setBlogForm((prev) => ({ ...prev, metaDescription: event.target.value }))}
                        placeholder="Concise description for search engines..."
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">Publish immediately</p>
                        <p className="text-xs text-muted-foreground">Draft posts stay hidden until you publish.</p>
                      </div>
                      <Switch
                        checked={blogForm.published}
                        onCheckedChange={(checked) => setBlogForm((prev) => ({ ...prev, published: checked }))}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" className="flex-1">
                        {editingBlogSlug ? 'Update Post' : 'Create Post'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleResetBlogForm}>
                        Clear
                      </Button>
                    </div>
                    {editingBlogSlug && (
                      <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleResetBlogForm}>
                        Cancel editing
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Blog Posts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">Total: {blogStats.total}</Badge>
                    <Badge variant="secondary">Published: {blogStats.published}</Badge>
                  </div>
                  {blogPosts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No blog posts yet. Start by creating your first article.</p>
                  ) : (
                    <div className="space-y-3">
                      {blogPosts.map((post) => (
                        <div key={post.slug} className="rounded-lg border bg-card/60 p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold leading-snug text-sm md:text-base">{post.title}</p>
                              <p className="text-xs text-muted-foreground">/{post.slug}</p>
                            </div>
                            <Badge variant={post.published ? 'default' : 'outline'}>
                              {post.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>{post.author}</span>
                            <span>{formatBlogDate(post.updatedAt || post.createdAt)}</span>
                            <span>{post.readTime}</span>
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditBlogPost(post.slug)}>
                              <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => handleTogglePublishBlog(post.slug)}>
                              {post.published ? 'Unpublish' : 'Publish'}
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteBlogPost(post.slug)}>
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Pages Management Tab */}
          <TabsContent value="pages" className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Pages Management</h2>
                <p className="text-sm text-muted-foreground">Create and manage custom pages for your website.</p>
              </div>
              <Button onClick={handleResetPageForm}>
                <Plus className="mr-2 h-4 w-4" />
                New Page
              </Button>
            </div>

            {pageMessage && (
              <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                {pageMessage}
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-[1.5fr,2fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FilePlus2 className="h-5 w-5" />
                    {editingPageId ? 'Edit Page' : 'Create Page'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form className="space-y-4" onSubmit={handlePageSubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="page_title">Title</Label>
                      <Input
                        id="page_title"
                        value={pageForm.title}
                        onChange={(e) => setPageForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Terms of Service"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="page_slug">URL Slug</Label>
                      <Input
                        id="page_slug"
                        value={pageForm.slug}
                        onChange={(e) => setPageForm(prev => ({ ...prev, slug: e.target.value }))}
                        placeholder="terms-of-service"
                        required
                      />
                      <p className="text-xs text-muted-foreground">URL will be: /page/{pageForm.slug}</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="page_content">Content (HTML)</Label>
                      <Textarea
                        id="page_content"
                        rows={12}
                        value={pageForm.content}
                        onChange={(e) => setPageForm(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="<h1>Terms of Service</h1><p>Your content here...</p>"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="page_meta_title">SEO Meta Title (optional)</Label>
                      <Input
                        id="page_meta_title"
                        value={pageForm.metaTitle}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaTitle: e.target.value }))}
                        placeholder="Terms of Service | King Subscriptions"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="page_meta_description">SEO Meta Description (optional)</Label>
                      <Textarea
                        id="page_meta_description"
                        rows={2}
                        value={pageForm.metaDescription}
                        onChange={(e) => setPageForm(prev => ({ ...prev, metaDescription: e.target.value }))}
                        placeholder="Read our terms of service and understand your rights..."
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2">
                      <div>
                        <p className="text-sm font-medium">Publish page</p>
                        <p className="text-xs text-muted-foreground">Published pages are visible to visitors.</p>
                      </div>
                      <Switch
                        checked={pageForm.published}
                        onCheckedChange={(checked) => setPageForm(prev => ({ ...prev, published: checked }))}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" className="flex-1">
                        {editingPageId ? 'Update Page' : 'Create Page'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleResetPageForm}>
                        Clear
                      </Button>
                    </div>
                    {editingPageId && (
                      <Button type="button" variant="ghost" className="w-full text-muted-foreground" onClick={handleResetPageForm}>
                        Cancel editing
                      </Button>
                    )}
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Custom Pages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary">Total: {customPages.length}</Badge>
                    <Badge variant="secondary">Published: {customPages.filter(p => p.published).length}</Badge>
                  </div>
                  {customPages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No custom pages yet. Create your first page to get started.</p>
                  ) : (
                    <div className="space-y-3">
                      {customPages.map((page) => (
                        <div key={page.id} className="rounded-lg border bg-card/60 p-4 shadow-sm">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <p className="font-semibold leading-snug text-sm md:text-base">{page.title}</p>
                              <p className="text-xs text-muted-foreground">/page/{page.slug}</p>
                            </div>
                            <Badge variant={page.published ? 'default' : 'outline'}>
                              {page.published ? 'Published' : 'Draft'}
                            </Badge>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {page.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>Created: {formatBlogDate(page.created_at)}</span>
                            {page.updated_at && page.updated_at !== page.created_at && (
                              <span>Updated: {formatBlogDate(page.updated_at)}</span>
                            )}
                          </div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditPage(page)}>
                              <Edit className="mr-1 h-4 w-4" /> Edit
                            </Button>
                            {page.published && (
                              <Button size="sm" variant="secondary" asChild>
                                <a href={`/page/${page.slug}`} target="_blank" rel="noopener noreferrer">
                                  <Eye className="mr-1 h-4 w-4" /> View
                                </a>
                              </Button>
                            )}
                            <Button size="sm" variant="destructive" onClick={() => handleDeletePage(page.id)}>
                              <Trash2 className="mr-1 h-4 w-4" /> Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Static Pages Tab */}
          <TabsContent value="static" className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Static Pages Management</h2>
                <p className="text-sm text-muted-foreground">Edit built-in pages like Privacy Policy, Terms & Conditions, etc.</p>
              </div>
            </div>

            <StaticPagesEditor />
          </TabsContent>

          {/* Giveaway Tab */}
          <TabsContent value="giveaway" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-[1.5fr,2fr]">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add Giveaway Account
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {giveawayMessage && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-300">
                      {giveawayMessage}
                    </div>
                  )}
                  <form className="space-y-4" onSubmit={handleGiveawaySubmit}>
                    <div className="grid gap-2">
                      <Label htmlFor="giveaway_email">Email</Label>
                      <Input
                        id="giveaway_email"
                        type="email"
                        value={giveawayForm.email}
                        onChange={(e) => setGiveawayForm({ ...giveawayForm, email: e.target.value })}
                        placeholder="user@example.com"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="giveaway_password">Password</Label>
                      <Input
                        id="giveaway_password"
                        type="password"
                        value={giveawayForm.password}
                        onChange={(e) => setGiveawayForm({ ...giveawayForm, password: e.target.value })}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <Button type="submit" disabled={giveawayLoading}>
                      {giveawayLoading ? 'Adding...' : 'Add Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {giveawayLoading ? (
                    <p>Loading accounts...</p>
                  ) : giveawayAccounts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No accounts available for giveaway.</p>
                  ) : (
                    <div className="space-y-3">
                      {giveawayAccounts.map((account) => (
                        <div key={account.id} className="rounded-lg border bg-card/60 p-3 shadow-sm">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-sm">{account.email}</p>
                              <Badge variant={account.is_claimed ? 'secondary' : 'default'}>
                                {account.is_claimed ? 'Claimed' : 'Available'}
                              </Badge>
                            </div>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteGiveaway(account.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>


          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Analytics Overview</h2>
                <p className="text-sm text-muted-foreground">Monitor your business performance and sales data.</p>
              </div>
              <Button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/analytics/overview', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    const result = await response.json();
                    if (response.ok) {
                      alert('✅ Sample analytics data seeded successfully!');
                      window.location.reload(); // Refresh to show new data
                    } else {
                      alert('❌ Failed to seed sample data: ' + result.error);
                    }
                  } catch (error) {
                    alert('❌ Error seeding sample data');
                  }
                }}
                variant="outline"
              >
                Seed Sample Data
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Products</p>
                      <p className="text-2xl font-bold">{analytics.totalProducts}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Published Articles</p>
                      <p className="text-2xl font-bold">{analytics.publishedBlogPosts}</p>
                      <p className="text-xs text-muted-foreground">{analytics.draftBlogPosts} drafts pending</p>
                    </div>
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Average Discount</p>
                      <p className="text-2xl font-bold">{analytics.averageDiscount}%</p>
                      <p className="text-xs text-muted-foreground">Across individual plan pricing</p>
                    </div>
                    <BarChart className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Popup Conversion</p>
                      <p className="text-2xl font-bold">{analytics.popupConversion}%</p>
                      <p className="text-xs text-muted-foreground">{analytics.popupMetrics.clicks} clicks / {analytics.popupMetrics.impressions} impressions</p>
                    </div>
                    <Zap className="h-8 w-8 text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Category coverage</CardTitle>
                <p className="text-sm text-muted-foreground">You are currently selling products across {analytics.categories.length} categories.</p>
              </CardHeader>
              <CardContent>
                {analytics.categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add category tags to your products to see distribution here.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {analytics.categories.map((category) => (
                      <Badge key={category} variant="secondary">{category}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top saving opportunities</CardTitle>
                <p className="text-sm text-muted-foreground">Highest discount subscriptions (based on monthly plan).</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Add original pricing to products to highlight savings.</p>
                ) : (
                  analytics.topProducts.map((item) => (
                    <div key={item.id} className="rounded-lg border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Saves {item.savings.toLocaleString()} PKR</p>
                        </div>
                        <Badge variant="default">{item.discount}% OFF</Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Categories Tab */}
          <TabsContent value="categories" className="space-y-6">
            <CategoryManagement />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            <ReviewManagement />
          </TabsContent>

          {/* Commerce Tab */}
          <TabsContent value="commerce" className="space-y-6">
            <CommerceManagement />
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <SiteContentManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
