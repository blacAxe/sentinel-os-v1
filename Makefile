COMPOSE=docker compose
FRONTEND_DIR=sentinel-console

help:
	@echo "Sentinel OS commands:"
	@echo "  make backend        Start backend stack with build and live logs"
	@echo "  make up             Start backend stack in background"
	@echo "  make logs           Watch all backend logs"
	@echo "  make frontend       Start Next.js frontend"
	@echo "  make down           Stop containers"
	@echo "  make clean          Stop containers and delete volumes"
	@echo "  make rebuild        Full backend rebuild with live logs"
	@echo "  make status         Show running containers"
	@echo "  make proxy-logs     Watch proxy logs"
	@echo "  make idp-logs       Watch IDP logs"
	@echo "  make vortex-logs    Watch Vortex logs"
	@echo "  make lumen-logs     Watch LumenLog logs"

backend:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml up --build

up:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml up -d --build

logs:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml logs -f

frontend:
	cd $(FRONTEND_DIR) && npm run dev

frontend-install:
	cd $(FRONTEND_DIR) && npm install

down:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml down

clean:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml down -v

rebuild:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml down
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml up --build

status:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml ps

proxy-logs:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml logs -f sentinel-proxy

idp-logs:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml logs -f idp

vortex-logs:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml logs -f vortex

lumen-logs:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml logs -f lumen-ingestor lumen-agent lumen-alerter

infra-logs:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml logs -f db redpanda clickhouse

restart-proxy:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml restart proxy

restart-vortex:
	$(COMPOSE) -f sentinel-platform-v1/docker-compose.yml restart vortex