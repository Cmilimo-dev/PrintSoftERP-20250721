#!/bin/bash

echo "Starting PostgREST server on port 3002..."
postgrest postgrest.conf &
POSTGREST_PID=$!

# Wait a moment for PostgREST to start
sleep 2

echo "Starting backend Express server on port 3003..."
node backend/index.js &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

echo "Starting proxy server on port 3001..."
node proxy-server.cjs &
PROXY_PID=$!

echo "PostgREST PID: $POSTGREST_PID"
echo "Backend PID: $BACKEND_PID"
echo "Proxy PID: $PROXY_PID"

echo "All servers started successfully!"
echo "API available at: http://127.0.0.1:3001/rest/v1/"
echo "Auth available at: http://127.0.0.1:3001/auth/"
echo "PostgREST directly at: http://127.0.0.1:3002/"
echo "Backend directly at: http://127.0.0.1:3003/"

# Wait for user input to stop servers
echo "Press Enter to stop servers..."
read

echo "Stopping servers..."
kill $POSTGREST_PID $BACKEND_PID $PROXY_PID
echo "Servers stopped."
