#!/bin/bash

echo "Starting PrintSoft ERP Backend Server..."
cd "$(dirname "$0")"
node backend/index.js &
BACKEND_PID=$!

echo "Backend PID: $BACKEND_PID"
echo "Backend server started successfully!"
echo "API available at: http://192.168.1.16:3001"
echo "Health check: http://192.168.1.16:3001/health"
echo "Auth endpoints: http://192.168.1.16:3001/auth/"

# Wait for user input to stop server
echo "Press Enter to stop server..."
read

echo "Stopping backend server..."
kill $BACKEND_PID
echo "Backend server stopped."
