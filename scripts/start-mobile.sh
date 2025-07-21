#!/bin/bash

# Get the current IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

echo "🚀 Starting PrintSoftERP for mobile access"
echo "📱 Your IP address: $IP"
echo ""
echo "Access the app from your mobile device:"
echo "  Frontend: http://$IP:8080"
echo "  Backend:  http://$IP:3001"
echo ""
echo "Starting servers..."
echo ""

# Start backend server
echo "Starting backend server..."
cd backend
node index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server..."
cd ..
npm run dev:mobile &
FRONTEND_PID=$!

# Function to cleanup processes
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap ctrl+c and call cleanup
trap cleanup INT

echo ""
echo "✅ Both servers are running!"
echo "📱 Open http://$IP:8080 on your mobile device"
echo "💻 Open http://localhost:8080 on your computer"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes to finish
wait
