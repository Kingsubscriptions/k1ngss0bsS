import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Crown, ShoppingCart } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import ThemeToggle from './ThemeToggle';
import { useCart } from '@/context/CartContext';
import CartIcon from './CartIcon';

const Header: React.FC = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { getTotalItems } = useCart();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tools' },
    { name: 'Why Us', href: '/why-us' },
    { name: 'Compare', href: '/compare' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Testimonials', href: '/testimonials' },
    { name: 'Blog', href: '/blog' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-gray-200/50 dark:border-gray-700/50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 gap-2">
        <Link
          to="/"
          className="flex items-center space-x-2 group min-w-0"
          aria-label="King Subscription Home"
        >
          <Crown className="h-8 w-8 md:h-10 md:w-10 text-primary group-hover:scale-110 transition-transform duration-200 flex-shrink-0" />
          <span className="text-lg sm:text-xl md:text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300 truncate max-w-[120px] sm:max-w-[140px] md:max-w-xs">
            King Subscription
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav
          className="hidden md:flex items-center space-x-6"
          role="navigation"
          aria-label="Main navigation"
        >
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary whitespace-nowrap px-2 py-1 rounded-md ${
                isActive(item.href)
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              aria-current={isActive(item.href) ? 'page' : undefined}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="flex items-center space-x-2 md:space-x-4">
          <div className="hidden sm:flex items-center space-x-2">
            <CurrencySelector />
            <ThemeToggle />
          </div>
          <div className="shrink-0">
            <CartIcon />
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="touch-manipulation min-h-[44px] min-w-[44px]"
                aria-label="Open navigation menu"
                aria-expanded={isOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] sm:w-[320px]"
              aria-label="Mobile navigation menu"
            >
              <div className="flex flex-col space-y-6 mt-8">
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col space-y-4" role="navigation" aria-label="Mobile navigation">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`text-base font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${
                        isActive(item.href)
                          ? 'text-primary bg-primary/10 border-l-4 border-primary'
                          : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Actions */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Preferences</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CurrencySelector />
                    <ThemeToggle />
                  </div>
                </div>

                {/* Mobile Cart */}
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-3">
                    <CartIcon />
                    <span className="text-sm text-muted-foreground">Shopping Cart</span>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
