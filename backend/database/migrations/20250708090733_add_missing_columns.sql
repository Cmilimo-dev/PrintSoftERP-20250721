-- Add missing columns for locations and current_inventory

-- Add is_warehouse column to locations
ALTER TABLE locations
ADD COLUMN IF NOT EXISTS is_warehouse BOOLEAN DEFAULT false;

-- Add stock_status and total_value columns to current_inventory
ALTER TABLE current_inventory
ADD COLUMN IF NOT EXISTS stock_status TEXT,
ADD COLUMN IF NOT EXISTS total_value DECIMAL;
