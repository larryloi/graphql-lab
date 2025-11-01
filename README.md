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

	```graphql
	query { demons { id name level age } }
	```

	- curl (list slayers)

	```bash
	curl -s -X POST http://localhost:4000/graphql \
		-H "Content-Type: application/json; charset=utf-8" \
		-d '{"query":"{ slayers { id name breathing_style age } }"}' | jq
	```

## Environment configuration

All environment variables used by the `graphql_api` service are in `docker-compose.env`.
Key vars:

- `DATABASE_HOST`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME` — primary DB (demo1)
- `DEMON_DATABASE_HOST`, `DEMON_DATABASE_USER`, `DEMON_DATABASE_PASSWORD`, `DEMON_DATABASE_NAME` — secondary DB used for slayers/demons

If you edit `docker-compose.env` you can restart the service:

```bash
docker compose up -d --force-recreate graphql_api
```

## Charset / UTF-8 notes

To display CJK and emoji correctly we ensure three things:

1. Database and tables are created with `DEFAULT CHARACTER SET utf8mb4` and `COLLATE utf8mb4_unicode_ci` (see `sql/` files).
2. The MySQL client used for importing SQL must use `--default-character-set=utf8mb4` (Makefile uses this flag).
3. The Node app uses `mysql2` and the connection pools set `charset: 'utf8mb4'`. The server also appends `charset=utf-8` to HTTP responses so browsers decode GraphiQL/JSON correctly.

If characters still appear garbled after these fixes it usually means the data was imported earlier with the wrong client charset and is double-encoded. Two repair options:

- Re-import (recommended for demo data):
	```bash
	make mysql.reset
	make mysql.create.schema
	```
- In-place repair (advanced, backup first):
	```sql
	-- run inside mysql client
	UPDATE demonslayer.slayers
		SET name = CONVERT(BINARY(CONVERT(name USING latin1)) USING utf8mb4);
	```

## Useful Make targets

- `make mysql.create.schema` — import SQL files (uses UTF-8 client)
- `make mysql.reset` — drops demo databases (demo1, demonslayer) so you can re-import

---

If you want I can add automated tests or a small script that performs a sample query and asserts UTF‑8 characters round-trip correctly.
