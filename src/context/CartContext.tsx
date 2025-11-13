import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  category: string;
  originalPrice: number;
  currentPrice: number;
  image: string;
  features: string[];
  rating: number;
  quantity?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalSavings: () => number;
  getTotalItems: () => number;
  getItemCount: () => number;
  generateWhatsAppMessage: () => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(i => i.id === item.id);
      if (existingItem) {
        return prev.map(i => 
          i.id === item.id 
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.currentPrice * (item.quantity || 1)), 0);
  };

  const getTotalSavings = () => {
    return cart.reduce((total, item) => 
      total + ((item.originalPrice - item.currentPrice) * (item.quantity || 1)), 0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getItemCount = () => {
    return getTotalItems();
  };

  const generateWhatsAppMessage = () => {
    if (cart.length === 0) return "Hi! I'm interested in your premium tools.";

    let message = "🛒 **MY CART ITEMS** 🛒\n\n";
    
    cart.forEach((item, index) => {
      const savings = (item.originalPrice - item.currentPrice) * (item.quantity || 1);
      const discountPercentage = Math.round(((item.originalPrice - item.currentPrice) / item.originalPrice) * 100);
      
      message += `${index + 1}. **${item.name}**\n`;
      message += `📂 Category: ${item.category}\n`;
      message += `💰 Price: $${item.currentPrice.toFixed(2)}`;
      if ((item.quantity || 1) > 1) {
        message += ` x ${item.quantity} = $${(item.currentPrice * (item.quantity || 1)).toFixed(2)}`;
      }
      message += `\n🏷️ Original: $${item.originalPrice.toFixed(2)} (${discountPercentage}% OFF)\n`;
      message += `💵 You Save: $${savings.toFixed(2)}\n`;
      message += `⭐ Rating: ${item.rating}/5.0\n\n`;
    });

    message += "💳 **ORDER SUMMARY**\n";
    message += `📦 Total Items: ${getTotalItems()}\n`;
    message += `💰 Total Price: $${getTotalPrice().toFixed(2)}\n`;
    message += `💵 Total Savings: $${getTotalSavings().toFixed(2)}\n`;
    message += `🎯 Discount: ${Math.round((getTotalSavings() / (getTotalPrice() + getTotalSavings())) * 100)}% OFF\n\n`;
    
    message += "✅ **WHAT'S INCLUDED:**\n";
    message += "⚡ Instant Account Delivery\n";
    message += "🔒 100% Genuine Accounts\n";
    message += "🛡️ 7-Day Money Back Guarantee\n";
    message += "📱 24/7 WhatsApp Support\n";
    message += "🔄 Free Account Replacement\n\n";
    
    message += "Please confirm this order and provide payment details. Thank you! 🙏";
    
    return message;
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalSavings,
      getTotalItems,
      getItemCount,
      generateWhatsAppMessage
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};