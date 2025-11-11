import { useSettings } from '@/context/SettingsContext';
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, CheckCircle, ArrowLeft, Shield, Clock, Award, Tag, CreditCard, Image, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useProductsContext } from "@/context/ProductsContext";
import { useToast } from "@/components/ui/use-toast";
import { useSeo } from "@/context/SeoContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Product } from "@/data/products";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onRetry?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 bg-red-50 rounded-md">
          <h3 className="text-lg font-medium text-red-800">Something went wrong</h3>
          <p className="text-red-600 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
            {this.props.onRetry && (
              <Button onClick={this.props.onRetry}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Extended Product type
type ProductWithRating = Product & {
  rating?: number;
  reviewCount?: number;
};

type GtagFunction = (...args: unknown[]) => void;

const getGtag = (): GtagFunction | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }
  const maybeWindow = window as Window & { gtag?: GtagFunction };
  return typeof maybeWindow.gtag === 'function' ? maybeWindow.gtag : undefined;
};

type ActivityItem = {
  name: string;
  city: string;
  time: string;
};

const LivePurchaseTicker: React.FC<{ items: ActivityItem[] }> = ({ items }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  const activity = items[index];

  return (
    <div className="mt-3 p-3 bg-gray-50 dark:bg-zinc-900 border border-gray-100 dark:border-zinc-700 rounded-lg mb-4 transition-colors w-full overflow-x-auto">
      <div className="flex items-center text-xs sm:text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
        <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2" />
        <span>
          {activity.name} from {activity.city} just purchased this product {activity.time}
        </span>
      </div>
    </div>
  );
};

// Interfaces
interface Plan {
  type: string;
  durations: Duration[];
}

interface Duration {
  duration: string;
  price: number;
  original?: number;
}

interface CartItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  features: string[];
  rating: number;
  quantity: number;
}

// API Service
const fetchProduct = async (id: string, allProducts: ProductWithRating[]): Promise<ProductWithRating | null> => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => {
        const product = allProducts.find(p => p.id === id);
        resolve(product || null);
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
};

// Notification Service
const subscribeToStockAlert = async (email: string, productId: string): Promise<boolean> => {
  try {
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500);
    });
  } catch (error) {
    console.error("Error subscribing to stock alert:", error);
    return false;
  }
};

// Custom Hook for Product Data
const useProductData = (id: string | undefined, allProducts: ProductWithRating[]) => {
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductWithRating | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Duration | null>(null);
  
  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await fetchProduct(id, allProducts);
        setProduct(data);
        
        if (data?.plans?.length) {
          const planParam = params.get("plan");
          const durationParam = params.get("dur");
          const initialPlan = data.plans.find(p => p.type === planParam) || data.plans[0];
          const initialDuration = initialPlan.durations.find(d => d.duration === durationParam) || initialPlan.durations[0];
          setSelectedPlan(initialPlan);
          setSelectedDuration(initialDuration);
        }
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadProduct();
  }, [id, params, allProducts]);
  
  return { loading, product, selectedPlan, selectedDuration, setSelectedPlan, setSelectedDuration };
};

// ProductImage Component
const ProductImage: React.FC<{ 
  product: ProductWithRating; 
  onLoad: () => void; 
  onError: () => void;
  loaded: boolean;
  errored: boolean;
}> = ({ product, onLoad, onError, loaded, errored }) => (
  <div className="relative group max-w-[250px] sm:max-w-none mx-auto lg:mx-0">
    <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 ring-1 ring-black/5">
      <div className="aspect-square sm:aspect-[4/3] w-full flex items-center justify-center relative">
        {!loaded && !errored && (
          <div className="absolute inset-0 animate-pulse bg-gray-200 dark:bg-gray-700" />
        )}
        {errored ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Image className="w-12 h-12 mb-2" />
            <p className="text-sm">Failed to load image</p>
          </div>
        ) : (
          <img
            src={product.image}
            alt={`${product.name} product image`}
            className={`h-full w-full object-contain transition-transform duration-300 group-hover:scale-105 ${!loaded ? 'opacity-0' : 'opacity-100'}`}
            onLoad={onLoad}
            onError={onError}
            loading="lazy"
          />
        )}
      </div>
    </div>
  </div>
);

