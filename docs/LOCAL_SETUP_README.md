# Local Development Setup - PrintSoft ERP

## Overview
Your ERP project is now configured for local development using PostgreSQL instead of remote Supabase.

## Components
- **Database**: PostgreSQL (printsofterp_dev)
- **API Server**: PostgREST (provides REST API)
- **Frontend**: React/Vite application

## Database Tables Created
✅ **Core Tables:**
- `products` - Product catalog (2 records)
- `customers` - Customer management (2 records) 
- `vendors` - Supplier/vendor management (1 record)
- `chart_of_accounts` - Financial accounts

✅ **Inventory Management:**
- `parts` - Inventory parts (0 records)
- `product_categories` - Product categorization (3 records)
- `locations` - Warehouse/storage locations (2 records)
- `stock_movements` - Inventory movements (0 records)
- `inventory_transactions` - Transaction history (0 records)
- `current_inventory` - Real-time inventory view (0 records)

✅ **Sales & Documents:**
- `quotations` + `quotation_items`
- `sales_orders` + `sales_order_items`
- `invoices` + `invoice_items`
- `delivery_notes` + `delivery_note_items`
- `purchase_orders` + `purchase_order_items`
- `leads` - Sales lead management
- `document_types` - Document configuration

## Services Running
- **PostgreSQL**: localhost:5432 (database: printsofterp_dev)
- **PostgREST API**: http://127.0.0.1:3001 (REST API for database)

## How to Start Development

### 1. Start the local services (if not running):
```bash
./start-local-dev.sh
```

### 2. Start your frontend development server:
```bash
npm run dev
# or
yarn dev
```

### 3. Your application will now use:
- Local PostgreSQL database
- Local REST API at http://127.0.0.1:3001
- Environment variables from `.env.local`

## Environment Configuration
The `.env.local` file has been configured to use the local setup:
```
VITE_SUPABASE_URL=http://127.0.0.1:3001
VITE_SUPABASE_ANON_KEY=<local-jwt-token>
```

## Testing the Setup
You can test the API directly:
```bash
# List all products
curl http://127.0.0.1:3001/products

# List all customers  
curl http://127.0.0.1:3001/customers

# List product categories
curl http://127.0.0.1:3001/product_categories
```

## Adding Sample Data
To add sample products or test data, you can:
1. Use the application UI (Product Form should now work)
2. Insert directly into PostgreSQL:
   ```sql
   psql -d printsofterp_dev -c "INSERT INTO products (name, sku, unit_price) VALUES ('Test Product', 'TEST001', 25.99);"
   ```

## Troubleshooting

### If PostgREST is not responding:
```bash
# Check if it's running
ps aux | grep postgrest

# Restart PostgREST
pkill -f postgrest
postgrest postgrest.conf &
```

### If PostgreSQL is not running:
```bash
brew services start postgresql@14
```

### If environment variables aren't picked up:
- Restart your development server
- Check that `.env.local` exists in the project root

## File Structure
- `postgrest.conf` - PostgREST configuration
- `create_missing_tables.sql` - Database schema
- `start-local-dev.sh` - Startup script
- `.env.local` - Local environment variables
- `LOCAL_SETUP_README.md` - This file

## Next Steps
1. ✅ Database tables created and verified
2. ✅ API server running and accessible  
3. ✅ Environment configured for local development
4. 🔄 Restart your frontend development server
5. ✅ Test ProductForm - should now work without errors
6. 📝 Add sample data through the UI or database

Your local development environment is ready! The ProductForm should now work without the previous Supabase connection errors.
