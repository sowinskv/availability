.PHONY: setup start stop restart logs clean test db-migrate db-reset

# Setup everything
setup:
	@echo "🚀 Setting up Atlas..."
	@./scripts/setup.sh

# Start all services (minimal: no worker)
start:
	@echo "Starting Atlas services (minimal)..."
	@cd docker && docker-compose -f docker-compose.minimal.yml up -d
	@echo "✅ Services started!"
	@echo "   - API: http://localhost:8000"
	@echo "   - Docs: http://localhost:8000/docs"
	@echo ""
	@echo "To start frontend: cd frontend && npm run dev"

# Start all services (full: with worker)
start-full:
	@echo "Starting Atlas services (full with worker)..."
	@cd docker && docker-compose up -d
	@echo "✅ Services started!"

# Stop all services
stop:
	@echo "Stopping Atlas services..."
	@cd docker && docker-compose -f docker-compose.minimal.yml down || docker-compose down
	@echo "✅ Services stopped!"

# Restart all services
restart: stop start

# View logs
logs:
	@cd docker && docker-compose -f docker-compose.minimal.yml logs -f

# Test Docker setup
docker-test:
	@./scripts/docker-test.sh

# Clean up everything
clean:
	@echo "⚠️  This will remove all containers, volumes, and data!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		cd docker && docker-compose down -v; \
		echo "✅ Cleaned up!"; \
	fi

# Run database migrations
db-migrate:
	@echo "Running database migrations..."
	@for file in db/migrations/*.sql; do \
		echo "Running $$file..."; \
		docker exec atlas-db psql -U atlas -d atlas -f /docker-entrypoint-initdb.d/$$(basename $$file); \
	done
	@echo "✅ Migrations complete!"

# Reset database (DANGEROUS!)
db-reset:
	@echo "⚠️  This will DELETE ALL DATA!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker exec atlas-db psql -U atlas -d atlas -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"; \
		make db-migrate; \
		echo "✅ Database reset complete!"; \
	fi

# Run tests
test:
	@echo "Running backend tests..."
	@cd backend && pytest
	@echo "✅ Tests passed!"

# Check health
health:
	@echo "Checking service health..."
	@curl -s http://localhost:8000/health | jq || echo "API not responding"
	@docker exec atlas-db psql -U atlas -d atlas -c "SELECT 1;" > /dev/null && echo "✅ Database OK" || echo "❌ Database not responding"
	@docker exec atlas-redis redis-cli ping > /dev/null && echo "✅ Redis OK" || echo "❌ Redis not responding"

# Development mode (hot reload)
dev:
	@echo "Starting Atlas in development mode..."
	@cd docker && docker-compose up

# Frontend install
frontend-install:
	@cd frontend && npm install

# Frontend dev
frontend-dev:
	@cd frontend && npm run dev

# Full dev environment
dev-full: start frontend-dev
