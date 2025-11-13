import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, X, Star, ArrowLeft, ShoppingCart } from "lucide-react";
import { Product } from "@/data/products";
import { useSeo } from '@/context/SeoContext';
import { useProductsContext } from "@/context/ProductsContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function Compare() {
  useSeo('compare');
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const { products } = useProductsContext();
  const { formatPrice } = useCurrency();
  const { addToCart } = useCart();

  const addProductToCompare = (productId: string) => {
    if (selectedProducts.length >= 4) return;
    
    const product = products.find(p => p.id === productId);
    if (product && !selectedProducts.find(p => p.id === productId)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProductFromCompare = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  // Get current price for a product
  const getCurrentPrice = (product: Product): number => {
    const price = product.price || {};
    return price.monthly ?? price.yearly ?? price.original ?? 0;
  };

  // Get original price for a product
  const getOriginalPrice = (product: Product): number => {
    const price = product.price || {};
    return price.original ?? price.monthly ?? price.yearly ?? 0;
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4" data-testid="compare-title">
            Compare Premium Tools
          </h1>
          <p className="text-xl text-muted-foreground">
            Compare features, pricing, and plans to find the perfect tools for your needs
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link to="/tools">
            <Button variant="outline" className="border-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </Link>
        </div>

        {/* Product Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Products to Compare (Max 4)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select onValueChange={addProductToCompare}>
                <SelectTrigger data-testid="product-selector">
                  <SelectValue placeholder="Choose a product to compare" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.id}
                      value={product.id}
                      disabled={selectedProducts.some(p => p.id === product.id)}
                    >
                      {product.name} - {product.category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex flex-wrap gap-2">
                {selectedProducts.map((product) => (
                  <Badge
                    key={product.id}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-1"
                  >
                    {product.name}
                    <X
                      className="w-4 h-4 cursor-pointer hover:text-destructive"
                      onClick={() => removeProductFromCompare(product.id)}
                      data-testid={`remove-${product.id}`}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        {selectedProducts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Comparison</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold text-foreground">Feature</th>
                    {selectedProducts.map((product) => (
                      <th key={product.id} className="text-center p-4 min-w-[200px]">
                        <div className="space-y-2">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg mx-auto"
                          />
                          <h3 className="font-semibold text-foreground">{product.name}</h3>
                          <Badge className="bg-primary/10 text-primary">
                            {product.category}
                          </Badge>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Pricing Row */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-foreground">Current Price</td>
                    {selectedProducts.map((product) => {
                      const currentPrice = getCurrentPrice(product);
                      const originalPrice = getOriginalPrice(product);
                      return (
                        <td key={product.id} className="p-4 text-center">
                          <div className="space-y-1">
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(currentPrice)}
                            </div>
                            {originalPrice > currentPrice && (
                              <div className="text-sm text-muted-foreground line-through">
                                {formatPrice(originalPrice)}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rating Row */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-foreground">Rating</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-1">
                          <div className="flex text-yellow-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-4 h-4 fill-current"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground ml-1">
                            (4.9)
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          2,847 reviews
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Plans Available */}
                  {selectedProducts.some(p => p.plans && p.plans.length > 0) && (
                    <tr className="border-b">
                      <td className="p-4 font-medium text-foreground">Available Plans</td>
                      {selectedProducts.map((product) => (
                        <td key={product.id} className="p-4 text-center">
                          <div className="space-y-1">
                            {product.plans?.map((plan) => (
                              <Badge key={plan.type} variant="outline" className="text-xs block mb-1">
                                {plan.type}
                              </Badge>
                            )) || (
                              <Badge variant="outline" className="text-xs">
                                Standard Plan
                              </Badge>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  )}

                  {/* Duration Options */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-foreground">Duration Options</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        <div className="space-y-1">
                          {product.price.monthly && (
                            <Badge variant="outline" className="text-xs block mb-1">
                              Monthly
                            </Badge>
                          )}
                          {product.price.yearly && (
                            <Badge variant="outline" className="text-xs block mb-1">
                              Yearly
                            </Badge>
                          )}
                          {product.plans?.map((plan) =>
                            plan.durations.map((duration) => (
                              <Badge key={`${plan.type}-${duration.duration}`} variant="outline" className="text-xs block mb-1">
                                {duration.duration}
                              </Badge>
                            ))
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Stock Status */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-foreground">Availability</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4 text-center">
                        <Badge
                          variant="default"
                          className="flex items-center justify-center gap-1 w-fit mx-auto"
                        >
                          <CheckCircle className="w-3 h-3" />
                          In Stock
                        </Badge>
                      </td>
                    ))}
                  </tr>

                  {/* Key Features */}
                  <tr className="border-b">
                    <td className="p-4 font-medium text-foreground">Key Features</td>
                    {selectedProducts.map((product) => (
                      <td key={product.id} className="p-4">
                        <ul className="space-y-1 text-sm">
                          {product.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="flex items-start text-left">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Actions */}
                  <tr>
                    <td className="p-4 font-medium text-foreground">Actions</td>
                    {selectedProducts.map((product) => {
                      const currentPrice = getCurrentPrice(product);
                      const originalPrice = getOriginalPrice(product);
                      const savings = originalPrice - currentPrice;
                      const discountPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
                      
                      return (
                        <td key={product.id} className="p-4">
                          <div className="space-y-2">
                            <Link to={`/product/${product.id}`} className="w-full block">
                              <Button
                                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                                size="sm"
                                data-testid={`view-details-${product.id}`}
                              >
                                View Details
                              </Button>
                            </Link>
                            <WhatsAppButton
                              message={`🚀 URGENT: I want ${product.name}!

💰 Price: ${formatPrice(currentPrice)} (${discountPercentage}% OFF!)
💵 I Save: ${formatPrice(savings)}
⚡ Instant Setup in 2 Minutes

Please confirm my order NOW before this deal expires!`}
                              variant="default"
                              className="w-full bg-green-500 text-white hover:bg-green-600"
                              text="Order via WhatsApp"
                              data-testid={`order-whatsapp-${product.id}`}
                            />
                            <Button
                              variant="outline"
                              className="w-full border-2 border-primary text-primary hover:bg-primary hover:text-white"
                              size="sm"
                              onClick={() => addToCart({
                                id: product.id,
                                name: product.name,
                                category: product.category,
                                originalPrice: originalPrice,
                                currentPrice: currentPrice,
                                image: product.image,
                                features: product.features || [],
                                rating: 4.9
                              })}
                            >
                              <ShoppingCart className="h-4 w-4 mr-2" />
                              Add to Cart
                            </Button>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {selectedProducts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-muted-foreground mb-4">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products selected</h3>
                <p>Choose products from the dropdown above to start comparing</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comparison Tips */}
        <Card className="mt-8 bg-muted/50">
          <CardHeader>
            <CardTitle>Comparison Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-semibold mb-2">Compare Pricing</h4>
                <p className="text-sm text-muted-foreground">
                  Look at both current and original prices to understand the value
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">⭐</div>
                <h4 className="font-semibold mb-2">Check Ratings</h4>
                <p className="text-sm text-muted-foreground">
                  Higher ratings and more reviews indicate better user satisfaction
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔧</div>
                <h4 className="font-semibold mb-2">Review Features</h4>
                <p className="text-sm text-muted-foreground">
                  Make sure the product includes all the features you need
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
