-- ==========================================
-- MAHA FAST FOOD COURT DATABASE INITIALIZATION
-- Run this complete script in the Supabase SQL Editor
-- ==========================================

-- 1. Create pos_settings table
CREATE TABLE IF NOT EXISTS pos_settings (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
);

-- 2. Create pos_tables table
CREATE TABLE IF NOT EXISTS pos_tables (
  id TEXT PRIMARY KEY,
  num INT NOT NULL,
  capacity INT NOT NULL,
  status TEXT NOT NULL,
  waiter TEXT,
  splits JSONB NOT NULL,
  active_split INT NOT NULL
);

-- 3. Create pos_menu table
CREATE TABLE IF NOT EXISTS pos_menu (
  id TEXT PRIMARY KEY,
  cat TEXT NOT NULL,
  name TEXT NOT NULL,
  desc_text TEXT,
  price NUMERIC NOT NULL,
  veg BOOLEAN NOT NULL,
  available BOOLEAN NOT NULL,
  stock INT NOT NULL,
  img TEXT
);

-- 4. Create pos_orders table
CREATE TABLE IF NOT EXISTS pos_orders (
  id TEXT PRIMARY KEY,
  ts BIGINT NOT NULL,
  table_num INT NOT NULL,
  waiter TEXT,
  split_label TEXT,
  split JSONB NOT NULL,
  totals JSONB NOT NULL,
  payment JSONB NOT NULL
);

-- 5. Create pos_reservations table
CREATE TABLE IF NOT EXISTS pos_reservations (
  id TEXT PRIMARY KEY,
  ts BIGINT NOT NULL,
  name TEXT NOT NULL,
  party INT NOT NULL,
  phone TEXT,
  note TEXT,
  table_num INT,
  status TEXT NOT NULL
);

-- 6. Create pos_customers table
CREATE TABLE IF NOT EXISTS pos_customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  visits INT NOT NULL,
  spent NUMERIC NOT NULL,
  points INT NOT NULL,
  tier TEXT NOT NULL,
  last TEXT
);

-- 7. Create pos_qr_orders table (QR customer-placed orders)
CREATE TABLE IF NOT EXISTS pos_qr_orders (
  id TEXT PRIMARY KEY,
  ts BIGINT NOT NULL,
  table_num INT NOT NULL,
  items JSONB NOT NULL,
  note TEXT,
  total NUMERIC NOT NULL,
  currency TEXT DEFAULT '₹',
  status TEXT NOT NULL DEFAULT 'pending'
);

-- Disable Row Level Security (RLS) for simple integration
ALTER TABLE pos_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_menu DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_qr_orders DISABLE ROW LEVEL SECURITY;

-- Enable Supabase Realtime for instant zero-delay syncing across all devices
ALTER PUBLICATION supabase_realtime ADD TABLE pos_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_qr_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_customers;

-- Set REPLICA IDENTITY to FULL so UPDATE/DELETE events include full row data
ALTER TABLE pos_settings REPLICA IDENTITY FULL;
ALTER TABLE pos_menu REPLICA IDENTITY FULL;
ALTER TABLE pos_tables REPLICA IDENTITY FULL;
ALTER TABLE pos_orders REPLICA IDENTITY FULL;
ALTER TABLE pos_qr_orders REPLICA IDENTITY FULL;
ALTER TABLE pos_reservations REPLICA IDENTITY FULL;
ALTER TABLE pos_customers REPLICA IDENTITY FULL;

-- Clean existing data to avoid conflicts during branding change
TRUNCATE TABLE pos_settings, pos_tables, pos_menu, pos_orders, pos_reservations, pos_customers, pos_qr_orders CASCADE;

-- Insert Global settings
INSERT INTO pos_settings (id, data) VALUES ('global', '{
  "restaurantName": "MAHA FAST FOOD COURT",
  "address": "Darbar Street, Korutla\n+91 98429 23119",
  "taxId": "TIN 87-4429301",
  "taxRate": 5.0,
  "serviceChargeRate": 0,
  "currency": "₹",
  "cashierName": "Cashier",
  "tipEnabled": false,
  "serviceChargeEnabled": false,
  "tableCount": 10,
  "heroImage": "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=70",
  "themeColor": "amber",
  "logoUrl": "",
  "receiptHeader": "Thank you for dining with us!",
  "receiptFooter": "Follow us on Instagram @mahafastfoodcourt",
  "qrNotificationSound": "loud"
}'::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data;

