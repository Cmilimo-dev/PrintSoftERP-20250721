#!/bin/bash

# PrintSoft ERP Production Deployment Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="printsoft-erp"
DOCKER_TAG="${1:-latest}"
COMPOSE_FILE="docker-compose.production.yml"
BACKUP_DIR="./backups"
LOG_DIR="./logs"

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

# Pre-deployment checks
check_requirements() {
    log "Checking deployment requirements..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    if ! docker info &> /dev/null; then
        error "Docker is not running. Please start Docker first."
    fi
    
    # Check if Docker Compose is available
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        error "Docker Compose is not available. Please install Docker Compose."
    fi
    
    # Check if .env.production exists
    if [[ ! -f ".env.production" ]]; then
        warning ".env.production file not found. Please create it from .env.production template."
        echo "Would you like to create a basic .env.production file? (y/N)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            cp .env.production.template .env.production 2>/dev/null || error "Template file not found"
            warning "Please edit .env.production with your actual values before continuing."
            exit 1
        else
            error "Production environment file is required."
        fi
    fi
    
    success "All requirements met"
}

# Create necessary directories
setup_directories() {
    log "Setting up directories..."
    mkdir -p "$BACKUP_DIR" "$LOG_DIR/nginx" "monitoring"
    success "Directories created"
}

# Backup current deployment (if exists)
backup_current() {
    if docker ps -q -f name=printsoft-erp-prod &> /dev/null; then
        log "Creating backup of current deployment..."
        BACKUP_NAME="printsoft-erp-backup-$(date +%Y%m%d-%H%M%S)"
        docker commit printsoft-erp-prod "$BACKUP_NAME" || warning "Failed to create backup"
        success "Backup created: $BACKUP_NAME"
    fi
}

# Build and deploy
build_and_deploy() {
    log "Building production image..."
    
    # Build the production image
    docker build -f Dockerfile.production -t "$DOCKER_IMAGE:$DOCKER_TAG" . || error "Failed to build image"
    success "Image built successfully"
    
    log "Deploying with Docker Compose..."
    
    # Stop existing containers
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans || warning "No existing containers to stop"
    
    # Start new deployment
    docker-compose -f "$COMPOSE_FILE" up -d || error "Failed to start containers"
    
    success "Deployment completed"
}

# Health check
health_check() {
    log "Running health checks..."
    
    # Wait for container to be ready
    sleep 10
    
    # Check if container is running
    if ! docker ps -q -f name=printsoft-erp-prod &> /dev/null; then
        error "Container is not running"
    fi
    
    # Check health endpoint
    max_attempts=30
    attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost/health > /dev/null; then
            success "Application is healthy"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed, retrying in 5 seconds..."
        sleep 5
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Cleanup old images
cleanup() {
    log "Cleaning up old Docker images..."
    
    # Remove unused images
    docker image prune -f || warning "Failed to prune images"
    
    # Remove old backups (keep last 5)
    if ls $BACKUP_DIR/printsoft-erp-backup-* 1> /dev/null 2>&1; then
        ls -t $BACKUP_DIR/printsoft-erp-backup-* | tail -n +6 | xargs -r rm || warning "Failed to cleanup old backups"
    fi
    
    success "Cleanup completed"
}

# Show deployment info
show_info() {
    echo ""
    echo "🚀 PrintSoft ERP Production Deployment Complete!"
    echo ""
    echo "📊 Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "🌐 Application URL: http://localhost"
    echo "📋 Health Check: http://localhost/health"
    echo "📝 Logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "🛑 Stop: docker-compose -f $COMPOSE_FILE down"
    echo ""
    echo "📁 Important Files:"
    echo "  - Configuration: .env.production"
    echo "  - Logs: $LOG_DIR/"
    echo "  - Backups: $BACKUP_DIR/"
    echo ""
}

# Main deployment flow
main() {
    echo "🚀 PrintSoft ERP Production Deployment"
    echo "======================================"
    
    check_requirements
    setup_directories
    backup_current
    build_and_deploy
    health_check
    cleanup
    show_info
    
    success "Deployment successful! 🎉"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "stop")
        log "Stopping PrintSoft ERP..."
        docker-compose -f "$COMPOSE_FILE" down
        success "Stopped"
        ;;
    "restart")
        log "Restarting PrintSoft ERP..."
        docker-compose -f "$COMPOSE_FILE" restart
        success "Restarted"
        ;;
    "logs")
        docker-compose -f "$COMPOSE_FILE" logs -f
        ;;
    "status")
        docker-compose -f "$COMPOSE_FILE" ps
        ;;
    "cleanup")
        log "Cleaning up..."
        docker-compose -f "$COMPOSE_FILE" down --volumes --remove-orphans
        docker system prune -f
        success "Cleanup completed"
        ;;
    *)
        echo "Usage: $0 [deploy|stop|restart|logs|status|cleanup]"
        echo ""
        echo "Commands:"
        echo "  deploy   - Deploy the application (default)"
        echo "  stop     - Stop the application"
        echo "  restart  - Restart the application"
        echo "  logs     - Show application logs"
        echo "  status   - Show service status"
        echo "  cleanup  - Stop and cleanup all resources"
        exit 1
        ;;
esac
