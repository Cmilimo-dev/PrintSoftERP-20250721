#!/bin/bash

# PrintSoft ERP Database Migration Script
# Usage: ./migrate.sh [migration-file.sql]

DB_NAME="printsoft_erp"
DB_USER="root"
DB_PASS=""

echo "🗄️  PrintSoft ERP Database Migration Tool"
echo "========================================="

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first."
    exit 1
fi

# Check if database exists
if ! mysql -u $DB_USER -e "USE $DB_NAME" 2>/dev/null; then
    echo "❌ Database '$DB_NAME' does not exist."
    echo "Please run the initial setup first:"
    echo "   mysql -u $DB_USER -p < database/setup/setup-database.sql"
    exit 1
fi

# If no argument provided, show available migrations
if [ $# -eq 0 ]; then
    echo "📁 Available migrations:"
    ls -1 database/migrations/*.sql | sort
    echo ""
    echo "Usage: ./migrate.sh [migration-file.sql]"
    echo "Example: ./migrate.sh database/migrations/add_hr_tables.sql"
    exit 0
fi

MIGRATION_FILE="$1"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "🔄 Running migration: $(basename $MIGRATION_FILE)"
echo "Database: $DB_NAME"

# Run the migration
if mysql -u $DB_USER -p $DB_NAME < "$MIGRATION_FILE"; then
    echo "✅ Migration completed successfully!"
    
    # Log the migration
    echo "$(date): Applied migration $(basename $MIGRATION_FILE)" >> database/migration.log
    
    # Show updated table count
    TABLE_COUNT=$(mysql -u $DB_USER -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';" -s -N)
    echo "📊 Database now has $TABLE_COUNT tables"
else
    echo "❌ Migration failed!"
    exit 1
fi
