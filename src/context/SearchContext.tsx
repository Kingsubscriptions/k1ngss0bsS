import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SearchFilters {
  query: string;
  category: string;
  priceRange: [number, number];
  rating: number;
  inStock: boolean;
  sortBy: 'name' | 'price-low' | 'price-high' | 'rating' | 'newest';
}

interface SearchContextType {
  filters: SearchFilters;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  searchResults: any[];
  isSearching: boolean;
  performSearch: (products: any[]) => void;
  suggestions: string[];
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

const defaultFilters: SearchFilters = {
  query: '',
  category: 'all',
  priceRange: [0, 10000],
  rating: 0,
  inStock: false,
  sortBy: 'name'
};

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Generate search suggestions based on product data
  useEffect(() => {
    const generateSuggestions = async () => {
      try {
        // This would typically fetch from an API
        const popularSearches = [
          'Netflix Premium',
          'Spotify Premium',
          'Canva Pro',
          'VPN Services',
          'AI Tools',
          'Microsoft Office',
          'Streaming Services'
        ];
        setSuggestions(popularSearches);
      } catch (error) {
        console.error('Failed to generate suggestions:', error);
      }
    };

    generateSuggestions();
  }, []);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const performSearch = (products: any[]) => {
    setIsSearching(true);

    setTimeout(() => {
      let results = [...products];

      // Apply search query filter
      if (filters.query.trim()) {
        const query = filters.query.toLowerCase();
        results = results.filter(product =>
          product.name.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.features && product.features.some((feature: string) =>
            feature.toLowerCase().includes(query)
          ))
        );
      }

      // Apply category filter
      if (filters.category !== 'all') {
        results = results.filter(product =>
          product.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }

      // Apply price range filter
      results = results.filter(product => {
        const price = product.price?.monthly || product.price?.yearly || 0;
        return price >= filters.priceRange[0] && price <= filters.priceRange[1];
      });

      // Apply rating filter
      if (filters.rating > 0) {
        results = results.filter(product =>
          (product.rating || 0) >= filters.rating
        );
      }

      // Apply stock filter
      if (filters.inStock) {
        results = results.filter(product =>
          product.stock !== 'false' && product.stock !== false && product.stock !== 0
        );
      }

      // Apply sorting
      results.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-low':
            return (a.price?.monthly || 0) - (b.price?.monthly || 0);
          case 'price-high':
            return (b.price?.monthly || 0) - (a.price?.monthly || 0);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'newest':
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          case 'name':
          default:
            return a.name.localeCompare(b.name);
        }
      });

      setSearchResults(results);
      setIsSearching(false);
    }, 300); // Debounce search
  };

  const value: SearchContextType = {
    filters,
    updateFilters,
    resetFilters,
    searchResults,
    isSearching,
    performSearch,
    suggestions
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};
