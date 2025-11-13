import React, { useState } from 'react';
import { ShoppingCart, X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSettings } from '@/context/SettingsContext';

export default function CartIcon() {
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { convertPrice, currency } = useCurrency();
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);

  const handleWhatsAppOrder = () => {
    if (cart.length === 0) return;

    const orderDetails = cart
      .map((item) => {
        const lineTotal = convertPrice(item.currentPrice * item.quantity).toFixed(2);
        return `- ${item.name} (${item.category}) x${item.quantity} - ${currency} ${lineTotal}`;
      })
      .join('\n\n');

    const totalPrice = convertPrice(getTotalPrice()).toFixed(2);
    const totalSavings = convertPrice(
      cart.reduce((total, item) => total + (item.originalPrice - item.currentPrice) * item.quantity, 0),
    ).toFixed(2);

    const message = `BULK ORDER REQUEST\n\n${orderDetails}\n\nTotal Amount: ${currency} ${totalPrice}\nTotal Savings: ${currency} ${totalSavings}\nItems Count: ${getTotalItems()}\n\nPlease confirm my bulk order. Thank you!`;

    const number = settings.whatsappNumber.replace(/\D/g, '') || '923276847960';
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`);
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
          <ShoppingCart className="h-5 w-5" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-green-500 text-white text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Shopping Cart ({getTotalItems()})</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-3 p-3 border rounded-lg dark:border-gray-600">
                  <img
                    src={item.image || '/api/placeholder/64/64'}
                    alt={item.name}
                    className="w-16 h-16 object-contain bg-gray-50 dark:bg-gray-700 rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm dark:text-white">{item.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                    <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                      {currency} {convertPrice(item.currentPrice).toFixed(2)}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}

              <div className="border-t pt-4 dark:border-gray-600">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-semibold dark:text-white">Total:</span>
                  <span className="font-bold text-lg text-green-600 dark:text-green-400">
                    {currency} {convertPrice(getTotalPrice()).toFixed(2)}
                  </span>
                </div>

                <div className="space-y-2">
                  <Button className="w-full bg-green-500 hover:bg-green-600" onClick={handleWhatsAppOrder}>
                    ORDER ALL VIA WHATSAPP
                  </Button>
                  <Button variant="outline" className="w-full" onClick={clearCart}>
                    Clear Cart
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
