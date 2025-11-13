import React from 'react';
import { Search, CreditCard, MessageCircle, Play } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: "1. Choose Your Tools",
      description: "Browse our catalog and select the premium subscriptions you need",
      bgColor: "bg-primary/10",
      iconColor: "text-primary"
    },
    {
      icon: CreditCard,
      title: "2. Secure Payment",
      description: "Pay securely through our trusted payment methods",
      bgColor: "bg-secondary/10",
      iconColor: "text-secondary"
    },
    {
      icon: MessageCircle,
      title: "3. Instant Delivery",
      description: "Receive your account credentials via WhatsApp within 1-5 minutes",
      bgColor: "bg-green-100 dark:bg-green-900/30",
      iconColor: "text-green-500"
    },
    {
      icon: Play,
      title: "4. Start Using",
      description: "Login and enjoy your premium subscriptions immediately",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
          How Our Subscription Service Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="text-center">
                <div className={`${step.bgColor} rounded-full p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center`}>
                  <Icon className={`${step.iconColor} text-2xl`} />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;