-- Insert default Tables (1 to 10 + Takeaway)
INSERT INTO pos_tables (id, num, capacity, status, waiter, splits, active_split) VALUES
('t1', 1, 4, 'available', NULL, '[{"id":"s_t1","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t2', 2, 4, 'available', NULL, '[{"id":"s_t2","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t3', 3, 4, 'available', NULL, '[{"id":"s_t3","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t4', 4, 4, 'available', NULL, '[{"id":"s_t4","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t5', 5, 4, 'available', NULL, '[{"id":"s_t5","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t6', 6, 4, 'available', NULL, '[{"id":"s_t6","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t7', 7, 4, 'available', NULL, '[{"id":"s_t7","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t8', 8, 4, 'available', NULL, '[{"id":"s_t8","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t9', 9, 4, 'available', NULL, '[{"id":"s_t9","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('t10', 10, 4, 'available', NULL, '[{"id":"s_t10","label":"Main","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0),
('takeaway', 9999, 99, 'available', NULL, '[{"id":"s_takeaway","label":"Takeaway","items":[],"taxRate":null,"discount":{"type":"flat","value":0},"tip":0,"includeService":true,"kotSent":false,"courseStage":"new"}]'::jsonb, 0);

-- Insert Maha Fast Food Court Menu Items
INSERT INTO pos_menu (id, cat, name, desc_text, price, veg, available, stock, img) VALUES
-- VEG CATEGORY
('vfr-s', 'veg', 'Veg Fried Rice (Single)', 'Freshly tossed vegetables with rice and light spices', 60.00, true, true, 99, 'https://images.unsplash.com/photo-1603133872878-6855075e7f1a?auto=format&fit=crop&w=400&q=70'),
('vfr-f', 'veg', 'Veg Fried Rice (Full)', 'Freshly tossed vegetables with rice and light spices', 80.00, true, true, 99, 'https://images.unsplash.com/photo-1603133872878-6855075e7f1a?auto=format&fit=crop&w=400&q=70'),
('vn-s', 'veg', 'Veg Noodles (Single)', 'Stir-fried noodles loaded with crunchy vegetables', 70.00, true, true, 99, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=70'),
('vn-f', 'veg', 'Veg Noodles (Full)', 'Stir-fried noodles loaded with crunchy vegetables', 90.00, true, true, 99, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=70'),
('vm-s', 'veg', 'Veg Manchurian (Single)', 'Indo-Chinese style vegetable balls in savory gravy', 60.00, true, true, 99, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=70'),
('vm-f', 'veg', 'Veg Manchurian (Full)', 'Indo-Chinese style vegetable balls in savory gravy', 80.00, true, true, 99, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=70'),

-- EGG CATEGORY
('efr-s', 'egg', 'Egg Fried Rice (Single)', 'Stir-fried rice cooked with eggs and seasonings', 70.00, false, true, 99, 'https://images.unsplash.com/photo-1603133872878-6855075e7f1a?auto=format&fit=crop&w=400&q=70'),
('efr-f', 'egg', 'Egg Fried Rice (Full)', 'Stir-fried rice cooked with eggs and seasonings', 90.00, false, true, 99, 'https://images.unsplash.com/photo-1603133872878-6855075e7f1a?auto=format&fit=crop&w=400&q=70'),
('en-s', 'egg', 'Egg Noodles (Single)', 'Soft stir-fried noodles tossed with eggs and veggies', 70.00, false, true, 99, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=70'),
('en-f', 'egg', 'Egg Noodles (Full)', 'Soft stir-fried noodles tossed with eggs and veggies', 90.00, false, true, 99, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=70'),
('sem-s', 'egg', 'Special Egg Manchurian (Single)', 'Deep fried egg pakoras tossed in hot Manchurian sauce', 80.00, false, true, 99, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=70'),
('sem-f', 'egg', 'Special Egg Manchurian (Full)', 'Deep fried egg pakoras tossed in hot Manchurian sauce', 100.00, false, true, 99, 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&q=70'),
('om', 'egg', 'Omelette', 'Traditional fluffy omelette cooked with onions and chili', 40.00, false, true, 99, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=400&q=70'),

-- CHICKEN CATEGORY
('cfr-s', 'chicken', 'Chicken Fried Rice (Single)', 'Delicious fried rice with juicy chicken chunks and egg', 80.00, false, true, 99, 'https://images.unsplash.com/photo-1603133872878-6855075e7f1a?auto=format&fit=crop&w=400&q=70'),
('cfr-f', 'chicken', 'Chicken Fried Rice (Full)', 'Delicious fried rice with juicy chicken chunks and egg', 100.00, false, true, 99, 'https://images.unsplash.com/photo-1603133872878-6855075e7f1a?auto=format&fit=crop&w=400&q=70'),
('cn-s', 'chicken', 'Chicken Noodles (Single)', 'Stir-fried noodles with tender chicken strips and egg', 80.00, false, true, 99, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=70'),
('cn-f', 'chicken', 'Chicken Noodles (Full)', 'Stir-fried noodles with tender chicken strips and egg', 100.00, false, true, 99, 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=400&q=70'),
('cm-s', 'chicken', 'Chicken Manchurian (Single)', 'Chicken bites coated in sweet, spicy, and tangy sauce', 90.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),
('cm-f', 'chicken', 'Chicken Manchurian (Full)', 'Chicken bites coated in sweet, spicy, and tangy sauce', 120.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),
('cp-s', 'chicken', 'Chicken Pakoda (Single)', 'Crispy, deep-fried spiced chicken fritters', 90.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),
('cp-f', 'chicken', 'Chicken Pakoda (Full)', 'Crispy, deep-fried spiced chicken fritters', 120.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),
('c65-s', 'chicken', 'Chicken 65 (Single)', 'Spicy, deep-fried chicken appetizer loaded with curry leaves', 90.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),
('c65-f', 'chicken', 'Chicken 65 (Full)', 'Spicy, deep-fried chicken appetizer loaded with curry leaves', 120.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),

-- STARTERS CATEGORY
('cl', 'starters', 'Chicken Lollipop (4 Pieces)', 'Juicy chicken drumettes fried to perfection with spices', 120.00, false, true, 99, 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=70'),
('clp', 'starters', 'Chicken Leg Piece (1 Piece)', 'Whole crispy chicken leg piece seasoned to perfection', 60.00, false, true, 99, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=400&q=70');
