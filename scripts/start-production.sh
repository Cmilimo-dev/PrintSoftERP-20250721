#!/bin/bash

# PrintSoftERP Production Start Script
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_DIR="backend"
FRONTEND_DIR="dist"
BACKEND_PORT=3001
FRONTEND_PORT=4173
LOG_DIR="logs"

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

# Create logs directory
create_logs_dir() {
    if [ ! -d "$LOG_DIR" ]; then
        mkdir -p "$LOG_DIR"
        success "Created logs directory"
    fi
}

# Check if backend is built
check_backend() {
    if [ ! -f "$BACKEND_DIR/index.js" ]; then
        error "Backend not found. Please ensure backend/index.js exists."
    fi
    
    if [ ! -f "$BACKEND_DIR/package.json" ]; then
        error "Backend package.json not found."
    fi
    
    success "Backend files found"
}

# Check if frontend is built
check_frontend() {
    if [ ! -d "$FRONTEND_DIR" ]; then
        error "Frontend build not found. Please run 'npm run build' first."
    fi
    
    if [ ! -f "$FRONTEND_DIR/index.html" ]; then
        error "Frontend index.html not found in build directory."
    fi
    
    success "Frontend build found"
}

# Install backend dependencies
install_backend_deps() {
    log "Checking backend dependencies..."
    
    cd "$BACKEND_DIR"
    if [ ! -d "node_modules" ]; then
        log "Installing backend dependencies..."
        npm install --only=production
        success "Backend dependencies installed"
    else
        log "Backend dependencies already installed"
    fi
    cd ..
}

# Start backend server
start_backend() {
    log "Starting backend server on port $BACKEND_PORT..."
    
    cd "$BACKEND_DIR"
    
    # Check if backend is already running
    if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
        warning "Backend server is already running on port $BACKEND_PORT"
        cd ..
        return 0
    fi
    
    # Start backend server in background
    nohup node index.js > "../$LOG_DIR/backend.log" 2>&1 &
    BACKEND_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    # Check if backend started successfully
    if kill -0 $BACKEND_PID 2>/dev/null; then
        success "Backend server started successfully (PID: $BACKEND_PID)"
        echo $BACKEND_PID > "../$LOG_DIR/backend.pid"
    else
        error "Failed to start backend server"
    fi
    
    cd ..
}

# Start frontend server
start_frontend() {
    log "Starting frontend server on port $FRONTEND_PORT..."
    
    # Check if frontend is already running
    if lsof -i :$FRONTEND_PORT > /dev/null 2>&1; then
        warning "Frontend server is already running on port $FRONTEND_PORT"
        return 0
    fi
    
    # Start frontend preview server in background
    nohup npx vite preview --port $FRONTEND_PORT --host 0.0.0.0 > "$LOG_DIR/frontend.log" 2>&1 &
    FRONTEND_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    # Check if frontend started successfully
    if kill -0 $FRONTEND_PID 2>/dev/null; then
        success "Frontend server started successfully (PID: $FRONTEND_PID)"
        echo $FRONTEND_PID > "$LOG_DIR/frontend.pid"
    else
        error "Failed to start frontend server"
    fi
}

# Health check
health_check() {
    log "Running health checks..."
    
    # Check backend health
    if curl -s -f http://localhost:$BACKEND_PORT/health > /dev/null; then
        success "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend
    if curl -s -f http://localhost:$FRONTEND_PORT > /dev/null; then
        success "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
}

# Stop servers
stop_servers() {
    log "Stopping servers..."
    
    # Stop backend
    if [ -f "$LOG_DIR/backend.pid" ]; then
        BACKEND_PID=$(cat "$LOG_DIR/backend.pid")
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            success "Backend server stopped"
        fi
        rm -f "$LOG_DIR/backend.pid"
    fi
    
    # Stop frontend
    if [ -f "$LOG_DIR/frontend.pid" ]; then
        FRONTEND_PID=$(cat "$LOG_DIR/frontend.pid")
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            success "Frontend server stopped"
        fi
        rm -f "$LOG_DIR/frontend.pid"
    fi
    
    # Kill any remaining processes
    pkill -f "node index.js" || true
    pkill -f "vite preview" || true
    
    success "All servers stopped"
}

# Show status
show_status() {
    log "Server Status:"
    echo ""
    
    # Backend status
    if lsof -i :$BACKEND_PORT > /dev/null 2>&1; then
        success "Backend: Running on http://localhost:$BACKEND_PORT"
    else
        warning "Backend: Not running"
    fi
    
    # Frontend status
    if lsof -i :$FRONTEND_PORT > /dev/null 2>&1; then
        success "Frontend: Running on http://localhost:$FRONTEND_PORT"
    else
        warning "Frontend: Not running"
    fi
    
    echo ""
    log "Access URLs:"
    echo "  🌐 Frontend: http://localhost:$FRONTEND_PORT"
    echo "  🔗 Backend API: http://localhost:$BACKEND_PORT"
    echo "  📊 Backend Health: http://localhost:$BACKEND_PORT/health"
    echo ""
    log "Logs:"
    echo "  📝 Backend: $LOG_DIR/backend.log"
    echo "  📝 Frontend: $LOG_DIR/frontend.log"
}

# Show logs
show_logs() {
    case "${2:-all}" in
        "backend")
            if [ -f "$LOG_DIR/backend.log" ]; then
                tail -f "$LOG_DIR/backend.log"
            else
                warning "Backend log file not found"
            fi
            ;;
        "frontend")
            if [ -f "$LOG_DIR/frontend.log" ]; then
                tail -f "$LOG_DIR/frontend.log"
            else
                warning "Frontend log file not found"
            fi
            ;;
        "all"|*)
            if [ -f "$LOG_DIR/backend.log" ] && [ -f "$LOG_DIR/frontend.log" ]; then
                tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log"
            else
                warning "Some log files not found"
            fi
            ;;
    esac
}

# Main function
main() {
    echo "🚀 PrintSoftERP Production Server"
    echo "=================================="
    echo ""
    
    create_logs_dir
    check_backend
    check_frontend
    install_backend_deps
    start_backend
    start_frontend
    
    # Wait for servers to be ready
    sleep 3
    
    health_check
    
    echo ""
    success "PrintSoftERP is now running! 🎉"
    echo ""
    show_status
    
    echo ""
    log "To stop the servers, run: $0 stop"
    log "To view logs, run: $0 logs"
}

# Handle command line arguments
case "${1:-start}" in
    "start")
        main
        ;;
    "stop")
        stop_servers
        ;;
    "restart")
        stop_servers
        sleep 2
        main
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs "$@"
        ;;
    "health")
        health_check
        ;;
    *)
        echo "Usage: $0 [start|stop|restart|status|logs|health]"
        echo ""
        echo "Commands:"
        echo "  start    - Start both frontend and backend servers (default)"
        echo "  stop     - Stop all servers"
        echo "  restart  - Restart all servers"
        echo "  status   - Show server status"
        echo "  logs     - Show logs (all|backend|frontend)"
        echo "  health   - Run health checks"
        exit 1
        ;;
esac
