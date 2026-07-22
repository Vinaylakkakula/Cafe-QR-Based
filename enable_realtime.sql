-- ==========================================
-- ENABLE SUPABASE REALTIME FOR POS TABLES
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor)
-- This is REQUIRED for instant zero-delay syncing
-- ==========================================

-- Add all POS tables to the supabase_realtime publication
-- This enables WebSocket-based instant change notifications

ALTER PUBLICATION supabase_realtime ADD TABLE pos_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_menu;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_tables;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_qr_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_reservations;
ALTER PUBLICATION supabase_realtime ADD TABLE pos_customers;

-- Set REPLICA IDENTITY to FULL so UPDATE/DELETE events include the full row data
ALTER TABLE pos_settings REPLICA IDENTITY FULL;
ALTER TABLE pos_menu REPLICA IDENTITY FULL;
ALTER TABLE pos_tables REPLICA IDENTITY FULL;
ALTER TABLE pos_orders REPLICA IDENTITY FULL;
ALTER TABLE pos_qr_orders REPLICA IDENTITY FULL;
ALTER TABLE pos_reservations REPLICA IDENTITY FULL;
ALTER TABLE pos_customers REPLICA IDENTITY FULL;
