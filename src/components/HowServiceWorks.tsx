import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Search, CreditCard, MessageCircle, Play } from 'lucide-react';

const HowServiceWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          How Our Subscription Service Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="bg-primary/10 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Search className="text-primary text-2xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">1. Choose Your Tools</h3>
            <p className="text-muted-foreground">Browse our catalog and select the premium subscriptions you need</p>
          </div>
          <div className="text-center">
            <div
              className="rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-2xl border-2"
              style={{
                background: 'linear-gradient(135deg, #fff 0%, #ffe066 100%)',
                borderColor: '#ffe066',
              }}
            >
              <CreditCard
                className="text-yellow-600 text-4xl font-extrabold"
                style={{ filter: 'drop-shadow(0 0 6px #ffe066)' }}
              />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">2. Secure Payment</h3>
            <p className="text-muted-foreground">Pay securely through our trusted payment methods</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="text-green-500 text-2xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">3. Instant Delivery</h3>
            <p className="text-muted-foreground">Receive your account credentials via WhatsApp within 1-5 minutes</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Play className="text-purple-500 text-2xl" />
            </div>
            <h3 className="font-semibold text-lg mb-2 text-foreground">4. Start Using</h3>
            <p className="text-muted-foreground">Login and enjoy your premium subscriptions immediately</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowServiceWorks;