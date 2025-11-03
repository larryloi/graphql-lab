# graphql-lab

## Docker image for `graphql_api`

This repository includes a `Dockerfile` intended for a Node.js-based GraphQL API. The `docker-compose.yaml` service `graphql_api` builds the image from the project root and maps port `4000`.

Assumptions:
- The GraphQL API is implemented in Node.js.
- There is a `package.json` at the project root with a `start` script (e.g. `"start": "node dist/index.js"` or `"start": "node index.js"`).
- If your project requires a build step (for example TypeScript), include a `build` script in `package.json` and the Dockerfile will run `npm run build` during the build stage.

How to build & run locally (Docker must be installed):

```bash
# Build the image with docker-compose and start services
docker-compose build
docker-compose up -d

# View logs
docker-compose logs -f graphql_api
```

If you prefer building the image manually:

```bash
docker build -t graphql_api:local .
docker run --rm -p 4000:4000 \
	-e DATABASE_HOST=mysql_db \
	-e DATABASE_USER=admin \
	-e DATABASE_PASSWORD=Abcd1234 \
	-e DATABASE_NAME=inventory \
	graphql_api:local
```

If your project is not Node.js, tell me which language/framework you use (Python/Graphene, Go, Ruby, etc.) and I will provide an alternative Dockerfile.

## Local development (quickstart)

Recommended: use docker compose which in this repo is configured to run a MySQL server and the local GraphQL API.

1. Start services:

```bash
cd /docker/graphql-lab
docker compose up -d mysql graphql_api
```

2. Import demo schemas (creates `demo1` and `demonslayer` DBs and seed data):

```bash
make mysql.create.schema
```

3. Open GraphiQL in your browser:

	- http://localhost:4000/graphql

