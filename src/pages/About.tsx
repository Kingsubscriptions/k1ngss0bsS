import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Users, 
  Shield, 
  Star, 
  CheckCircle, 
  TrendingUp,
  Globe,
  Award,
  Heart,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import WhatsAppButton from '@/components/WhatsAppButton';
import { useSeo } from '@/context/SeoContext';

const About: React.FC = () => {
  useSeo('about');
  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Crown className="h-12 w-12 text-primary mr-4" />
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                King Subscription
              </span>
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
            We're on a mission to democratize access to premium software. 
            Why should entrepreneurs pay ridiculous prices when they can get the same tools for 50% less?
          </p>
          <Badge variant="destructive" className="text-lg px-6 py-2">
            Trusted by 10,000+ Smart Entrepreneurs
          </Badge>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">10,000+</div>
              <div className="text-sm text-muted-foreground">Happy Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">$2.4M+</div>
              <div className="text-sm text-muted-foreground">Saved by Users</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold">4.9/5</div>
              <div className="text-sm text-muted-foreground">Average Rating</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-6">
              <Globe className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-muted-foreground">Countries Served</div>
            </CardContent>
          </Card>
        </div>

        {/* Our Story */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="max-w-4xl mx-auto space-y-6 text-lg leading-relaxed">
              <p>
                It started with frustration. As entrepreneurs ourselves, we were tired of paying 
                <span className="font-bold text-red-600"> ridiculous prices </span>
                for software that should be accessible to everyone building their dreams.
              </p>
              <p>
                ChatGPT Plus at $20/month? Adobe Creative Cloud at $50+/month? LinkedIn Premium at $60/month? 
                We thought: <span className="font-bold">"There has to be a better way."</span>
              </p>
              <p>
                So we built it. King Subscription was born from the belief that 
                <span className="text-green-600 font-bold"> premium tools shouldn't have premium prices</span>. 
                We partnered directly with software providers and negotiated bulk deals to pass massive savings to entrepreneurs like you.
              </p>
              <p className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Today, we've saved our users over $2.4 million in software costs.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Our Mission */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-6 w-6 text-red-500 mr-2" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                To make premium software accessible to every entrepreneur, creator, and business owner who refuses to overpay for the tools they need to succeed.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Fair pricing for everyone
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  No compromise on quality
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Instant access & support
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                Our Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                We believe in transparency, fairness, and putting our customers first. Every decision we make is guided by one question: "Does this help entrepreneurs succeed?"
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Customer-first approach
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Complete transparency
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  Continuous improvement
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Why Choose Us */}
        <Card className="mb-16">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Why 10,000+ Entrepreneurs Choose Us</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">100% Secure</h3>
                <p className="text-muted-foreground">
                  All accounts are legitimate with full warranty protection and 7-day money-back guarantee.
                </p>
              </div>
              <div className="text-center">
                <Zap className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Instant Delivery</h3>
                <p className="text-muted-foreground">
                  Get your premium tools within 2 minutes of purchase. No waiting, no hassle.
                </p>
              </div>
              <div className="text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">24/7 Support</h3>
                <p className="text-muted-foreground">
                  Our WhatsApp support team is always ready to help you succeed with your tools.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary to-secondary text-white text-center">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-4">Ready to Join 10,000+ Smart Entrepreneurs?</h2>
            <p className="text-xl mb-6 opacity-90">
              Stop overpaying for software. Get premium tools at Huge Discounts and start saving today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/tools">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                  🚀 Browse Premium Tools
                </Button>
              </Link>
              <WhatsAppButton 
                message="Hi! I'd like to know more about King Subscription and how I can save on premium tools."
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;