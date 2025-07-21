#!/bin/bash

# API configuration
API_BASE="http://192.168.1.3:3001/rest/v1"
AUTH_HEADER="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwb3N0Z3Jlc3QiLCJleHAiOjE5MDY2ODk2MDAsImlhdCI6MTc1MTYzNDQ4NiwiaXNzIjoicG9zdGdyZXN0IiwianRpIjoiZGV2LXRva2VuLTFuaGw5b2E0YyIsInJvbGUiOiJhcHBsZSIsInN1YiI6ImFwcGxlIn0.1oSlJjZvKhYojpZq9T35dU0OEX2RWUZ9Fawijkk673Q"

# Records to keep (the ones we want to preserve)
KEEP_CUSTOMER="bf21e4ce-a1ee-4000-9efa-c2a5975de02c"
KEEP_PRODUCT="ac7bcc7f-f698-474c-9a39-fe4af942dc69"
KEEP_SUPPLIER="8d053058-4a51-4f17-808d-2b635f9bddc6"
KEEP_VENDOR="5aae2c66-c33a-43c4-acd5-933b9ce1da45"

echo "🔥 AGGRESSIVE cleanup of number sequence duplicates..."
echo "══════════════════════════════════════════════════════"

# Function to delete specific IDs
delete_specific_ids() {
    local sequence_type=$1
    local keep_id=$2
    
    echo "🎯 Processing ${sequence_type} sequences..."
    
    # Get all IDs for this sequence type
    local all_ids=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.${sequence_type}&document_type=is.null&select=id" \
        -H "${AUTH_HEADER}" | jq -r '.[].id')
    
    local count=0
    local deleted=0
    
    for id in $all_ids; do
        count=$((count + 1))
        if [ "$id" != "$keep_id" ]; then
            echo "   🗑️  Deleting: $id"
            curl -s -X DELETE "${API_BASE}/number_sequences?id=eq.$id" -H "${AUTH_HEADER}" > /dev/null
            deleted=$((deleted + 1))
        else
            echo "   ✅ Keeping: $id (target record)"
        fi
    done
    
    echo "   📊 Processed $count records, deleted $deleted duplicates"
    echo
}

# Check current state
echo "📋 Current state:"
customer_count=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.customer&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')
product_count=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.product&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')
supplier_count=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.supplier&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')
vendor_count=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.vendor&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')

echo "   Customer: $customer_count records"
echo "   Product:  $product_count records"
echo "   Supplier: $supplier_count records"
echo "   Vendor:   $vendor_count records"
echo

# Perform aggressive cleanup
delete_specific_ids "customer" "$KEEP_CUSTOMER"
delete_specific_ids "product" "$KEEP_PRODUCT"
delete_specific_ids "supplier" "$KEEP_SUPPLIER"
delete_specific_ids "vendor" "$KEEP_VENDOR"

echo "🎉 Cleanup completed!"
echo "══════════════════════════════════════════════════════"

# Final verification
echo "📋 Final state:"
customer_final=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.customer&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')
product_final=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.product&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')
supplier_final=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.supplier&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')
vendor_final=$(curl -s "${API_BASE}/number_sequences?sequence_type=eq.vendor&document_type=is.null" -H "${AUTH_HEADER}" | jq 'length')

echo "   Customer: $customer_final records (should be 1)"
echo "   Product:  $product_final records (should be 1)"
echo "   Supplier: $supplier_final records (should be 1)"
echo "   Vendor:   $vendor_final records (should be 1)"

# Verify the kept records
echo
echo "🔍 Verification - kept records:"
echo "Customer sequence:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_CUSTOMER}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo "Product sequence:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_PRODUCT}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo "Supplier sequence:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_SUPPLIER}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo "Vendor sequence:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_VENDOR}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo
echo "✨ All duplicates have been eliminated!"
