-- ===========================================
-- SUPABASE FULL DATABASE RESTORATION - FIXED VERSION
-- Complete backup with all data in proper format
-- Fixed: JSONB casting for blog_posts content and tags
-- ===========================================

-- Drop tables if they exist to ensure clean restoration
-- NOTE: Analytics tables are preserved and not dropped to maintain data integrity
DROP TABLE IF EXISTS public.admin_settings CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.seo_settings CASCADE;
DROP TABLE IF EXISTS public.blog_posts CASCADE;
DROP TABLE IF EXISTS public.popup_settings CASCADE;
-- Analytics tables are NOT dropped to preserve existing data
-- DROP TABLE IF EXISTS public.page_views CASCADE;
-- DROP TABLE IF EXISTS public.product_views CASCADE;
-- DROP TABLE IF EXISTS public.user_interactions CASCADE;
-- DROP TABLE IF EXISTS public.conversion_events CASCADE;
-- DROP TABLE IF EXISTS public.search_queries CASCADE;
-- DROP TABLE IF EXISTS public.cart_events CASCADE;
-- DROP TABLE IF EXISTS public.error_logs CASCADE;

-- Create admin_settings table
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

-- Create products table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.products (
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

-- Create SEO settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seo_settings (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    page_key TEXT NOT NULL,
    title TEXT,
    description TEXT,
    keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create blog_posts table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT,
    author TEXT,
    category TEXT,
    tags JSONB DEFAULT '[]',
    cover_image TEXT,
    content JSONB DEFAULT '[]',
    published BOOLEAN DEFAULT false,
    read_time TEXT,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create popup_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.popup_settings (
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

-- ===========================================
-- ANALYTICS SYSTEM TABLES
-- Complete analytics tracking for user behavior and business insights
-- ===========================================

-- Create analytics tables for real-time tracking
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT NOT NULL,
    page_url TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    os TEXT,
    screen_resolution TEXT,
    viewport_size TEXT,
    time_on_page INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    category TEXT,
    price_range TEXT,
    time_spent INTEGER,
    source_page TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_interactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL, -- 'click', 'scroll', 'form_submit', 'whatsapp_click', etc.
    element_id TEXT,
    element_class TEXT,
    page_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.conversion_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'product_purchase', 'whatsapp_contact', 'email_signup', etc.
    product_id TEXT,
    product_name TEXT,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'PKR',
    source TEXT,
    campaign TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.search_queries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT NOT NULL,
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    filters_applied JSONB DEFAULT '{}',
    clicked_product_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cart_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'add_to_cart', 'remove_from_cart', 'cart_view', 'checkout_start'
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    price DECIMAL(10,2),
    currency TEXT DEFAULT 'PKR',
    cart_total DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.error_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID,
    session_id TEXT,
    error_type TEXT NOT NULL,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    page_path TEXT,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_page_url ON public.page_views(page_url);

CREATE INDEX IF NOT EXISTS idx_product_views_session_id ON public.product_views(session_id);
CREATE INDEX IF NOT EXISTS idx_product_views_product_id ON public.product_views(product_id);
CREATE INDEX IF NOT EXISTS idx_product_views_created_at ON public.product_views(created_at);

CREATE INDEX IF NOT EXISTS idx_user_interactions_session_id ON public.user_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_type ON public.user_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_user_interactions_created_at ON public.user_interactions(created_at);

CREATE INDEX IF NOT EXISTS idx_conversion_events_session_id ON public.conversion_events(session_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON public.conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON public.conversion_events(created_at);

CREATE INDEX IF NOT EXISTS idx_search_queries_session_id ON public.search_queries(session_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_query ON public.search_queries(query);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON public.search_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_cart_events_session_id ON public.cart_events(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_product_id ON public.cart_events(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_events_created_at ON public.cart_events(created_at);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs(error_type);

-- Insert admin settings data
INSERT INTO public.admin_settings (
    whatsapp_number,
    whatsapp_direct_order,
    enable_purchase_notifications,
    enable_floating_cart,
    show_discount_badges,
    show_breadcrumbs,
    updated_at
) VALUES (
    '+923276847960',
    false,
    true,
    true,
    true,
    true,
    NOW()
);

-- Insert all product data with complex pricing plans
INSERT INTO public.products (
    id,
    name,
    category,
    description,
    features,
    image,
    popular,
    badge,
    price,
    stock,
    plans,
    created_at,
    updated_at
) VALUES
('netflix', 'Netflix Premium', 'Entertainment, Streaming', 'Watch your favorite shows and movies in 4K UHD. Plans available for every need.', '["Ultra HD 4K Streaming", "Officially Paid & Renewable", "Works on All Devices", "Shared Plan Rules Apply"]', 'https://logo.clearbit.com/netflix.com', true, 'Popular', '{"monthly": 350, "original": 1100, "yearly": 4000}', '"unlimited"', '[{"type": "Premium (Shared Screen)", "description": "Profile on a shared account. No downloads. Use on 1 device only. Do not change name/PIN.", "durations": [{"duration": "1 Month", "price": 350, "original": 1100}]}, {"type": "Platinum (Private Screen)", "description": "Your own private, PIN-protected profile with unlimited downloads.", "durations": [{"duration": "1 Month", "price": 500, "original": 1100}, {"duration": "3 Months", "price": 1500, "original": 3300}, {"duration": "6 Months", "price": 2800, "original": 6600}, {"duration": "1 Year", "price": 6000, "original": 13200}]}]', '2025-07-01T10:00:00Z'::TIMESTAMP WITH TIME ZONE, '2025-08-29T14:29:31.641Z'::TIMESTAMP WITH TIME ZONE),
('prime-video', 'Amazon Prime Video', 'Entertainment, Streaming', 'Enjoy thousands of movies, TV shows, and Amazon Originals in Ultra HD.', '["Ultra HD Streaming", "Officially Paid", "Unlimited Downloads", "Single Screen Access"]', 'https://logo.clearbit.com/primevideo.com', false, NULL, '{"monthly": 120, "original": 599}', 'true', '[{"type": "Individual Screen", "description": "Access for one user with unlimited downloads.", "durations": [{"duration": "1 Month", "price": 120, "original": 599}, {"duration": "6 Months", "price": 450, "original": 3594}, {"duration": "1 Year", "price": 900, "original": 7188}]}]', NOW(), NOW()),
('spotify-premium', 'Spotify Premium', 'Music, Entertainment', 'Ad-free music streaming with high-quality audio, activated on your own email.', '["Activated on Your Personal Email", "Ad-free Music Streaming", "Offline Downloads", "High Quality Audio"]', 'https://logo.clearbit.com/spotify.com', true, NULL, '{"monthly": 350, "original": 520}', 'true', '[{"type": "Individual", "description": "Premium access for one person on their own email.", "durations": [{"duration": "1 Month", "price": 350, "original": 520}, {"duration": "3 Months", "price": 900, "original": 1560}, {"duration": "6 Months", "price": 1800, "original": 3120}]}]', NOW(), NOW()),
('youtube-premium', 'YouTube Premium', 'Entertainment, Streaming', 'Ad-free videos, background play, and offline downloads, activated on your personal email.', '["Activated on Your Personal Email", "Ad-free Video & Music", "Background Play", "Offline Downloads"]', 'https://logo.clearbit.com/youtube.com', false, NULL, '{"monthly": 300, "original": 479}', 'true', '[{"type": "Individual", "description": "Premium access for one person on their own email.", "durations": [{"duration": "1 Month", "price": 300, "original": 479}, {"duration": "4 Months", "price": 1200, "original": 1916}, {"duration": "6 Months", "price": 1800, "original": 2874}, {"duration": "1 Year", "price": 3200, "original": 5748}]}]', NOW(), NOW()),
('disney-plus', 'Disney+', 'Entertainment, Streaming', 'The home of Disney, Pixar, Marvel, Star Wars. Requires VPN for access.', '["Endless Entertainment", "Originals & Exclusives", "4K UHD Quality", "Requires VPN (Instructions Provided)"]', 'https://logo.clearbit.com/disneyplus.com', false, NULL, '{"monthly": 450, "original": 2200}', 'true', '[{"type": "Single Screen", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 450, "original": 2200}]}]', NOW(), NOW()),
('hbo-max', 'HBO Max', 'Entertainment, Streaming', 'Stream all of HBO, plus hit movies, originals, and fan favorites. Requires VPN.', '["HBO Originals (Game of Thrones, etc.)", "Warner Bros. Movie Premieres", "Max Originals", "Requires VPN (Instructions Provided)"]', 'https://logo.clearbit.com/hbomax.com', false, NULL, '{"monthly": 500, "original": 2800}', 'true', '[{"type": "Single Screen", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 500, "original": 2800}]}]', NOW(), NOW()),
('hulu', 'Hulu', 'Entertainment, Streaming', 'Access a huge streaming library of current-season episodes and hit movies.', '["Current-Season TV Shows", "Award-Winning Hulu Originals", "Huge Movie Library", "Requires VPN (Instructions Provided)"]', 'https://logo.clearbit.com/hulu.com', false, NULL, '{"monthly": 450, "original": 2200}', 'true', '[{"type": "Single Screen", "description": "Monthly access for a single user (ad-supported).", "durations": [{"duration": "1 Month", "price": 450, "original": 2200}]}]', NOW(), NOW()),
('quillbot-premium', 'Quillbot Premium', 'Writer Tools, Study Tools', 'Advanced AI writing assistant for paraphrasing, grammar checking, and summarizing.', '["Unlimited Paraphrasing", "Advanced Grammar & Tone Checks", "Plagiarism Checker", "Faster Processing Speed"]', 'https://logo.clearbit.com/quillbot.com', false, NULL, '{"monthly": 400, "original": 2800}', 'true', '[{"type": "Shared Account", "description": "Access for one device for one month.", "durations": [{"duration": "1 Month", "price": 400, "original": 2800}]}]', NOW(), NOW()),
('grammarly-premium', 'Grammarly Premium', 'Writer Tools, Study Tools', 'Go beyond grammar and spelling to improve your writing''s style and clarity.', '["Advanced Grammar & Punctuation", "Clarity & Conciseness Suggestions", "Plagiarism Detector", "Tone Adjustment"]', 'https://logo.clearbit.com/grammarly.com', false, NULL, '{"monthly": 500, "original": 3500}', 'true', '[{"type": "Shared Account", "description": "Access for one device for one month.", "durations": [{"duration": "1 Month", "price": 500, "original": 3500}]}]', NOW(), NOW()),
('turnitin-instructor', 'Turnitin Instructor', 'Study Tools, Writer Tools', 'Check for plagiarism and AI-generated content with a professional instructor account.', '["Plagiarism Reports", "AI Content Detection", "100 Files Daily Limit (on Pro plans)", "Personal or Shared Access"]', 'https://logo.clearbit.com/turnitin.com', false, NULL, '{"monthly": 350, "original": 1000}', 'true', '[{"type": "Student (Plagiarism Only)", "description": "Personal account on your email for plagiarism checks.", "durations": [{"duration": "1 Month", "price": 350, "original": 1000}]}, {"type": "Pro AI (Shared)", "description": "Shared account with AI & Plagiarism reports. Shared with 3 people.", "durations": [{"duration": "1 Month", "price": 1900, "original": 4000}]}, {"type": "Pro AI (Private)", "description": "Private account on your email with AI & Plagiarism reports.", "durations": [{"duration": "1 Month", "price": 4200, "original": 6000}]}]', NOW(), NOW()),
('chegg-account', 'Chegg Study Account', 'Study Tools', 'Get expert Q&A, textbook solutions, and homework help.', '["Expert Q&A", "Textbook Solutions", "Homework Help", "24/7 Study Support"]', 'https://logo.clearbit.com/chegg.com', false, NULL, '{"monthly": 500, "original": 4200}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 500, "original": 4200}]}]', NOW(), NOW()),
('coursera-plus', 'Coursera Plus', 'Study Tools, Courses', 'Get unlimited access to thousands of world-class courses and certifications.', '["Unlimited access to 7,000+ courses", "Certificates for completed courses", "Learn from top universities", "Activated on your personal email"]', 'https://logo.clearbit.com/coursera.com', false, NULL, '{"yearly": 4500, "original": 111000}', 'true', '[{"type": "Personal Email", "description": "Full year of Coursera Plus on your own account.", "durations": [{"duration": "1 Year", "price": 4500, "original": 111000}]}]', NOW(), NOW()),
('udemy-premium', 'Udemy Premium', 'Study Tools, Courses', 'Access a collection of top-rated courses on business, tech, and personal development.', '["Access to 8,000+ top courses", "Certificates of Completion", "Top-rated instructors", "For 1 Device"]', 'https://logo.clearbit.com/udemy.com', false, NULL, '{"monthly": 1600, "original": 8400}', 'true', '[{"type": "Premium Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 1600, "original": 8400}]}]', NOW(), NOW()),
('semrush-pro', 'Semrush Pro', 'SEO Tools, Business', 'All-in-one suite for SEO, content marketing, and competitor research.', '["Keyword Research Tools", "Competitor Analysis", "Site Audit", "Content Marketing Toolkit"]', 'https://logo.clearbit.com/semrush.com', false, NULL, '{"monthly": 1500, "original": 36000}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 1500, "original": 36000}]}]', NOW(), NOW()),
('helium-10', 'Helium 10', 'SEO Tools, Business', 'Powerful software suite for Amazon sellers and e-commerce entrepreneurs.', '["Amazon Product Research", "Keyword Research & Tracking", "Listing Optimization", "For FBA Sellers"]', 'https://logo.clearbit.com/helium10.com', false, NULL, '{"monthly": 1500, "original": 10000}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 1500, "original": 10000}]}]', NOW(), NOW()),
('jasper-ai', 'Jasper AI', 'AI Tools, Writer Tools', 'AI Content Platform that helps your team create amazing content 10x faster.', '["AI Copywriting", "Blog & Article Writer", "Multiple Content Templates", "Brand Voice & Tone"]', 'https://logo.clearbit.com/jasper.ai', false, NULL, '{"monthly": 1200, "original": 13700}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 1200, "original": 13700}]}]', NOW(), NOW()),
('copy-ai', 'Copy.ai', 'AI Tools, Writer Tools', 'AI-powered copywriter that generates high-quality marketing copy in seconds.', '["Automated Copywriting", "90+ Content Types", "Freestyle Text Generation", "Ideal for Marketers"]', 'https://logo.clearbit.com/copy.ai', false, NULL, '{"monthly": 800, "original": 13700}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 800, "original": 13700}]}]', NOW(), NOW()),
('surfer-seo', 'Surfer SEO', 'SEO Tools, Writer Tools', 'Content intelligence tool that helps you write perfectly optimized articles.', '["Data-Driven Content Editor", "SERP Analysis", "SEO Audit Tool", "Keyword Research"]', 'https://logo.clearbit.com/surferseo.com', false, NULL, '{"monthly": 1500, "original": 17800}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 1500, "original": 17800}]}]', NOW(), NOW()),
('rytr', 'Rytr AI', 'AI Tools, Writer Tools', 'An AI writing assistant that helps you create high-quality content, in just a few seconds.', '["40+ Use Cases", "30+ Languages Supported", "Built-in Plagiarism Checker", "Fast & Responsive"]', 'https://logo.clearbit.com/rytr.me', false, NULL, '{"monthly": 700, "original": 8100}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 700, "original": 8100}]}]', NOW(), NOW()),
('pictory-ai', 'Pictory.ai', 'AI Tools, Video', 'Create stunning videos from your scripts or blog posts using AI.', '["AI-Powered Video Creation", "Script-to-Video", "Blog-to-Video", "Huge Stock Media Library"]', 'https://logo.clearbit.com/pictory.ai', false, NULL, '{"monthly": 1200, "original": 6700}', 'true', '[{"type": "Shared Account", "description": "Monthly access for a single user.", "durations": [{"duration": "1 Month", "price": 1200, "original": 6700}]}]', NOW(), NOW()),
('shutterstock', 'Shutterstock', 'Graphics/Creative, Design', 'Download high-quality stock photos, vectors, videos, and music.', '["Millions of Stock Photos", "Royalty-Free Vectors & Illustrations", "Stock Video Footage", "Shared Access"]', 'https://logo.clearbit.com/shutterstock.com', false, NULL, '{"monthly": 1000, "original": 8000}', 'true', '[{"type": "Shared Account", "description": "Monthly access with download limits.", "durations": [{"duration": "1 Month", "price": 1000, "original": 8000}]}]', NOW(), NOW()),
('envato-elements', 'Envato Elements', 'Graphics/Creative, Design', 'Unlimited downloads of millions of creative assets: templates, stock videos, photos, and more.', '["Unlimited Downloads", "Millions of Creative Assets", "Stock Videos & Photos", "Templates & Fonts"]', 'https://logo.clearbit.com/envato.com', false, NULL, '{"monthly": 899, "original": 4600}', 'true', '[{"type": "Shared Account", "description": "Login access for one month. Download limits may apply.", "durations": [{"duration": "1 Month", "price": 899, "original": 4600}]}]', NOW(), NOW()),
('midjourney', 'Midjourney', 'AI Tools, Graphics/Creative', 'Advanced AI image generation tool that turns text prompts into stunning visuals.', '["AI Image Generation from Text", "High-Resolution & Stylistic Outputs", "Ideal for Concept Art & Design", "Private Account Access"]', 'https://logo.clearbit.com/midjourney.com', false, NULL, '{"monthly": 3500, "original": 8400}', 'true', '[{"type": "Basic Plan", "description": "Monthly private access with a set number of image generations.", "durations": [{"duration": "1 Month", "price": 3500, "original": 8400}]}]', NOW(), NOW()),
('nord-vpn', 'NordVPN', 'VPN, Software', 'Secure, high-speed VPN for safe and private internet access on one device.', '["High-Speed Servers", "Strict No-Logs Policy", "Secure Encryption", "For 1 Device"]', 'https://logo.clearbit.com/nordvpn.com', false, NULL, '{"monthly": 400, "original": 3600}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 400, "original": 3600}]}]', NOW(), NOW()),
('express-vpn', 'ExpressVPN', 'VPN, Software', 'Premium VPN service known for its blazing-fast speeds and robust security.', '["Blazing-Fast Speeds", "Best-in-Class Encryption", "99.9% Uptime", "For 1 Device"]', 'https://logo.clearbit.com/expressvpn.com', false, NULL, '{"monthly": 600, "original": 3600}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 600, "original": 3600}]}]', NOW(), NOW()),
('surfshark-vpn', 'Surfshark VPN', 'VPN, Software', 'Affordable VPN with premium features for secure and private browsing.', '["Strong Encryption", "CleanWeb Ad-blocker", "Strict No-Logs Policy", "For 1 Device"]', 'https://logo.clearbit.com/surfshark.com', false, NULL, '{"monthly": 350, "original": 3600}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 350, "original": 350}]}]', NOW(), NOW()),
('cyberghost-vpn', 'CyberGhost VPN', 'VPN, Software', 'User-friendly VPN with servers optimized for streaming and torrenting.', '["Optimized Streaming Servers", "User-Friendly Apps", "Strong No-Logs Policy", "For 1 Device"]', 'https://logo.clearbit.com/cyberghostvpn.com', false, NULL, '{"monthly": 500, "original": 3600}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 500, "original": 3600}]}]', NOW(), NOW()),
('ip-vanish-vpn', 'IP Vanish VPN', 'VPN, Software', 'Fast and secure VPN with a strong focus on privacy and anonymity.', '["Anonymous Torrenting Support", "Zero Traffic Logs", "Advanced Encryption", "For 1 Device"]', 'https://logo.clearbit.com/ipvanish.com', false, NULL, '{"monthly": 350, "original": 3000}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 350, "original": 3000}]}]', NOW(), NOW()),
('hotspot-shield-vpn', 'Hotspot Shield VPN', 'VPN, Software', 'Popular VPN for fast streaming and secure browsing.', '["Patented Hydra Protocol for Speed", "Military-Grade Encryption", "4K Streaming Support", "For 1 Device"]', 'https://logo.clearbit.com/hotspotshield.com', false, NULL, '{"monthly": 400, "original": 2200}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 400, "original": 2200}]}]', NOW(), NOW()),
('pure-vpn', 'Pure VPN', 'VPN, Software', 'A feature-rich VPN with a massive global server network.', '["256-bit Encryption", "Always-On Audit", "Port Forwarding Support", "For 1 Device"]', 'https://logo.clearbit.com/purevpn.com', false, NULL, '{"monthly": 400, "original": 3000}', 'true', '[{"type": "Shared Account", "description": "One month access for a single device.", "durations": [{"duration": "1 Month", "price": 400, "original": 3000}]}]', NOW(), NOW()),
('playstation-plus', 'Playstation Plus (PS+)', 'Gaming, Entertainment', 'Online multiplayer, free monthly games, and exclusive discounts on PlayStation.', '["Online Multiplayer Access", "Free Monthly Games", "Exclusive Discounts", "Cloud Storage"]', 'https://logo.clearbit.com/playstation.com', false, NULL, '{"monthly": 2750, "original": 3500}', 'true', '[{"type": "Essential", "description": "Core plan with online multiplayer and monthly games.", "durations": [{"duration": "1 Month", "price": 2750, "original": 3500}, {"duration": "3 Months", "price": 7400, "original": 10500}, {"duration": "12 Months", "price": 18400, "original": 42000}]}, {"type": "Extra", "description": "Includes Essential benefits plus a catalog of PS4 & PS5 games.", "durations": [{"duration": "1 Month", "price": 3850, "original": 5000}, {"duration": "3 Months", "price": 9500, "original": 15000}, {"duration": "12 Months", "price": 27800, "original": 60000}]}, {"type": "Deluxe", "description": "All benefits plus classic games and game trials.", "durations": [{"duration": "1 Month", "price": 4750, "original": 6000}, {"duration": "3 Months", "price": 10700, "original": 18000}, {"duration": "12 Months", "price": 32300, "original": 72000}]}]', NOW(), NOW()),
('rdp-service', 'RDP (Remote Desktop)', 'Software, Productivity', 'High-performance Remote Desktop Protocol for various tasks.', '["High-Speed Connection", "Multiple Configurations", "25-Day Replacement Warranty", "Emulator Support Available"]', 'https://logo.clearbit.com/microsoft.com', false, NULL, '{"monthly": 1800, "original": 2500}', 'true', '[{"type": "2 Core / 4GB RAM", "description": "Balanced performance for general tasks.", "durations": [{"duration": "1 Month", "price": 2000, "original": 3000}]}, {"type": "4 Core / 8GB RAM", "description": "More power for demanding applications.", "durations": [{"duration": "1 Month", "price": 2700, "original": 4000}]}, {"type": "8 Core / 16GB RAM", "description": "High-end performance for heavy workloads.", "durations": [{"duration": "1 Month", "price": 3500, "original": 5000}]}]', NOW(), NOW()),
('uk-physical-sim', 'UK Physical SIM Card', 'Services', 'Get a physical UK SIM card for international calls, SMS, and account verification.', '["Unlock TikTok Live", "Create UK WhatsApp", "Receive International Calls & SMS", "Business Verification"]', 'https://logo.clearbit.com/ee.co.uk', false, NULL, '{"monthly": 4500, "original": 6000}', 'false', '[{"type": "Physical SIM", "description": "One-time purchase for a UK SIM card.", "durations": [{"duration": "One-Time", "price": 4500, "original": 6000}]}]', NOW(), NOW()),
('linkedin-premium', 'LinkedIn Premium', 'Business, Productivity', 'Unlock advanced features for job seeking, networking, and sales prospecting.', '["Advanced Search Filters", "InMail Credits", "See Who Viewed Your Profile", "Access to LinkedIn Learning"]', 'https://logo.clearbit.com/linkedin.com', false, NULL, '{"monthly": 6000, "original": 22000}', 'true', '[{"type": "Sales Navigator Advance", "description": "Advanced tools for sales professionals to find leads.", "durations": [{"duration": "1 Month", "price": 7500, "original": 28000}]}, {"type": "Business Plan (Yearly)", "description": "Grow your presence and build your brand.", "durations": [{"duration": "1 Year", "price": 8999, "original": 71000}]}]', NOW(), NOW()),
('ms-office-365', 'Microsoft Office 365', 'Software, Productivity', 'Lifetime access to the essential Microsoft productivity suite: Word, Excel, PowerPoint.', '["One-Time Payment (Lifetime)", "Word, Excel, PowerPoint", "5TB OneDrive Storage", "Use on 5 Devices"]', 'https://logo.clearbit.com/microsoft.com', false, NULL, '{"yearly": 2500, "original": 21000}', 'true', '[{"type": "Lifetime Account", "description": "One-time payment for lifetime access on your name.", "durations": [{"duration": "Lifetime", "price": 2500, "original": 21000}]}]', NOW(), NOW()),
('windows-pro', 'Microsoft Windows 10/11 Pro', 'Software, Productivity', 'Official OEM license key for Windows 10 Pro or Windows 11 Pro.', '["Official OEM License Key", "Lifetime Activation", "For 1 PC", "Windows 10 Pro or 11 Pro"]', 'https://logo.clearbit.com/microsoft.com', false, NULL, '{"yearly": 1499, "original": 40000}', 'true', '[{"type": "OEM License Key", "description": "One-time purchase for a single PC activation.", "durations": [{"duration": "Lifetime", "price": 1499, "original": 40000}]}]', NOW(), NOW()),
('social-media-services', 'Social Media Services', 'Business, Social Media Services', 'Grow your social media presence with authentic followers, likes, views, and more.', '["Authentic Followers, Likes & Views", "Supports TikTok, Instagram, Facebook, YouTube", "Fast Delivery", "Non-Drop Guarantees Available"]', 'https://logo.clearbit.com/facebook.com', true, NULL, '{"monthly": 50, "original": 100}', 'true', '[{"type": "TikTok Services", "description": "Boost your TikTok profile. Non-Drop and Organic options available.", "durations": [{"duration": "1k Followers", "price": 800, "original": 1200}, {"duration": "5k Views", "price": 100, "original": 200}, {"duration": "1k Likes", "price": 250, "original": 400}]}, {"type": "Instagram Services", "description": "Enhance your Instagram engagement.", "durations": [{"duration": "1k Followers", "price": 350, "original": 600}, {"duration": "1k Likes", "price": 150, "original": 250}, {"duration": "1k Views", "price": 50, "original": 100}]}, {"type": "YouTube Services", "description": "Grow your YouTube channel. Monetization packages available.", "durations": [{"duration": "1k Subscribers", "price": 3000, "original": 4500}, {"duration": "1k Views", "price": 400, "original": 600}, {"duration": "1k Likes", "price": 400, "original": 600}]}, {"type": "Facebook Services", "description": "Increase your page''s reach and likes.", "durations": [{"duration": "1k Page Like/Followers", "price": 850, "original": 1200}, {"duration": "1k Post Likes", "price": 400, "original": 600}, {"duration": "1k Views", "price": 120, "original": 200}]}]', NOW(), NOW())
;

-- Insert SEO settings data
INSERT INTO public.seo_settings (page_key, title, description) VALUES
('home', 'Kings Subscriptions - Premium Digital Products', 'Get ChatGPT Plus, Canva Pro, Adobe Suite & 15+ premium tools at 50% off with instant delivery and 24/7 support.');

INSERT INTO public.seo_settings (page_key, title, description) VALUES
('tools', 'Premium Tools & Subscriptions | Kings Subscriptions', 'Browse verified premium tools with flexible plans and genuine renewals. Pick the perfect option for your workflow.');

INSERT INTO public.seo_settings (page_key, title, description) VALUES
('about', 'About Kings Subscriptions', 'Learn how Kings Subscriptions delivers affordable premium tools with transparent policies and dedicated support.');

INSERT INTO public.seo_settings (page_key, title, description) VALUES
('products', 'All Products | Kings Subscriptions', 'Explore every premium subscription we offer across AI, streaming, design, and business categories.');

INSERT INTO public.seo_settings (page_key, title, description) VALUES
('blog', 'Knowledge Hub | Kings Subscriptions', 'Guides, case studies, and tool comparisons to help you save money and scale your workflow.');

INSERT INTO public.seo_settings (page_key, title, description) VALUES
('contact', 'Contact Kings Subscriptions', 'Need help choosing a plan? Talk to our support team via WhatsApp, email, or live chat.');

-- Insert blog posts data one by one to avoid truncation issues
-- Insert blog posts data one by one to avoid truncation issues
INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('best-premium-tools-2025', 'best-premium-tools-for-small-business-2025', '25 Best Premium Tools for Small Business in 2025: Complete Guide', 'Discover the ultimate toolkit for entrepreneurs: AI assistants, design software, marketing tools, and productivity apps that will transform your business operations.', 'SEO Master', 'Business Tools', '["premium tools", "small business", "productivity", "AI tools"]'::jsonb, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', '["Why Premium Tools Matter for Small Businesses", "In today''s competitive landscape, small businesses need access to professional-grade tools to compete with larger enterprises. Premium software subscriptions provide advanced features, better security, and reliable support that free alternatives simply can''t match.", "Top 10 Essential Premium Tools for Small Business", "• ChatGPT Plus - Advanced AI writing and analysis ($20/month)", "• Canva Pro - Professional design toolkit ($12.99/month)", "• Semrush - Complete SEO and marketing suite ($129/month)", "• Adobe Creative Cloud - Design and creative software ($52.99/month)", "• Zoom Pro - Professional video conferencing ($14.99/month)", "• Slack Pro - Team communication platform ($8.75/user/month)", "• QuickBooks Pro - Accounting and financial management ($30/month)", "• HubSpot CRM - Customer relationship management ($45/month)", "• Mailchimp Pro - Email marketing automation ($14.99/month)", "• Shopify Basic - E-commerce platform ($29/month)", "How to Save Money on Premium Tools", "Many small businesses struggle with the high cost of premium software. Here are proven strategies to reduce your subscription expenses:", "• Choose annual plans for 15-20% savings", "• Use shared accounts for team access", "• Select bundled subscriptions when available", "• Audit usage and cancel unused tools quarterly", "• Consider open-source alternatives for basic needs", "ROI of Premium Tools for Small Business", "Investing in premium tools typically yields 300-500% ROI within the first year. Professional software enables automation, improves efficiency, and provides competitive advantages that drive revenue growth.", "Ready to access premium tools at affordable prices? Get started with King Subs today and save up to 70% on software subscriptions."]'::jsonb, true, '12 min read', '25 Best Premium Tools for Small Business 2025 | Complete Guide', 'Discover the ultimate toolkit for entrepreneurs: AI assistants, design software, marketing tools, and productivity apps that will transform your business operations.', '2025-09-15T08:00:00.000Z'::TIMESTAMP WITH TIME ZONE);


INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('chatgpt-plus-alternatives', 'chatgpt-plus-alternatives-best-ai-tools-2025', 'ChatGPT Plus Alternatives: 15 Best AI Tools for Business in 2025', 'ChatGPT Plus isn''t the only game in town. Discover superior AI alternatives that offer better features, lower costs, and specialized capabilities for entrepreneurs.', 'AI Expert', 'AI Tools', '["chatgpt alternatives", "AI tools", "business AI", "productivity"]'::jsonb, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80', '["Why Look Beyond ChatGPT Plus?", "While ChatGPT Plus offers solid general-purpose AI capabilities, specialized tools often provide better results for specific business needs. Many alternatives offer more affordable pricing and advanced features.", "Top ChatGPT Plus Alternatives", "• Claude 3 Opus - Superior writing and analysis ($20/month)", "• Gemini Ultra - Best Google Workspace integration ($20/month)", "• Perplexity Pro - Advanced research capabilities ($20/month)", "• Jasper - Specialized marketing copy ($39/month)", "• Copy.ai - Creative writing assistant ($49/month)", "• Writesonic - SEO-focused content creation ($12/month)", "• Rytr - Budget-friendly writing tool ($29/month)", "• Notion AI - Integrated productivity AI ($10/month)", "• GitHub Copilot - Code generation ($10/month)", "• Midjourney - AI image generation ($10/month)", "Best AI Tools by Use Case", "Content Creation & Marketing", "• Jasper - Best for marketing copy and blog posts", "• Copy.ai - Excellent for social media content", "• Writesonic - Superior for SEO-optimized articles", "Business Analysis & Strategy", "• Claude 3 Opus - Best for complex analysis", "• Perplexity Pro - Superior research capabilities", "• Gemini Ultra - Excellent data processing", "Cost Comparison: ChatGPT vs Alternatives", "Tool | Price | Best For | Rating", "ChatGPT Plus | $20/month | General AI tasks | 4.2/5", "Claude 3 Opus | $20/month | Writing & Analysis | 4.8/5", "Jasper | $39/month | Marketing Copy | 4.6/5", "Copy.ai | $49/month | Creative Writing | 4.4/5", "Writesonic | $12/month | SEO Content | 4.3/5", "Don''t limit yourself to ChatGPT Plus. Explore superior AI alternatives and save money with King Subs premium tool subscriptions."]'::jsonb, true, '15 min read', 'ChatGPT Plus Alternatives: 15 Best AI Tools for Business 2025', 'ChatGPT Plus isn''t the only game in town. Discover superior AI alternatives that offer better features, lower costs, and specialized capabilities for entrepreneurs.', '2025-09-12T09:30:00.000Z'::TIMESTAMP WITH TIME ZONE);

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('save-money-software-subscriptions', 'how-to-save-money-on-software-subscriptions', 'How to Save $10,000+ Per Year on Software Subscriptions: Complete Guide', 'Stop wasting money on expensive software subscriptions. Learn proven strategies to cut costs by 70% while maintaining access to premium tools your business needs.', 'Finance Expert', 'Cost Saving', '["software subscriptions", "cost saving", "business expenses", "budget"]'::jsonb, 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80', '["The Hidden Cost of Software Subscriptions", "Small businesses typically spend 15-25% of their revenue on software subscriptions. With proper management, you can reduce this to 5-10% while maintaining access to essential tools.", "Strategy 1: Audit Your Current Stack", "Start by listing all your software subscriptions and their usage. Identify tools that are underutilized or redundant.", "• Track monthly costs for each tool", "• Monitor user engagement and feature usage", "• Identify overlapping functionality", "• Calculate ROI for each subscription", "Strategy 2: Negotiate Better Rates", "• Contact providers for enterprise discounts", "• Ask for annual billing discounts (15-20% savings)", "• Request free months for long-term commitments", "• Bundle multiple tools from the same provider", "Strategy 3: Use Shared Accounts", "Many premium tools allow multiple users on a single account. This can reduce costs by 60-80% for team access.", "• Centralized account management", "• Controlled access permissions", "• Cost-effective team collaboration", "• Professional account features", "Strategy 4: Choose Cost-Effective Alternatives", "Expensive Tool | Cost-Effective Alternative | Savings", "Adobe Creative Cloud | Canva Pro | $480/year", "Figma Professional | Penpot (Free) | $144/year", "Zoom Pro | Google Meet | $180/year", "Slack Pro | Discord | $96/year", "Mailchimp Pro | ConvertKit | $240/year", "Real-World Savings Examples", "• Design Agency: Saved $8,400/year by switching to Canva Pro", "• Marketing Firm: Reduced costs by $12,000/year with shared accounts", "• E-commerce Store: Cut software expenses by 65% with strategic alternatives", "• Consulting Business: Saved $15,000/year through negotiated enterprise rates", "Ready to slash your software subscription costs? King Subs helps businesses save thousands annually on premium tools. Start your cost optimization journey today."]'::jsonb, true, '18 min read', 'How to Save $10,000+ Per Year on Software Subscriptions', 'Stop wasting money on expensive software subscriptions. Learn proven strategies to cut costs by 70% while maintaining access to premium tools your business needs.', '2025-09-10T10:15:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('canva-pro-vs-adobe-creative-cloud', 'canva-pro-vs-adobe-creative-cloud-comparison', 'Canva Pro vs Adobe Creative Cloud: Which is Better for Small Business?', 'The ultimate comparison between Canva Pro and Adobe Creative Cloud. Find out which design platform offers better value, features, and ROI for your business needs.', 'Design Expert', 'Design Tools', '["canva pro", "adobe creative cloud", "design software", "graphic design"]'::jsonb, 'https://images.unsplash.com/photo-1586717791821-3f44a563fa4c?auto=format&fit=crop&w=1200&q=80', '["Canva Pro vs Adobe Creative Cloud: The Ultimate Showdown", "Choosing between Canva Pro and Adobe Creative Cloud is a critical decision for small businesses. Each platform offers unique strengths and serves different user needs.", "Pricing Comparison", "Plan | Canva Pro | Adobe Creative Cloud", "Monthly Price | $12.99 | $52.99", "Annual Price | $119.99 | $599.88", "Best For | Small teams, quick designs | Professional designers", "Learning Curve | Easy | Steep", "Storage | 1TB | 100GB", "Feature Comparison", "Canva Pro Strengths", "• Intuitive drag-and-drop interface", "• Thousands of professional templates", "• Built-in stock photos and graphics", "• Real-time collaboration", "• Mobile app with full functionality", "• Brand kit for consistent branding", "Adobe Creative Cloud Strengths", "• Industry-standard professional tools", "• Photoshop, Illustrator, InDesign suite", "• Advanced photo editing capabilities", "• Vector graphics and typography control", "• Integration with other Adobe products", "• Extensive plugin ecosystem", "Which Should You Choose?", "Choose Canva Pro If:", "• You''re new to design or have a small team", "• You need quick, professional-looking results", "• Budget is a major concern", "• You want easy collaboration features", "• Mobile design work is important", "Choose Adobe Creative Cloud If:", "• You need professional-grade design work", "• You''re willing to invest time in learning", "• You require advanced photo editing", "• Industry standards are important", "• You need specialized design tools", "ROI Analysis", "Canva Pro typically offers 4x better ROI for small businesses due to its lower cost and faster learning curve. Most users see a return on investment within 2-3 months.", "Ready to choose the right design tool for your business? Get Canva Pro at Huge Discounts with King Subs and start creating professional designs today."]'::jsonb, true, '14 min read', 'Canva Pro vs Adobe Creative Cloud: Which is Better for Small Business?', 'The ultimate comparison between Canva Pro and Adobe Creative Cloud. Find out which design platform offers better value, features, and ROI for your business needs.', '2025-09-08T11:00:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('best-ai-tools-entrepreneurs', 'best-ai-tools-for-entrepreneurs-2025', 'Best AI Tools for Entrepreneurs in 2025: Boost Productivity by 300%', 'Discover the top AI tools that successful entrepreneurs use to automate tasks, generate ideas, and scale their businesses. Save time and money with these game-changing solutions.', 'Entrepreneur Coach', 'Entrepreneurship', '["AI tools", "entrepreneurship", "productivity", "automation"]'::jsonb, 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80', '["Why Entrepreneurs Need AI Tools", "Entrepreneurs wear many hats and juggle countless tasks. AI tools can automate repetitive work, provide insights, and help make better decisions. The right AI toolkit can save 20+ hours per week.", "Essential AI Tools for Entrepreneurs", "Content Creation & Marketing", "• ChatGPT Plus - Business writing and strategy ($20/month)", "• Jasper - Marketing copy generation ($39/month)", "• Canva Magic Studio - AI-powered design ($12.99/month)", "• Runway ML - Video creation and editing ($12/month)", "Business Operations & Analysis", "• Zapier - Workflow automation ($19.99/month)", "• Notion AI - Project management ($10/month)", "• Tableau Public - Data visualization (Free)", "• MonkeyLearn - Text analysis ($299/month)", "Customer Service & Sales", "• Intercom - AI chatbot ($39/month)", "• HubSpot CRM - Sales automation ($45/month)", "• Drift - Conversational marketing ($0-500/month)", "• Gong - Sales call analysis ($65/user/month)", "How AI Tools Boost Entrepreneur Productivity", "• Automate repetitive tasks like email responses and scheduling", "• Generate marketing content 10x faster", "• Analyze data and provide business insights", "• Create professional designs without design skills", "• Handle customer inquiries 24/7", "Cost-Benefit Analysis", "The average entrepreneur saves $500+ per month by using AI tools effectively. With proper implementation, these tools typically pay for themselves within 30-60 days.", "Getting Started with AI Tools", "• Start with one tool that solves your biggest pain point", "• Learn the basics through tutorials and documentation", "• Integrate tools to create automated workflows", "• Track ROI and adjust your toolkit as you grow", "• Stay updated with new AI developments", "Ready to supercharge your entrepreneurial journey with AI? Get access to premium AI tools at discounted rates with King Subs."]'::jsonb, true, '16 min read', 'Best AI Tools for Entrepreneurs 2025: Boost Productivity by 300%', 'Discover the top AI tools that successful entrepreneurs use to automate tasks, generate ideas, and scale their businesses. Save time and money with these game-changing solutions.', '2025-09-05T12:20:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('software-subscription-management', 'software-subscription-management-guide', 'Complete Guide to Software Subscription Management for Businesses', 'Master the art of managing software subscriptions. Learn how to track costs, optimize spending, and maximize ROI from your tech stack investments.', 'Tech Management Expert', 'Business Management', '["subscription management", "software", "business tools", "cost optimization"]'::jsonb, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', '["The Growing Challenge of Software Subscriptions", "Businesses today subscribe to an average of 37 different software tools. Without proper management, subscription costs can spiral out of control, eating into profits and limiting growth.", "Building a Subscription Management System", "Step 1: Create a Master Inventory", "• List all current subscriptions with costs", "• Document renewal dates and auto-payment status", "• Track user assignments and utilization rates", "• Note contract terms and cancellation policies", "Step 2: Implement Cost Controls", "• Set monthly budget limits by category", "• Require approval for new subscriptions", "• Conduct quarterly subscription audits", "• Negotiate better rates annually", "Subscription Management Best Practices", "Centralized Management", "Use a single platform or spreadsheet to track all subscriptions. Include payment methods, renewal dates, and usage metrics.", "Regular Audits", "• Review subscriptions quarterly", "• Cancel unused or underutilized tools", "• Consolidate overlapping functionality", "• Update payment methods as needed", "Cost Optimization Strategies", "• Choose annual plans for 15-20% savings", "• Use shared accounts for team access", "• Negotiate enterprise discounts", "• Select bundled subscriptions", "• Consider open-source alternatives", "Tools for Subscription Management", "Tool | Purpose | Cost", "Google Sheets | Basic tracking | Free", "Notion | Advanced organization | $10/month", "Subscription management software | Automated tracking | $20-100/month", "Accounting software | Expense tracking | $10-50/month", "Password manager | Credential storage | $3-5/month", "Measuring ROI from Software Investments", "• Track productivity improvements", "• Monitor cost savings achieved", "• Measure revenue impact", "• Calculate time saved per tool", "• Assess user satisfaction", "Take control of your software subscriptions today. King Subs provides expert guidance and discounted access to premium business tools."]'::jsonb, true, '20 min read', 'Complete Guide to Software Subscription Management for Businesses', 'Master the art of managing software subscriptions. Learn how to track costs, optimize spending, and maximize ROI from your tech stack investments.', '2025-09-03T13:45:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('digital-marketing-tools-comparison', 'digital-marketing-tools-comparison-2025', 'Digital Marketing Tools Comparison 2025: Complete Buyer''s Guide', 'Navigate the crowded digital marketing landscape with confidence. Compare top tools across SEO, social media, email marketing, and analytics to find your perfect marketing stack.', 'Marketing Strategist', 'Digital Marketing', '["digital marketing", "marketing tools", "SEO", "social media", "email marketing"]'::jsonb, 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', '["The Essential Digital Marketing Toolkit", "Successful digital marketing requires the right combination of tools. From SEO and content marketing to social media and analytics, each tool serves a specific purpose in your marketing strategy.", "SEO Tools Comparison", "Tool | Best For | Price | Rating", "Semrush | Complete SEO suite | $129/month | 4.8/5", "Ahrefs | Backlink analysis | $99/month | 4.7/5", "Moz Pro | Beginner-friendly SEO | $79/month | 4.4/5", "SEMrush | Keyword research | $129/month | 4.8/5", "Screaming Frog | Technical SEO | $149/year | 4.6/5", "Social Media Management Tools", "• Hootsuite - Best for enterprise teams ($99/month)", "• Buffer - User-friendly interface ($15/month)", "• Later - Visual planning focus ($18/month)", "• Sprout Social - Advanced analytics ($249/month)", "• Missinglettr - AI-powered content ($25/month)", "Email Marketing Platforms", "Platform | Best Feature | Price | Contact Limit", "Mailchimp | Automation | $14.99/month | 500-2000", "ConvertKit | Creator-focused | $9/month | 300-5000", "Sendinblue | SMS marketing | $25/month | 1000-10000", "ActiveCampaign | CRM integration | $29/month | 500-1000", "Drip | E-commerce focus | $39/month | 2500", "Analytics & Tracking Tools", "• Google Analytics 4 - Free web analytics", "• Hotjar - User behavior tracking ($39/month)", "• Mixpanel - Product analytics ($89/month)", "• Amplitude - Advanced analytics ($0-1000/month)", "• Tableau - Data visualization ($70/user/month)", "Content Marketing Tools", "• HubSpot - Complete marketing suite ($45/month)", "• Jasper - AI content creation ($39/month)", "• Surfer SEO - Content optimization ($89/month)", "• Grammarly Business - Writing enhancement ($15/user/month)", "• Canva Pro - Visual content creation ($12.99/month)", "Building Your Marketing Stack", "For Startups & Small Businesses", "• Google Analytics (Free)", "• Mailchimp ($14.99/month)", "• Canva Pro ($12.99/month)", "• Buffer ($15/month)", "• Semrush ($129/month)", "For Growing Businesses", "• Google Analytics 4 (Free)", "• HubSpot Pro ($45/month)", "• Semrush ($129/month)", "• Hotjar ($39/month)", "• Jasper ($39/month)", "Cost Optimization Tips", "• Start with free tools and upgrade as you grow", "• Choose annual plans for 15-20% savings", "• Use shared accounts for team access", "• Audit tools quarterly to eliminate waste", "• Consider bundled subscriptions from single providers", "Ready to build your perfect digital marketing stack? King Subs offers discounted access to all major marketing tools. Start optimizing your marketing efforts today."]'::jsonb, true, '22 min read', 'Digital Marketing Tools Comparison 2025: Complete Buyer''s Guide', 'Navigate the crowded digital marketing landscape with confidence. Compare top tools across SEO, social media, email marketing, and analytics to find your perfect marketing stack.', '2025-09-01T14:30:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('premium-tools-roi-guide', 'premium-tools-roi-guide-business-growth', 'Premium Tools ROI Guide: How to Measure Business Growth Impact', 'Learn how to calculate and maximize return on investment from premium software tools. Discover frameworks to justify tech spending and prove business value.', 'Business Analyst', 'Business Strategy', '["ROI", "business growth", "premium tools", "investment"]'::jsonb, 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80', '["Understanding Premium Tools ROI", "Premium tools represent a significant investment for businesses. Understanding and measuring ROI is crucial for justifying these expenses and optimizing your tech stack.", "ROI Calculation Framework", "Basic ROI Formula", "ROI = (Gain from Investment - Cost of Investment) / Cost of Investment × 100", "For Software Tools", "• Quantify time savings and productivity gains", "• Calculate revenue increases from improved performance", "• Measure cost reductions from process optimization", "• Track quality improvements and error reduction", "• Assess competitive advantages gained", "Measuring Productivity Gains", "Tool Category | Average Time Savings | Monthly Value", "AI Writing Tools | 5 hours/week | $250-500", "Design Software | 8 hours/week | $400-800", "Project Management | 6 hours/week | $300-600", "Marketing Automation | 10 hours/week | $500-1000", "Accounting Software | 4 hours/week | $200-400", "Revenue Impact Assessment", "Direct Revenue Drivers", "• Increased sales from better marketing tools", "• Higher conversion rates from improved websites", "• New revenue streams from automation", "• Premium pricing enabled by professional tools", "• Market expansion through better analytics", "Indirect Revenue Benefits", "• Improved customer satisfaction and retention", "• Enhanced brand reputation", "• Competitive advantages in the market", "• Ability to handle larger clients/projects", "• Scalability improvements", "Cost Reduction Analysis", "• Elimination of manual processes", "• Reduction in outsourcing expenses", "• Lower error rates and rework costs", "• Improved resource utilization", "• Streamlined operations", "ROI by Business Size", "Business Size | Average ROI | Payback Period | Annual Savings", "Solo Entrepreneur | 300-500% | 2-3 months | $5,000-15,000", "Small Business (2-10) | 400-700% | 1-2 months | $15,000-50,000", "Medium Business (11-50) | 500-1000% | 1 month | $50,000-200,000", "Large Business (50+) | 600-1500% | 2-4 weeks | $200,000+", "Maximizing Tool ROI", "• Provide comprehensive training to users", "• Set clear KPIs and success metrics", "• Regularly audit tool usage and effectiveness", "• Integrate tools for maximum workflow efficiency", "• Stay updated with new features and best practices", "Common ROI Mistakes to Avoid", "• Focusing only on subscription costs", "• Ignoring implementation and training costs", "• Not measuring qualitative benefits", "• Underestimating long-term value", "• Comparing tools without considering integration", "Ready to maximize your ROI from premium tools? King Subs helps businesses choose the right tools and measure their impact. Start your ROI optimization journey today."]'::jsonb, true, '19 min read', 'Premium Tools ROI Guide: How to Measure Business Growth Impact', 'Learn how to calculate and maximize return on investment from premium software tools. Discover frameworks to justify tech spending and prove business value.', '2025-08-28T15:15:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

INSERT INTO public.blog_posts (
    id,
    slug,
    title,
    excerpt,
    author,
    category,
    tags,
    cover_image,
    content,
    published,
    read_time,
    meta_title,
    meta_description,
    created_at
) VALUES
('business-growth-hacks-2025', 'business-growth-hacks-premium-tools-2025', 'Business Growth Hacks 2025: Leverage Premium Tools for Explosive Growth', 'Discover cutting-edge strategies to accelerate business growth using premium digital tools. From automation to analytics, learn how successful entrepreneurs scale their businesses.', 'Growth Hacker', 'Business Growth', '["business growth", "scaling", "premium tools", "entrepreneurship"]'::jsonb, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80', '["The Growth Imperative in 2025", "In today''s hyper-competitive business landscape, growth isn''t optional—it''s essential for survival. Premium tools provide the leverage needed to accelerate growth and stay ahead of the competition.", "Growth Hack #1: Automate Everything", "Automation is the foundation of scalable growth. Premium tools can automate repetitive tasks, freeing you to focus on high-value activities.", "Email marketing automation with Mailchimp", "Social media scheduling with Hootsuite", "Lead generation with HubSpot", "Customer support with Intercom", "Invoice generation with QuickBooks", "Growth Hack #2: Optimize Your Marketing Funnel", "Use analytics tools to identify bottlenecks and opportunities in your customer journey.", "A/B testing with Google Optimize", "Conversion tracking with Google Analytics", "Email sequence optimization with Mailchimp", "Landing page testing with Unbounce", "Growth Hack #3: Leverage AI for Content Creation", "AI tools can dramatically speed up content creation while maintaining quality.", "Blog post generation with Jasper", "Social media content with Copy.ai", "Video script writing with ChatGPT", "SEO optimization with Surfer SEO", "Image creation with Midjourney", "Growth Hack #4: Implement Data-Driven Decision Making", "Use premium analytics tools to make informed business decisions.", "Customer behavior analysis with Hotjar", "Sales forecasting with Salesforce", "Market research with Statista", "Competitor analysis with Semrush", "Financial modeling with Excel or Google Sheets", "Growth Hack #5: Streamline Operations with Workflow Automation", "Connect your tools to create seamless workflows that save time and reduce errors.", "CRM to email automation with Zapier", "Project management integration with Monday.com", "Accounting automation with QuickBooks", "Customer onboarding sequences with HubSpot", "Ready to accelerate your business growth? King Subs provides discounted access to all the premium tools you need for explosive growth."]'::jsonb, true, '17 min read', 'Business Growth Hacks 2025: Leverage Premium Tools for Explosive Growth', 'Discover cutting-edge strategies to accelerate business growth using premium digital tools. From automation to analytics, learn how successful entrepreneurs scale their businesses.', '2025-08-25T16:00:00.000Z'::TIMESTAMP WITH TIME ZONE)
ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    excerpt = EXCLUDED.excerpt,
    author = EXCLUDED.author,
    category = EXCLUDED.category,
    tags = EXCLUDED.tags,
    cover_image = EXCLUDED.cover_image,
    content = EXCLUDED.content,
    published = EXCLUDED.published,
    read_time = EXCLUDED.read_time,
    meta_title = EXCLUDED.meta_title,
    meta_description = EXCLUDED.meta_description,
    created_at = EXCLUDED.created_at;

-- Insert popup settings data (only one row should exist)
-- First, try to update existing row, if no row exists, insert new one
INSERT INTO public.popup_settings (
    id, enabled, title, message, button_text, button_href,
    show_timer, timer_duration, trigger, delay_seconds, frequency, theme, pages,
    last_shown_at, last_dismissed_at, impressions, clicks, dismissals,
    updated_at
) VALUES (
    1, true, 'Limited Time Offer',
    'Get 10% off when you order on WhatsApp within the next 10 minutes.',
    'Order on WhatsApp',
    'https://wa.me/923276847960?text=I%20want%20to%20claim%20the%20limited%20time%20offer',
    true, 10, 'delay', 6, 'once-per-session', 'dark',
    '["/", "/tools", "/product/:id"]',
    NULL, NULL, 0, 0, 0,
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    enabled = EXCLUDED.enabled,
    title = EXCLUDED.title,
    message = EXCLUDED.message,
    button_text = EXCLUDED.button_text,
    button_href = EXCLUDED.button_href,
    show_timer = EXCLUDED.show_timer,
    timer_duration = EXCLUDED.timer_duration,
    trigger = EXCLUDED.trigger,
    delay_seconds = EXCLUDED.delay_seconds,
    frequency = EXCLUDED.frequency,
    theme = EXCLUDED.theme,
    pages = EXCLUDED.pages,
    updated_at = EXCLUDED.updated_at;

-- Enable Row Level Security if not already enabled
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_settings ENABLE ROW LEVEL SECURITY;

-- Create policies allowing all operations
CREATE POLICY "Allow all operations on admin_settings" ON public.admin_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on seo_settings" ON public.seo_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on blog_posts" ON public.blog_posts FOR ALL USING (true);
CREATE POLICY "Allow all operations on popup_settings" ON public.popup_settings FOR ALL USING (true);

-- Create timestamp update function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for auto-updating timestamps
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

-- Enable real-time subscriptions for cross-browser synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.seo_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blog_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.popup_settings;

-- ===========================================
-- DATABASE RESTORATION COMPLETED SUCCESSFULLY!
-- All tables restored with complete data and proper structure
-- Real-time sync enabled for cross-browser functionality
-- ===========================================

-- Verification queries to confirm data integrity:
-- SELECT COUNT(*) as admin_settings_count FROM admin_settings;
-- SELECT COUNT(*) as products_count FROM products;
-- SELECT COUNT(*) as seo_settings_count FROM seo_settings;
-- SELECT COUNT(*) as blog_posts_count FROM blog_posts;
-- SELECT COUNT(*) as popup_settings_count FROM popup_settings;
