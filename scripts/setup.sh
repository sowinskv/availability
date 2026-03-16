#!/bin/bash
# Atlas setup script

set -e

echo "🚀 Setting up Atlas..."

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Prerequisites checked"

# Setup environment file
if [ ! -f docker/.env ]; then
    echo "Creating environment file..."
    cp docker/.env.example docker/.env
    echo "⚠️  Please edit docker/.env and add your API keys"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - OPENAI_API_KEY"
    read -p "Press enter when you've added your API keys..."
fi

# Start Docker services
echo "Starting Docker services..."
cd docker
docker-compose up -d db redis
echo "Waiting for database to be ready..."
sleep 10

# Run migrations
echo "Running database migrations..."
for migration in ../db/migrations/*.sql; do
    echo "Running $(basename $migration)..."
    docker exec atlas-db psql -U atlas -d atlas -f /docker-entrypoint-initdb.d/$(basename $migration)
done

# Start backend
echo "Starting backend..."
docker-compose up -d api worker
echo "Waiting for API to be ready..."
sleep 5

# Setup frontend
echo "Setting up frontend..."
cd ../frontend
if [ ! -d node_modules ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo ""
echo "✅ Atlas setup complete!"
echo ""
echo "To start the application:"
echo "  1. Backend API: http://localhost:8000"
echo "  2. Frontend: cd frontend && npm run dev (http://localhost:3000)"
echo ""
echo "Check logs with:"
echo "  docker-compose logs -f"
echo ""
echo "Stop services with:"
echo "  docker-compose down"
