import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Star,
  Shield,
  Zap,
  Crown,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Target,
  Flame,
  HelpCircle,
  ChevronDown // Added for arrow indicator (assuming Lucide has it; if not, use ArrowDown)
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '@/components/ProductCard';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useProductsContext } from '@/context/ProductsContext';
import { useCurrency } from '@/context/CurrencyContext';
import HowItWorks from './HowItWorks';
import { useSeo } from '@/context/SeoContext';
import { useHero } from '@/context/HeroContext';

// Updated CountdownTimer (kept as is)
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours
  React.useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(timer);
  }, []);
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  return (
    <Badge variant="destructive" className="text-lg px-4 py-2 mb-4">
      <Flame className="mr-2 h-5 w-5" />
      Limited Time: {hours}:{minutes}:{seconds} Left for Extra 10% Off!
    </Badge>
  );
};

// Updated: Accordion-style FAQ with more Q&A
const MiniFAQ = () => {
  const faqs = [
    { question: "Is this service 100% secure and legal?", answer: "Yes! We provide legitimate shared accounts compliant with all terms of service. 100% safe and legal." },
    { question: "What if my account stops working later?", answer: "We offer a 30-day free account replacement Warranty. Zero risk to you." },
    { question: "How long does setup take?", answer: "Instant access in under 2 minutes. Automated delivery with 24/7 WhatsApp support." },
    { question: "Can I use it on multiple devices?", answer: "It Depends on The Subscription, For some subscriptions you can use them on multiple devices for some subscriptions only single device is allowed" },
    { question: "Do I get all the premium features?", answer: "Absolutely. You’ll get the exact features as if you paid full price." },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center"><HelpCircle className="mr-2 h-5 w-5" /> Quick FAQ</CardTitle>
      </CardHeader>
      <CardContent>
        {faqs.map((faq, index) => (
          <div key={index} className="mb-4 border-b">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full text-left flex justify-between items-center py-2 font-semibold"
              aria-expanded={openIndex === index}
            >
              {faq.question}
              <ChevronDown className={`h-5 w-5 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === index && <p className="text-muted-foreground mt-2">{faq.answer}</p>}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const Home: React.FC = () => {
  useSeo('home');
  const { products } = useProductsContext();
  const { formatPrice } = useCurrency();
  const { settings: heroSettings } = useHero();
  const featuredProducts = products.slice(0, 9);

  // Ensure page opens at top on navigation
  React.useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); } catch { window.scrollTo(0, 0); }
  }, []);

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section - Updated CTA text, fixed dark mode for WhatsApp button */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-14 md:py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-20 left-10 animate-pulse">💰</div>
            <div className="absolute top-40 right-20 animate-bounce">🚀</div>
            <div className="absolute bottom-20 left-20 animate-pulse">⚡</div>
            <div className="absolute bottom-40 right-10 animate-bounce">👑</div>
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <CountdownTimer />
            <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                {/* Clean the title if it contains the duplicate text, so we can render the second line in white */}
                {(heroSettings?.title || 'STOP SPENDING MONEY').replace(/ On Overpriced (Software|Softwares)( & Services)?!?$/i, '')}
              </span>
              <br />
              <span className="text-foreground">
                On Overpriced Softwares & Services!
              </span>
            </h1>
            <div className="text-xl md:text-2xl mb-8 text-muted-foreground max-w-4xl mx-auto">
              <p className="mb-4">
                {heroSettings?.subtitle || '🔥 10,000+ Professionals have already canceled their expensive subscription and Now they buy those subs from us at affordable prices.'}
              </p>
              <p className="text-lg">
                <span className="text-green-600 font-bold">ChatGPT Plus, Canva Pro, Adobe Creative Suite</span> and {products.length}+ premium tools are available at <span className="bg-yellow-200 dark:bg-yellow-800 px-2 py-1 rounded font-bold">Huge Discounts</span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-6 mb-8 flex-wrap">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-green-600" />
                <span><strong>10,000+</strong> Active Users</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span><strong>4.9/5</strong> Rating (2,341 reviews)</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4 text-blue-600" />
                <span><strong>100%</strong> Secure & Instant</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/tools">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105" aria-label="View deals">
                  Show Me The Deals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <WhatsAppButton
                message="Hi! I want to save money on premium tools. Can you help me get started?"
                variant="outline"
                className="px-8 py-6 text-lg border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900 dark:hover:text-green-100" // Fixed dark mode visibility
                text="ORDER VIA WHATSAPP"
              />
            </div>
            <div className="inline-flex items-center bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-6 py-3 rounded-full">
              <Shield className="mr-2 h-5 w-5 text-green-600" /> {/* Fixed color: vibrant green, no fade */}
              <span className="font-semibold">🗓️ 30 Days Replacement warranty</span>
            </div>
          </div>
        </section>

        {/* Solution Section - Kept same, updated "View All" text, fixed dark mode hover */}
        <section className="pt-10 pb-14 md:pt-16 md:pb-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Introducing King Subscription
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
                The <strong>ONLY</strong> platform where you can get premium tools at <span className="text-green-600 font-bold">reasonalble and affordable rates</span> without compromising on quality or features.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
              <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-4">💰</div>
                  <CardTitle className="text-green-600">Save 50%+ Instantly</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Why pay full price when you can get the same tools for half the cost?
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      All premium features included
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      No hidden fees or limitations
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      Price locked forever
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-4">⚡</div>
                  <CardTitle className="text-blue-600">Instant Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    No waiting. No approval process. Get your tools in under 2 minutes.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      Automated delivery
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      24/7 WhatsApp support
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                      Setup assistance included
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <CardHeader>
                  <div className="text-4xl mb-4">🛡️</div>
                  <CardTitle className="text-purple-600">100% Secure & Legal</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Legitimate accounts with full access and warranty protection.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                      Money-back guarantee
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                      Account replacement warranty
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                      Trusted by 10,000+ users
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Featured Products */}
            <div className="mb-16">
              <h3 className="text-3xl font-bold text-center mb-12">
                🔥 Most Popular Money-Savers
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/tools">
                  <Button size="lg" variant="outline" className="border-2 border-primary hover:bg-primary hover:text-background dark:hover:bg-primary dark:hover:text-background"> {/* Fixed dark mode hover */}
                    View All Tools
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <MiniFAQ /> {/* Placed below featured products */}
          </div>
        </section>

        {/* Problem/Agitation Section - Kept same */}
        <section className="py-20 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-red-600">
                The BRUTAL Truth About Software Subscriptions...
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                You're getting ROBBED every month, and here's the proof:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="border-red-200 bg-white/80 dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <DollarSign className="mr-2 h-6 w-6" />
                    Overpriced by 300%+
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    ChatGPT Plus: <span className="line-through">{formatPrice(40)}</span> → Our Price: <span className="text-green-600 font-bold">{formatPrice(20)}</span>
                  </p>
                  <p className="text-muted-foreground mt-2">
                    <strong>You save: {formatPrice(240)}/year</strong>
                  </p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white/80 dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <Clock className="mr-2 h-6 w-6" />
                    Wasted Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Hours spent juggling multiple subscriptions, forgotten renewals, and price hikes.
                  </p>
                  <p className="text-red-600 font-bold mt-2">Time = Money LOST</p>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-white/80 dark:bg-gray-800/50 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <TrendingUp className="mr-2 h-6 w-6" />
                    Annual Price Increases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Adobe increased prices by 20% last year. OpenAI might be next. You're trapped in their ecosystem.
                  </p>
                  <p className="text-red-600 font-bold mt-2">Corporate Greed Wins</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-red-600 mb-4">
                💸 Average User Wastes {formatPrice(2400)}/Year on Overpriced Software
              </p>
              <p className="text-lg text-muted-foreground">
                But you're smarter than that, right?
              </p>
            </div>
          </div>
        </section>

        {/* Social Proof Testimonials - Kept same */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl font-bold text-center mb-12">
              What Smart Entrepreneurs Are Saying...
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "Saved {formatPrice(3600)} in the first year alone. These guys are legit and their WhatsApp support is incredible!"
                  </p>
                  <div className="font-semibold text-foreground">Sarah Chen</div>
                  <div className="text-sm text-muted-foreground">Digital Marketing Agency Owner</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "Finally! No more juggling 15 different subscriptions. Got everything I need at half the price."
                  </p>
                  <div className="font-semibold text-foreground">Marcus Johnson</div>
                  <div className="text-sm text-muted-foreground">E-commerce Entrepreneur</div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">
                    "Setup was instant. Quality is exactly the same as paying full price. Wish I found this sooner!"
                  </p>
                  <div className="font-semibold text-foreground">Alex Rivera</div>
                  <div className="text-sm text-muted-foreground">Content Creator</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <HowItWorks /> {/* Kept only this one, removed duplicate */}

        {/* Converting Section - Updated CTA text */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Join 10,000+ Smart Entrepreneurs
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Don't let expensive subscriptions drain your business budget. Join thousands of successful entrepreneurs who've already made the smart switch.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">$2,400</div>
                <p className="text-muted-foreground">Average Annual Savings</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
                <p className="text-muted-foreground">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">2 Min</div>
                <p className="text-muted-foreground">Setup Time</p>
              </div>
            </div>
            <Link to="/tools">
              <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                Start Saving Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Urgency/Scarcity CTA - Kept same */}
        <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              ⏰ Don't Let This Opportunity Slip Away
            </h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              While others pay full price like suckers, <strong>smart entrepreneurs</strong> are saving thousands.
              Join the elite group who refuse to overpay for software.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/tools">
                <Button size="lg" className="bg-white text-red-600 hover:bg-gray-100 px-8 py-6 text-xl font-bold shadow-xl">
                  Show Me The Deals
                </Button>
              </Link>
            </div>

            <div className="text-sm opacity-90">
              ⚡ Instant access • 💯 7-day guarantee • 🔒 100% secure
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
