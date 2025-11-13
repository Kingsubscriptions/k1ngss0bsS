import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Users, TrendingUp, Award, MessageCircle } from 'lucide-react';
import { useSeo } from '@/context/SeoContext';
import { Link } from 'react-router-dom';
import { useCurrency } from '@/context/CurrencyContext';
import WhatsAppButton from '@/components/WhatsAppButton';

const Testimonials: React.FC = () => {
  useSeo('testimonials');
  const { formatPrice } = useCurrency();

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Digital Marketing Agency Owner',
      location: '🇺🇸 USA',
      content: `King Subscription saved my agency over $3,600 in the first year alone! We got ChatGPT Plus, Canva Pro, and Adobe Creative Cloud at half the price. The WhatsApp support is incredible - they respond within minutes and helped us set everything up perfectly. Best business decision I made this year!`,
      rating: 5,
      savings: 3600,
      tools: ['ChatGPT Plus', 'Canva Pro', 'Adobe Creative Cloud'],
      verified: true
    },
    {
      name: 'Marcus Johnson',
      role: 'E-commerce Entrepreneur',
      location: '🇬🇧 UK',
      content: `Finally! No more juggling 15 different subscriptions and getting hit with surprise price increases. I consolidated everything through King Subscription and I'm saving $2,400 annually. The setup was instant and everything works exactly like the original subscriptions. Highly recommended!`,
      rating: 5,
      savings: 2400,
      tools: ['SEMrush Pro', 'LinkedIn Premium', 'Microsoft Office'],
      verified: true
    },
    {
      name: 'Alex Rivera',
      role: 'Content Creator & YouTuber',
      location: '🇨🇦 Canada',
      content: `I was skeptical at first, but the quality is exactly the same as paying full price. I've been using their Adobe Creative Cloud and CapCut Pro accounts for 6 months now with zero issues. Saved over $1,800 and the customer support via WhatsApp is amazing. Wish I found this sooner!`,
      rating: 5,
      savings: 1800,
      tools: ['Adobe Creative Cloud', 'CapCut Pro', 'Canva Pro'],
      verified: true
    },
    {
      name: 'Emily Watson',
      role: 'Startup Founder',
      location: '🇦🇺 Australia',
      content: `As a bootstrap startup, every dollar matters. King Subscription helped us access premium tools we couldn't afford otherwise. We're using ChatGPT Plus for customer service, Canva Pro for marketing, and SEMrush for SEO. Saved us $4,200 in year one!`,
      rating: 5,
      savings: 4200,
      tools: ['ChatGPT Plus', 'Canva Pro', 'SEMrush Pro'],
      verified: true
    },
    {
      name: 'David Kim',
      role: 'Freelance Designer',
      location: '🇰🇷 South Korea',
      content: `Adobe Creative Cloud was eating 30% of my monthly income. Through King Subscription, I pay half the price and get the same premium features. The account has been stable for 8 months, and their replacement warranty gives me peace of mind. Customer support is top-notch!`,
      rating: 5,
      savings: 1600,
      tools: ['Adobe Creative Cloud', 'Envato Elements'],
      verified: true
    },
    {
      name: 'Lisa Thompson',
      role: 'Digital Marketing Consultant',
      location: '🇩🇪 Germany',
      content: `I was paying over $300/month for various SaaS tools. King Subscription cut that in half! The LinkedIn Sales Navigator and SEMrush accounts work flawlessly. What impressed me most was their proactive customer service - they reached out to ensure everything was working perfectly.`,
      rating: 5,
      savings: 1800,
      tools: ['LinkedIn Sales Navigator', 'SEMrush Pro', 'Coursera Plus'],
      verified: true
    }
  ];

  const stats = [
    { icon: Users, value: '10,000+', label: 'Happy Customers' },
    { icon: TrendingUp, value: '$2.4M+', label: 'Total Saved' },
    { icon: Star, value: '4.9/5', label: 'Average Rating' },
    { icon: Award, value: '99.9%', label: 'Uptime' }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Real Stories, Real Savings
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            Don't just take our word for it. See what 10,000+ smart entrepreneurs are saying about 
            their experience with King Subscription and how much they're saving.
          </p>
          <Badge variant="destructive" className="text-lg px-6 py-2">
            ⭐ 4.9/5 Rating from 2,341+ Reviews
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <stat.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="hover:shadow-lg transition-shadow dark:bg-gray-800/50 dark:border-gray-700"
            >
              <CardContent className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  {testimonial.verified && (
                    <Badge className="bg-green-600">✓ Verified</Badge>
                  )}
                </div>

                {/* Content */}
                <p className="text-muted-foreground mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>

                {/* Tools Used */}
                <div className="mb-4">
                  <div className="text-sm font-semibold mb-2">Tools Used:</div>
                  <div className="flex flex-wrap gap-2">
                    {testimonial.tools.map((tool, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Savings */}
                <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg mb-4">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(testimonial.savings)} Saved
                  </div>
                  <div className="text-sm text-muted-foreground">in the first year</div>
                </div>

                {/* User Info */}
                <div className="border-t pt-4">
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.location}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Total Impact */}
        <Card className="mb-16 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-6">The Numbers Don't Lie</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-4xl font-black text-green-600 mb-2">
                  {formatPrice(testimonials.reduce((total, t) => total + t.savings, 0))}
                </div>
                <div className="text-muted-foreground">Total saved by these 6 users alone</div>
              </div>
              <div>
                <div className="text-4xl font-black text-blue-600 mb-2">
                  {Math.round(testimonials.reduce((total, t) => total + t.savings, 0) / testimonials.length)}
                </div>
                <div className="text-muted-foreground">Average savings per user</div>
              </div>
              <div>
                <div className="text-4xl font-black text-purple-600 mb-2">100%</div>
                <div className="text-muted-foreground">Would recommend to others</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Questions */}
        <Card className="mb-16">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold text-center mb-8">
              What Our Customers Ask Most
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-2">❓ "Are the accounts really legitimate?"</h3>
                <p className="text-muted-foreground mb-4">
                  Yes! Every account is 100% legitimate with full premium features. We have warranty protection and replace accounts if any issues arise.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">❓ "How fast is the setup process?"</h3>
                <p className="text-muted-foreground mb-4">
                  Most customers get their accounts within 2 minutes of purchase. Our automated system handles delivery instantly.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">❓ "What if I need help or support?"</h3>
                <p className="text-muted-foreground mb-4">
                  Our WhatsApp support team is available 24/7. Most issues are resolved within 15 minutes.
                </p>
              </div>
              <div>
                <h3 className="font-bold mb-2">❓ "Is there a money-back guarantee?"</h3>
                <p className="text-muted-foreground mb-4">
                  Absolutely! We offer a 7-day money-back guarantee. If you're not happy, we'll refund you immediately.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white text-center">
          <CardContent className="p-8">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Join These Success Stories?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Stop overpaying for software like everyone else. Join 10,000+ smart entrepreneurs 
              who are saving thousands with King Subscription.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link to="/tools">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-xl font-bold">
                  🚀 Browse Premium Tools
                </Button>
              </Link>
              <WhatsAppButton 
                message="Hi! I've read the testimonials and want to start saving on premium tools. Can you help me get started?"
                variant="outline"
                className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              />
            </div>
            <div className="text-sm opacity-80">
              ⚡ Instant access • 💯 7-day guarantee • 🔒 100% secure • ⭐ 4.9/5 rated
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Testimonials;