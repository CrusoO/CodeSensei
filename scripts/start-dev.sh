#!/bin/bash

# Interactive Coding Engine - Development Startup Script
# This script starts both the frontend and backend development servers

echo "🚀 Starting Interactive Coding Engine Development Environment"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    echo "   Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python is required but not installed."
    echo "   Please install Python 3.8+ from https://python.org/"
    exit 1
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

# Install backend dependencies if needed
if ! python3 -c "import fastapi" 2>/dev/null && ! python -c "import fastapi" 2>/dev/null; then
    echo "📦 Installing backend dependencies..."
    pip install -r requirements.txt
fi

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Start backend server in background
echo "🔧 Starting FastAPI backend server..."
cd api
if command -v python3 &> /dev/null; then
    python3 -m uvicorn interactive-coding:router --reload --host 0.0.0.0 --port 8000 &
else
    python -m uvicorn interactive-coding:router --reload --host 0.0.0.0 --port 8000 &
fi
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Go back to root directory
cd ..

# Start frontend server
echo "⚛️ Starting React frontend server..."
npm start &
FRONTEND_PID=$!

echo ""
echo "🎉 Development servers started successfully!"
echo ""
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping development servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Set up trap to cleanup on exit
trap cleanup INT TERM

# Wait for user input
wait
