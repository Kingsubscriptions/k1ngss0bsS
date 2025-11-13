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
  Eye,
  MessageCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useCurrency } from "@/context/CurrencyContext";
import { useCart } from "@/context/CartContext";
import { useSettings } from '@/context/SettingsContext';
import { getProductImage, getStockLabel, isProductInStock } from "@/data/products";

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
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
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

/* ---------- Mobile Optimized Component ---------- */
export default function MobileProductCard({ product, viewMode = 'grid' }: { product: AnyProduct; viewMode?: 'grid' | 'list' }) {
  const { formatPrice } = useSafeCurrency();
  const { addToCart } = useSafeCart();
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(true);
  const [waOpen, setWaOpen] = useState(false);

  const { settings } = useSettings();
  const whatsappNumberDigits = settings.whatsappNumber.replace(/\D/g, '') || '923276847960';
  const directWhatsApp = settings.whatsappDirectOrder;

  const imageSrc = getProductImage(product.image);
  const { current, original, savings, discount } = useProductPricing(product.price);
  const { isInStock, quantity } = useStockInfo(product.stock);
  const primaryCategory = product.category.split(',')[0].trim();
  const featureList = (product.features ?? []).filter(Boolean).slice(0, 4);
  const isList = viewMode === 'list';

  const randomPurchaseCount = useMemo(() => {
    const min = 120;
    const max = 420;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, []);

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

  const handleWhatsAppAction = () => {
    if (directWhatsApp) {
      handleWhatsAppOrder({ name: 'Customer', phone: '', email: '', city: '' });
      return;
    }
    setWaOpen(true);
  };

  const ActionTile: React.FC<{
    icon: LucideIcon;
    lines: [string, string];
    onClick?: () => void;
    to?: string;
    disabled?: boolean;
    variant?: 'view' | 'whatsapp' | 'cart';
  }> = ({ icon: Icon, lines, onClick, to, disabled, variant = 'view' }) => {
    
    // Define colors for each button type
    const getVariantClasses = () => {
      if (disabled) return {
        container: 'cursor-not-allowed opacity-50 bg-muted/40 border-muted',
        icon: 'bg-muted text-muted-foreground',
        text: 'text-muted-foreground'
      };
      
      switch (variant) {
        case 'whatsapp':
          return {
            container: 'hover:border-green-300 hover:bg-green-50 bg-green-50/50 border-green-200',
            icon: 'bg-green-100 text-green-700',
            text: 'text-green-700'
          };
        case 'cart':
          return {
            container: 'hover:border-purple-300 hover:bg-purple-50 bg-purple-50/50 border-purple-200',
            icon: 'bg-purple-100 text-purple-700',
            text: 'text-purple-700'
          };
        case 'view':
        default:
          return {
            container: 'hover:border-blue-300 hover:bg-blue-50 bg-blue-50/50 border-blue-200',
            icon: 'bg-blue-100 text-blue-700',
            text: 'text-blue-700'
          };
      }
    };

    const classes = getVariantClasses();
    
    const content = (
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
          classes.container
        )}
      >
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-full', classes.icon)}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="leading-tight text-xs text-muted-foreground">{lines[0]}</span>
        <span className={cn('leading-tight font-bold text-xs', classes.text)}>{lines[1]}</span>
      </div>
    );

    if (to) {
      return (
        <Link to={to} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        className="block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {content}
      </button>
    );
  };

  // List View for Mobile - completely redesigned
  if (isList) {
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
            {/* Very Small Image on Left */}
            <div className="relative flex-shrink-0 w-16 h-12 rounded-md overflow-hidden bg-muted/40">
              <img
                src={imgError ? '/placeholder-image.jpg' : imageSrc}
                alt={product.name}
                className="w-full h-full object-contain"
                loading="lazy"
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

  // Grid View for Mobile - Completely redesigned for better mobile UX
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
        'group relative h-full overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-300 hover:shadow-lg',
        !isInStock && 'opacity-90'
      )}>
        {/* Improved Slim Top Ribbon */}
        <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between">
          <Badge className={cn(
            "text-xs px-1.5 py-0.5 font-semibold rounded-md",
            isInStock ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
          )}>
            <ShieldCheck className="h-2.5 w-2.5 mr-1" />
            {isInStock ? 'Verified' : 'Out'}
          </Badge>
          {product.badge && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 font-semibold bg-blue-100 text-blue-700 rounded-md">
              {product.badge}
            </Badge>
          )}
        </div>

        {/* Much Smaller Compact Image */}
        <div className="relative mx-2 mt-6 mb-1 overflow-hidden rounded-md bg-muted/40 flex items-center justify-center aspect-[4/3] min-h-[100px]">
          <img
            src={imgError ? '/images/default-image.jpg' : imageSrc}
            alt={product.name}
            className="max-h-full w-full object-contain transition duration-300 group-hover:scale-105"
            loading="lazy"
            width="120"
            height="90"
            onLoad={() => setImgLoading(false)}
            onError={() => setImgError(true)}
          />
        </div>

        <CardContent className="flex flex-1 flex-col gap-1.5 p-2">
          {/* Title & Category */}
          <div className="space-y-0.5">
            <h3 className="font-bold text-sm leading-tight line-clamp-2">{product.name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Tag className="h-2.5 w-2.5" />
              <span className="truncate">{primaryCategory}</span>
            </div>
          </div>

          {/* In Stock Status */}
          <div className="mb-1">
            <span className={cn(
              "inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full",
              isInStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}>
              <CheckCircle className="w-2.5 h-2.5 mr-1" />
              {isInStock ? "In Stock" : "Out of Stock"}
            </span>
            {quantity > 0 && quantity < 10 && (
              <p className="text-xs font-semibold text-amber-600 mt-0.5">Only {quantity} left!</p>
            )}
          </div>

          {/* Single Line Rating + Purchase Count */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{(product.rating ?? 4.9).toFixed(1)}</span>
            <span className="text-muted-foreground">·</span>
            <span>{randomPurchaseCount.toLocaleString()} bought</span>
          </div>

          {/* Compact 2x2 Features Grid */}
          {featureList.length > 0 && (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mb-2">
              {featureList.slice(0, 4).map((feature, index) => (
                <div key={index} className="flex items-center gap-1 text-muted-foreground">
                  <CheckCircle className="h-2.5 w-2.5 text-emerald-500 flex-shrink-0" />
                  <span className="truncate text-xs">{feature}</span>
                </div>
              ))}
            </div>
          )}

          {/* Enhanced Purple Gradient Pricing */}
          <div className="rounded-lg bg-gradient-to-br from-purple-500/20 via-purple-600/15 to-indigo-500/20 border border-purple-200/40 backdrop-blur-sm px-3 py-2 mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <span className="text-base font-bold text-primary">{formatPrice(current)}</span>
                {original > current && (
                  <span className="text-xs text-muted-foreground line-through">{formatPrice(original)}</span>
                )}
              </div>
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs font-bold px-1.5 py-0.5 animate-pulse">
                  {discount}% OFF
                </Badge>
              )}
            </div>
            {savings > 0 && (
              <div className="text-xs text-emerald-600 font-medium">You save {formatPrice(savings)}</div>
            )}
          </div>

          {/* Enhanced Action Tiles with Proper Colors */}
          <div className="space-y-1.5">
            <ActionTile
              icon={Eye}
              lines={["View", "Plans"]}
              to={`/product/${product.id}`}
              disabled={!isInStock}
              variant="view"
            />
            <ActionTile
              icon={MessageCircle}
              lines={["Order via", "WhatsApp"]}
              onClick={handleWhatsAppAction}
              disabled={!isInStock}
              variant="whatsapp"
            />
            <ActionTile
              icon={ShoppingCart}
              lines={["Add to", "Cart"]}
              onClick={handleAddToCart}
              disabled={!isInStock}
              variant="cart"
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
