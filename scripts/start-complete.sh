#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to kill process on port
kill_port() {
    local port=$1
    local pid=$(lsof -ti :$port)
    if [ ! -z "$pid" ]; then
        print_warning "Killing process on port $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
        sleep 1
    fi
}

# Function to cleanup on exit
cleanup() {
    print_header "\n🛑 Shutting down servers..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        print_status "Stopping backend server (PID: $BACKEND_PID)"
        kill $BACKEND_PID 2>/dev/null
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        print_status "Stopping frontend server (PID: $FRONTEND_PID)"
        kill $FRONTEND_PID 2>/dev/null
    fi
    
    # Clean up any remaining processes on our ports
    kill_port 3001
    kill_port 8080
    
    print_status "All servers stopped."
    exit 0
}

# Set up trap for cleanup on script exit
trap cleanup EXIT INT TERM

print_header "🚀 Starting PrintSoft ERP - Complete System"
print_header "=============================================="

# Change to project root directory (parent of scripts directory)
cd "$(dirname "$0")/.."

# Check if required directories exist
if [ ! -d "backend" ]; then
    print_error "Backend directory not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

# Clear any existing processes on our ports
print_status "Checking for existing processes on ports 3001 and 8080..."
if check_port 3001; then
    print_warning "Port 3001 is already in use. Stopping existing process..."
    kill_port 3001
fi

if check_port 8080; then
    print_warning "Port 8080 is already in use. Stopping existing process..."
    kill_port 8080
fi

# Install dependencies if needed
print_status "Checking dependencies..."

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Check frontend dependencies
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

print_header "\n📡 Starting Backend Server..."
print_header "=============================="

# Start backend server
cd backend
node index.js &
BACKEND_PID=$!
cd ..

print_status "Backend server started with PID: $BACKEND_PID"

# Wait for backend to start
print_status "Waiting for backend to initialize..."
sleep 3

# Check if backend is running
if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
    print_error "Backend server failed to start!"
    exit 1
fi

# Test backend health
print_status "Testing backend connectivity..."
if curl -s http://127.0.0.1:3001/health > /dev/null 2>&1; then
    print_status "✅ Backend health check passed"
else
    print_warning "Backend health check failed, but server might still be starting..."
fi

print_header "\n🌐 Starting Frontend Server..."
print_header "==============================="

# Start frontend server
npm run dev:mobile &
FRONTEND_PID=$!

print_status "Frontend server started with PID: $FRONTEND_PID"

# Wait for frontend to start
print_status "Waiting for frontend to initialize..."
sleep 5

# Check if frontend is running
if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
    print_error "Frontend server failed to start!"
    exit 1
fi

print_header "\n✅ All Servers Started Successfully!"
print_header "===================================="

echo ""
print_status "📡 Backend API: http://127.0.0.1:3001"
print_status "   • Health Check: http://127.0.0.1:3001/health"
print_status "   • Auth Endpoints: http://127.0.0.1:3001/auth/"
print_status "   • API Documentation: http://127.0.0.1:3001/api/"

echo ""
print_status "🌐 Frontend Application: http://127.0.0.1:8080"
print_status "   • Also accessible at: http://0.0.0.0:8080 (for mobile testing)"

echo ""
print_status "🔑 Default Login Credentials:"
print_status "   • Email: admin@printsoft.com"
print_status "   • Password: admin123"

echo ""
print_status "🔧 Process Information:"
print_status "   • Backend PID: $BACKEND_PID"
print_status "   • Frontend PID: $FRONTEND_PID"

echo ""
print_header "📋 Quick Commands:"
echo "   • View backend logs: tail -f backend/logs/app.log (if logging is enabled)"
echo "   • Check backend status: curl http://127.0.0.1:3001/health"
echo "   • Stop servers: Press Ctrl+C or close this terminal"

echo ""
print_warning "Press Ctrl+C to stop all servers..."

# Keep the script running and wait for user interruption
while true; do
    # Check if processes are still running
    if ! ps -p $BACKEND_PID > /dev/null 2>&1; then
        print_error "Backend server has stopped unexpectedly!"
        break
    fi
    
    if ! ps -p $FRONTEND_PID > /dev/null 2>&1; then
        print_error "Frontend server has stopped unexpectedly!"
        break
    fi
    
    sleep 5
done

# Cleanup will be handled by the trap
