-- Add unique constraints to prevent duplicate number sequences
-- This will ensure that only one sequence can exist per sequence_type and document_type combination

-- First, let's verify current state
SELECT 
    sequence_type,
    document_type,
    COUNT(*) as count
FROM number_sequences 
GROUP BY sequence_type, document_type
HAVING COUNT(*) > 1;

-- Add unique constraint for sequences with null document_type
-- This covers customer, product, supplier, vendor sequences
ALTER TABLE number_sequences 
ADD CONSTRAINT unique_sequence_type_null_document 
UNIQUE (sequence_type) 
WHERE document_type IS NULL;

-- Add unique constraint for sequences with specific document_type
-- This covers any future sequences that might use document_type
ALTER TABLE number_sequences 
ADD CONSTRAINT unique_sequence_type_document 
UNIQUE (sequence_type, document_type) 
WHERE document_type IS NOT NULL;

-- Verify constraints were added
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname LIKE '%sequence%' 
AND conrelid = 'number_sequences'::regclass;

-- Final verification - should return no rows if all duplicates are gone
SELECT 
    sequence_type,
    document_type,
    COUNT(*) as count
FROM number_sequences 
GROUP BY sequence_type, document_type
HAVING COUNT(*) > 1;
