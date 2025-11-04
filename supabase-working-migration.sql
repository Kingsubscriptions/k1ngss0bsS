-- ===========================================
-- WORKING SUPABASE MIGRATION - Clean & Error-Free
-- Combines ultimate migration with AI solution
-- ===========================================

-- Step 1: Create all tables first (clean slate approach)
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.seo_settings CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.popup_settings CASCADE;

-- Step 2: Create admin_settings table
CREATE TABLE public.admin_settings (
    id SERIAL PRIMARY KEY,
    whatsapp_number TEXT DEFAULT '+923276847960',
    whatsapp_direct_order BOOLEAN DEFAULT false,
    enable_purchase_notifications BOOLEAN DEFAULT true,
    enable_floating_cart BOOLEAN DEFAULT true,
    show_discount_badges BOOLEAN DEFAULT true,
    show_breadcrumbs BOOLEAN DEFAULT true,
    popup_settings JSONB DEFAULT '{
        "enabled": true,
        "title": "Limited Time Offer",
        "message": "Get 10% off when you order on WhatsApp within the next 10 minutes.",
        "buttonText": "Order on WhatsApp",
        "buttonHref": "https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer",
        "showTimer": true,
        "timerDuration": 10,
        "trigger": "delay",
        "delaySeconds": 6,
        "frequency": "once-per-session",
        "theme": "dark",
        "pages": ["/", "/tools", "/product/:id"]
    }'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create products table
CREATE TABLE public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    features TEXT DEFAULT '[]',
    image TEXT,
    popular BOOLEAN DEFAULT false,
    
    badge TEXT,
    price TEXT DEFAULT '{}',
    stock TEXT DEFAULT 'false',
    plans JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create SEO settings table (AI solution integrated)
CREATE TABLE public.seo_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    page_key TEXT NOT NULL,
    title TEXT,
    description TEXT,
    keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 5: Create blog_posts table
CREATE TABLE public.blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    category TEXT,
    tags TEXT DEFAULT '[]',
    cover_image TEXT,
    content TEXT DEFAULT '[]',
    published BOOLEAN DEFAULT false,
    read_time TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create popup_settings table
CREATE TABLE public.popup_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    enabled BOOLEAN DEFAULT true,
    title TEXT DEFAULT 'Limited Time Offer',
    message TEXT DEFAULT 'Get 10% off when you order on WhatsApp within the next 10 minutes.',
    button_text TEXT DEFAULT 'Order on WhatsApp',
    button_href TEXT DEFAULT 'https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer',
    show_timer BOOLEAN DEFAULT true,
    timer_duration INTEGER DEFAULT 10,
    trigger TEXT DEFAULT 'delay',
    delay_seconds INTEGER DEFAULT 6,
    frequency TEXT DEFAULT 'once-per-session',
    theme TEXT DEFAULT 'dark',
    pages TEXT DEFAULT '["/", "/tools", "/product/:id"]',
    last_shown_at TIMESTAMP WITH TIME ZONE,
    last_dismissed_at TIMESTAMP WITH TIME ZONE,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    dismissals INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Insert default data
INSERT INTO public.admin_settings (
    whatsapp_number,
    whatsapp_direct_order,
    enable_purchase_notifications,
    enable_floating_cart,
    show_discount_badges,
    show_breadcrumbs
) VALUES (
    '+923276847960',
    false,
    true,
    true,
    true,
    true
);

-- Insert default SEO settings
INSERT INTO public.seo_settings (page_key, title, description) VALUES
('home', 'Kings Subscriptions - Premium Digital Products', 'Get ChatGPT Plus, Canva Pro, Adobe Suite & 15+ premium tools at 50% off with instant delivery and 24/7 support.'),
('tools', 'Premium Tools & Subscriptions | Kings Subscriptions', 'Browse verified premium tools with flexible plans and genuine renewals. Pick the perfect option for your workflow.'),
('about', 'About Kings Subscriptions', 'Learn how Kings Subscriptions delivers affordable premium tools with transparent policies and dedicated support.'),
('products', 'All Products | Kings Subscriptions', 'Explore every premium subscription we offer across AI, streaming, design, and business categories.'),
('blog', 'Knowledge Hub | Kings Subscriptions', 'Guides, case studies, and tool comparisons to help you save money and scale your workflow.'),
('contact', 'Contact Kings Subscriptions', 'Need help choosing a plan? Talk to our support team via WhatsApp, email, or live chat.');

-- Insert default popup settings
INSERT INTO public.popup_settings (
    id, enabled, title, message, button_text, button_href,
    show_timer, timer_duration, trigger, delay_seconds, frequency, theme, pages
) VALUES (
    1, true, 'Limited Time Offer',
    'Get 10% off when you order on WhatsApp within the next 10 minutes.',
    'Order on WhatsApp',
    'https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer',
    true, 10, 'delay', 6, 'once-per-session', 'dark',
    '["/", "/tools", "/product/:id"]'
);

-- Step 8: Enable Row Level Security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

-- Step 9: Create policies
CREATE POLICY "Allow all operations on admin_settings" ON public.admin_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on seo_settings" ON public.seo_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on blog_posts" ON public.blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on popup_settings" ON public.popup_settings FOR ALL USING (true);

-- Step 10: Create timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 11: Create triggers
CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
    BEFORE UPDATE ON public.seo_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_popup_settings_updated_at
    BEFORE UPDATE ON public.popup_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 12: Enable realtime subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seo_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.popup_settings;

-- ===========================================
-- MIGRATION COMPLETED SUCCESSFULLY!
-- All tables created with proper structure and data
-- Real-time sync enabled for cross-browser functionality
-- ===========================================

-- Verification queries:
-- SELECT COUNT(*) as admin_settings_count FROM admin_settings;
-- SELECT COUNT(*) as products_count FROM products;
-- SELECT COUNT(*) as seo_settings_count FROM seo_settings;
-- SELECT COUNT(*) as blog_posts_count FROM blog_posts;
-- SELECT COUNT(*) as popup_settings_count FROM popup_settings;
