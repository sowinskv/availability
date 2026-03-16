#!/bin/bash
# Quick Docker test script

set -e

echo "🧪 Testing Atlas Docker setup..."
echo ""

# Check if .env exists
if [ ! -f "docker/.env" ]; then
    echo "⚠️  No .env file found. Creating from example..."
    cp docker/.env.example docker/.env
    echo "✅ Created docker/.env"
    echo "⚠️  Please edit docker/.env and add your API keys"
    echo ""
fi

echo "1️⃣  Building Docker images..."
cd docker
docker-compose -f docker-compose.minimal.yml build --no-cache

echo ""
echo "2️⃣  Starting services..."
docker-compose -f docker-compose.minimal.yml up -d

echo ""
echo "3️⃣  Waiting for services to be ready..."
sleep 10

echo ""
echo "4️⃣  Checking database..."
if docker exec atlas-db psql -U atlas -d atlas -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Database is ready"
else
    echo "   ❌ Database check failed"
    exit 1
fi

echo ""
echo "5️⃣  Checking Redis..."
if docker exec atlas-redis redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Redis is ready"
else
    echo "   ❌ Redis check failed"
    exit 1
fi

echo ""
echo "6️⃣  Checking API..."
sleep 5  # Give API more time to start
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ API is responding"
    curl -s http://localhost:8000/health | jq || echo ""
else
    echo "   ⚠️  API not responding yet (checking logs)..."
    echo ""
    docker logs atlas-api --tail 20
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Docker test complete!"
echo ""
echo "Services running:"
echo "  - API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Database: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "View logs: docker-compose -f docker-compose.minimal.yml logs -f"
echo "Stop services: docker-compose -f docker-compose.minimal.yml down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
