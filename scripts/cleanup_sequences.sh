#!/bin/bash

# API configuration
API_BASE="http://192.168.1.3:3001/rest/v1"
AUTH_HEADER="Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJwb3N0Z3Jlc3QiLCJleHAiOjE5MDY2ODk2MDAsImlhdCI6MTc1MTYzNDQ4NiwiaXNzIjoicG9zdGdyZXN0IiwianRpIjoiZGV2LXRva2VuLTFuaGw5b2E0YyIsInJvbGUiOiJhcHBsZSIsInN1YiI6ImFwcGxlIn0.1oSlJjZvKhYojpZq9T35dU0OEX2RWUZ9Fawijkk673Q"

# Records to keep (oldest of each type)
KEEP_CUSTOMER="bf21e4ce-a1ee-4000-9efa-c2a5975de02c"
KEEP_PRODUCT="ac7bcc7f-f698-474c-9a39-fe4af942dc69"
KEEP_SUPPLIER="8d053058-4a51-4f17-808d-2b635f9bddc6"
KEEP_VENDOR="5aae2c66-c33a-43c4-acd5-933b9ce1da45"

echo "🚀 Starting number sequence cleanup..."
echo "════════════════════════════════════════"

# Function to count records before cleanup
count_before() {
    local sequence_type=$1
    curl -s "${API_BASE}/number_sequences?sequence_type=eq.${sequence_type}&document_type=is.null" \
        -H "${AUTH_HEADER}" | jq 'length'
}

# Function to delete duplicates (keeping one specific record)
cleanup_sequence_type() {
    local sequence_type=$1
    local keep_id=$2
    
    echo "📊 Cleaning up ${sequence_type} sequences..."
    
    # Count before
    local before_count=$(count_before $sequence_type)
    echo "   Before: ${before_count} records"
    
    # Delete all except the one we want to keep
    local delete_response=$(curl -s -X DELETE \
        "${API_BASE}/number_sequences?sequence_type=eq.${sequence_type}&document_type=is.null&id=not.eq.${keep_id}" \
        -H "${AUTH_HEADER}")
    
    # Count after
    local after_count=$(count_before $sequence_type)
    echo "   After:  ${after_count} records"
    echo "   ✅ Deleted $((before_count - after_count)) duplicate records"
    echo
}

# Backup current state (optional - save current count)
echo "📋 Current state before cleanup:"
echo "   Customer sequences: $(count_before customer)"
echo "   Product sequences:  $(count_before product)"
echo "   Supplier sequences: $(count_before supplier)"
echo "   Vendor sequences:   $(count_before vendor)"
echo

# Perform cleanup
cleanup_sequence_type "customer" "$KEEP_CUSTOMER"
cleanup_sequence_type "product" "$KEEP_PRODUCT"
cleanup_sequence_type "supplier" "$KEEP_SUPPLIER"
cleanup_sequence_type "vendor" "$KEEP_VENDOR"

echo "🎉 Cleanup completed!"
echo "════════════════════════════════════════"

# Verify final state
echo "📋 Final verification:"
echo "   Customer sequences: $(count_before customer)"
echo "   Product sequences:  $(count_before product)"
echo "   Supplier sequences: $(count_before supplier)"
echo "   Vendor sequences:   $(count_before vendor)"

# Show the kept records
echo
echo "🔍 Kept records details:"
echo "Customer:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_CUSTOMER}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo "Product:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_PRODUCT}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo "Supplier:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_SUPPLIER}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo "Vendor:"
curl -s "${API_BASE}/number_sequences?id=eq.${KEEP_VENDOR}" -H "${AUTH_HEADER}" | jq '.[0] | {id: .id, sequence_type: .sequence_type, prefix: .prefix, current_number: .current_number, format: .format}'

echo
echo "✨ All done! Number sequences have been cleaned up."