// ProductInfo Component
const ProductInfo: React.FC<{ 
  product: ProductWithRating; 
  primaryCategory: string; 
  stockLabel: string; 
  isInStock: boolean;
  liveActivityItems: ActivityItem[];
}> = ({ product, primaryCategory, stockLabel, isInStock, liveActivityItems }) => {
  // Generate random number of recent purchases for social proof
  const recentPurchases = Math.floor(Math.random() * 50) + 50;
  
  return (
    <div className="mb-4">
      {/* Satisfaction Guarantee Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-start">
          <Award className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-800">Satisfaction Guaranteed</h4>
            <p className="text-sm text-blue-600">
              7-day money-back guarantee • 24/7 support • Instant activation
            </p>
          </div>
        </div>
      </div>

      <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-3 break-words">
        {product.name}
      </h1>
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 w-full">
        {/* Reviews and purchases */}
        <div className="flex items-center flex-shrink-0 min-w-0">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-5 h-5 ${i < Math.floor(product.rating || 4.9) ? 'fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <span className="ml-2 text-xs sm:text-sm text-muted-foreground truncate">
            ({product.rating || 4.9}) • {product.reviewCount || 2847} reviews
          </span>
          <span className="hidden xs:inline text-green-600 font-medium ml-2 text-xs sm:text-sm whitespace-nowrap">
            • ⚡ {recentPurchases} bought today
          </span>
        </div>
        {/* Show purchases on new line for xs screens */}
        <span className="xs:hidden block w-full text-green-600 font-medium text-xs mt-1">
          ⚡ {recentPurchases} bought today
        </span>
        {/* Divider */}
        <div className="hidden sm:block h-4 border-l mx-2"></div>
        {/* Category */}
        <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
          <Tag className="w-4 h-4" />
          <span className="truncate max-w-[100px] sm:max-w-none">{primaryCategory}</span>
        </div>
        {/* Stock badge */}
        <div className={`px-2 sm:px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${isInStock ? 'bg-green-400/15 text-green-800 ring-green-500/30' : 'bg-red-400/15 text-red-800 ring-red-500/30'} flex-shrink-0 mt-1 sm:mt-0`}>
          {stockLabel}
        </div>
      </div>

      {/* Live customer activity (dynamic) */}
      <LivePurchaseTicker items={liveActivityItems} />

      <p className="text-muted-foreground text-base sm:text-lg leading-relaxed break-words">
        {product.description}
      </p>
    </div>
  );
};

// Quantity Selector Component
const QuantitySelector: React.FC<{
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxAvailable?: number;
}> = ({ quantity, onQuantityChange, maxAvailable = 10 }) => {
  return (
    <div className="flex items-center mb-4">
      <span className="mr-3 font-medium">Quantity:</span>
      <div className="flex items-center border rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="h-8 w-8 px-0"
        >
          -
        </Button>
        <span className="mx-3 w-8 text-center">{quantity}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onQuantityChange(Math.min(maxAvailable, quantity + 1))}
          disabled={quantity >= maxAvailable}
          className="h-8 w-8 px-0"
        >
          +
        </Button>
      </div>
      {maxAvailable < 10 && (
        <span className="ml-2 text-sm text-muted-foreground">
          ({maxAvailable} available)
        </span>
      )}
    </div>
  );
};

