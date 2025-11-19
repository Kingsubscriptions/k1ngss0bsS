import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from '@/lib/utils';
import {
  ShieldCheck,
  Star,
  CheckCircle,
  ShoppingCart,
  Tag,
  Zap,
  AlertCircle,
  Clock,
  Users,
  Shield,
  Truck,
  Eye,
  MessageCircle
} from "lucide-react";
import type { LucideIcon } from 'lucide-react';
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from '@/context/SettingsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { getProductImage, getStockLabel, isProductInStock } from "@/data/products";
import OptimizedImage from "@/components/OptimizedImage";

/* ---------- Helper Functions & Hooks ---------- */
function safeNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function useSafeCurrency() {
  try {
    const currencyCtx = useCurrency();
    if (!currencyCtx) throw new Error();
    return currencyCtx;
  } catch {
    return {
      formatPrice: (x: number) => `PKR ${Number(x || 0).toLocaleString()}`,
    };
  }
}

function useSafeCart() {
  try {
    const cartCtx = useCart();
    if (!cartCtx) throw new Error();
    return cartCtx;
  } catch {
    return { addToCart: (_: unknown) => console.error("Cart context not found.") };
  }
}

/* ---------- Custom Hooks ---------- */
function useProductPricing(price: AnyProduct['price']) {
  return useMemo(() => {
    const current = safeNum(price?.monthly) || safeNum(price?.yearly) || 0;
    let original = safeNum(price?.original) || 0;

    if (original > 0 && current > 0 && original <= current) {
      original = current * 1.5;
    } else if (original === 0 && current > 0) {
      original = current * 2;
    }

    const savings = Math.max(original - current, 0);
    const discount = original > 0 ? Math.round((savings / original) * 100) : 0;

    return { current, original, savings, discount };
  }, [price]);
}

function useStockInfo(stock: AnyProduct['stock']) {
  return useMemo(() => {
    const isInStock = isProductInStock(stock);
    const label = getStockLabel(stock);
    let quantity = 0;

    if (typeof stock === 'number') {
      quantity = stock;
    }

    return { isInStock, label, quantity };
  }, [stock]);
}

/* ---------- Data Type for Product ---------- */
type AnyProduct = {
  id: string;
  name: string;
  category: string;
  image?: string;
  images?: string[];
  features?: string[];
  rating?: number;
  price?: { monthly?: number; yearly?: number; original?: number };
  stockStatus?: "in_stock" | "out_of_stock";
  badge?: string;
  stock?: boolean | number | "unlimited";
};

type WhatsAppOrderForm = {
  name: string;
  email: string;
  phone: string;
  city: string;
};

interface WhatsAppOrderPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AnyProduct;
  price: number;
  onOrder: (form: WhatsAppOrderForm) => void;
  idPrefix: string;
}

