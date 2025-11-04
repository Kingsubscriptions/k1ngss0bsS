
import { useState } from "react";
import { Product } from "@/data/products";
import { useProductsContext } from "@/context/ProductsContext";
import ProductCardSimple from "@/components/ProductCard";
import { useSeo } from '@/context/SeoContext';
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AllProducts() {
  const { products } = useProductsContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const isMobile = useIsMobile();
  useSeo('products');
  
  return (
    <div className="min-h-[60vh] bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold">All Products</h1>
          
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
        </div>
        
        <div className={cn(
          "gap-3 items-stretch",
          // Enhanced mobile responsive grid: 2 columns in grid mode, 1 column in list mode
          viewMode === 'grid'
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        )}>
          {products.map((p) => (
            <div key={p.id}>
              <ProductCardSimple product={p as Product} viewMode={viewMode} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
