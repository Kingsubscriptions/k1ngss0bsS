import React, { lazy, Suspense } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { BlogProvider } from '@/context/BlogContext';
import { PopupProvider } from '@/context/PopupContext';
import { SeoProvider } from '@/context/SeoContext';
import { CartProvider } from '@/context/CartContext';
import { CompareProvider } from '@/context/CompareContext';
import { AuthProvider } from '@/context/AuthContext';
import { SearchProvider } from '@/context/SearchContext';
import { CustomPagesProvider } from '@/context/CustomPagesContext';
import { HeroProvider } from '@/context/HeroContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { AdminSettingsProvider } from '@/context/AdminSettingsContext';
import { StaticPagesProvider } from '@/context/StaticPagesContext';
import { UserProvider } from '@/context/UserContext';
import { NewsletterProvider } from '@/context/NewsletterContext';
import { ContactProvider } from '@/context/ContactContext';
import { FAQProvider } from '@/context/FAQContext';
import { CouponProvider } from '@/context/CouponContext';
import { ProductCategoriesProvider } from '@/context/ProductCategoriesContext';
import { ReviewManagementProvider } from '@/context/ReviewManagementContext';
import { PaymentMethodsProvider } from '@/context/PaymentMethodsContext';
import { ShippingOptionsProvider } from '@/context/ShippingOptionsContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { SEOMetaProvider } from '@/context/SEOMetaContext';
import { SocialMediaLinksProvider } from '@/context/SocialMediaLinksContext';
import { FooterContentProvider } from '@/context/FooterContentContext';
import { NavigationMenusProvider } from '@/context/NavigationMenusContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import SecurityHeaders from './components/SecurityHeaders';
import SEOHead from './components/SEOHead';
import { AccessibilityProvider } from './components/AccessibilityProvider';
const Home = lazy(() => import('./pages/Home'));
const Tools = lazy(() => import('./pages/Tools'));
const About = lazy(() => import('./pages/About'));
const WhyUs = lazy(() => import('./pages/WhyUs'));
const Compare = lazy(() => import('./pages/Compare'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AllProducts = lazy(() => import('./pages/AllProducts'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));

// Additional pages
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy'));
const DMCA = lazy(() => import('./pages/DMCA'));
const Admin = lazy(() => import('./pages/Admin'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ProductController = lazy(() => import('./pages/ProductController'));
const Contact = lazy(() => import('./pages/Contact'));
const TermsConditions = lazy(() => import('./pages/TermsConditions'));
const CustomPage = lazy(() => import('./pages/CustomPage'));
import PurchaseNotifications from './components/PurchaseNotifications';
import FloatingElements from './components/FloatingElements';
import FloatingCart from './components/FloatingCart';
import PopupAnnouncement from './components/PopupAnnouncement';
import ProductDashboard from './pages/ProductDashboard';

const queryClient = new QueryClient();

// Error Boundary Component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', color: 'red' }}>
          <h1>❌ Error in App</h1>
          <p>Something went wrong. Check console for details.</p>
          <pre style={{ background: '#f5f5f5', padding: '10px', border: '1px solid #ccc' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AccessibilityProvider>
            <ProductsProvider>
              <BlogProvider>
                <PopupProvider>
                  <SeoProvider>
                    <SettingsProvider>
                      <CurrencyProvider>
                  <CartProvider>
                    <CompareProvider>
                      <SearchProvider>
                        <CustomPagesProvider>
                        <HeroProvider>
                        <SiteSettingsProvider>
                        <AdminSettingsProvider>
                        <StaticPagesProvider>
                        <UserProvider>
                        <NewsletterProvider>
                        <ContactProvider>
                        <FAQProvider>
                        <CouponProvider>
                        <ProductCategoriesProvider>
                        <ReviewManagementProvider>
                        <PaymentMethodsProvider>
                        <ShippingOptionsProvider>
                        <InventoryProvider>
                        <SEOMetaProvider>
                        <SocialMediaLinksProvider>
                        <FooterContentProvider>
                        <NavigationMenusProvider>
                        <TooltipProvider>
                      <SecurityHeaders />
                      <SEOHead />
                      <Toaster />
                      <ScrollToTop />
                      <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1" id="main">
                          <Suspense fallback={<div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>}>
                            <Routes>
                              <Route path="/" element={<Home />} />
                              <Route path="/tools" element={<Tools />} />
                              <Route path="/about" element={<About />} />
                              <Route path="/why-us" element={<WhyUs />} />
                              <Route path="/compare" element={<Compare />} />
                              <Route path="/testimonials" element={<Testimonials />} />
                              <Route path="/products" element={<AllProducts />} />
                              <Route path="/product/:id" element={<ProductDetail />} />

                              {/* Additional routes */}
                              <Route path="/blog" element={<Blog />} />
                              <Route path="/blog/:slug" element={<BlogPost />} />
                              <Route path="/contact" element={<Contact />} />
                              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                              <Route path="/terms-conditions" element={<TermsConditions />} />
                              <Route path="/refund-policy" element={<RefundPolicy />} />
                              <Route path="/dmca" element={<DMCA />} />
                              <Route path="/admin" element={<Admin />} />
                              <Route path="/admin/login" element={<AdminLogin />} />
                              <Route path="/admin/dashboard" element={<AdminDashboard />} />
                              <Route path="/product-controller" element={<ProductController />} />
                              <Route path="/productcontroller" element={<ProductController />} />
                              <Route path="/productdashboard" element={<ProductDashboard onLogout={() => {}} />} />
                              <Route path="/page/:slug" element={<CustomPage />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </main>
                        <Footer />
                        <PurchaseNotifications />
                        <PopupAnnouncement />
                        <FloatingElements />
                        <FloatingCart />
                      </div>
                        </TooltipProvider>
                        </NavigationMenusProvider>
                        </FooterContentProvider>
                        </SocialMediaLinksProvider>
                        </SEOMetaProvider>
                        </InventoryProvider>
                        </ShippingOptionsProvider>
                        </PaymentMethodsProvider>
                        </ReviewManagementProvider>
                        </ProductCategoriesProvider>
                        </CouponProvider>
                        </FAQProvider>
                        </ContactProvider>
                        </NewsletterProvider>
                        </UserProvider>
                        </StaticPagesProvider>
                        </AdminSettingsProvider>
                        </SiteSettingsProvider>
                        </HeroProvider>
                        </CustomPagesProvider>
                      </SearchProvider>
                  </CompareProvider>
                </CartProvider>
              </CurrencyProvider>
            </SettingsProvider>
          </SeoProvider>
        </PopupProvider>
      </BlogProvider>
    </ProductsProvider>
  </AccessibilityProvider>
</AuthProvider>
</BrowserRouter>
</QueryClientProvider>
</ErrorBoundary>
);

export default App;