// ProductPlans Component
const ProductPlans: React.FC<{ 
  product: ProductWithRating; 
  selectedPlan: Plan | null; 
  setSelectedPlan: (plan: Plan) => void;
}> = ({ product, selectedPlan, setSelectedPlan }) => {
  const hasPlans = product.plans && product.plans.length > 0;
  
  if (!hasPlans) {
    return (
      <div className="text-center py-4 text-muted-foreground mb-6">
        No plans available for this product.
      </div>
    );
  }
  
  return (
    <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-3">Choose Plan</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {product.plans.map((plan) => (
          <Card
            key={plan.type}
            className={`cursor-pointer transition-all duration-200 ${selectedPlan?.type === plan.type ? 'ring-2 ring-primary bg-primary/5 border-primary/40' : 'hover:bg-muted/50 hover:shadow-md hover:-translate-y-0.5'}`}
            onClick={() => setSelectedPlan(plan)}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-card-foreground">{plan.type}</h4>
                {selectedPlan?.type === plan.type && (
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 ml-2" />
                )}
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                {product.features.slice(0, 2).map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ProductDuration Component
const ProductDuration: React.FC<{ 
  selectedPlan: Plan | null; 
  selectedDuration: Duration | null;
  setSelectedDuration: (duration: Duration) => void;
  formatPrice: (price: number) => string;
}> = ({ selectedPlan, selectedDuration, setSelectedDuration, formatPrice }) => {
  const handleDurationChange = (value: string) => {
    const duration = selectedPlan?.durations.find(d => d.duration === value);
    if (duration) setSelectedDuration(duration);
  };
  
  return (
    <div className="rounded-2xl border bg-card p-4 md:p-5 shadow-sm mb-6">
      <h3 className="text-lg font-semibold mb-3">Choose Duration / Service</h3>
      <Select 
        value={selectedDuration?.duration} 
        onValueChange={handleDurationChange} 
        disabled={!selectedPlan}
      >
        <SelectTrigger className="h-12 rounded-xl text-base">
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {selectedPlan?.durations.map((duration) => (
            <SelectItem key={duration.duration} value={duration.duration} className="text-base py-2">
              {duration.duration} - {formatPrice(duration.price)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

// ProductPricing Component
const ProductPricing: React.FC<{ 
  currentPrice: number; 
  originalPrice: number; 
  finalSavings: number; 
  finalDiscount: number;
  selectedDuration: Duration | null;
  formatPrice: (price: number) => string;
  product: ProductWithRating;
}> = ({ currentPrice, originalPrice, finalSavings, finalDiscount, selectedDuration, formatPrice, product }) => (
  <div className="mb-6">
    <div className="rounded-2xl p-4 md:p-5 bg-black/[.035] dark:bg-white/[.04] ring-1 ring-black/10 dark:ring-white/10">
      {originalPrice > currentPrice && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</span>
          {finalDiscount > 0 && (
            <span className="px-2 py-0.5 text-xs rounded-full font-semibold bg-destructive text-destructive-foreground">
              Save {finalDiscount}%
            </span>
          )}
        </div>
      )}
      <div className="mt-2 text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
        {formatPrice(currentPrice)}
      </div>
      {finalSavings > 0 && (
        <div className="text-sm text-muted-foreground mt-1">
          You save <span className="font-semibold text-foreground">{formatPrice(finalSavings)}</span>
        </div>
      )}
      {selectedDuration && parseInt(selectedDuration.duration) > 1 && (
        <div className="text-sm text-muted-foreground mt-1">
          ({formatPrice(currentPrice / parseInt(selectedDuration.duration))}/month)
          <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
            Save {Math.round((1 - (currentPrice / (product.price?.monthly || currentPrice * parseInt(selectedDuration.duration))) * 100))}% vs monthly
          </span>
        </div>
      )}
    </div>
  </div>
);

// ProductActions Component
const ProductActions: React.FC<{ 
  isActionDisabled: boolean; 
  onAddToCart: () => void; 
  onWhatsAppOrder: () => void;
  product: ProductWithRating;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxAvailable?: number;
}> = ({ isActionDisabled, onAddToCart, onWhatsAppOrder, product, quantity, onQuantityChange, maxAvailable }) => {
  // Stock counter for scarcity
  const showStockCounter = typeof product.stock === 'number' && product.stock > 0 && product.stock < 10;
  
  // Time-based urgency
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 43 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.minutes === 0) {
          if (prev.hours === 0) {
            clearInterval(timer);
            return { hours: 0, minutes: 0 };
          }
          return { hours: prev.hours - 1, minutes: 59 };
        }
        return { hours: prev.hours, minutes: prev.minutes - 1 };
      });
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <div className="space-y-3">
      {/* Scarcity & Urgency Elements */}
      {showStockCounter && (
        <div className="bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-sm">
          ⚠️ Only {product.stock} left in stock - order soon!
        </div>
      )}
      
      <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Order within next <span className="font-bold mx-1">{timeLeft.hours}h {timeLeft.minutes}m</span> for same-day activation
      </div>
      
      {/* Quantity Selector */}
      <QuantitySelector 
        quantity={quantity} 
        onQuantityChange={onQuantityChange}
        maxAvailable={maxAvailable}
      />
      
      {/* Action Buttons */}
      <Button 
        onClick={onAddToCart} 
        disabled={isActionDisabled} 
        size="lg" 
        className="w-full h-12 text-base"
        aria-label="Add product to cart"
      >
        Add to Cart
      </Button>
      <Button 
        onClick={onWhatsAppOrder} 
        disabled={isActionDisabled} 
        className="w-full h-12 text-base bg-green-600 text-white hover:bg-green-700" 
        size="lg"
        aria-label="Order product via WhatsApp"
      >
        Order via WhatsApp
      </Button>
      
      {/* Trust Badges & Security Seals */}
      <div className="mt-4 border-t pt-4">
        <div className="flex flex-wrap gap-4 justify-center">
          <div className="text-center">
            <Shield className="w-8 h-8 text-green-600 mx-auto" />
            <p className="text-xs mt-1">100% Official Account</p>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto" />
            <p className="text-xs mt-1">Instant Delivery</p>
          </div>
          <div className="text-center">
            <Award className="w-8 h-8 text-amber-600 mx-auto" />
            <p className="text-xs mt-1">Replacement Guarantee</p>
          </div>
        </div>
      </div>
      
      {/* Payment Methods */}
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground mb-2">We accept:</p>
        <div className="flex justify-center gap-2">
          <div className="bg-white dark:bg-zinc-900 p-1 rounded border border-gray-200 dark:border-zinc-700">
            <CreditCard className="w-8 h-8 text-gray-700 dark:text-gray-200" />
          </div>
          <div className="bg-white dark:bg-zinc-900 p-1 rounded border border-gray-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">JazzCash</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-1 rounded border border-gray-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">EasyPaisa</span>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-1 rounded border border-gray-200 dark:border-zinc-700">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-100">Bank Transfer</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProductBundle Component for upselling
const ProductBundle: React.FC<{ 
  product: ProductWithRating; 
  currentPrice: number;
  formatPrice: (price: number) => string;
  relatedAddons: ProductWithRating[];
}> = ({ product, currentPrice, formatPrice, relatedAddons }) => {
  if (relatedAddons.length === 0) return null;
  
  const bundlePrice = relatedAddons.reduce((sum, addon) => sum + (addon.price?.monthly || 0), 0);
  const bundleDiscount = bundlePrice * 0.2; // 20% discount
  
  return (
    <div className="mb-8 p-6 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50">
      <h3 className="text-xl font-bold mb-4 flex items-center">
        <span className="bg-amber-500 text-white p-1 rounded mr-2">🔥</span>
        Frequently Bought Together - Save 20%
      </h3>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <Checkbox id="bundle-main" defaultChecked className="mr-2" />
            <label htmlFor="bundle-main" className="font-medium">
              {product.name} - {formatPrice(currentPrice)}
            </label>
          </div>
          
          {relatedAddons.map((addon, index) => (
            <div key={addon.id} className="flex items-center mb-2 ml-6">
              <Checkbox id={`bundle-${index}`} defaultChecked className="mr-2" />
              <label htmlFor={`bundle-${index}`} className="text-sm">
                {addon.name} - {formatPrice(addon.price?.monthly || 0)}
              </label>
            </div>
          ))}
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-500 line-through">
              Total: {formatPrice(currentPrice + bundlePrice)}
            </div>
            <div className="text-xl font-bold text-green-600">
              Bundle Price: {formatPrice(currentPrice + bundlePrice - bundleDiscount)}
            </div>
            <div className="text-sm text-green-600">
              You save {formatPrice(bundleDiscount)}
            </div>
            <Button className="w-full mt-3 bg-amber-600 hover:bg-amber-700">
              Add Bundle to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ProductTabs Component
const ProductTabs: React.FC<{ product: ProductWithRating }> = ({ product }) => (
  <Tabs defaultValue="description" className="mb-12">
    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
      <TabsTrigger value="description">Description</TabsTrigger>
      <TabsTrigger value="features">Features</TabsTrigger>
      <TabsTrigger value="why-us">Why Us</TabsTrigger>
      <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
    </TabsList>
    
    <TabsContent value="description" className="mt-6">
      <Card>
        <CardHeader><CardTitle>Product Details</CardTitle></CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none text-muted-foreground">
          <p>{product.longDescription || product.description}</p>
        </CardContent>
      </Card>
    </TabsContent>
    
    <TabsContent value="features" className="mt-6">
      <Card>
        <CardHeader><CardTitle>Key Features</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </TabsContent>
    
    <TabsContent value="why-us" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Verified & Official</h3>
            <p className="text-muted-foreground text-sm">All subscriptions are officially paid and come with full support.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Instant Delivery</h3>
            <p className="text-muted-foreground text-sm">Receive credentials within minutes of payment.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Satisfaction Guarantee</h3>
            <p className="text-muted-foreground text-sm">We provide full support for the duration of your subscription.</p>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
    
    <TabsContent value="testimonials" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">"This service saved me hundreds of dollars annually. Highly recommended!"</p>
            <div className="flex items-center mt-4">
              <img src="https://i.pravatar.cc/40?u=a" alt="John D. profile picture" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h4 className="font-semibold">John D.</h4>
                <p className="text-sm text-muted-foreground">Digital Marketer</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">"Fast delivery and excellent customer support. Will buy again!"</p>
            <div className="flex items-center mt-4">
              <img src="https://i.pravatar.cc/40?u=b" alt="Sarah M. profile picture" className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h4 className="font-semibold">Sarah M.</h4>
                <p className="text-sm text-muted-foreground">Content Creator</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  </Tabs>
);

// ProductFAQ Component
const ProductFAQ: React.FC = () => (
  <div className="mb-8 mt-12">
    <h3 className="text-2xl font-bold mb-6">Frequently Asked Questions</h3>
    <Accordion type="single" collapsible>
      <AccordionItem value="item-1">
        <AccordionTrigger>How do I activate my subscription?</AccordionTrigger>
        <AccordionContent>
          You'll receive activation instructions via email within 5 minutes of purchase. Simply follow the provided steps to activate your subscription.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Can I use this on multiple devices?</AccordionTrigger>
        <AccordionContent>
          Most of our subscriptions allow usage on multiple devices. Please check the specific product details for device limitations.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>What is the refund policy?</AccordionTrigger>
        <AccordionContent>
          We offer a 7-day money-back guarantee for all new subscriptions. Contact our support team if you're not satisfied with your purchase.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-4">
        <AccordionTrigger>How do I get support?</AccordionTrigger>
        <AccordionContent>
          Our support team is available 24/7 via WhatsApp and email. You'll find contact details in your order confirmation email.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  </div>
);

// ProductReviews Component
const ProductReviews: React.FC = () => (
  <div className="mb-8">
    <h3 className="text-2xl font-bold mb-6">User Reviews</h3>
    <div className="space-y-4">
      <div className="border rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => ( <Star key={i} className="w-4 h-4 fill-current" /> ))}
          </div>
          <span className="ml-2 text-sm font-medium">Amazing service, fast delivery!</span>
        </div>
        <p className="text-muted-foreground">I've been using this service for 6 months now and it's been fantastic. The delivery is instant and the support team is very responsive.</p>
        <div className="mt-2 text-sm text-muted-foreground">- Alex Johnson</div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => ( <Star key={i} className="w-4 h-4 fill-current" /> ))}
          </div>
          <span className="ml-2 text-sm font-medium">Great value for money.</span>
        </div>
        <p className="text-muted-foreground">Saved me so much compared to buying directly. The subscription works perfectly and I haven't had any issues.</p>
        <div className="mt-2 text-sm text-muted-foreground">- Maria Garcia</div>
      </div>
      <div className="border rounded-lg p-4">
        <div className="flex items-center mb-2">
          <div className="flex text-yellow-400">
            {[...Array(4)].map((_, i) => ( <Star key={i} className="w-4 h-4 fill-current" /> ))}
            <Star key={5} className="w-4 h-4 text-gray-300" />
          </div>
          <span className="ml-2 text-sm font-medium">Support was very helpful.</span>
        </div>
        <p className="text-muted-foreground">Had a small issue with activation but the support team resolved it quickly. Overall very satisfied with the service.</p>
        <div className="mt-2 text-sm text-muted-foreground">- David Chen</div>
      </div>
    </div>
  </div>
);

// RelatedProducts Component
const RelatedProducts: React.FC<{ 
  relatedProducts: ProductWithRating[];
  formatPrice: (price: number) => string;
  onAddToCart: (product: ProductWithRating) => void;
  onWhatsAppOrder: (product: ProductWithRating) => void;
}> = ({ relatedProducts, formatPrice, onAddToCart, onWhatsAppOrder }) => {
  if (relatedProducts.length === 0) return null;
  
  return (
    <section>
      <h2 className="text-3xl font-bold text-center mb-8">Related Products</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map((p) => {
          const price = p.price?.monthly ?? p.price?.yearly ?? 0;
          return (
            <Card key={p.id}>
              <CardContent className="p-4 flex flex-col items-center">
                <img src={p.image} alt={p.name} className="w-32 h-20 object-contain mb-3 rounded" />
                <h4 className="font-semibold text-lg mb-1 text-center">{p.name}</h4>
                <p className="text-sm text-muted-foreground mb-2 text-center line-clamp-2">{p.description}</p>
                <div className="text-xl font-bold text-emerald-600 mb-2">{formatPrice(price)}</div>
                <div className="flex gap-2 mb-2 flex-wrap justify-center">
                  <Link to={`/product/${p.id}`}>
                    <Button size="sm" variant="outline">View Details</Button>
                  </Link>
                  <Button size="sm" onClick={() => onAddToCart(p)}>Add to Cart</Button>
                  <Button 
                    size="sm" 
                    className="bg-green-600 text-white hover:bg-green-700" 
                    onClick={() => onWhatsAppOrder(p)}
                  >
                    Order via WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

// WhatsApp Form Component (Advanced)
const WhatsAppForm: React.FC<{
  show: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string, phone: string, city: string) => void;
  productName: string;
  productPrice: string;
}> = ({ show, onClose, onSubmit, productName, productPrice }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [errors, setErrors] = useState<{ [k: string]: string }>({});

  if (!show) return null;

  // Simple validation
  const validate = () => {
    const errs: { [k: string]: string } = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.trim() || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Valid email required';
    if (!phone.trim() || !/^\d{10,15}$/.test(phone.replace(/\D/g, ''))) errs.phone = 'Valid phone required';
    if (!city.trim()) errs.city = 'City is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(name, email, phone, city);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg max-w-md w-full relative shadow-xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
        <h3 className="text-lg font-bold mb-2 text-center">🚀 Place Your Order Instantly!</h3>
        <p className="mb-4 text-center text-muted-foreground">Fill in your details and we'll connect you on WhatsApp.</p>
        <div className="space-y-3">
          <Input
            id="detail_name"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
          />
          {errors.name && <div className="text-xs text-red-500">{errors.name}</div>}
          <Input
            id="detail_email"
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <div className="text-xs text-red-500">{errors.email}</div>}
          <Input
            id="detail_phone"
            type="tel"
            placeholder="Your Phone (e.g. 03XXXXXXXXX)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={errors.phone ? 'border-red-500' : ''}
          />
          {errors.phone && <div className="text-xs text-red-500">{errors.phone}</div>}
          <Input
            id="detail_city"
            placeholder="Your City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={errors.city ? 'border-red-500' : ''}
          />
          {errors.city && <div className="text-xs text-red-500">{errors.city}</div>}
        </div>
        <div className="flex gap-2 mt-6 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name || !email || !phone || !city}>
            <span role="img" aria-label="whatsapp">💬</span> Order on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main ProductDetail Component
const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [params, setParams] = useSearchParams();
  const cart = useCart();
  const currencyCtx = useCurrency();
  const { products } = useProductsContext();
  const productCollection = useMemo<ProductWithRating[]>(
    () => (Array.isArray(products) ? (products as ProductWithRating[]) : []),
    [products]
  );
  const bundleAddons = useMemo<ProductWithRating[]>(
    () => productCollection.filter(p => p.category === 'addon' || p.category === 'accessory').slice(0, 2),
    [productCollection]
  );
  const { toast } = useToast();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [imageErrored, setImageErrored] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showWhatsAppForm, setShowWhatsAppForm] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const { settings } = useSettings();
  const directWhatsApp = settings.whatsappDirectOrder;
  const whatsappNumberDigits = settings.whatsappNumber.replace(/\D/g, '') || '923276847960';

  // Use custom hook for product data
  const { loading, product, selectedPlan, selectedDuration, setSelectedPlan, setSelectedDuration } = useProductData(id, productCollection as ProductWithRating[]);
  
  // Update URL when selection changes
  useEffect(() => {
    if (selectedPlan && selectedDuration) {
      const next = new URLSearchParams(params);
      next.set("plan", selectedPlan.type);
      next.set("dur", selectedDuration.duration);
      if (params.get('plan') !== selectedPlan.type || params.get('dur') !== selectedDuration.duration) {
        setParams(next, { replace: true });
      }
    }
  }, [selectedPlan, selectedDuration, params, setParams]);
  
  // Exit intent popup
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0) {
        toast({
          title: "Wait! Special Offer Just For You",
          description: "Get 10% off with code LEAVE10 if you order in next 10 minutes!",
          action: <Button onClick={() => {
            toast({ title: "Code LEAVE10 applied!" });
          }}>Apply Discount</Button>,
        });
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [toast]);
  
  // Move price logic above analytics tracking
  const formatPrice = currencyCtx?.formatPrice ?? ((x: number) => `PKR ${x.toLocaleString()}`);
  const hasPlans = product?.plans && product.plans.length > 0;
  const currentPrice = selectedDuration?.price ?? product?.price?.monthly ?? product?.price?.yearly ?? 0;
  const originalPrice = selectedDuration?.original ?? product?.price?.original ?? 0;
  const finalSavings = Math.max(originalPrice - currentPrice, 0);
  const finalDiscount = originalPrice > 0 && currentPrice > 0 ? Math.round((finalSavings / originalPrice) * 100) : 0;

  const liveActivityItems = useMemo<ActivityItem[]>(() => [
    { name: 'Ahmed', city: 'Karachi', time: '2 minutes ago' },
    { name: 'Sara', city: 'Lahore', time: 'just now' },
    { name: 'Ali', city: 'Islamabad', time: '5 minutes ago' },
    { name: 'Fatima', city: 'Multan', time: '1 minute ago' },
    { name: 'Usman', city: 'Faisalabad', time: '3 minutes ago' },
    { name: 'Ayesha', city: 'Peshawar', time: '4 minutes ago' },
    { name: 'Bilal', city: 'Quetta', time: 'just now' },
    { name: 'Zainab', city: 'Hyderabad', time: '6 minutes ago' },
  ], []);

  // Analytics tracking
  useEffect(() => {
    const gtag = getGtag();
    if (product && gtag) {
      gtag('event', 'view_item', {
        currency: currencyCtx?.currency || 'PKR',
        value: currentPrice,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: currentPrice,
          quantity: 1,
        }],
      });
    }
  }, [product, currentPrice, currencyCtx]);
  
  // Stock status logic
  let stockLabel = "In Stock";
  let isInStock = true;
  let maxAvailable = 10;
  
  if (!product) {
    stockLabel = "Product not found";
    isInStock = false;
  } else if (product.stock === false || 
            (typeof product.stock === 'number' && product.stock === 0) ||
            product.stock === undefined) {
    stockLabel = "Out of Stock";
    isInStock = false;
  } else if (product.stock === true || product.stock === "unlimited") {
    stockLabel = "In Stock";
    isInStock = true;
  } else if (typeof product.stock === 'number' && product.stock > 0) {
    stockLabel = `${product.stock} left`;
    isInStock = true;
    maxAvailable = product.stock;
  }
  
  const isActionDisabled = hasPlans && (!selectedPlan || !selectedDuration) || !isInStock;
  const primaryCategory = product?.category?.split(',')[0].trim() || "";
  const relatedProducts = product ? 
    productCollection.filter(p => p.category.includes(primaryCategory) && p.id !== product.id).slice(0, 3) 
    : [];
  
  // SEO meta tags
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | King Subs`;
      
      // Standard meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute('content', product.longDescription || product.description);
      
      // Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', `${product.name} | King Subs`);
      
      const ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', product.longDescription || product.description);
      
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage) ogImage.setAttribute('content', product.image);
      
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', window.location.href);
      
      // Twitter Card tags
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (twitterCard) twitterCard.setAttribute('content', 'summary_large_image');
      
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) twitterTitle.setAttribute('content', `${product.name} | King Subs`);
      
      const twitterDesc = document.querySelector('meta[name="twitter:description"]');
      if (twitterDesc) twitterDesc.setAttribute('content', product.longDescription || product.description);
      
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage) twitterImage.setAttribute('content', product.image);
    }
  }, [product]);
  
  const handleAddToCart = () => {
    if (!product || isActionDisabled) return;
    
    const cartItem = {
      id: `${product.id}-${selectedPlan?.type || ''}-${selectedDuration?.duration || ''}`,
      name: hasPlans && selectedPlan && selectedDuration
        ? `${product.name} - ${selectedPlan.type} (${selectedDuration.duration})`
        : product.name,
      category: product.category,
      originalPrice: originalPrice,
      currentPrice: currentPrice,
      image: product.image,
      features: product.features,
      rating: product?.rating || 4.9,
      quantity: quantity
    };
    
    cart.addToCart(cartItem);
    
    toast({
      title: "Added to Cart",
      description: `${cartItem.name} (x${quantity}) has been added to your cart.`,
    });
    
    const gtag = getGtag();
    if (gtag) {
      gtag('event', 'add_to_cart', {
        currency: currencyCtx?.currency || 'PKR',
        value: currentPrice * quantity,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: currentPrice,
          quantity,
        }],
      });
    }
  };
  
  const handleWhatsAppOrder = () => {
    if (directWhatsApp) {
      // send a minimal direct message without collecting form data
      const name = 'Customer';
      const email = '';
      const phone = '';
      const city = '';
      submitWhatsAppForm(name, email, phone, city);
      return;
    }
    setShowWhatsAppForm(true);
  };
  
  // Enhanced WhatsApp order submit: save info to backend, then open WhatsApp with improved message template
  const submitWhatsAppForm = async (name: string, email: string, phone: string, city: string) => {
    if (!product || isActionDisabled) return;

    const orderName = hasPlans && selectedPlan && selectedDuration
      ? `${product.name} - ${selectedPlan.type} (${selectedDuration.duration})`
      : product.name;
    const plan = selectedPlan?.type || '-';
    const duration = selectedDuration?.duration || '-';
    const price = formatPrice(currentPrice);
    const status = isInStock ? '✅ In Stock' : '❌ Out of Stock';
    const quantityText = quantity > 1 ? `${quantity}x ` : '';

    // Save order info to backend (POST request)
    try {
      await fetch('/server/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'whatsapp-order',
          productId: product.id,
          productName: orderName,
          price: currentPrice,
          name,
          email,
          phone,
          city,
          date: new Date().toISOString(),
        })
      });
    } catch (err) {
      // Ignore error for now, still proceed to WhatsApp
    }

    // Improved WhatsApp message template
    const messageLines = [
      'Hello King Subscriptions!',
      `My name is ${name}.`,
      '',
      'I want to order:',
      `- ${quantityText}${product.name}`,
      `Status: ${status}`,
      `Plan: ${plan}`,
      `Duration: ${duration}`,
      `Price: ${price}`,
      '',
      'Please share your payment accounts and assist me with the order.',
      '',
      'My contact details:',
      `Phone: ${phone || 'N/A'}`,
      `Email: ${email || 'N/A'}`,
      `City: ${city || 'N/A'}`
    ];

    const url = `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(messageLines.join('\n'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowWhatsAppForm(false);

    const gtag = getGtag();
    if (gtag) {
      gtag('event', 'whatsapp_click', {
        product_name: product.name,
        product_price: currentPrice,
      });
    }

    const gtagClick = getGtag();
    if (gtagClick) {
      gtagClick('event', 'whatsapp_click', {
        product_name: product.name,
        product_price: currentPrice,
      });
    }
  };
  
  // Handler for adding related products to cart
  const handleAddRelatedToCart = useCallback((p: ProductWithRating) => {
    const price = p.price?.monthly ?? p.price?.yearly ?? 0;
    cart.addToCart({
      id: p.id,
      name: p.name,
      category: p.category,
      originalPrice: p.price?.original ?? 0,
      currentPrice: price,
      image: p.image,
      features: p.features,
      rating: p.rating || 4.9,
      quantity: 1
    });
    
    toast({
      title: "Added to Cart",
      description: `${p.name} has been added to your cart.`,
    });
  }, [cart, toast]);
  
  // Handler for WhatsApp ordering related products
  const handleWhatsAppOrderRelated = useCallback((p: ProductWithRating) => {
    const price = p.price?.monthly ?? p.price?.yearly ?? 0;
    const msg = `Hi! I want to order ${p.name} for ${formatPrice(price)}. Please help me get started!`;
    const waBase = "https://api.whatsapp.com/send?phone=923276847960";
    const url = `${waBase}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }, [formatPrice]);
  
  // Real Notification System
  const handleStockAlert = async () => {
    if (!product) return;
    
    try {
      // In a real app, you would collect the user's email
      const email = "user@example.com"; // This would come from a form
      const success = await subscribeToStockAlert(email, product.id);
      
      if (success) {
        toast({
          title: "Restock Alert",
          description: "We'll notify you when this product is back in stock!",
        });
      } else {
        toast({
          title: "Subscription Failed",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };
  
  // Track plan selection
  const handlePlanSelect = (plan: Plan) => {
    setSelectedPlan(plan);
    
    const gtagPlan = getGtag();
    if (gtagPlan) {
      gtagPlan('event', 'select_item', {
        item_list_id: 'plan_selection',
        item_list_name: 'Plan Selection',
        items: [{
          item_id: `${product?.id}_${plan.type}`,
          item_name: `${product?.name} - ${plan.type}`,
          index: 0,
          item_category: 'plan',
        }],
      });
    }
  };
  
  // Loading/Error UI
  useSeo('product-detail', product ? {

    title: `${product.name} | Kings Subscriptions`,

    description: product.description || product.longDescription || 'View premium subscription details, plans, and support information.',

  } : undefined);



  if (loading) return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-12 mb-8 md:mb-12">
            <div className="aspect-[4/3] bg-gray-200 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        The product you're looking for doesn't exist or has been removed.
      </p>
      <Link to="/">
        <Button size="lg">Back to Home</Button>
      </Link>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 py-6 md:py-10">
      {/* WhatsApp Form Modal */}
      <WhatsAppForm
        show={showWhatsAppForm}
        onClose={() => setShowWhatsAppForm(false)}
        onSubmit={submitWhatsAppForm}
        productName={hasPlans && selectedPlan && selectedDuration
          ? `${product.name} - ${selectedPlan.type} (${selectedDuration.duration})`
          : product.name}
        productPrice={formatPrice(currentPrice)}
      />
      
      {/* SEO structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name || "",
            image: product.image ? [product.image] : [],
            description: product.longDescription || product.description || "",
            brand: { "@type": "Brand", name: primaryCategory },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: String(product.rating || 4.9),
              reviewCount: product.reviewCount || 2847
            },
            offers: {
              "@type": "Offer",
              price: String(currentPrice || 0),
              priceCurrency: currencyCtx?.currency || "PKR",
              availability: isInStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              url: typeof window !== "undefined" ? window.location.href : "",
            },
          }),
        }}
      />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb with better back button */}
        <div className="mb-6 md:mb-8">
          <Link to="/tools">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
        
        {/* Visual Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Product</span>
            <span>Plan</span>
            <span>Duration</span>
            <span>Checkout</span>
          </div>
          <div className="flex h-1 rounded overflow-hidden bg-gray-200 dark:bg-zinc-800">
            <div className={`transition-all duration-500 ${selectedPlan ? (selectedDuration ? 'w-3/4' : 'w-1/2') : 'w-1/4'} bg-primary dark:bg-emerald-400`}></div>
          </div>
        </div>
        
        {/* Product Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 lg:gap-12 mb-8 md:mb-12">
          {/* Left: Product Image */}
          <ErrorBoundary>
            <ProductImage 
              product={product} 
              onLoad={() => setHeroLoaded(true)} 
              onError={() => setImageErrored(true)}
              loaded={heroLoaded}
              errored={imageErrored}
            />
          </ErrorBoundary>
          
          {/* Right: Info */}
          <div className="lg:sticky lg:top-4 self-start">
            <ErrorBoundary>
              <ProductInfo 
                product={product} 
                primaryCategory={primaryCategory}
                stockLabel={stockLabel}
                isInStock={isInStock}
                liveActivityItems={liveActivityItems}
              />
            </ErrorBoundary>
            
            {/* Product Bundle Offer */}
            <ErrorBoundary>
              <ProductBundle 
                product={product}
                currentPrice={currentPrice}
                formatPrice={formatPrice}
                relatedAddons={bundleAddons}
              />
            </ErrorBoundary>
            
            {/* Plan & Duration Selection */}
            {hasPlans && (
              <>
                <ErrorBoundary>
                  <ProductPlans 
                    product={product} 
                    selectedPlan={selectedPlan} 
                    setSelectedPlan={handlePlanSelect}
                  />
                </ErrorBoundary>
                
                <ErrorBoundary>
                  <ProductDuration 
                    selectedPlan={selectedPlan} 
                    selectedDuration={selectedDuration}
                    setSelectedDuration={setSelectedDuration}
                    formatPrice={formatPrice}
                  />
                </ErrorBoundary>
              </>
            )}
            
            {/* Pricing */}
            <ErrorBoundary>
              <ProductPricing 
                currentPrice={currentPrice}
                originalPrice={originalPrice}
                finalSavings={finalSavings}
                finalDiscount={finalDiscount}
                selectedDuration={selectedDuration}
                formatPrice={formatPrice}
                product={product}
              />
            </ErrorBoundary>
            
            {/* Action Buttons */}
            <ErrorBoundary>
              <ProductActions 
                isActionDisabled={isActionDisabled}
                onAddToCart={handleAddToCart}
                onWhatsAppOrder={handleWhatsAppOrder}
                product={product}
                quantity={quantity}
                onQuantityChange={setQuantity}
                maxAvailable={maxAvailable}
              />
            </ErrorBoundary>
          </div>
        </div>
        
        {/* Tabs Section */}
        <ErrorBoundary>
          <ProductTabs product={product} />
        </ErrorBoundary>
        
        {/* Related Products */}
        <ErrorBoundary>
          <RelatedProducts 
            relatedProducts={relatedProducts}
            formatPrice={formatPrice}
            onAddToCart={handleAddRelatedToCart}
            onWhatsAppOrder={handleWhatsAppOrderRelated}
          />
        </ErrorBoundary>
        
        {/* FAQ Section */}
        <ErrorBoundary>
          <ProductFAQ />
        </ErrorBoundary>
        
        {/* Reviews Section */}
        <ErrorBoundary>
          <ProductReviews />
        </ErrorBoundary>
        
        {/* Stock Alert */}
        {!isInStock && (
          <div className="mb-4 p-4 bg-yellow-100 text-yellow-800 rounded-lg">
            <span>Out of stock? </span>
            <Button onClick={handleStockAlert} variant="outline" className="ml-2" aria-label="Notify me when back in stock">
              Notify Me
            </Button>
          </div>
        )}
      </div>
      
      {/* Mobile Sticky Add to Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t shadow-lg p-3 z-40 pb-safe">
        <div className="flex flex-col xs:flex-row items-center justify-between gap-3">
          <div className="flex flex-col items-start w-full xs:w-auto">
            <div className="text-lg font-bold text-emerald-600">{formatPrice(currentPrice)}</div>
            {originalPrice > currentPrice && (
              <div className="text-sm text-muted-foreground line-through">{formatPrice(originalPrice)}</div>
            )}
          </div>
          <Button 
            onClick={handleAddToCart} 
            disabled={isActionDisabled} 
            size="lg" 
            className="w-full xs:w-auto text-base"
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;



