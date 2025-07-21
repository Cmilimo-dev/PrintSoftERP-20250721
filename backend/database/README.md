# PrintSoft ERP Database

This directory contains all database-related files for the PrintSoft ERP system, organized into logical folders for better maintainability.

## 📁 Directory Structure

```
database/
├── setup/          # Initial database setup files
├── schemas/        # Database schema definitions
├── migrations/     # Database migration files
├── seeds/          # Sample/test data files
└── README.md       # This file
```

## 🗂️ File Organization

### `/setup/`
- `setup-database.sql` - Complete database initialization script
- Contains the main database creation and initial setup

### `/schemas/`
- `main_schema.sql` - Core ERP tables schema
- `subscription_schema.sql` - Subscription and billing tables
- `user_management_schema.sql` - User and authentication tables
- `financial_automation_schema.sql` - Financial automation features

### `/migrations/`
- Historical database changes and updates
- Migration files from previous development iterations
- Each file represents a specific database change or update

### `/seeds/`
- Sample data for development and testing
- Initial data for lookup tables
- Demo data for new installations

## 🚀 Quick Start

### 1. Initial Setup
```bash
# Create database and tables
mysql -u root -p < database/setup/setup-database.sql
```

### 2. Verify Installation
```bash
# Check if database was created
mysql -u root -e "USE printsoft_erp; SHOW TABLES;"
```

### 3. Run Additional Migrations (if needed)
```bash
# Apply any additional migrations
mysql -u root -p printsoft_erp < database/migrations/[migration_file].sql
```

## 📊 Database Schema Overview

### Core Tables
- **users** - User accounts and authentication
- **companies** - Company/organization records
- **subscription_plans** - Available subscription tiers
- **user_subscriptions** - User subscription records
- **team_members** - Team/collaboration features

### Business Tables
- **customers** - Customer management
- **vendors** - Vendor/supplier records
- **inventory_items** - Product/inventory management
- **documents** - Business documents (invoices, orders, etc.)
- **financial_transactions** - Financial records

### System Tables
- **audit_logs** - System activity tracking
- **system_settings** - Application configuration
- **document_types** - Document type definitions

## 🔧 Maintenance

### Adding New Tables
1. Create migration file in `/migrations/`
2. Update relevant schema file in `/schemas/`
3. Test migration thoroughly
4. Update this README if needed

### Schema Updates
1. Create new migration file for changes
2. Update the corresponding schema file
3. Document breaking changes

## 🔒 Security Notes

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Database credentials should be stored in environment variables
- Regular backups recommended for production

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection Error**: Check MySQL is running and credentials are correct
2. **Table Not Found**: Ensure setup script ran successfully
3. **Permission Denied**: Check MySQL user permissions

### Useful Commands
```bash
# Check database status
mysql -u root -e "SHOW DATABASES;"

# Check table structure
mysql -u root -e "DESCRIBE printsoft_erp.users;"

# Check data
mysql -u root -e "SELECT COUNT(*) FROM printsoft_erp.subscription_plans;"
```

## 📝 Notes

- Database uses MySQL/MariaDB
- UTF-8 character set for international support
- Foreign key constraints for data integrity
- Indexed columns for performance optimization
