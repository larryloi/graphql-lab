FROM node:20-bullseye-slim

# Use Debian Bullseye-based Node image (supported repos). This avoids EOL Ubuntu
# repository codenames that produce "no Release file" errors during apt-get.

WORKDIR /usr/src/app

# Install MariaDB client (lightweight) and keep image small
RUN apt-get update \
	&& apt-get install -y --no-install-recommends mariadb-client ca-certificates ncat \
	&& rm -rf /var/lib/apt/lists/*

# Install app dependencies
COPY package*.json ./
# Use npm ci when a lockfile exists for reproducible installs; otherwise fall back to npm install
RUN if [ -f package-lock.json ]; then \
			npm ci --only=production --no-audit --no-fund; \
		else \
			npm install --only=production --no-audit --no-fund; \
		fi

# Copy app source code
COPY . .

# Expose port 4000
EXPOSE 4000

# Run the app
CMD ["npm", "start"]

