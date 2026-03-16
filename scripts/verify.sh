#!/bin/bash
# Verification script for Atlas installation

set -e

echo "🔍 Verifying Atlas installation..."
echo ""

# Check Docker services
echo "1. Checking Docker services..."
if docker ps | grep -q "atlas-db"; then
    echo "   ✅ Database is running"
else
    echo "   ❌ Database is not running"
    exit 1
fi

if docker ps | grep -q "atlas-redis"; then
    echo "   ✅ Redis is running"
else
    echo "   ❌ Redis is not running"
    exit 1
fi

if docker ps | grep -q "atlas-api"; then
    echo "   ✅ API is running"
else
    echo "   ⚠️  API is not running (may not be started yet)"
fi

# Check API health
echo ""
echo "2. Checking API health..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "   ✅ API is healthy"
    curl -s http://localhost:8000/health | jq
else
    echo "   ⚠️  API not responding (may still be starting)"
fi

# Check database connection
echo ""
echo "3. Checking database..."
if docker exec atlas-db psql -U atlas -d atlas -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ Database connection OK"

    # Check if tables exist
    TABLE_COUNT=$(docker exec atlas-db psql -U atlas -d atlas -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
    if [ "$TABLE_COUNT" -gt 0 ]; then
        echo "   ✅ Database tables exist ($TABLE_COUNT tables)"
    else
        echo "   ⚠️  No tables found - run 'make db-migrate'"
    fi
else
    echo "   ❌ Database connection failed"
    exit 1
fi

# Check Redis
echo ""
echo "4. Checking Redis..."
if docker exec atlas-redis redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Redis is responding"
else
    echo "   ❌ Redis connection failed"
    exit 1
fi

# Check frontend
echo ""
echo "5. Checking frontend..."
if [ -d "frontend/node_modules" ]; then
    echo "   ✅ Frontend dependencies installed"
else
    echo "   ⚠️  Frontend dependencies not installed - run 'cd frontend && npm install'"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Atlas verification complete!"
echo ""
echo "Next steps:"
echo "  1. If API is not running: cd docker && docker-compose up -d api"
echo "  2. If tables don't exist: make db-migrate"
echo "  3. Start frontend: cd frontend && npm run dev"
echo ""
echo "Access Points:"
echo "  - API: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - Frontend: http://localhost:3000"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
