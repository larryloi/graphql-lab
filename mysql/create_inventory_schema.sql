CREATE DATABASE IF NOT EXISTS inventory;

USE inventory;

CREATE TABLE IF NOT EXISTS suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY (NAME, TYPE)
);
CREATE INDEX idx_created_at ON suppliers (created_at);
CREATE INDEX idx_updated_at ON suppliers (updated_at);
CREATE INDEX suppliers_type_IDX USING BTREE ON suppliers (`type`);

CREATE TABLE IF NOT EXISTS orders (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `order_id` VARCHAR(36) NOT NULL,
  `supplier_id` INT NOT NULL,
  `item_id` INT NOT NULL,
  `status` VARCHAR(20) NOT NULL,
  `qty` INT NOT NULL,
  `net_price` INT NOT NULL,
  `tax_rate` FLOAT NOT NULL,
  `issued_at` DATETIME NOT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `spec` JSON DEFAULT NULL,
  `created_at` DATETIME DEFAULT NULL,
  `updated_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_orders_order_id` (`order_id`),
  KEY `IDX_orders_issued_at` (`issued_at`),
  KEY `IDX_orders_completed_at` (`completed_at`),
  KEY `IDX_orders_created_at` (`created_at`),
  KEY `IDX_orders_updated_at` (`updated_at`)
) ENGINE=INNODB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
