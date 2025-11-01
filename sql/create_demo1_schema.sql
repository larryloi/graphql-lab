-- Create a demo database and users table for the GraphQL demo
CREATE DATABASE IF NOT EXISTS demo1;
USE demo1;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  UNIQUE KEY unique_email (email)
);

-- Seed data (idempotent)
INSERT INTO users (name, email) VALUES
  ('Alice', 'alice@example.com'),
  ('Bob', 'bob@example.com'),
  ('John Doe', 'john@example.com'),
  ('Jane Smith', 'jane@example.com'),
  ('Charlie Davis', 'charlie@example.com')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- demonslayer table was moved to sql/create_demoslayer_schema.sql (separate DB)
