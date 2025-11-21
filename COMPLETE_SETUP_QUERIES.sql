-- =====================================================
-- KING SUBSCRIPTIONS - COMPLETE DATABASE SETUP
-- Run this entire file in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- PART 1: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE free_giveaways ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 2: CREATE RLS POLICIES
-- =====================================================

-- Products: Public Read
DROP POLICY IF EXISTS "Public products read" ON products;
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);

-- Settings: Public Read  
DROP POLICY IF EXISTS "Public settings read" ON settings;
CREATE POLICY "Public settings read" ON settings FOR SELECT USING (true);

-- Users: Users can read/update their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own data" ON users;
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Free Giveaways: Authenticated users can read
DROP POLICY IF EXISTS "Authenticated users can read giveaways" ON free_giveaways;
CREATE POLICY "Authenticated users can read giveaways" ON free_giveaways FOR SELECT USING (auth.role() = 'authenticated');

-- Analytics: Public Insert (for client-side tracking), No Public Select
DROP POLICY IF EXISTS "Public insert page_views" ON page_views;
CREATE POLICY "Public insert page_views" ON page_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert product_views" ON product_views;
CREATE POLICY "Public insert product_views" ON product_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert user_interactions" ON user_interactions;
CREATE POLICY "Public insert user_interactions" ON user_interactions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert conversion_events" ON conversion_events;
CREATE POLICY "Public insert conversion_events" ON conversion_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert search_queries" ON search_queries;
CREATE POLICY "Public insert search_queries" ON search_queries FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert cart_events" ON cart_events;
CREATE POLICY "Public insert cart_events" ON cart_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public insert error_logs" ON error_logs;
CREATE POLICY "Public insert error_logs" ON error_logs FOR INSERT WITH CHECK (true);

-- =====================================================
-- PART 3: ADD SAMPLE PRODUCTS
-- This will populate your database with popular products
-- =====================================================

-- Clear existing products (OPTIONAL - comment out if you want to keep existing)
-- DELETE FROM products;

