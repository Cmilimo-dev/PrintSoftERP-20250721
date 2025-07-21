# PrintSoft ERP

A comprehensive Enterprise Resource Planning (ERP) system built with React, TypeScript, and Node.js, featuring user authentication, subscription management, and complete business modules.

## Features

### 🏢 Core ERP Modules
- **Sales Management** - Sales orders, quotations, invoices, delivery notes
- **Customer Management** - Customer records, leads, enhanced CRUD operations
- **Inventory Management** - Product catalog, stock tracking, movements
- **Financial Management** - Chart of accounts, transactions, reporting
- **Purchase Orders** - Vendor management, purchase order processing

### 🔧 Technical Features
- Clean architecture without business document dependencies
- TypeScript for type safety
- React Hooks for state management
- Local storage data persistence
- Modular component design
- Export functionality (PDF, CSV, Excel, MHT)
- Automatic number generation for documents and entities
- Advanced filtering and search capabilities

## Architecture

### Data Layer
- **ERPDataService** - Centralized data management
- **ERPExportService** - Document and list export functionality
- **LocalStorage** - Data persistence layer

### Type System
- **ERPTypes** - Clean type definitions for all entities
- **ERPCustomer, ERPVendor, ERPDocument** - Core business entities
- **ERPInventoryItem, ERPAccount, ERPTransaction** - Extended entities

### Hooks
- **useERPCustomers** - Customer management operations
- **useERPVendors** - Vendor management operations
- **useERPDocuments** - Document management by type
- **useERPInventory** - Inventory and stock operations
- **useERPFinancial** - Financial data management

### Components
- **Modular UI components** - Reusable form and list components
- **Enhanced CRUD tables** - Advanced filtering, sorting, export
- **Dashboard views** - Overview and analytics
- **Form components** - Type-safe form handling

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn package manager

### Installation

1. Clone or copy the clean ERP modules folder
```bash
cd erp-modules-clean
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser to `http://localhost:5173`

### Build for Production
```bash
npm run build
# or
yarn build
```

## Project Structure

```
PrintSoftERP/
├── database/                # Database files (organized)
│   ├── setup/              # Initial database setup
│   │   └── setup-database.sql
│   ├── schemas/             # Database schema definitions
│   │   ├── main_schema.sql
│   │   ├── subscription_schema.sql
│   │   ├── user_management_schema.sql
│   │   └── financial_automation_schema.sql
│   ├── migrations/          # Database migrations (16 files)
│   ├── seeds/               # Sample data files
│   └── README.md           # Database documentation
├── server/                  # Backend API server
│   ├── index.js            # Express server with authentication
│   ├── package.json        # Backend dependencies
│   └── .env.example        # Environment variables template
├── src/                     # Frontend React application
│   ├── components/          # UI components
│   ├── contexts/           # React contexts (Auth, Subscription)
│   ├── hooks/              # Custom React hooks
│   ├── services/           # Business logic services
│   ├── types/              # TypeScript type definitions
│   ├── config/             # Configuration files
│   └── App.tsx             # Main application component
├── start-dev.sh            # Development startup script
├── SETUP.md               # Detailed setup instructions
└── README.md              # This file
```

## Data Management

### Storage
- All data is stored in browser localStorage
- Automatic ID generation for all entities
- Incremental document numbering with configurable formats
- Automatic customer/vendor/product number generation

### Document Types
- Sales Orders (SO-YYYY-####)
- Quotations (QT-YYYY-####)
- Invoices (INV-YYYY-####)
- Delivery Notes (DN-YYYY-####)
- Purchase Orders (PO-YYYY-####)

### Export Formats
- **PDF** - Professional formatted documents
- **CSV** - Comma-separated values for spreadsheets
- **Excel** - Tab-separated format compatible with Excel
- **MHT** - Web archive format

## Customization

### Adding New Modules
1. Create component in appropriate folder
2. Add types to `erpTypes.ts`
3. Extend `erpDataService.ts` for data operations
4. Create hooks for state management
5. Add navigation item to `App.tsx`

### Modifying Document Formats
Edit the format strings in `erpDataService.ts`:
```typescript
const formats: Record<ERPDocumentType, string> = {
  'sales-order': 'SO-{YYYY}-{####}',
  // Add custom format
};
```

### Styling
- Uses Tailwind CSS for styling
- Radix UI components for accessibility
- Customizable theme colors in export service

## Development

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Modular component architecture
- Clean separation of concerns

### Testing
The modules are designed to be easily testable with:
- Pure functions for business logic
- Separated data layer
- Mockable services
- Type-safe interfaces

## Contributing

1. Follow the existing code structure
2. Maintain TypeScript type safety
3. Update documentation for new features
4. Test thoroughly before committing

## License

This project is private and proprietary. All rights reserved.

## Support

For questions or issues, please refer to the documentation or contact the development team.
