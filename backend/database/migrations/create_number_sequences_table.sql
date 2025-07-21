-- Create the number_sequences table for auto-generating numbers
CREATE TABLE IF NOT EXISTS number_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_type VARCHAR(20) NOT NULL CHECK (sequence_type IN ('document', 'customer', 'supplier', 'product', 'vendor')),
    document_type VARCHAR(50), -- For documents: purchase-order, invoice, quote, etc.
    prefix VARCHAR(20) NOT NULL,
    current_number INTEGER NOT NULL DEFAULT 1000,
    format VARCHAR(100) NOT NULL, -- e.g., "PO-{YYYY}-{####}", "CUST-{####}", "PROD-{#####}"
    reset_annually BOOLEAN DEFAULT FALSE,
    reset_monthly BOOLEAN DEFAULT FALSE,
    fiscal_year_start VARCHAR(5), -- MM-DD format
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(sequence_type, document_type)
);

-- Insert default sequences
INSERT INTO number_sequences (sequence_type, document_type, prefix, current_number, format, reset_annually, reset_monthly, fiscal_year_start) VALUES
-- Document sequences
('document', 'purchase-order', 'PO', 1000, 'PO-{YYYY}-{####}', true, false, '01-01'),
('document', 'invoice', 'INV', 1000, 'INV-{YYYY}-{####}', true, false, '01-01'),
('document', 'quote', 'QT', 1000, 'QT-{YYYY}-{####}', true, false, '01-01'),
('document', 'sales-order', 'SO', 1000, 'SO-{YYYY}-{####}', true, false, '01-01'),
('document', 'delivery-note', 'DN', 1000, 'DN-{YYYY}-{####}', true, false, '01-01'),
('document', 'goods-receiving-voucher', 'GRV', 1000, 'GRV-{YYYY}-{####}', true, false, '01-01')
ON CONFLICT (sequence_type, document_type) DO NOTHING;

-- Entity sequences (document_type is NULL for these)
INSERT INTO number_sequences (sequence_type, prefix, current_number, format, reset_annually, reset_monthly) VALUES
('customer', 'CUST', 10000, 'CUST-{#####}', false, false),
('supplier', 'SUP', 10000, 'SUP-{#####}', false, false),
('vendor', 'VEN', 10000, 'VEN-{#####}', false, false),
('product', 'PROD', 100000, 'PROD-{######}', false, false)
ON CONFLICT (sequence_type, document_type) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_number_sequences_type ON number_sequences(sequence_type);
CREATE INDEX IF NOT EXISTS idx_number_sequences_doc_type ON number_sequences(document_type);
CREATE INDEX IF NOT EXISTS idx_number_sequences_lookup ON number_sequences(sequence_type, document_type);
