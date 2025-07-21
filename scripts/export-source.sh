#!/bin/bash

# Export script for ERP Full Source Code
echo "📂 Starting ERP Source Code Export..."

# Create export directory with timestamp
EXPORT_DIR="erp-source-$(date +%Y%m%d-%H%M%S)"
mkdir -p "../$EXPORT_DIR"

echo "📋 Copying source files..."
# Copy source code and configurations
cp -r src/ "../$EXPORT_DIR/"
cp -r public/ "../$EXPORT_DIR/"

# Copy all configuration files
cp package.json "../$EXPORT_DIR/"
cp package-lock.json "../$EXPORT_DIR/"
cp README.md "../$EXPORT_DIR/"
cp vite.config.ts "../$EXPORT_DIR/"
cp tailwind.config.ts "../$EXPORT_DIR/"
cp postcss.config.js "../$EXPORT_DIR/"
cp components.json "../$EXPORT_DIR/"
cp tsconfig.json "../$EXPORT_DIR/"
cp tsconfig.app.json "../$EXPORT_DIR/"
cp tsconfig.node.json "../$EXPORT_DIR/"
cp eslint.config.js "../$EXPORT_DIR/"
cp index.html "../$EXPORT_DIR/"

# Copy any additional files
if [ -f ".env.example" ]; then
    cp .env.example "../$EXPORT_DIR/"
fi

echo "📝 Creating development documentation..."
cat > "../$EXPORT_DIR/SETUP.md" << 'EOF'
# ERP Development Setup

## Prerequisites
- Node.js 16+ 
- npm or yarn package manager

## Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Development
- Development server runs on http://localhost:8080
- Hot module replacement enabled
- TypeScript with strict mode
- ESLint for code quality

## Project Structure
```
src/
├── components/           # UI components
├── pages/               # Main page components
├── hooks/               # Custom React hooks
├── services/            # Business logic services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── contexts/            # React contexts
```

## Features
- Complete ERP modules (Sales, Purchase, Inventory, Financial, etc.)
- Unified export system (PDF, Excel, CSV)
- Local storage data persistence
- Responsive design with Tailwind CSS
- Component library with Radix UI and Shadcn

## Building
The project uses Vite for fast development and optimized production builds with automatic code splitting.
EOF

echo "🎯 Creating package scripts reference..."
cat > "../$EXPORT_DIR/SCRIPTS.md" << 'EOF'
# Available Scripts

## Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint code checks

## Production Deployment
- Build output goes to `dist/` folder
- Static files ready for hosting
- No server-side dependencies required

## Customization
- Modify `tailwind.config.ts` for styling
- Update `vite.config.ts` for build configuration
- Edit `components.json` for component library settings
EOF

echo "✅ Source code export completed: ../$EXPORT_DIR"
echo "📁 Total size: $(du -sh ../$EXPORT_DIR | cut -f1)"
