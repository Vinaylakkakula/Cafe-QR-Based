-- Run this SQL in your Supabase SQL Editor to set up the POS database tables.

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

-- Enable Row Level Security (RLS) - Optional (Disable or add policies for production)
ALTER TABLE pos_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_menu DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE pos_customers DISABLE ROW LEVEL SECURITY;
