#!/bin/bash

# PrintSoft ERP Development Startup Script

echo "🚀 Starting PrintSoft ERP Development Environment..."

# Check if MySQL is running
if ! pgrep -x "mysqld" > /dev/null; then
    echo "❌ MySQL is not running. Please start MySQL first:"
    echo "   brew services start mysql"
    echo "   or"
    echo "   sudo systemctl start mysql"
    exit 1
fi

echo "✅ MySQL is running"

# Check if database exists
if ! mysql -u root -e "use printsoft_erp" 2>/dev/null; then
    echo "❌ Database 'printsoft_erp' does not exist."
    echo "Please run the database setup first:"
    echo "   mysql -u root -p < database/setup/setup-database.sql"
    exit 1
fi

echo "✅ Database exists"

# Start backend in background
echo "🔧 Starting backend server..."
cd server
if [ ! -f ".env" ]; then
    echo "❌ Backend .env file not found. Copying from example..."
    cp .env.example .env
    echo "⚠️  Please edit server/.env with your database credentials"
    exit 1
fi

npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:3001/api/health > /dev/null; then
    echo "✅ Backend is running on http://localhost:3001"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo "🎨 Starting frontend..."
if [ ! -f ".env" ]; then
    echo "❌ Frontend .env file not found. Copying from example..."
    cp .env.example .env
fi

npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 PrintSoft ERP is starting up!"
echo ""
echo "📊 Backend API: http://localhost:3001"
echo "🖥️  Frontend:   http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

wait
