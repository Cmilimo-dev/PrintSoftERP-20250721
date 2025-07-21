-- Create missing tables for the ERP system
-- This file creates all the tables that are referenced in the codebase but missing from the database

-- Product Categories table
CREATE TABLE IF NOT EXISTS product_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    parent_category_id UUID REFERENCES product_categories(id),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations/Warehouses table
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Kenya',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parts table (used by inventory hooks)
CREATE TABLE IF NOT EXISTS parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_number VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES product_categories(id),
    vendor_id UUID REFERENCES vendors(id),
    unit_cost DECIMAL(15, 4) DEFAULT 0,
    selling_price DECIMAL(15, 4) DEFAULT 0,
    unit_of_measure VARCHAR(50) DEFAULT 'pcs',
    minimum_stock DECIMAL(15, 3) DEFAULT 0,
    reorder_point DECIMAL(15, 3) DEFAULT 0,
    current_stock DECIMAL(15, 3) DEFAULT 0,
    maximum_stock DECIMAL(15, 3),
    barcode VARCHAR(100),
    weight DECIMAL(10, 3),
    dimensions VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    is_serialized BOOLEAN DEFAULT FALSE,
    tax_rate DECIMAL(5, 2) DEFAULT 16,
    warranty_period INTEGER,
    lead_time_days INTEGER DEFAULT 7,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stock Movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID REFERENCES parts(id),
    from_location_id UUID REFERENCES locations(id),
    to_location_id UUID REFERENCES locations(id),
    movement_type VARCHAR(20) CHECK (movement_type IN ('in', 'out', 'transfer', 'adjustment')),
    quantity DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 4),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    movement_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Transactions table
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    part_id UUID REFERENCES parts(id),
    location_id UUID REFERENCES locations(id),
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('in', 'out', 'adjustment', 'transfer')),
    quantity DECIMAL(15, 3) NOT NULL,
    unit_cost DECIMAL(15, 4),
    reference_type VARCHAR(50),
    reference_id UUID,
    notes TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    transaction_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leads table (if not exists from migration)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_number VARCHAR(50) UNIQUE,
    company_name VARCHAR(255),
    contact_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    source VARCHAR(100),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    estimated_value DECIMAL(15, 2),
    expected_close_date DATE,
    notes TEXT,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID
);

-- Current Inventory View
CREATE OR REPLACE VIEW current_inventory AS
SELECT 
    p.id,
    p.part_number,
    p.name,
    p.description,
    p.category_id,
    p.vendor_id,
    p.unit_cost,
    p.selling_price,
    p.unit_of_measure,
    p.current_stock,
    p.minimum_stock,
    p.reorder_point,
    p.maximum_stock,
    p.barcode,
    p.weight,
    p.dimensions,
    p.is_active,
    p.is_serialized,
    p.tax_rate,
    p.warranty_period,
    p.lead_time_days,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.current_stock <= p.minimum_stock THEN 'low_stock'
        WHEN p.current_stock >= p.maximum_stock THEN 'overstock'
        ELSE 'normal'
    END as stock_status
FROM parts p;

-- Insert some default data
INSERT INTO product_categories (id, name, description) VALUES 
    ('cat-1', 'General', 'General products category'),
    ('cat-2', 'Electronics', 'Electronic components and devices'),
    ('cat-3', 'Office Supplies', 'Office and stationery supplies')
ON CONFLICT (id) DO NOTHING;

INSERT INTO locations (id, name, code, address) VALUES 
    ('loc-1', 'Main Warehouse', 'WH-001', '123 Storage Street, Nairobi'),
    ('loc-2', 'Secondary Storage', 'WH-002', '456 Industrial Road, Mombasa')
ON CONFLICT (id) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parts_name ON parts(name);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_category ON parts(category_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_part ON stock_movements(part_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_part ON inventory_transactions(part_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_date ON inventory_transactions(transaction_date);
