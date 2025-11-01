include Makefile.env

ct ?=

# Helper to conditionally add container argument
CONTAINER_ARG = $(if $(ct),$(ct),)

VARS_TO_PRINT = ct DEFAULT_MASTER SEATUNNEL_VER

define print_vars
        @echo "Makefile variables:"
        $(foreach var,$(VARS_TO_PRINT),\
                echo "  $(var) = $($(var))\n"\
        )
endef

# Colors for output
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
MAGENTA := \033[35m
CYAN := \033[36m
WHITE := \033[37m
RESET := \033[0m

.PHONY: help ps up down logs build.app run mysql.create.schema mysql.reset shell.app shell.mysql query.slayers query.slayers.raw query.demons.raw query.graphiql

help:
				@echo "$(GREEN)Available targets:$(RESET)"
				@echo "  up                         - Start container (optionally ct=<container>)"
				@echo "  down                       - Stop and remove container (optionally ct=<container>)"
				@echo "  ps                         - List containers"
				@echo "  logs                       - Follow logs (optionally ct=<container>)"
				@echo "  build.app                  - Build the GraphQL app Docker image"
				@echo "  run                        - Run the GraphQL app Docker image"
				@echo "  mysql.create.schema        - Create demo schemas in MySQL"
				@echo "  mysql.reset                - Drop demo schemas in MySQL"
				@echo "  shell.app                  - Open shell in GraphQL app container"
				@echo "  shell.mysql                - Open MySQL client shell in MySQL container"
				@echo "  query.slayers              - Query slayers via GraphQL API"
				@echo "  query.slayers.raw          - Query slayers via GraphQL API (raw output)"
				@echo "  query.demons.raw           - Query demons via GraphQL API (raw output)"
				@echo "  query.graphiql             - Get GraphiQL page headers"


up:
	@echo "$(GREEN)Starting containers...$(RESET)"
	docker compose up -d

ps:
	@echo "$(GREEN)Listing containers...$(RESET)"
	docker compose ps -a

down:
	@echo "$(GREEN)Stopping containers...$(RESET)"
	docker compose down

logs:
	@echo "$(GREEN)Following logs...$(RESET)"
	docker compose logs -f $(ct)

build.app:
	@echo "$(GREEN)Building GraphQL app Docker image...$(RESET)"
	docker build -t graphql-app:0.1.0 -f Dockerfile .

run:
	@echo "$(GREEN)Running GraphQL app Docker image...$(RESET)"
	docker run --rm -p 4000:4000 \
		graphql-app:0.1.0

adminer-db:
	@echo "$(GREEN)Running Adminer Docker image...$(RESET)"
	docker run --rm -p 8080:8080 \
		--link mysql_db:db \
		-e DATABASE_HOST=mysql_db \
		-e DATABASE_USER=admin \
		-e DATABASE_PASSWORD=Abcd1234 \
		-e DATABASE_NAME=inventory \

mysql.create.schema:
	@echo "$(GREEN)Creating MySQL schemas...$(RESET)"
	# Run the SQL file from the host into the mysql container. Use relative path so
	# the Makefile can be run from the repository root.
	@echo "Applying demo1 schema (using utf8mb4 client)..."
	docker exec -i mysql mysql --default-character-set=utf8mb4 -uroot -pAbcd1234 < mysql/create_demo1_schema.sql || true
	@echo "Applying demonslayer schema (using utf8mb4 client)..."
	docker exec -i mysql mysql --default-character-set=utf8mb4 -uroot -pAbcd1234 < mysql/create_demonslayer_schema.sql || true
	@echo "Schemas applied."

.PHONY: mysql.reset
mysql.reset:
	@echo "$(GREEN)Resetting MySQL schemas...$(RESET)"
	# Drop demo databases (use with caution) so you can re-import cleanly.
	docker exec -i mysql mysql -uroot -pAbcd1234 -e "DROP DATABASE IF EXISTS demo1; DROP DATABASE IF EXISTS demonslayer;" || true
	@echo "Schemas applied."

shell.app:
	@echo "$(GREEN)Opening shell in GraphQL app container...$(RESET)"
	docker compose exec -it graphql /bin/sh

shell.mysql:
	@echo "$(GREEN)Opening shell in MySQL container...$(RESET)"
	docker compose exec mysql mysql --default-character-set=utf8mb4 -hlocalhost -uroot -pAbcd1234 inventory

query.slayers:
	@echo "$(GREEN)Querying slayers...$(RESET)"
	curl -s -X POST http://localhost:4000/graphql \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{"query":"{ slayers { id name breathing_style age } }"}' | jq

query.slayers.raw:
	@echo "$(GREEN)Querying slayers (raw output)...$(RESET)"
	curl -i -X POST http://localhost:4000/graphql \
	-H "Content-Type: application/json; charset=utf-8" \
	-d '{"query":"{ slayers { id name breathing_style age } }"}' | head -n 20

query.demons.raw:
	@echo "$(GREEN)Querying demons (raw output)...$(RESET)"
	curl -i -X POST http://localhost:4000/graphql \
	-H "Content-Type: application/json; charset=utf-8" \
	-d '{"query":"{ demons { id name age } }"}' | head -n 20

query.graphiql:
	@echo "$(GREEN)Getting GraphiQL page headers...$(RESET)"
	curl -I http://localhost:4000/graphql

