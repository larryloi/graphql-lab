up:
	docker compose up -d

ps:
	docker compose ps -a

down:
	docker compose down

build.app:
	docker build -t graphql-app:0.1.0 -f Dockerfile .

run:
	docker run --rm -p 4000:4000 \
		graphql-app:0.1.0

adminer-db:
		-e DATABASE_HOST=mysql_db \
		-e DATABASE_USER=admin \
		-e DATABASE_PASSWORD=Abcd1234 \
		-e DATABASE_NAME=inventory \

mysql.create.schema:
	# Run the SQL file from the host into the mysql container. Use relative path so
	# the Makefile can be run from the repository root.
	@echo "Applying demo1 schema..."
	docker exec -i mysql mysql -uroot -pAbcd1234 < sql/create_demo1_schema.sql || true
	@echo "Applying demonslayer schema..."
	docker exec -i mysql mysql -uroot -pAbcd1234 < sql/create_demonslayer_schema.sql || true
	@echo "Schemas applied."

shell.app:
	docker compose exec -it graphql_api /bin/sh

shell.mysql:
	docker compose exec mysql mysql -hlocalhost -uroot -pAbcd1234 inventory