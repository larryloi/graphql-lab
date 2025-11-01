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