-- Insert Premium Products
-- Insert Extracted Products
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('chatgpt-plus', 'ChatGPT Plus', 'Features: Advanced GPT model access, Fast responses &amp; priority, Works across devices, Semi plan: 3–6 users (our email), Shared plan: 7–9 users. Price: PKR 3,999 /month', '{"amount":3999,"currency":"PKR","display":"PKR 3,999 /month"}', '/images/products/chatgpt-plus.png', 'AI , Writting', '{"Advanced GPT model access","Fast responses &amp; priority","Works across devices","Semi plan: 3–6 users (our email)","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('coursera-plus', 'Coursera Plus', 'Features: Top university courses, Certificates included, Private on customer email. Price: PKR 1,999 /month', '{"amount":1999,"currency":"PKR","display":"PKR 1,999 /month"}', '/images/products/coursera-plus.png', 'Productivity', '{"Top university courses","Certificates included","Private on customer email"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('canva-pro', 'Canva Pro', 'Features: Premium templates &amp; assets, Background remover &amp; magic tools, Private on customer email. Price: PKR 299 /month', '{"amount":299,"currency":"PKR","display":"PKR 299 /month"}', '/images/products/canva-pro.png', 'Design', '{"Premium templates &amp; assets","Background remover &amp; magic tools","Private on customer email"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('capcut-pro', 'CapCut Pro', 'Features: Pro effects &amp; transitions, No watermark, Stock assets, Semi plan: 2 users (our email). Price: PKR 1,699 /month', '{"amount":1699,"currency":"PKR","display":"PKR 1,699 /month"}', '/images/products/capcut-pro.png', 'Video', '{"Pro effects &amp; transitions","No watermark","Stock assets","Semi plan: 2 users (our email)"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('linkedin-premium', 'LinkedIn Premium', 'Features: InMail &amp; insights, Who viewed your profile, Learning library. Price: PKR 3,499 /month', '{"amount":3499,"currency":"PKR","display":"PKR 3,499 /month"}', '/images/products/linkedin-premium.png', 'Productivity', '{"InMail &amp; insights","Who viewed your profile","Learning library"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('adobe-cloud', 'Adobe Cloud', 'Features: Full creative suite, Cloud libraries, Regular updates. Price: PKR 2,499 /month', '{"amount":2499,"currency":"PKR","display":"PKR 2,499 /month"}', '/images/products/adobe-cloud.png', 'Design', '{"Full creative suite","Cloud libraries","Regular updates"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('elevenlabs-ai', 'ElevenLabs AI', 'Features: Ultra‑realistic voices, Voice cloning, Commercial usage. Price: PKR 2,899 /month', '{"amount":2899,"currency":"PKR","display":"PKR 2,899 /month"}', '/images/products/elevenlabs-ai.png', 'Automation', '{"Ultra‑realistic voices","Voice cloning","Commercial usage"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('google-veo-3', 'Google Veo 3', 'Features: AI video generation, HD export, ~100 credits per voiceover video. Price: PKR 2,999 /month', '{"amount":2999,"currency":"PKR","display":"PKR 2,999 /month"}', '/images/products/google-veo-3.png', 'Automation', '{"AI video generation","HD export","~100 credits per voiceover video"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('wa-sender-pro', 'WA Sender Pro', 'Features: Bulk WhatsApp messaging, Template support, Automation friendly. Price: PKR 1,499 /month', '{"amount":1499,"currency":"PKR","display":"PKR 1,499 /month"}', '/images/products/wa-sender-pro.png', 'Productivity', '{"Bulk WhatsApp messaging","Template support","Automation friendly"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('heygen-ai', 'Heygen AI', 'Features: Talking avatars, Studio quality lip‑sync, Commercial use, Shared plan: 7–9 users. Price: PKR 5,499 /month', '{"amount":5499,"currency":"PKR","display":"PKR 5,499 /month"}', '/images/products/heygen-ai.png', 'AI', '{"Talking avatars","Studio quality lip‑sync","Commercial use","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('runwayml', 'RunwayML', 'Features: Gen‑3 video models, Text/Img → Video, Pro editing suite, Semi plan: 3–6 users (our email). Price: PKR 14,999 /month', '{"amount":14999,"currency":"PKR","display":"PKR 14,999 /month"}', '/images/products/runwayml.png', 'Video', '{"Gen‑3 video models","Text/Img → Video","Pro editing suite","Semi plan: 3–6 users (our email)"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('hailuio-ai', 'Hailuio AI', 'Features: Advanced multimodal AI, High‑limit usage, Team friendly, Shared plan: 7–9 users. Price: PKR 44,999 /month', '{"amount":44999,"currency":"PKR","display":"PKR 44,999 /month"}', '/images/products/hailuio-ai.png', 'AI', '{"Advanced multimodal AI","High‑limit usage","Team friendly","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('freepik-premium-plus', 'Freepik Premium Plus', 'Features: Vectors, photos, PSDs, AI assets included (private), Commercial license, Shared plan: 7–9 users. Price: PKR 4,499 /month', '{"amount":4499,"currency":"PKR","display":"PKR 4,499 /month"}', '/images/products/freepik-premium-plus.png', 'Design', '{"Vectors, photos, PSDs","AI assets included (private)","Commercial license","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('sora-ai-shared', 'Sora AI Shared', 'Features: Text → short video, Creative previews, Shared access, Shared plan: 7–9 users. Price: PKR 2,199 /month', '{"amount":2199,"currency":"PKR","display":"PKR 2,199 /month"}', '/images/products/sora-ai-shared.png', 'Video', '{"Text → short video","Creative previews","Shared access","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('hedra-ai', 'Hedra AI', 'Features: Realtime voice/video, Developer APIs, Commercial usage. Price: PKR 1,889 /month', '{"amount":1889,"currency":"PKR","display":"PKR 1,889 /month"}', '/images/products/hedra-ai.png', 'AI', '{"Realtime voice/video","Developer APIs","Commercial usage"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('claude-ai-pro', 'Claude AI Pro', 'Features: Claude‑3.5 access, High rate limits, Web &amp; API use, Semi plan: 3–6 users (our email). Price: PKR 5,399 /month', '{"amount":5399,"currency":"PKR","display":"PKR 5,399 /month"}', '/images/products/claude-ai-pro.png', 'AI', '{"Claude‑3.5 access","High rate limits","Web &amp; API use","Semi plan: 3–6 users (our email)"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('cursor-ai-pro-private', 'Cursor AI Pro Private', 'Features: AI pair‑programming, Repo chat, Auto‑fix &amp; refactor. Price: PKR 4,999 /month', '{"amount":4999,"currency":"PKR","display":"PKR 4,999 /month"}', '/images/products/cursor-ai-pro-private.png', 'Productivity', '{"AI pair‑programming","Repo chat","Auto‑fix &amp; refactor"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('envato-elements', 'Envato Elements', 'Features: Unlimited assets, Fonts, video, SFX, Commercial license, Shared plan: 7–9 users. Price: PKR 1,799 /month', '{"amount":1799,"currency":"PKR","display":"PKR 1,799 /month"}', '/images/products/envato-elements.png', 'Design', '{"Unlimited assets","Fonts, video, SFX","Commercial license","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('perplexity-enterprise', 'Perplexity Enterprise', 'Features: Enterprise search, Citations &amp; sources, Customer mail. Price: PKR 1,499 /month', '{"amount":1499,"currency":"PKR","display":"PKR 1,499 /month"}', '/images/products/perplexity-enterprise.png', 'AI', '{"Enterprise search","Citations &amp; sources","Customer mail"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('super-grok-ai', 'Super Grok AI', 'Features: Web‑scale model, Fun + powerful, Shared or private, Shared plan: 7–9 users. Price: PKR 4,999 /month', '{"amount":4999,"currency":"PKR","display":"PKR 4,999 /month"}', '/images/products/super-grok-ai.png', 'AI', '{"Web‑scale model","Fun + powerful","Shared or private","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('vidiq-boost', 'VidIQ Boost', 'Features: YouTube SEO, Keyword &amp; competitors, Best‑time posting. Price: PKR 1,499 /month', '{"amount":1499,"currency":"PKR","display":"PKR 1,499 /month"}', '/images/products/vidiq-boost.png', 'Productivity', '{"YouTube SEO","Keyword &amp; competitors","Best‑time posting"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('microsoft-office-365', 'Microsoft Office 365', 'Features: Word, Excel, PowerPoint, Outlook &amp; OneDrive, Guaranteed activation. Price: PKR 4,599 /year', '{"amount":4599,"currency":"PKR","display":"PKR 4,599 /year"}', '/images/products/microsoft-office-365.png', 'Productivity', '{"Word, Excel, PowerPoint","Outlook &amp; OneDrive","Guaranteed activation"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('udemy-private', 'Udemy Private', 'Features: Top university courses, Certificates included, Private on customer email. Price: PKR 3,999 /Month', '{"amount":3999,"currency":"PKR","display":"PKR 3,999 /Month"}', '/images/products/udemy-private.png', 'Productivity', '{"Top university courses","Certificates included","Private on customer email"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('leonardo-ai', 'Leonardo AI', 'Features: Image generation studio, Models &amp; finetunes, High‑quality outputs, Shared plan: 7–9 users. Price: PKR 5,499 /month', '{"amount":5499,"currency":"PKR","display":"PKR 5,499 /month"}', '/images/products/leonardo-ai.png', 'AI', '{"Image generation studio","Models &amp; finetunes","High‑quality outputs","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('midjourney-standard', 'Midjourney Standard', 'Features: Fast image gen, Upscale &amp; variations, Community access, Shared plan: 7–9 users. Price: PKR 3,499 /month', '{"amount":3499,"currency":"PKR","display":"PKR 3,499 /month"}', '/images/products/midjourney-standard.png', 'Creative', '{"Fast image gen","Upscale &amp; variations","Community access","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('ideogram-plus', 'Ideogram Plus', 'Features: Typography‑perfect art, Logos &amp; posters, Commercial use. Price: PKR 2,999 /month', '{"amount":2999,"currency":"PKR","display":"PKR 2,999 /month"}', '/images/products/ideogram-plus.png', 'Creative', '{"Typography‑perfect art","Logos &amp; posters","Commercial use"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('playht-creator', 'PlayHT Creator', 'Features: Neural voices, Cloning &amp; SSML, Studio export. Price: PKR 2,999 /month', '{"amount":2999,"currency":"PKR","display":"PKR 2,999 /month"}', '/images/products/playht-creator.png', 'Automation', '{"Neural voices","Cloning &amp; SSML","Studio export"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('fishaudio-premium', 'FishAudio Premium', 'Features: TTS &amp; voice cloning, Multiple speakers, Commercial usage. Price: PKR 3,799 /month', '{"amount":3799,"currency":"PKR","display":"PKR 3,799 /month"}', '/images/products/fishaudio-premium.png', 'Automation', '{"TTS &amp; voice cloning","Multiple speakers","Commercial usage"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('google-drive-storage', 'Google Drive Storage', 'Features: Family sharing, Secure cloud storage, Customer mail access. Price: PKR 10,999 /year', '{"amount":10999,"currency":"PKR","display":"PKR 10,999 /year"}', '/images/products/google-drive-storage.png', 'Productivity', '{"Family sharing","Secure cloud storage","Customer mail access"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('filmora', 'Filmora', 'Features: Easy pro editor, AI features, Huge effects, Shared plan: 7–9 users. Price: PKR 11,999 /year', '{"amount":11999,"currency":"PKR","display":"PKR 11,999 /year"}', '/images/products/filmora.png', 'Video', '{"Easy pro editor","AI features","Huge effects","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('idm-license-key', 'IDM License Key', 'Features: Original license key, Auto updates, 1‑year validity. Price: PKR 3,999 /year', '{"amount":3999,"currency":"PKR","display":"PKR 3,999 /year"}', '/images/products/idm-license-key.png', 'Productivity', '{"Original license key","Auto updates","1‑year validity"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('semrush-shared', 'Semrush (Shared)', 'Features: Keyword research, Site audits, Competitor insights, Shared plan: 7–9 users. Price: PKR 899 /month', '{"amount":899,"currency":"PKR","display":"PKR 899 /month"}', '/images/products/semrush-shared.png', 'SEO', '{"Keyword research","Site audits","Competitor insights","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('turnitin-shared', 'Turnitin (Shared)', 'Features: Plagiarism check, Similarity reports, Academic use, Shared plan: 7–9 users. Price: PKR 799 /month', '{"amount":799,"currency":"PKR","display":"PKR 799 /month"}', '/images/products/turnitin-shared.png', 'Writing', '{"Plagiarism check","Similarity reports","Academic use","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('grammarly-shared', 'Grammarly (Shared)', 'Features: Grammar &amp; tone, Rewrite &amp; suggest, Browser extension, Shared plan: 7–9 users. Price: PKR 899 /month', '{"amount":899,"currency":"PKR","display":"PKR 899 /month"}', '/images/products/grammarly-shared.png', 'Writing', '{"Grammar &amp; tone","Rewrite &amp; suggest","Browser extension","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('stealth-writer-pro', 'Stealth Writer Pro', 'Features: Bypass AI detection, Smart paraphrasing, Export ready. Price: PKR 5,999 /month', '{"amount":5999,"currency":"PKR","display":"PKR 5,999 /month"}', '/images/products/stealth-writer-pro.png', 'Writing', '{"Bypass AI detection","Smart paraphrasing","Export ready"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('ahrefs-lite-shared', 'Ahrefs Lite (Shared)', 'Features: Backlinks &amp; keywords, Site Explorer, Batch analysis, Shared plan: 7–9 users. Price: PKR 5,999 /month', '{"amount":5999,"currency":"PKR","display":"PKR 5,999 /month"}', '/images/products/ahrefs-lite-shared.png', 'SEO', '{"Backlinks &amp; keywords","Site Explorer","Batch analysis","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('lovable-pro-3-months', 'Lovable Pro 3 Months', 'Features: AI app builder, Deploy fast, Team features. Price: PKR 4,599 /month', '{"amount":4599,"currency":"PKR","display":"PKR 4,599 /month"}', '/images/products/lovable-pro-3-months.png', 'Productivity', '{"AI app builder","Deploy fast","Team features"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('replit-team', 'Replit Team', 'Features: Cloud IDE, Deployments, Collaboration. Price: PKR 4,999 /month', '{"amount":4999,"currency":"PKR","display":"PKR 4,999 /month"}', '/images/products/replit-team.png', 'Productivity', '{"Cloud IDE","Deployments","Collaboration"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('surfshark-vpn', 'Surfshark VPN', 'Features: Secure &amp; fast, Unlimited devices, Streaming unlock, Shared plan: 7–9 users. Price: PKR 1,599 /month', '{"amount":1599,"currency":"PKR","display":"PKR 1,599 /month"}', '/images/products/surfshark-vpn.png', 'VPN', '{"Secure &amp; fast","Unlimited devices","Streaming unlock","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('nordvpn', 'NordVPN', 'Features: Top privacy, Meshnet &amp; ThreatShield, Streaming unlock, Shared plan: 7–9 users. Price: PKR 1,999 /month', '{"amount":1999,"currency":"PKR","display":"PKR 1,999 /month"}', '/images/products/nordvpn.png', 'VPN', '{"Top privacy","Meshnet &amp; ThreatShield","Streaming unlock","Shared plan: 7–9 users"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;
INSERT INTO products (id, name, description, price, image, category, features) VALUES ('youtube-premium-individual', 'YouTube Premium (Individual)', 'Features: Ad‑free YouTube, Background play, Music Premium. Price: PKR 449 /month', '{"amount":449,"currency":"PKR","display":"PKR 449 /month"}', '/images/products/youtube-premium-individual.png', 'Productivity', '{"Ad‑free YouTube","Background play","Music Premium"}')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    image = EXCLUDED.image,
    category = EXCLUDED.category,
    features = EXCLUDED.features;

-- =====================================================
-- PART 4: VERIFY SETUP
-- =====================================================

-- Check if products were added
SELECT COUNT(*) as total_products FROM products;

-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'users', 'free_giveaways', 'page_views');

-- =====================================================
-- SETUP COMPLETE!
-- Your database is now secured and populated with products
-- =====================================================



INSERT INTO public.products (id, name, description, price, image, category, features)
VALUES
('netflix', 'Netflix Premium', 'Watch your favorite shows and movies in 4K UHD. Plans available for every need.', '{"monthly":350,"original":1100,"yearly":4000}'::jsonb, 'https://logo.clearbit.com/netflix.com', 'Entertainment, Streaming', ARRAY['Ultra HD 4K Streaming','Officially Paid & Renewable','Works on All Devices','Shared Plan Rules Apply']),
('prime-video', 'Amazon Prime Video', 'Enjoy thousands of movies, TV shows, and Amazon Originals in Ultra HD.', '{"monthly":120,"original":599}'::jsonb, 'https://logo.clearbit.com/primevideo.com', 'Entertainment, Streaming', ARRAY['Ultra HD Streaming','Officially Paid','Unlimited Downloads','Single Screen Access']),
('spotify-premium', 'Spotify Premium', 'Ad-free music streaming with high-quality audio, activated on your own email.', '{"monthly":350,"original":520}'::jsonb, 'https://logo.clearbit.com/spotify.com', 'Music, Entertainment', ARRAY['Activated on Your Personal Email','Ad-free Music Streaming','Offline Downloads','High Quality Audio']),
('youtube-premium', 'YouTube Premium', 'Ad-free videos, background play, and offline downloads, activated on your personal email.', '{"monthly":300,"original":479}'::jsonb, 'https://logo.clearbit.com/youtube.com', 'Entertainment, Streaming', ARRAY['Activated on Your Personal Email','Ad-free Video & Music','Background Play','Offline Downloads']),
('disney-plus', 'Disney+', 'The home of Disney, Pixar, Marvel, Star Wars. Requires VPN for access.', '{"monthly":450,"original":2200}'::jsonb, 'https://logo.clearbit.com/disneyplus.com', 'Entertainment, Streaming', ARRAY['Endless Entertainment','Originals & Exclusives','4K UHD Quality','Requires VPN (Instructions Provided)']),
('hbo-max', 'HBO Max', 'Stream all of HBO, plus hit movies, originals, and fan favorites. Requires VPN.', '{"monthly":500,"original":2800}'::jsonb, 'https://logo.clearbit.com/hbomax.com', 'Entertainment, Streaming', ARRAY['HBO Originals (Game of Thrones, etc.)','Warner Bros. Movie Premieres','Max Originals','Requires VPN (Instructions Provided)']),
('hulu', 'Hulu', 'Access a huge streaming library of current-season episodes and hit movies.', '{"monthly":450,"original":2200}'::jsonb, 'https://logo.clearbit.com/hulu.com', 'Entertainment, Streaming', ARRAY['Current-Season TV Shows','Award-Winning Hulu Originals','Huge Movie Library','Requires VPN (Instructions Provided)']),
('quillbot-premium', 'Quillbot Premium', 'Advanced AI writing assistant for paraphrasing, grammar checking, and summarizing.', '{"monthly":400,"original":2800}'::jsonb, 'https://logo.clearbit.com/quillbot.com', 'Writer Tools, Study Tools', ARRAY['Unlimited Paraphrasing','Advanced Grammar & Tone Checks','Plagiarism Checker','Faster Processing Speed']),
('grammarly-premium', 'Grammarly Premium', 'Go beyond grammar and spelling to improve your writing''s style and clarity.', '{"monthly":500,"original":3500}'::jsonb, 'https://logo.clearbit.com/grammarly.com', 'Writer Tools, Study Tools', ARRAY['Advanced Grammar & Punctuation','Clarity & Conciseness Suggestions','Plagiarism Detector','Tone Adjustment']),
('turnitin-instructor', 'Turnitin Instructor', 'Check for plagiarism and AI-generated content with a professional instructor account.', '{"monthly":350,"original":1000}'::jsonb, 'https://logo.clearbit.com/turnitin.com', 'Study Tools, Writer Tools', ARRAY['Plagiarism Reports','AI Content Detection','100 Files Daily Limit (on Pro plans)','Personal or Shared Access']),
('chegg-account', 'Chegg Study Account', 'Get expert Q&A, textbook solutions, and homework help.', '{"monthly":500,"original":4200}'::jsonb, 'https://logo.clearbit.com/chegg.com', 'Study Tools', ARRAY['Expert Q&A','Textbook Solutions','Homework Help','24/7 Study Support']),
('coursera-plus', 'Coursera Plus', 'Get unlimited access to thousands of world-class courses and certifications.', '{"yearly":4500,"original":111000}'::jsonb, 'https://logo.clearbit.com/coursera.com', 'Study Tools, Courses', ARRAY['Unlimited access to 7,000+ courses','Certificates for completed courses','Learn from top universities','Activated on your personal email']),
('udemy-premium', 'Udemy Premium', 'Access a collection of top-rated courses on business, tech, and personal development.', '{"monthly":1600,"original":8400}'::jsonb, 'https://logo.clearbit.com/udemy.com', 'Study Tools, Courses', ARRAY['Access to 8,000+ top courses','Certificates of Completion','Top-rated instructors','For 1 Device']),
('semrush-pro', 'Semrush Pro', 'All-in-one suite for SEO, content marketing, and competitor research.', '{"monthly":1500,"original":36000}'::jsonb, 'https://logo.clearbit.com/semrush.com', 'SEO Tools, Business', ARRAY['Keyword Research Tools','Competitor Analysis','Site Audit','Content Marketing Toolkit']),
('helium-10', 'Helium 10', 'Powerful software suite for Amazon sellers and e-commerce entrepreneurs.', '{"monthly":1500,"original":10000}'::jsonb, 'https://logo.clearbit.com/helium10.com', 'SEO Tools, Business', ARRAY['Amazon Product Research','Keyword Research & Tracking','Listing Optimization','For FBA Sellers']),
('jasper-ai', 'Jasper AI', 'AI Content Platform that helps your team create amazing content 10x faster.', '{"monthly":1200,"original":13700}'::jsonb, 'https://logo.clearbit.com/jasper.ai', 'AI Tools, Writer Tools', ARRAY['AI Copywriting','Blog & Article Writer','Multiple Content Templates','Brand Voice & Tone']),
('copy-ai', 'Copy.ai', 'AI-powered copywriter that generates high-quality marketing copy in seconds.', '{"monthly":800,"original":13700}'::jsonb, 'https://logo.clearbit.com/copy.ai', 'AI Tools, Writer Tools', ARRAY['Automated Copywriting','90+ Content Types','Freestyle Text Generation','Ideal for Marketers']),
('surfer-seo', 'Surfer SEO', 'Content intelligence tool that helps you write perfectly optimized articles.', '{"monthly":1500,"original":17800}'::jsonb, 'https://logo.clearbit.com/surferseo.com', 'SEO Tools, Writer Tools', ARRAY['Data-Driven Content Editor','SERP Analysis','SEO Audit Tool','Keyword Research']),
('rytr', 'Rytr AI', 'An AI writing assistant that helps you create high-quality content, in just a few seconds.', '{"monthly":700,"original":8100}'::jsonb, 'https://logo.clearbit.com/rytr.me', 'AI Tools, Writer Tools', ARRAY['40+ Use Cases','30+ Languages Supported','Built-in Plagiarism Checker','Fast & Responsive']),
('pictory-ai', 'Pictory.ai', 'Create stunning videos from your scripts or blog posts using AI.', '{"monthly":1200,"original":6700}'::jsonb, 'https://logo.clearbit.com/pictory.ai', 'AI Tools, Video', ARRAY['AI-Powered Video Creation','Script-to-Video','Blog-to-Video','Huge Stock Media Library']),
('shutterstock', 'Shutterstock', 'Download high-quality stock photos, vectors, videos, and music.', '{"monthly":1000,"original":8000}'::jsonb, 'https://logo.clearbit.com/shutterstock.com', 'Graphics/Creative, Design', ARRAY['Millions of Stock Photos','Royalty-Free Vectors & Illustrations','Stock Video Footage','Shared Access']),
('envato-elements', 'Envato Elements', 'Unlimited downloads of millions of creative assets: templates, stock videos, photos, and more.', '{"monthly":899,"original":4600}'::jsonb, 'https://logo.clearbit.com/envato.com', 'Graphics/Creative, Design', ARRAY['Unlimited Downloads','Millions of Creative Assets','Stock Videos & Photos','Templates & Fonts']),
('midjourney', 'Midjourney', 'Advanced AI image generation tool that turns text prompts into stunning visuals.', '{"monthly":3500,"original":8400}'::jsonb, 'https://logo.clearbit.com/midjourney.com', 'AI Tools, Graphics/Creative', ARRAY['AI Image Generation from Text','High-Resolution & Stylistic Outputs','Ideal for Concept Art & Design','Private Account Access']),
('nord-vpn', 'NordVPN', 'Secure, high-speed VPN for safe and private internet access on one device.', '{"monthly":400,"original":3600}'::jsonb, 'https://logo.clearbit.com/nordvpn.com', 'VPN, Software', ARRAY['High-Speed Servers','Strict No-Logs Policy','Secure Encryption','For 1 Device']),
('express-vpn', 'ExpressVPN', 'Premium VPN service known for its blazing-fast speeds and robust security.', '{"monthly":600,"original":3600}'::jsonb, 'https://logo.clearbit.com/expressvpn.com', 'VPN, Software', ARRAY['Blazing-Fast Speeds','Best-in-Class Encryption','99.9% Uptime','For 1 Device']),
('surfshark-vpn', 'Surfshark VPN', 'Affordable VPN with premium features for secure and private browsing.', '{"monthly":350,"original":3600}'::jsonb, 'https://logo.clearbit.com/surfshark.com', 'VPN, Software', ARRAY['Strong Encryption','CleanWeb Ad-blocker','Strict No-Logs Policy','For 1 Device']),
('cyberghost-vpn', 'CyberGhost VPN', 'User-friendly VPN with servers optimized for streaming and torrenting.', '{"monthly":500,"original":3600}'::jsonb, 'https://logo.clearbit.com/cyberghostvpn.com', 'VPN, Software', ARRAY['Optimized Streaming Servers','User-Friendly Apps','Strong No-Logs Policy','For 1 Device']),
('ip-vanish-vpn', 'IP Vanish VPN', 'Fast and secure VPN with a strong focus on privacy and anonymity.', '{"monthly":350,"original":3000}'::jsonb, 'https://logo.clearbit.com/ipvanish.com', 'VPN, Software', ARRAY['Anonymous Torrenting Support','Zero Traffic Logs','Advanced Encryption','For 1 Device']),
('hotspot-shield-vpn', 'Hotspot Shield VPN', 'Popular VPN for fast streaming and secure browsing.', '{"monthly":400,"original":2200}'::jsonb, 'https://logo.clearbit.com/hotspotshield.com', 'VPN, Software', ARRAY['Patented Hydra Protocol for Speed','Military-Grade Encryption','4K Streaming Support','For 1 Device']),
('pure-vpn', 'Pure VPN', 'A feature-rich VPN with a massive global server network.', '{"monthly":400,"original":3000}'::jsonb, 'https://logo.clearbit.com/purevpn.com', 'VPN, Software', ARRAY['256-bit Encryption','Always-On Audit','Port Forwarding Support','For 1 Device']),
('playstation-plus', 'Playstation Plus (PS+)', 'Online multiplayer, free monthly games, and exclusive discounts on PlayStation.', '{"monthly":2750,"original":3500}'::jsonb, 'https://logo.clearbit.com/playstation.com', 'Gaming, Entertainment', ARRAY['Online Multiplayer Access','Free Monthly Games','Exclusive Discounts','Cloud Storage']),
('rdp-service', 'RDP (Remote Desktop)', 'High-performance Remote Desktop Protocol for various tasks.', '{"monthly":1800,"original":2500}'::jsonb, 'https://logo.clearbit.com/microsoft.com', 'Software, Productivity', ARRAY['High-Speed Connection','Multiple Configurations','25-Day Replacement Warranty','Emulator Support Available']),
('uk-physical-sim', 'UK Physical SIM Card', 'Get a physical UK SIM card for international calls, SMS, and account verification.', '{"monthly":4500,"original":6000}'::jsonb, 'https://logo.clearbit.com/ee.co.uk', 'Services', ARRAY['Unlock TikTok Live','Create UK WhatsApp','Receive International Calls & SMS','Business Verification']),
('linkedin-premium', 'LinkedIn Premium', 'Unlock advanced features for job seeking, networking, and sales prospecting.', '{"monthly":6000,"original":22000}'::jsonb, 'https://logo.clearbit.com/linkedin.com', 'Business, Productivity', ARRAY['Advanced Search Filters','InMail Credits','See Who Viewed Your Profile','Access to LinkedIn Learning']),
('ms-office-365', 'Microsoft Office 365', 'Lifetime access to the essential Microsoft productivity suite: Word, Excel, PowerPoint.', '{"yearly":2500,"original":21000}'::jsonb, 'https://logo.clearbit.com/microsoft.com', 'Software, Productivity', ARRAY['One-Time Payment (Lifetime)','Word, Excel, PowerPoint','5TB OneDrive Storage','Use on 5 Devices']),
('windows-pro', 'Microsoft Windows 10/11 Pro', 'Official OEM license key for Windows 10 Pro or Windows 11 Pro.', '{"yearly":1499,"original":40000}'::jsonb, 'https://logo.clearbit.com/microsoft.com', 'Software, Productivity', ARRAY['Official OEM License Key','Lifetime Activation','For 1 PC','Windows 10 Pro or 11 Pro']),
('social-media-services', 'Social Media Services', 'Grow your social media presence with authentic followers, likes, views, and more.', '{"monthly":50,"original":100}'::jsonb, 'https://logo.clearbit.com/facebook.com', 'Business, Social Media Services', ARRAY['Authentic Followers, Likes & Views','Supports TikTok, Instagram, Facebook, YouTube','Fast Delivery','Non-Drop Guarantees Available'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image = EXCLUDED.image,
  category = EXCLUDED.category,
  features = EXCLUDED.features;