// WhatsApp Order Popup Form
function WhatsAppOrderPopup({ open, onOpenChange, product, price, onOrder, idPrefix }: WhatsAppOrderPopupProps) {
  const [form, setForm] = useState<WhatsAppOrderForm>({ name: '', email: '', phone: '', city: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);
  const fieldPrefix = idPrefix || (product?.id ?? "product");

  useEffect(() => {
    if (open && nameRef.current) nameRef.current.focus();
    if (!open) setForm({ name: "", email: "", phone: "", city: "" });
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Name and phone are required.");
      return;
    }
    setLoading(true);
    try {
      // Save to backend
      await fetch("/api/products/whatsapp-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          product: product.name,
          price,
        }),
      });
      setLoading(false);
      onOrder(form);
      onOpenChange(false);
    } catch (err) {
      setError("Failed to save order. Try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent aria-modal="true" role="dialog" className="max-w-md w-full">
        <DialogHeader>
          <h2 className="text-lg font-bold">Order via WhatsApp</h2>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3" aria-label="WhatsApp Order Form">
          <Input
            ref={nameRef}
            id="wa_name"
            name="name"
            placeholder="Your Name*"
            value={form.name}
            onChange={handleChange}
            aria-label="Name"
            required
            autoComplete="name"
          />
          <Input
            id="wa_email"
            name="email"
            placeholder="Email (optional)"
            value={form.email}
            onChange={handleChange}
            aria-label="Email"
            type="email"
            autoComplete="email"
          />
          <Input
            id="wa_phone"
            name="phone"
            placeholder="Phone Number*"
            value={form.phone}
            onChange={handleChange}
            aria-label="Phone"
            required
            autoComplete="tel"
          />
          <Input
            id="wa_city"
            name="city"
            placeholder="City (optional)"
            value={form.city}
            onChange={handleChange}
            aria-label="City"
            autoComplete="address-level2"
          />
          {error && <div className="text-red-600 text-xs">{error}</div>}
          <DialogFooter>
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading} aria-label="Submit WhatsApp Order">
              <span className="font-bold flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Place Order & Open WhatsApp
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- The Optimized Component ---------- */

export default function ProductCardSimple({ product, viewMode = 'grid' }: { product: AnyProduct; viewMode?: 'grid' | 'list' }) {
  const { formatPrice } = useSafeCurrency();
  const { addToCart } = useSafeCart();
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [waOpen, setWaOpen] = useState(false);
  const isMobile = useIsMobile();

  const { settings } = useSettings();
  const whatsappNumberDigits = settings.whatsappNumber.replace(/\D/g, '') || '923276847960';
  const directWhatsApp = settings.whatsappDirectOrder;
  const showDiscountBadges = settings.showDiscountBadges;

  // Use utility functions for image and stock
  const imageSrc = getProductImage(product.image);
  const { current, original, savings, discount } = useProductPricing(product.price);
  const { isInStock, quantity } = useStockInfo(product.stock);
  const primaryCategory = product.category.split(',')[0].trim();
  const featureList = (product.features ?? []).filter(Boolean).slice(0, 4);
  const isList = viewMode === 'list';

  // Generate random purchase count (for social proof)
  const randomPurchaseCount = useMemo(() => Math.floor(Math.random() * 500) + 50, []);

  const handleAddToCart = () => {
    if (!isInStock) return;
    addToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      originalPrice: original || current,
      currentPrice: current,
      image: product.image ?? '',
      features: product.features ?? [],
      rating: product.rating ?? 4.9,
      quantity: 1,
    });
  };

  const handleWhatsAppAction = () => {
    if (directWhatsApp) {
      handleWhatsAppOrder({ name: 'Customer', phone: '', email: '', city: '' });
      return;
    }
    setWaOpen(true);
  };

  const handleWhatsAppOrder = (form: WhatsAppOrderForm) => {
    const currentDate = new Date().toLocaleDateString();
    const limitedOffer = discount > 15 ? `*Limited Time Offer:* This ${discount}% discount is valid only until tomorrow!` : '';
    const message = `Hello! I want to order:
 
*Product:* ${product.name}
*Price:* ${formatPrice(current)} ${discount > 0 ? `(Save ${discount}%)` : ''}
${limitedOffer}
 
*Name:* ${form.name}
*Phone:* ${form.phone}
${form.email ? `*Email:* ${form.email}
` : ''}${form.city ? `*City:* ${form.city}
` : ''}*Reference:* ${product.id}
*Date:* ${currentDate}
 
Please send me payment details. Thank you!`;
    const url = `https://wa.me/${whatsappNumberDigits}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // List View for Mobile
  if (isList && isMobile) {
    return (
      <>
        <WhatsAppOrderPopup
          open={!directWhatsApp && waOpen}
          onOpenChange={setWaOpen}
          product={product}
          price={current}
          onOrder={handleWhatsAppOrder}
          idPrefix={product.id}
        />
        <Card className={cn(
          'group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-md',
          !isInStock && 'opacity-75'
        )}>
          <div className="flex items-center p-2 gap-3">
            {/* Small Image on Left */}
            <div className="relative flex-shrink-0 w-16 h-12 rounded-md overflow-hidden bg-muted/40">
              <OptimizedImage
                src={imageSrc}
                alt={product.name}
                width={64}
                height={48}
                className="w-full h-full"
                placeholder="/placeholder-image.jpg"
                onLoad={() => setImgLoading(false)}
                onError={() => setImgError(true)}
              />
            </div>

            {/* Product Info - Center */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-1 mb-1">{product.name}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                <span className={cn(
                  "inline-flex items-center px-1.5 py-0.5 text-xs font-semibold rounded",
                  isInStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {isInStock ? "In Stock" : "Out of Stock"}
                </span>
              </div>
              <div className="text-base font-bold text-primary">{formatPrice(current)}</div>
            </div>

            {/* Action Icons - Right Side */}
            <div className="flex items-center gap-1">
              <Link to={`/product/${product.id}`}>
                <Button size="sm" variant="outline" disabled={!isInStock} className="p-2 h-8 w-8 border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700">
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="outline"
                onClick={handleWhatsAppAction}
                disabled={!isInStock}
                className="p-2 h-8 w-8 border-green-200 bg-green-50 hover:bg-green-100 text-green-700"
              >
                <MessageCircle className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddToCart}
                disabled={!isInStock}
                className="p-2 h-8 w-8 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      </>
    );
  }

  // Grid View - Responsive for both Mobile and Desktop
  return (
    <>
      <WhatsAppOrderPopup
        open={!directWhatsApp && waOpen}
        onOpenChange={setWaOpen}
        product={product}
        price={current}
        onOrder={handleWhatsAppOrder}
        idPrefix={product.id}
      />
      <Card className="group h-full flex flex-col border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg">
        <CardContent className={cn("flex flex-col flex-1", isMobile ? "p-3" : "p-4")}>
          {/* Image Area - Smaller on Mobile */}
          <div className="relative mb-3">
            <div className={cn(
              "w-full relative rounded-md overflow-hidden bg-muted/40 flex items-center justify-center p-4",
              isMobile ? "aspect-[4/3] min-h-[120px]" : "aspect-square sm:aspect-[4/3] min-h-[200px]"
            )}>
              <OptimizedImage
                src={product.images?.[0] || imageSrc}
                alt={`Logo for ${product.name}`}
                width={isMobile ? 200 : 400}
                height={isMobile ? 150 : 300}
                className={cn(
                  "w-full h-full transition-transform duration-300 group-hover:scale-105",
                  imgLoading ? 'blur-sm' : 'blur-0'
                )}
                objectFit="contain"
                placeholder="/images/default-image.jpg"
                onLoad={() => setImgLoading(false)}
                onError={() => setImgError(true)}
              />
            </div>

            {/* Product Badge */}
            {product.badge && (
              <div className="absolute top-1.5 left-1.5">
                <span className={cn(
                  "font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200",
                  isMobile ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs"
                )}>
                  {product.badge}
                </span>
              </div>
            )}

            {/* Verified Badge */}
            <div className="absolute top-1.5 right-1.5" role="status" aria-label="Verified Product">
              <span className={cn(
                "font-semibold rounded-full text-white bg-green-600 flex items-center gap-1",
                isMobile ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1"
              )}>
                <ShieldCheck className={cn(isMobile ? "w-2.5 h-2.5" : "w-3 h-3")} aria-hidden="true" />
                {isMobile ? "✓" : "Verified"}
              </span>
            </div>

            {/* Low Stock Warning */}
            {isInStock && quantity > 0 && quantity < 10 && (
              <div className={cn(
                "absolute bottom-1.5 left-1.5 bg-amber-100 text-amber-800 rounded font-medium",
                isMobile ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs"
              )} role="status" aria-label={`Only ${quantity} left in stock`}>
                <AlertCircle className="inline-block w-3 h-3 mr-1" aria-hidden="true" />
                Only {quantity} left!
              </div>
            )}
          </div>

          {/* Title & Category */}
          <h3 className={cn(
            "font-bold mb-1 line-clamp-2",
            isMobile ? "text-sm" : "text-lg"
          )}>{product.name}</h3>
          <div className={cn(
            "flex items-center gap-1.5 text-muted-foreground mb-2",
            isMobile ? "text-xs" : "text-xs"
          )}>
            <Tag className={cn(isMobile ? "w-2.5 h-2.5" : "w-3 h-3", "opacity-70")} aria-hidden="true" />
            <span className="truncate">Category: {primaryCategory}</span>
          </div>

          {/* Stock Status Pill */}
          <div className="mb-2" role="status" aria-label={isInStock ? "In Stock" : "Out of Stock"}>
            {isInStock ? (
              <span className={cn(
                "inline-flex items-center font-semibold rounded-full bg-green-100 text-green-800",
                isMobile ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
              )}>
                <CheckCircle className={cn(isMobile ? "w-2.5 h-2.5 mr-0.5" : "w-3 h-3 mr-1")} aria-hidden="true" />
                In Stock
              </span>
            ) : (
              <span className={cn(
                "inline-flex items-center font-semibold rounded-full bg-red-100 text-red-800",
                isMobile ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
              )}>
                <AlertCircle className={cn(isMobile ? "w-2.5 h-2.5 mr-0.5" : "w-3 h-3 mr-1")} aria-hidden="true" />
                Out of Stock
              </span>
            )}
          </div>

          {/* Single Line Rating + Social Proof */}
          <div className={cn(
            "flex items-center gap-1 text-muted-foreground mb-3",
            isMobile ? "text-xs" : "text-sm"
          )} role="status" aria-label={`Rating: ${(product.rating ?? 4.9).toFixed(1)} out of 5 stars. ${randomPurchaseCount.toLocaleString()} bought.`}>
            <Star className={cn(
              "fill-yellow-400 text-yellow-400",
              isMobile ? "w-3 h-3" : "w-4 h-4"
            )} aria-hidden="true" />
            <span className="font-semibold">
              {(product.rating ?? 4.9).toFixed(1)}
            </span>
            <span className="text-muted-foreground">·</span>
            <span>{randomPurchaseCount.toLocaleString()} bought</span>
          </div>

          {/* Features - Vertical List for Both PC and Mobile */}
          <div className={cn(
            "mb-4 space-y-2",
            isMobile ? "text-xs" : "text-sm"
          )} aria-label="Product Features">
            {(product.features?.slice(0, 4) || []).map((feature, i) => (
              <div key={i} className="flex items-start text-muted-foreground">
                <CheckCircle className={cn(
                  "text-green-500 flex-shrink-0 mt-0.5",
                  isMobile ? "w-3 h-3 mr-1.5" : "w-4 h-4 mr-2"
                )} aria-hidden="true" />
                <span className="leading-tight">{feature}</span>
              </div>
            ))}
          </div>

          {/* Slimmer Pricing Box */}
          <div className={cn(
            "mt-auto mb-3 rounded-lg border border-blue-100 relative bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 dark:border-blue-900",
            isMobile ? "p-1.5" : "p-3"
          )}>
            {showDiscountBadges && discount > 0 && (
              <div className="absolute -top-2 -right-2">
                <span className={cn(
                  "font-bold rounded-full bg-red-500 text-white animate-pulse",
                  isMobile ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-xs"
                )}>
                  {discount}% OFF
                </span>
              </div>
            )}
            <div className="flex items-center justify-between mb-1">
              <span className={cn(
                "text-muted-foreground line-through",
                isMobile ? "text-xs" : "text-sm"
              )}>{formatPrice(original)}</span>
            </div>
            <div className={cn(
              "font-extrabold text-primary",
              isMobile ? "text-lg" : "text-2xl"
            )}>{formatPrice(current)}</div>
            {savings > 0 && (
              <div className="text-xs text-muted-foreground mt-1">You save {formatPrice(savings)}</div>
            )}
          </div>

          {/* Trust Badges */}
          <div className={cn(
            "flex items-center justify-between mb-3 text-muted-foreground",
            isMobile ? "text-xs" : "text-xs"
          )} aria-label="Trust Badges">
            <div className="flex items-center" aria-label="Secure Transaction">
              <Shield className={cn(isMobile ? "w-2.5 h-2.5 mr-0.5" : "w-3 h-3 mr-1")} aria-hidden="true" />
              Secure
            </div>
            <div className="flex items-center" aria-label="Free Delivery">
              <Truck className={cn(isMobile ? "w-2.5 h-2.5 mr-0.5" : "w-3 h-3 mr-1")} aria-hidden="true" />
              Free Delivery
            </div>
          </div>

          {/* Action Buttons - Fixed for very small screens */}
          <div className={cn("space-y-2", isMobile ? "space-y-1.5" : "")}>
            <Link to={`/product/${product.id}`} className="block" tabIndex={0} aria-label={`View details for ${product.name}`}>
              <Button variant="outline" className={cn(
                "w-full flex items-center justify-center gap-1 min-h-[36px]",
                isMobile ? "text-xs px-2 py-1.5" : "gap-2"
              )} disabled={!isInStock} aria-label="View Details">
                <Tag className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
                <span className={cn(isMobile ? "truncate" : "")}>
                  {isMobile ? "View Details" : "View Details & Plans"}
                </span>
              </Button>
            </Link>
            <Button
              className={cn(
                "w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-1 min-h-[36px]",
                isMobile ? "text-xs px-2 py-1.5" : "gap-2"
              )}
              onClick={handleWhatsAppAction}
              disabled={!isInStock}
              aria-label={`Order ${product.name} via WhatsApp`}
              tabIndex={0}
            >
              <MessageCircle className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              <span className={cn("font-bold", isMobile ? "truncate" : "")}>
                {isMobile ? "Order WhatsApp" : "Order via WhatsApp"}
              </span>
            </Button>
            <Button
              variant="secondary"
              className={cn(
                "w-full flex items-center justify-center gap-1 min-h-[36px]",
                isMobile ? "text-xs px-2 py-1.5" : "gap-2"
              )}
              onClick={handleAddToCart}
              disabled={!isInStock}
              aria-label="Add to Cart"
              tabIndex={0}
            >
              <ShoppingCart className={cn(isMobile ? "w-3 h-3" : "w-4 h-4")} />
              <span className={cn(isMobile ? "truncate" : "")}>Add to Cart</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
