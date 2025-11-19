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
INSERT INTO products (id, name, category, description, image, features, price, stock, rating, badge, created_at, updated_at)
VALUES 
-- AI & Productivity Tools
('chatgpt-plus', 'ChatGPT Plus', 'AI Tools,Productivity', 'Access to GPT-4, faster response times, and priority access to new features', '/images/products/chatgpt-logo.png', 
'["Access to GPT-4", "Faster response times", "Priority access to new features", "Available even during peak times"]'::jsonb,
'{"monthly": 350, "yearly": 4000, "original": 2000}'::jsonb, true, 4.9, 'Popular', NOW(), NOW()),

('github-copilot', 'GitHub Copilot', 'AI Tools,Programming', 'AI pair programmer that helps you write code faster', '/images/products/github-copilot-logo.png',
'["AI code suggestions", "Multi-language support", "IDE integration", "Context-aware completions"]'::jsonb,
'{"monthly": 450, "yearly": 5000, "original": 1000}'::jsonb, true, 4.8, 'New', NOW(), NOW()),

-- Design & Creative
('canva-pro', 'Canva Pro', 'Design,Graphics/Creative', 'Professional design tools with premium templates and assets', '/images/products/canva-logo.png',
'["100M+ premium photos & graphics", "Brand Kit & templates", "Background remover", "Team collaboration"]'::jsonb,
'{"monthly": 400, "yearly": 4500, "original": 1299}'::jsonb, true, 4.9, 'Best Seller', NOW(), NOW()),

('adobe-creative-cloud', 'Adobe Creative Cloud', 'Design,Graphics/Creative', 'Complete suite of Adobe creative applications', '/images/products/adobe-logo.png',
'["Photoshop, Illustrator, Premiere Pro", "100GB cloud storage", "Adobe Fonts access", "All latest updates"]'::jsonb,
'{"monthly": 1500, "yearly": 16000, "original": 5499}'::jsonb, true, 4.8, 'Premium', NOW(), NOW()),

-- Entertainment & Streaming
('netflix-premium', 'Netflix Premium', 'Entertainment,Streaming', 'Watch unlimited movies and TV shows in 4K UHD', '/images/products/netflix-logo.png',
'["4K Ultra HD streaming", "4 screens simultaneously", "Unlimited downloads", "No ads"]'::jsonb,
'{"monthly": 350, "yearly": 4000, "original": 1100}'::jsonb, true, 4.9, 'Popular', NOW(), NOW()),

('spotify-premium', 'Spotify Premium', 'Music,Entertainment', 'Ad-free music streaming with offline downloads', '/images/products/spotify-logo.png',
'["Ad-free listening", "Offline downloads", "High quality audio", "Unlimited skips"]'::jsonb,
'{"monthly": 300, "yearly": 3500, "original": 999}'::jsonb, true, 4.9, 'Best Seller', NOW(), NOW()),

('youtube-premium', 'YouTube Premium', 'Entertainment,Streaming', 'Ad-free YouTube with background play and downloads', '/images/products/youtube-logo.png',
'["Ad-free videos", "Background play", "YouTube Music included", "Offline downloads"]'::jsonb,
'{"monthly": 280, "yearly": 3200, "original": 899}'::jsonb, true, 4.8, NULL, NOW(), NOW()),

-- Microsoft & Office
('microsoft-365', 'Microsoft 365', 'Productivity,Software', 'Complete Microsoft Office suite with cloud services', '/images/products/microsoft-365-logo.png',
'["Word, Excel, PowerPoint, Outlook", "1TB OneDrive storage", "Premium Office apps", "Works on 5 devices"]'::jsonb,
'{"monthly": 500, "yearly": 5500, "original": 6999}'::jsonb, true, 4.8, 'Popular', NOW(), NOW()),

('windows-11-pro', 'Windows 11 Pro', 'Software,Productivity', 'Professional Windows operating system', '/images/products/windows-logo.png',
'["Lifetime activation", "All Pro features", "BitLocker encryption", "Remote Desktop"]'::jsonb,
'{"monthly": 1200, "yearly": 12000, "original": 39000}'::jsonb, 15, 4.7, 'Hot Deal', NOW(), NOW()),

-- Education & Learning
('coursera-plus', 'Coursera Plus', 'Education,Courses', 'Unlimited access to 7,000+ courses from top universities', '/images/products/coursera-logo.png',
'["7000+ courses", "Professional certificates", "University degrees", "Learn at your own pace"]'::jsonb,
'{"monthly": 1500, "yearly": 16000, "original": 59000}'::jsonb, true, 4.9, 'New', NOW(), NOW()),

('udemy-business', 'Udemy Business', 'Education,Courses', 'Access to top-rated business and tech courses', '/images/products/udemy-logo.png',
'["8000+ courses", "Expert instructors", "Certificates of completion", "Mobile app access"]'::jsonb,
'{"monthly": 800, "yearly": 9000, "original": 30000}'::jsonb, true, 4.7, NULL, NOW(), NOW()),

-- SEO & Marketing
('semrush-pro', 'Semrush Pro', 'SEO Tools,Marketing', 'All-in-one SEO toolkit for digital marketers', '/images/products/semrush-logo.png',
'["Keyword research", "Competitor analysis", "Site audit", "Rank tracking"]'::jsonb,
'{"monthly": 3500, "yearly": 38000, "original": 11999}'::jsonb, true, 4.8, 'Premium', NOW(), NOW()),

('ahrefs-lite', 'Ahrefs Lite', 'SEO Tools,Marketing', 'Powerful SEO tools for backlink analysis', '/images/products/ahrefs-logo.png',
'["Backlink checker", "Keyword explorer", "Site explorer", "Rank tracker"]'::jsonb,
'{"monthly": 3000, "yearly": 32000, "original": 9900}'::jsonb, true, 4.9, 'Popular', NOW(), NOW()),

-- VPN & Security
('nordvpn', 'NordVPN', 'VPN,Security', 'Fast and secure VPN service', '/images/products/nordvpn-logo.png',
'["5500+ servers worldwide", "Military-grade encryption", "No logs policy", "6 devices simultaneously"]'::jsonb,
'{"monthly": 600, "yearly": 6500, "original": 1299}'::jsonb, true, 4.8, NULL, NOW(), NOW()),

-- Gaming
('discord-nitro', 'Discord Nitro', 'Gaming,Social Media', 'Enhanced Discord experience with perks', '/images/products/discord-logo.png',
'["Custom emojis anywhere", "HD video streaming", "Server boosts", "Larger uploads"]'::jsonb,
'{"monthly": 400, "yearly": 4500, "original": 999}'::jsonb, true, 4.7, 'Popular', NOW(), NOW())

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  rating = EXCLUDED.rating,
  badge = EXCLUDED.badge,
  updated_at = NOW();

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
