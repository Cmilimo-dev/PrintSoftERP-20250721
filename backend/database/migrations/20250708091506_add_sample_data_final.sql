-- Add sample business data for testing (final)

-- Update locations to include warehouse flag
UPDATE locations SET is_warehouse = true WHERE name = 'Main Warehouse';

-- Insert sample customers (only if they don't exist)
INSERT INTO customers (full_name, email, phone, company_name, status)
SELECT 'John Smith', 'john.smith@example.com', '+254701234567', 'Acme Corp Ltd', 'active'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'john.smith@example.com');

INSERT INTO customers (full_name, email, phone, company_name, status)
SELECT 'Jane Doe', 'jane.doe@techcorp.com', '+254702345678', 'TechCorp Solutions', 'active'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'jane.doe@techcorp.com');

INSERT INTO customers (full_name, email, phone, company_name, status)
SELECT 'Bob Wilson', 'bob.wilson@retail.com', '+254703456789', 'Wilson Retail Chain', 'active'
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE email = 'bob.wilson@retail.com');

-- Insert sample suppliers (only if they don't exist)
INSERT INTO suppliers (name, email, phone, contact_name)
SELECT 'Global Supplies Ltd', 'orders@globalsupplies.com', '+254711234567', 'Mary Johnson'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE email = 'orders@globalsupplies.com');

INSERT INTO suppliers (name, email, phone, contact_name)
SELECT 'Tech Components Inc', 'sales@techcomponents.com', '+254712345678', 'David Chen'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE email = 'sales@techcomponents.com');

INSERT INTO suppliers (name, email, phone, contact_name)
SELECT 'Office Solutions', 'info@officesolutions.com', '+254713456789', 'Sarah Williams'
WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE email = 'info@officesolutions.com');

-- Insert sample inventory data
DO $$
DECLARE
    part_record RECORD;
    location_record RECORD;
    random_qty INTEGER;
    random_price DECIMAL;
BEGIN
    FOR part_record IN SELECT id FROM parts LOOP
        FOR location_record IN SELECT id FROM locations LOOP
            random_qty := FLOOR(RANDOM() * 100) + 10;
            random_price := ROUND((RANDOM() * 50 + 10)::NUMERIC, 2);
            
            INSERT INTO current_inventory (part_id, location_id, quantity, stock_status, total_value)
            VALUES (
                part_record.id,
                location_record.id,
                random_qty,
                CASE 
                    WHEN random_qty < 20 THEN 'LOW_STOCK'
                    WHEN random_qty < 30 THEN 'REORDER'
                    ELSE 'IN_STOCK'
                END,
                random_qty * random_price
            )
            ON CONFLICT (part_id, location_id) DO UPDATE SET
                stock_status = CASE 
                    WHEN current_inventory.quantity < 20 THEN 'LOW_STOCK'
                    WHEN current_inventory.quantity < 30 THEN 'REORDER'
                    ELSE 'IN_STOCK'
                END,
                total_value = current_inventory.quantity * random_price;
        END LOOP;
    END LOOP;
END $$;
