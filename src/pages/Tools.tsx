import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import type { BadgeProps } from '@/components/ui/badge';
import {
  Search,
  Filter,
  SortAsc,
  Sparkles,
  Shield,
  Clock,
  Zap,
  ChevronDown,
  X,
  Grid3X3,
  List
} from 'lucide-react';
import ProductCardSimple from '@/components/ProductCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProducts } from '@/hooks/useProducts';
import { useSeo } from '@/context/SeoContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  popular?: boolean;
  price: {
    monthly?: number;
    yearly?: number;
  };
}

const Tools: React.FC = () => {
  useSeo('tools');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [priceRange, setPriceRange] = useState('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const isMobile = useIsMobile();

  // Fetch products from API
  const { data: productsData = [], isLoading, error } = useProducts() as { 
    data: Product[]; 
    isLoading: boolean;
    error: Error | null;
  };

  // Compute categories dynamically based on fetched products
  const categories = useMemo(() => {
    if (isLoading || !productsData.length) {
      return [{ id: 'all', name: 'All', count: 0 }];
    }
    const cats = Array.from(
      new Set<string>((productsData as Product[]).map((p) => p.category))
    );
    return [
      { id: 'all', name: 'All', count: productsData.length },
      ...cats.map((cat) => ({
        id: cat.toLowerCase(),
        name: cat,
        count: (productsData as Product[]).filter((p) => p.category === cat).length
      }))
    ];
  }, [productsData, isLoading]);

  // Price ranges for filtering
  const priceRanges = [
    { id: 'all', name: 'Any Price', min: 0, max: Infinity },
    { id: 'free', name: 'Free', min: 0, max: 0 },
    { id: 'under-10', name: 'Under $10', min: 0.01, max: 10 },
    { id: '10-25', name: '$10 - $25', min: 10, max: 25 },
    { id: '25-50', name: '$25 - $50', min: 25, max: 50 },
    { id: 'over-50', name: 'Over $50', min: 50, max: Infinity },
  ];

  const filteredProducts = useMemo(() => {
    if (isLoading || !productsData.length) {
      return [];
    }
    
    const selectedPriceRange = priceRanges.find(range => range.id === priceRange);
    
    return (productsData as Product[])
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategory === 'all' ||
          product.category.toLowerCase() === selectedCategory.toLowerCase();
        
        // Check price range
        const productPrice = product.price.monthly || product.price.yearly || 0;
        const matchesPrice = selectedPriceRange 
          ? productPrice >= selectedPriceRange.min && productPrice <= selectedPriceRange.max
          : true;
          
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') {
          if (a.popular && !b.popular) return -1;
          if (!a.popular && b.popular) return 1;
          return 0;
        }
        if (sortBy === 'price-low') {
          const aPrice = a.price.monthly || a.price.yearly || 0;
          const bPrice = b.price.monthly || b.price.yearly || 0;
          return aPrice - bPrice;
        }
        if (sortBy === 'price-high') {
          const aPrice = a.price.monthly || a.price.yearly || 0;
          const bPrice = b.price.monthly || b.price.yearly || 0;
          return bPrice - aPrice;
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [productsData, searchTerm, selectedCategory, sortBy, priceRange, isLoading]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('popular');
    setPriceRange('all');
  };

  // Show error state if API fails
  if (error) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-4 inline-block">
            <Shield className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Unable to Load Products</h2>
          <p className="text-muted-foreground mb-6">
            We're having trouble loading our product catalog. Please try again later.
          </p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show a skeleton loading state while products are being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen py-12 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          {/* Header Skeleton */}
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-6 rounded-full" />
            <Skeleton className="h-16 w-3/4 mx-auto mb-8" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-10" />
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Skeleton className="h-10 w-64 rounded-md" />
              <Skeleton className="h-8 w-72 rounded-md" />
            </div>
          </div>

          {/* Filter Skeleton */}
          <Card className="mb-12 shadow-xl border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <Skeleton className="h-12 flex-1 rounded-xl" />
                <div className="flex gap-2 flex-wrap justify-center">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-24 rounded-md" />
                  ))}
                </div>
                <Skeleton className="h-12 w-40 rounded-lg" />
              </div>
            </CardContent>
          </Card>

          {/* Products Grid Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-6 w-48" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-2/3 mb-6" />
                    <Skeleton className="h-10 w-full rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      {/* Hero Banner */}
      <div className="relative mb-0">
        <picture>
          <source
            srcSet="/get-paid-subscriptions-at-mobile.png"
            media="(max-width: 767px)"
          />
          <img
            src="/get-paid-subscriptions-at-desktop.png"
            alt="Hero Banner"
            className="w-full h-[300px] md:h-[400px] object-cover object-center"
            style={{ maxHeight: '400px' }}
          />
        </picture>
      </div>
      {/* Hero Text Section (below image) */}
      <div className="container mx-auto px-4 mt-8 text-center">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 text-orange-800 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-orange-200 dark:border-orange-800/30 backdrop-blur-sm justify-center">
          <Zap className="h-4 w-4" /> LIMITED TIME OFFER
        </div>
        <h1 className="text-4xl md:text-6xl font-black mb-8 tracking-tight text-foreground text-center">
          <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
            Premium Subscriptions
          </span>
          <br />
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Huge Discounts
          </span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
          Get access to the world's best AI, SEO, design, and productivity tools and subscriptions. 
          All at affordable and reasonable rates with full premium features.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-8">
          <div className="text-lg px-6 py-3 font-bold shadow-lg animate-pulse inline-flex items-center rounded-full bg-destructive text-destructive-foreground">
            <Clock className="mr-2 h-4 w-4" /> LIMITED TIME: Unbeatable Discounted Rates
          </div>
          <div className="bg-green-600 text-white px-4 py-2 font-semibold inline-flex items-center rounded-full">
            <Sparkles className="mr-1 h-4 w-4" /> Instant Setup <Shield className="mr-1 h-4 w-4" /> Money Back Guarantee  <Clock className="mr-1 h-4 w-4" /> 24/7 Support
          </div>
        </div>
      </div>
      {/* Search and Filters */}
      <div className="container mx-auto px-4">
        {/* Search and Filters */}
        <Card className="mb-8 shadow-xl border-2 border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    placeholder="Search premium tools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 py-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
                
                <div className="flex gap-2 items-center">
                  {/* View Mode Toggle - Only visible on mobile */}
                  <div className="md:hidden">
                    <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'list')}>
                      <ToggleGroupItem value="grid" aria-label="Grid view" size="sm">
                        <Grid3X3 className="h-4 w-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem value="list" aria-label="List view" size="sm">
                        <List className="h-4 w-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  
                  <Button
                    variant="outline"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                        <DropdownMenuRadioItem value="popular">🔥 Most Popular</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="name">A-Z Alphabetical</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-low">💰 Price: Low to High</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="price-high">💎 Price: High to Low</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {(searchTerm || selectedCategory !== 'all' || priceRange !== 'all') && (
                    <Button variant="ghost" onClick={clearFilters} className="text-sm">
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Expanded Filters */}
              {isFilterOpen && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                  <div>
                    <h3 className="font-medium mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <Button
                          key={category.id}
                          variant={selectedCategory === category.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(category.id)}
                          className={`border-2 font-semibold transition-all duration-200 ${
                            selectedCategory === category.id 
                              ? 'shadow-lg scale-105' 
                              : 'hover:scale-105 hover:shadow-md'
                          }`}
                        >
                          {category.name} <span className="ml-1 text-xs opacity-80">({category.count})</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3">Price Range</h3>
                    <div className="flex flex-wrap gap-2">
                      {priceRanges.map((range) => (
                        <Button
                          key={range.id}
                          variant={priceRange === range.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPriceRange(range.id)}
                          className={`border-2 font-semibold transition-all duration-200 ${
                            priceRange === range.id 
                              ? 'shadow-lg scale-105' 
                              : 'hover:scale-105 hover:shadow-md'
                          }`}
                        >
                          {range.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} of {productsData.length} premium tools
            {selectedCategory !== 'all' && ` in "${categories.find(c => c.id === selectedCategory)?.name}"`}
            {priceRange !== 'all' && ` within "${priceRanges.find(r => r.id === priceRange)?.name}"`}
          </p>
          
          {filteredProducts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popular">Most Popular</SelectItem>
                  <SelectItem value="name">A-Z Alphabetical</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className={cn(
            "gap-3 mb-12",
            // Enhanced mobile responsive grid: 2 columns in grid mode, 1 column in list mode, fallback to 1 col on very small screens
            viewMode === 'grid'
              ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {filteredProducts.map((product) => (
              <div key={product.id}>
                <ProductCardSimple product={product} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-16 mb-12">
            <CardContent>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-4">No tools found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Try adjusting your search or filter criteria. We have many premium tools that might match your needs.
              </p>
              <Button onClick={clearFilters}>
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white text-center overflow-hidden relative">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10"></div>
          <div className="absolute -left-12 -bottom-12 h-32 w-32 rounded-full bg-white/10"></div>
          <CardContent className="p-8 relative z-10">
            <h2 className="text-3xl font-bold mb-4">
              Can't Find What You're Looking For?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              We're constantly adding new premium tools. Contact us for custom requests!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="https://wa.me/923276847960" target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 font-semibold">
                  💬 Contact Support
                </Button>
              </a>
              <a href="https://wa.me/923276847960?text=Hi! I'd like to request a custom tool subscription. Please let me know how I can get started." target="_blank" rel="noopener noreferrer">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 font-semibold">
                  📝 Request a Tool
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Tools;