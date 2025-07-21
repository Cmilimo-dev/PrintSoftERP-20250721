#!/bin/bash

echo "Starting PrintSoft ERP - Complete System..."
cd "$(dirname "$0")"

# Start backend in background
echo "Starting backend server on port 3001..."
node backend/index.js &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend in background
echo "Starting frontend server..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ All servers started successfully!"
echo "📡 Backend API: http://192.168.1.16:3001"
echo "🌐 Frontend App: http://192.168.1.16:8080 (or 8082 if 8080 is busy)"
echo ""
echo "🔑 Login credentials:"
echo "   Email: admin@printsoft.com"
echo "   Password: admin123"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Enter to stop all servers..."
read

echo "Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "All servers stopped."
