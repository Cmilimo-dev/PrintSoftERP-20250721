-- Fix customers table to add missing columns

ALTER TABLE customers
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS company_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Make full_name not null with a default
UPDATE customers SET full_name = 'Unknown' WHERE full_name IS NULL;
ALTER TABLE customers ALTER COLUMN full_name SET NOT NULL;
