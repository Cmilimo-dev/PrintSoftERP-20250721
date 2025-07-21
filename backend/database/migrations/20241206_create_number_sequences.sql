-- Create number_sequences table for document numbering
CREATE TABLE IF NOT EXISTS number_sequences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sequence_type TEXT NOT NULL CHECK (sequence_type IN ('document', 'customer', 'supplier', 'product', 'vendor')),
    document_type TEXT, -- NULL for entity sequences, specific type for document sequences
    prefix TEXT NOT NULL,
    current_number INTEGER NOT NULL DEFAULT 1000,
    format TEXT NOT NULL, -- e.g., "PO-{YYYY}-{####}", "CUST-{#####}"
    reset_annually BOOLEAN NOT NULL DEFAULT false,
    reset_monthly BOOLEAN NOT NULL DEFAULT false,
    fiscal_year_start TEXT DEFAULT '01-01', -- MM-DD format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate sequences
    UNIQUE(sequence_type, document_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_number_sequences_lookup 
ON number_sequences(sequence_type, document_type);

-- Insert default sequences
INSERT INTO number_sequences (sequence_type, document_type, prefix, current_number, format, reset_annually, reset_monthly, fiscal_year_start) VALUES
-- Document sequences
('document', 'purchase-order', 'PO', 1000, 'PO-{YYYY}-{####}', true, false, '01-01'),
('document', 'sales-order', 'SO', 1000, 'SO-{YYYY}-{####}', true, false, '01-01'),
('document', 'invoice', 'INV', 1000, 'INV-{YYYY}-{####}', true, false, '01-01'),
('document', 'quote', 'QT', 1000, 'QT-{YYYY}-{####}', true, false, '01-01'),
('document', 'delivery-note', 'DN', 1000, 'DN-{YYYY}-{####}', true, false, '01-01'),
('document', 'goods-receiving-voucher', 'GRV', 1000, 'GRV-{YYYY}-{####}', true, false, '01-01'),
('document', 'goods-return', 'GR', 1000, 'GR-{YYYY}-{####}', true, false, '01-01'),

-- Entity sequences
('customer', NULL, 'CUST', 10000, 'CUST-{#####}', false, false, '01-01'),
('supplier', NULL, 'SUP', 10000, 'SUP-{#####}', false, false, '01-01'),
('vendor', NULL, 'VEN', 10000, 'VEN-{#####}', false, false, '01-01'),
('product', NULL, 'PROD', 100000, 'PROD-{######}', false, false, '01-01')

ON CONFLICT (sequence_type, document_type) DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_number_sequences_updated_at
    BEFORE UPDATE ON number_sequences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE number_sequences ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view number sequences" ON number_sequences
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update number sequences" ON number_sequences
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert number sequences" ON number_sequences
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON number_sequences TO authenticated;
