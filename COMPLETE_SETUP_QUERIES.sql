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
