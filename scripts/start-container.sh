#!/bin/bash

# Interactive Coding Engine - Container Startup Script
# Easy way to test the engine with zero setup

echo "Interactive Coding Engine - Container Setup"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is required but not installed."
    echo "   Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "ERROR: Docker Compose is required but not installed."
    echo "   Please install Docker Compose or use 'docker compose' (newer syntax)"
    exit 1
fi

echo "Docker is available!"
echo ""

# Show available options
echo "Available Services:"
echo "   1. api     - Just the API backend (recommended for testing)"
echo "   2. demo    - Full demo with frontend (for exploration)"
echo "   3. docs    - Documentation server"
echo "   4. all     - Everything (API + Demo + Docs)"
echo ""

# Get user choice
read -p "What would you like to start? (1-4, or 'api' for quick test): " choice

case $choice in
    1|api)
        echo "Starting API backend only..."
        docker-compose up api
        ;;
    2|demo)
        echo "Starting full demo with frontend..."
        docker-compose --profile demo up
        ;;
    3|docs)
        echo "Starting documentation server..."
        docker-compose --profile docs up docs
        ;;
    4|all)
        echo "Starting everything..."
        docker-compose --profile demo --profile docs up
        ;;
    *)
        echo "Starting API backend (default choice)..."
        docker-compose up api
        ;;
esac

echo ""
echo "Services started!"
echo ""
echo "Available URLs:"
echo "   • API Backend: http://localhost:8000"
echo "   • API Documentation: http://localhost:8000/docs"
echo "   • Health Check: http://localhost:8000/api/coding/health"
if [[ $choice == "2" || $choice == "demo" || $choice == "4" || $choice == "all" ]]; then
    echo "   • Demo Frontend: http://localhost:3000"
fi
if [[ $choice == "3" || $choice == "docs" || $choice == "4" || $choice == "all" ]]; then
    echo "   • Documentation: http://localhost:8080"
fi
echo ""
echo "Quick Test:"
echo "curl -X POST http://localhost:8000/api/coding/analyze \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"code\": \"const [count, setCount] = useState(0);\", \"language\": \"javascript\"}'"
echo ""
echo "Press Ctrl+C to stop all services"