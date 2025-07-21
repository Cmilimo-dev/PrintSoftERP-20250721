#!/bin/bash

# Export script for ERP Production Build
echo "🚀 Starting ERP Production Export..."

# Create export directory with timestamp
EXPORT_DIR="erp-production-$(date +%Y%m%d-%H%M%S)"
mkdir -p "../$EXPORT_DIR"

echo "📦 Building production version..."
npm run build

echo "📋 Copying production files..."
# Copy built application
cp -r dist/ "../$EXPORT_DIR/dist"

# Copy essential configuration files
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
cp index.html "../$EXPORT_DIR/"

echo "📝 Creating deployment documentation..."
cat > "../$EXPORT_DIR/DEPLOYMENT.md" << 'EOF'
# ERP Production Deployment

## Files Included
- `dist/` - Production build files (ready for static hosting)
- `package.json` - Dependencies and scripts
- Configuration files for rebuilding if needed

## Deployment Options

### 1. Static File Hosting
Upload the `dist/` folder contents to:
- Netlify, Vercel, GitHub Pages
- AWS S3 + CloudFront
- Traditional web hosting

### 2. Docker Deployment
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. Node.js Server
```bash
npm install -g serve
serve -s dist -l 3000
```

## Configuration
- Built with Vite
- Uses local storage for data persistence
- No external database dependencies
- Responsive design with Tailwind CSS

## Build Information
- Build Date: $(date)
- Node Version: $(node --version)
- NPM Version: $(npm --version)
EOF

echo "✅ Production export completed: ../$EXPORT_DIR"
echo "📁 Total size: $(du -sh ../$EXPORT_DIR | cut -f1)"
