.PHONY: up down logs migrate test lint

COMPOSE_FILE=infra/docker-compose.yml

up:
	docker compose -f $(COMPOSE_FILE) up -d --build

down:
	docker compose -f $(COMPOSE_FILE) down -v

logs:
	docker compose -f $(COMPOSE_FILE) logs -f api

migrate:
	docker compose -f $(COMPOSE_FILE) run --rm api alembic upgrade head

test:
	docker compose -f $(COMPOSE_FILE) run --rm api pytest -q

lint:
	@echo "lint: not configured yet"

