import React from 'react';
import { Link } from 'react-router-dom';
import { Crown, Mail, MessageCircle, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Footer: React.FC = () => {
  const categories = [
    { name: 'AI Tools', href: '/tools?category=AI Tools' },
    { name: 'SEO Tools', href: '/tools?category=SEO Tools' },
    { name: 'Design Tools', href: '/tools?category=Design Tools' },
    { name: 'Video Tools', href: '/tools?category=Video Tools' },
    { name: 'Productivity', href: '/tools?category=Productivity' },
  ];

  return (
    <footer className="bg-muted/30 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">King Subscription</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Get Premium Subscriptions in affordable pricing. Trusted by 10,000+ Professionals worldwide.
            </p>
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-sm text-muted-foreground ml-2">4.9/5 (2,341 reviews)</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/tools" className="text-sm text-muted-foreground hover:text-primary">All Tools</Link></li>
              <li><Link to="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link to="/why-us" className="text-sm text-muted-foreground hover:text-primary">Why Choose Us</Link></li>
              <li><Link to="/compare" className="text-sm text-muted-foreground hover:text-primary">Compare Prices</Link></li>
              <li><Link to="/testimonials" className="text-sm text-muted-foreground hover:text-primary">Testimonials</Link></li>
              <li><Link to="/blog" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
            </ul>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h3 className="font-semibold">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-sm text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
              <li><Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary">Refund Policy</Link></li>
              <li><Link to="/dmca" className="text-sm text-muted-foreground hover:text-primary">DMCA</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link 
                    to={category.href} 
                    className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Support</h3>
            <div className="space-y-3">
              <a
                href="https://wa.me/923276847960"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center w-full justify-start border rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50 dark:hover:bg-muted/20"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                WhatsApp Support
              </a>
              <a
                href="mailto:kingsubscriptionoffical@gmail.com"
                className="inline-flex items-center w-full justify-start border rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted/50 dark:hover:bg-muted/20"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </a>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-600" />
                <span>7‑Day Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 King Subscription. All rights reserved. | 
            <span className="text-green-600 font-semibold"> Save 50% on Premium Tools</span> | 
            Trusted by 10,000+ Users
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;