4. Example GraphQL queries (GraphiQL or curl):

	- List all slayers

	```graphql
	query { slayers { id name breathing_style age } }
	```

	- Single slayer by id

	```graphql
	query { slayer(id: 1) { id name breathing_style age } }
	```

	- List demons

	# graphql-lab

	Lightweight demo: a Node.js GraphQL API (Express + express-graphql) backed by MySQL, packaged with Docker and docker-compose.

	This repo includes:
	- `Dockerfile` to build the GraphQL service image
	- `docker-compose.yaml` that runs a MySQL server plus the GraphQL service
	- `sql/` demo schemas and seeds for `demo1`, `demonslayer`, and `inventory`

	Quick goals covered here:
	- start the app locally with Docker
	- import demo schemas (UTF‑8 aware)
	- example GraphQL queries (including orders queries)

	## Quickstart (recommended)

	Prerequisites: Docker and docker-compose plugin (modern `docker compose`).

	1. Start MySQL and the GraphQL service from the repo root:

	```bash
	cd /docker/graphql-lab
	docker compose up -d mysql graphql
	```

	Note: the compose service name for the app in this repo is `graphql` (not `graphql_api`).

	2. Import demo schemas and seed data (this uses the MySQL client with utf8mb4):

	```bash
	make mysql.create.schema
	```

	3. Open GraphiQL in your browser:

	- http://localhost:4000/graphql

	4. Recreate demo data (destructive) if you need a clean state:

	```bash
	make mysql.reset
	make mysql.create.schema
	```

	## Example GraphQL queries

	Paste these into the left editor in GraphiQL and use the Variables pane when shown.

	- List slayers:

	```graphql
	query { slayers { id name breathing_style age } }
	```

	- Single slayer by id:

	```graphql
	query { slayer(id: 1) { id name breathing_style age } }
	```

	- List demons:

	```graphql
	query { demons { id name level age } }
	```

	- Orders filtered by issued_at (DATETIME string) and status (recommended: use variables)

	Query (use the Variables pane):

	```graphql
	query OrdersByDate($issuedAt: String!, $status: String!) {
		ordersByIssuedAt(issued_at: $issuedAt, status: $status) {
			id
			order_id
			supplier_id
			item_id
			status
			qty
			net_price
			tax_rate
			issued_at
			completed_at
			spec
		}
	}
	```

	Variables (example):

	```json
	{
		"issuedAt": "2025-01-01 00:00:00",
		"status": "shipped"
	}
	```

	- Orders filtered by minutes in the past (use `ordersByIssuedAtMins`):

	```graphql
	query OrdersByMins($mins: Int!, $status: String!) {
		ordersByIssuedAtMins(issuedAtMins: $mins, status: $status) {
			id
			order_id
			status
			qty
			issued_at
			spec
		}
	}
	```

	Variables example (last 60 minutes):

	```json
	{ "mins": 60, "status": "shipped" }
	```

	Notes:
	- `Int` in GraphQL is signed 32-bit — negative values are allowed by the type system, but the resolver should validate semantics (e.g., reject negative minutes if you mean "minutes in the past").
	- `issued_at` fields in the DB may be returned as epoch-ms strings in this demo; you can convert them to ISO strings in the resolver if desired.
	- `spec` is stored as JSON in the DB and returned as a string by default; parsing it in the resolver will return a proper JSON object to clients.

	## curl examples

	POST with variables (recommended):

	```bash
	curl -sS \
		-H "Content-Type: application/json; charset=utf-8" \
		-X POST http://localhost:4000/graphql \
		-d '{
			"query":"query OrdersByDate($issuedAt: String!, $status: String!){ ordersByIssuedAt(issued_at: $issuedAt, status: $status){ id order_id status qty issued_at spec } }",
			"variables": { "issuedAt": "2025-01-01 00:00:00", "status": "shipped" }
		}'
	```

	Inline-literals (no variables):

	```bash
	curl -sS -X POST http://localhost:4000/graphql \
		-H "Content-Type: application/json; charset=utf-8" \
		-d '{ "query": "{ ordersByIssuedAt(issued_at:\"2025-01-01 00:00:00\", status:\"shipped\") { id order_id status qty issued_at } }" }'
	```

	## Environment configuration

	All environment variables are centralized in `docker-compose.env` used by the `graphql` service. Important ones:

	- `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` — primary DB
	- `DEMON_DATABASE_HOST`, `DEMON_DATABASE_USER`, `DEMON_DATABASE_PASSWORD`, `DEMON_DATABASE_NAME` — secondary DB for slayers/demons
	- `INVENTORY_DATABASE_*` — inventory DB settings (orders table)

	After editing `docker-compose.env`, restart the service:

	```bash
	docker compose up -d --force-recreate graphql
	```

	## Charset / UTF-8 guidance

	To avoid mojibake and show CJK/emoji correctly:

	1. DDL: SQL files in `sql/` create DB/tables with `DEFAULT CHARSET=utf8mb4` and an utf8mb4 collation.
	2. Import: the Makefile uses `mysql --default-character-set=utf8mb4` when importing the SQL files.
	3. Connections: the Node pools are configured with `charset: 'utf8mb4'`.

	If characters are still garbled, data was likely imported earlier with the wrong client charset (double-encoded). For demo data the simplest fix is to re-import (see `make mysql.reset`); for production data take backups and consider an in-place conversion carefully.

	## Troubleshooting

	- If the container fails to start, fetch logs and exit code:

	```bash
	docker compose ps
	docker compose logs --no-color graphql --tail=300
	```

	- Common causes:
		- Syntax or runtime errors in `server.js` or `schema.js` (check logs).
		- Missing dependencies because `package.json` was not copied into the build context.
		- DB connection issues — confirm MySQL is up (`docker compose ps mysql`) and credentials in `docker-compose.env` match.

	## Next steps / addons

	- Add resolver improvements: parse `spec` into JSON, convert epoch timestamps to ISO, validate `issuedAtMins` >= 0, add ORDER BY/LIMIT for pagination.
	- Add a small integration test that runs a sample query against the container and asserts results and UTF-8 round-trip.

	If you want any of those done I can patch `server.js` and update the README with examples and commands.
