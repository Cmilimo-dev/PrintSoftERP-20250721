#!/bin/bash

# Start local development environment
echo "Starting local ERP development environment..."

# Check if PostgreSQL is running
if ! brew services list | grep postgresql@14 | grep started > /dev/null; then
    echo "Starting PostgreSQL..."
    brew services start postgresql@14
fi

# Check if PostgREST is running
if ! pgrep -f "postgrest postgrest.conf" > /dev/null; then
    echo "Starting PostgREST API server..."
    nohup postgrest postgrest.conf > postgrest.log 2>&1 &
    echo "PostgREST started on http://127.0.0.1:3001"
fi

echo "Local development environment is ready!"
echo "- PostgreSQL database: printsofterp_dev"
echo "- API server: http://127.0.0.1:3001"
echo "- Available tables: products, parts, customers, vendors, etc."
echo ""
echo "You can now start your frontend development server:"
echo "  npm run dev"
echo ""
echo "To stop PostgREST: pkill -f postgrest"
