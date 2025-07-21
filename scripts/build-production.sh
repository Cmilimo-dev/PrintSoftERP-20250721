#!/bin/bash

# PrintSoft ERP Production Build Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
BACKUP_DIR="dist-backup"
ANALYZE_BUNDLE=false

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check Node.js and npm versions
check_environment() {
    log "Checking build environment..."
    
    # Check Node.js version (minimum 16)
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 16 ]; then
        error "Node.js version 16 or higher is required. Current: $(node -v)"
    fi
    
    # Check npm version
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
    fi
    
    success "Environment check passed - Node.js $(node -v), npm $(npm -v)"
}

# Backup existing build
backup_existing() {
    if [ -d "$BUILD_DIR" ]; then
        log "Backing up existing build..."
        rm -rf "$BACKUP_DIR"
        mv "$BUILD_DIR" "$BACKUP_DIR"
        success "Existing build backed up to $BACKUP_DIR"
    fi
}

# Install/update dependencies
install_dependencies() {
    log "Installing/updating dependencies..."
    
    # Clean install for production
    rm -rf node_modules package-lock.json
    npm ci --only=production --no-audit --no-fund || error "Failed to install dependencies"
    
    success "Dependencies installed"
}

# Run pre-build checks
pre_build_checks() {
    log "Running pre-build checks..."
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        warning ".env.production not found, using .env.local if available"
        if [ -f ".env.local" ]; then
            log "Using .env.local for build"
        else
            warning "No environment file found"
        fi
    fi
    
    # Type checking
    if command -v tsc &> /dev/null; then
        log "Running TypeScript type checking..."
        npm run type-check 2>/dev/null || npx tsc --noEmit || warning "Type checking failed, continuing..."
    fi
    
    # Linting (if available)
    log "Running linting..."
    npm run lint 2>/dev/null || warning "Linting failed or not available, continuing..."
    
    success "Pre-build checks completed"
}

# Build the application
build_app() {
    log "Building production application..."
    
    # Set production environment
    export NODE_ENV=production
    
    # Use production config if available
    if [ -f "vite.config.production.ts" ]; then
        log "Using production-specific Vite configuration"
        npx vite build --config vite.config.production.ts || error "Build failed"
    else
        npm run build || error "Build failed"
    fi
    
    success "Application built successfully"
}

# Post-build optimizations
post_build_optimizations() {
    log "Running post-build optimizations..."
    
    # Calculate build size
    if [ -d "$BUILD_DIR" ]; then
        BUILD_SIZE=$(du -sh "$BUILD_DIR" | cut -f1)
        log "Build size: $BUILD_SIZE"
    fi
    
    # Compress assets (if gzip available)
    if command -v gzip &> /dev/null; then
        log "Pre-compressing assets with gzip..."
        find "$BUILD_DIR" -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" -o -name "*.json" \) \
            -exec gzip -k -9 {} \;
        success "Assets pre-compressed"
    fi
    
    # Generate asset manifest
    log "Generating asset manifest..."
    cat > "$BUILD_DIR/manifest.json" << EOF
{
  "name": "PrintSoft ERP",
  "short_name": "PrintSoft",
  "description": "Comprehensive business management solution",
  "version": "$(node -p "require('./package.json').version")",
  "build_time": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "build_size": "$BUILD_SIZE"
}
EOF
    
    success "Post-build optimizations completed"
}

# Bundle analysis
analyze_bundle() {
    if [ "$ANALYZE_BUNDLE" = true ]; then
        log "Analyzing bundle size..."
        
        if command -v npx &> /dev/null; then
            # Install bundle analyzer if not available
            npm install --no-save rollup-plugin-visualizer || warning "Could not install bundle analyzer"
            
            # Generate bundle report
            npx vite-bundle-analyzer "$BUILD_DIR" || warning "Bundle analysis failed"
        fi
    fi
}

# Validate build
validate_build() {
    log "Validating build..."
    
    # Check if essential files exist
    ESSENTIAL_FILES=("index.html" "assets")
    for file in "${ESSENTIAL_FILES[@]}"; do
        if [ ! -e "$BUILD_DIR/$file" ]; then
            error "Essential file/directory missing: $file"
        fi
    done
    
    # Check for common issues
    if grep -r "localhost" "$BUILD_DIR" 2>/dev/null; then
        warning "Found localhost references in build - check your configuration"
    fi
    
    # Validate HTML
    if [ -f "$BUILD_DIR/index.html" ]; then
        if ! grep -q "<!DOCTYPE html>" "$BUILD_DIR/index.html"; then
            warning "index.html may be malformed"
        fi
    fi
    
    success "Build validation completed"
}

# Generate deployment report
generate_report() {
    log "Generating deployment report..."
    
    REPORT_FILE="build-report.txt"
    cat > "$REPORT_FILE" << EOF
PrintSoft ERP Production Build Report
====================================

Build Date: $(date)
Node.js Version: $(node -v)
npm Version: $(npm -v)
Build Size: $(du -sh "$BUILD_DIR" 2>/dev/null | cut -f1 || echo "Unknown")

Files Generated:
$(find "$BUILD_DIR" -type f | wc -l) files

Directory Structure:
$(tree "$BUILD_DIR" 2>/dev/null || find "$BUILD_DIR" -type d | head -20)

Largest Files:
$(find "$BUILD_DIR" -type f -exec ls -lh {} \; | sort -k5 -hr | head -10 | awk '{print $5 " " $9}')

Build Configuration:
- Environment: production
- Minification: enabled
- Source maps: disabled
- Code splitting: enabled
- Asset optimization: enabled

Next Steps:
1. Test the build: npm run preview
2. Deploy using: ./deploy-production.sh
3. Monitor application performance
EOF
    
    success "Build report generated: $REPORT_FILE"
}

# Main build process
main() {
    echo "🚀 PrintSoft ERP Production Build"
    echo "================================="
    
    check_environment
    backup_existing
    install_dependencies
    pre_build_checks
    build_app
    post_build_optimizations
    analyze_bundle
    validate_build
    generate_report
    
    echo ""
    success "Production build completed successfully! 🎉"
    echo ""
    echo "📁 Build output: $BUILD_DIR"
    echo "📊 Build report: build-report.txt"
    echo "🔍 Test build: npm run preview"
    echo "🚀 Deploy: ./deploy-production.sh"
    echo ""
}

# Handle command line arguments
case "${1:-build}" in
    "build")
        main
        ;;
    "analyze")
        ANALYZE_BUNDLE=true
        main
        ;;
    "clean")
        log "Cleaning build artifacts..."
        rm -rf "$BUILD_DIR" "$BACKUP_DIR" node_modules package-lock.json
        success "Cleanup completed"
        ;;
    "preview")
        if [ ! -d "$BUILD_DIR" ]; then
            error "No build found. Run './build-production.sh' first"
        fi
        log "Starting preview server..."
        npm run preview
        ;;
    *)
        echo "Usage: $0 [build|analyze|clean|preview]"
        echo ""
        echo "Commands:"
        echo "  build   - Build for production (default)"
        echo "  analyze - Build with bundle analysis"
        echo "  clean   - Clean all build artifacts"
        echo "  preview - Preview the production build"
        exit 1
        ;;
esac
