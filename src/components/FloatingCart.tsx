import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, X, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSettings } from '@/context/SettingsContext';
import WhatsAppButton from './WhatsAppButton';

const FloatingCart: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { formatPrice } = useCurrency();
  const { settings } = useSettings();

  if (!settings.enableFloatingCart) {
    return null;
  }

  const generateWhatsAppMessage = () => {
    const orderDate = new Date().toLocaleDateString();
    const orderTime = new Date().toLocaleTimeString();
    
    let message = `🛒 **NEW ORDER REQUEST**\n\n`;
    message += `📅 Date: ${orderDate}\n`;
    message += `⏰ Time: ${orderTime}\n`;
    message += `👤 Customer: [Please provide your name]\n\n`;
    message += `📦 **SELECTED SUBSCRIPTIONS:**\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    cart.forEach((item, index) => {
      const savings = (item.originalPrice - item.currentPrice) * item.quantity;
      const discountPercent = Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100);
      
      message += `${index + 1}. **${item.name}**\n`;
      message += `   📂 Category: ${item.category}\n`;
      message += `   💰 Price: ${formatPrice(item.currentPrice)} x ${item.quantity}\n`;
      message += `   💵 Original: ${formatPrice(item.originalPrice)} (${discountPercent}% OFF)\n`;
      message += `   💚 You Save: ${formatPrice(savings)}\n`;
      message += `   ⭐ Rating: ${item.rating}/5\n\n`;
    });

    const totalOriginal = cart.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0);
    const totalCurrent = getTotalPrice();
    const totalSavings = totalOriginal - totalCurrent;
    const overallDiscount = Math.round((totalSavings / totalOriginal) * 100);

    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📊 **ORDER SUMMARY:**\n`;
    message += `   🛍️ Total Items: ${getTotalItems()}\n`;
    message += `   💰 Total Amount: ${formatPrice(totalCurrent)}\n`;
    message += `   💵 Original Price: ${formatPrice(totalOriginal)}\n`;
    message += `   💚 Total Savings: ${formatPrice(totalSavings)} (${overallDiscount}% OFF)\n\n`;
    
    message += `🚀 **DELIVERY DETAILS:**\n`;
    message += `   ⚡ Instant delivery within 1-5 minutes\n`;
    message += `   📱 Account credentials via WhatsApp\n`;
    message += `   🛡️ 7-day money-back guarantee\n`;
    message += `   🔄 Account replacement warranty\n\n`;
    
    message += `💳 **PAYMENT:**\n`;
    message += `   Please provide payment details and confirm this order.\n`;
    message += `   We accept all major payment methods.\n\n`;
    
    message += `✅ Please confirm this order and provide:\n`;
    message += `   • Your full name\n`;
    message += `   • Email address\n`;
    message += `   • Preferred payment method\n\n`;
    
    message += `Thank you for choosing our premium subscription service! 🙏`;

    return message;
  };

  if (getTotalItems() === 0 && !isOpen) return null;

  return (
    <>
      {/* Floating Cart Button */}
      {!isOpen && getTotalItems() > 0 && (
        <div className="fixed bottom-24 right-5 sm:bottom-28 z-40 sm:z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white text-primary shadow-xl ring-1 ring-primary/20 transition-transform duration-200 hover:scale-105 focus-visible:scale-105 dark:bg-zinc-900 dark:text-white dark:ring-primary/40"
            aria-label="Open cart"
          >
            <ShoppingCart className="w-6 h-6" />
            <Badge className="absolute -top-1.5 -right-1.5 h-7 min-w-[1.75rem] rounded-full border-2 border-white bg-red-500 px-1 text-xs font-bold text-white shadow-md dark:border-zinc-900">
              {getTotalItems()}
            </Badge>
          </Button>
        </div>
      )}

      {/* Cart Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
          <Card className="w-full rounded-t-2xl sm:rounded-2xl max-w-[min(24rem,90vw)] max-h-[85vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-xl font-bold flex items-center">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Shopping Cart ({getTotalItems()} items)
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-4 overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Your cart is empty</p>
                </div>
              ) : (
                <>
                  {cart.map((item) => {
                    const savings = item.originalPrice - item.currentPrice;
                    const discountPercent = Math.round((savings / item.originalPrice) * 100);
                    
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/api/placeholder/48/48';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-sm font-bold text-green-600">
                              {formatPrice(item.currentPrice)}
                            </span>
                            <span className="text-xs line-through text-muted-foreground">
                              {formatPrice(item.originalPrice)}
                            </span>
                            <Badge className="bg-red-100 text-red-800 text-xs px-1">
                              {discountPercent}% OFF
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Cart Summary */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items ({getTotalItems()})</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>You Save</span>
                      <span>
                        {formatPrice(
                          cart.reduce((sum, item) => sum + ((item.originalPrice - item.currentPrice) * item.quantity), 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Total</span>
                      <span className="text-primary">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 pt-4">
                    <WhatsAppButton
                      message={generateWhatsAppMessage()}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      text="🛒 ORDER ALL VIA WHATSAPP"
                      size="lg"
                    />
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full"
                    >
                      Clear Cart
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default FloatingCart;

