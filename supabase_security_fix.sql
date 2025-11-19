-- Enable RLS on all tables
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
-- We allow public insert so client-side events can be logged.
-- We do NOT allow public select, so users can't see analytics.
-- The Server (using Service Role Key) will bypass these and can read/write everything.

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
