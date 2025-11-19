import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, ExternalLink, Gift, Info, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

// Define types for our data
interface GiveawayItem {
  id: string;
  product_name: string;
  login_details: string;
  official_website?: string;
  instructions?: string;
  welcome_message?: string;
}

interface PageContent {
  header_title?: string;
  header_subtitle?: string;
  about_section_title?: string;
  about_section_content?: string;
  how_it_works_title?: string;
  how_it_works_steps?: { title: string; description: string }[];
  payment_info_title?: string;
  payment_info_content?: string;
  faq_title?: string;
  faqs?: { question: string; answer: string }[];
  cta_title?: string;
  cta_button_text?: string;
  cta_button_link?: string;
}

const FreeGiveaway = () => {
  const { user, loading: authLoading } = useAuth();
  const [giveaways, setGiveaways] = useState<GiveawayItem[]>([]);
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch giveaway items
        const { data: giveawayData, error: giveawayError } = await supabase
          .from('free_giveaways')
          .select('*')
          .eq('is_active', true)
          .order('ordering', { ascending: true });

        if (giveawayError) throw new Error(`Failed to fetch giveaways: ${giveawayError.message}`);
        setGiveaways(giveawayData || []);

        // Fetch page content
        const { data: contentData, error: contentError } = await supabase
          .from('giveaway_page_content')
          .select('*')
          .limit(1)
          .single();

        if (contentError) throw new Error(`Failed to fetch page content: ${contentError.message}`);
        setContent(contentData || {});

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (authLoading || loading) {
    return <div className="p-8 text-center text-sm text-muted-foreground">Loading your free resources...</div>;
  }

  // If not loading and not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
            {content?.header_title || 'Your Free Premium Tools'}
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
            {content?.header_subtitle || 'Here are the free subscriptions you have access to. Follow the instructions carefully for the best experience.'}
          </p>
        </header>

        {/* Giveaway Items */}
        <main className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {giveaways.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Gift className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold">{item.product_name}</h2>
                </div>
                {item.welcome_message && (
                  <p className="text-sm text-muted-foreground mb-4">{item.welcome_message}</p>
                )}

                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="instructions">
                    <AccordionTrigger>How to Use</AccordionTrigger>
                    <AccordionContent className="text-sm space-y-3">
                      <p>{item.instructions || 'No specific instructions provided.'}</p>
                      {item.official_website && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={item.official_website} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Official Website
                          </a>
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="credentials">
                    <AccordionTrigger>Login Credentials</AccordionTrigger>
                    <AccordionContent className="space-y-2">
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-3 text-sm font-mono relative">
                            {item.login_details}
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-2 right-2 h-7 w-7"
                                onClick={() => handleCopy(item.login_details, item.id)}
                            >
                                {copiedId === item.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </main>

        {/* Additional Content Sections */}
        <section className="mt-16 space-y-12">
            {/* Payment Info */}
            {content?.payment_info_title && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary"/>{content.payment_info_title}</CardTitle>
                    </CardHeader>
                    <CardContent className="prose dark:prose-invert max-w-none">
                        {/* Render markdown content here, for now using a simple pre tag */}
                        <pre className="whitespace-pre-wrap font-sans">{content.payment_info_content}</pre>
                    </CardContent>
                </Card>
            )}

            {/* CTA */}
            {content?.cta_title && (
                <div className="text-center p-8 bg-primary/10 rounded-lg">
                    <h2 className="text-2xl font-bold mb-2">{content.cta_title}</h2>
                    <Button asChild>
                        <a href={content.cta_button_link || '#'}>{content.cta_button_text || 'Learn More'}</a>
                    </Button>
                </div>
            )}
        </section>
      </div>
    </div>
  );
};

export default FreeGiveaway;
