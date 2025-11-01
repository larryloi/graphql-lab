CREATE DATABASE IF NOT EXISTS company;
USE company;


CREATE TABLE IF NOT EXISTS `depts` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NULL,
    PRIMARY KEY (`id`)
) ENGINE=INNODB;

CREATE TABLE IF NOT EXISTS `emps` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `dept_id` INT NOT NULL,
    `first_name` VARCHAR(85) NULL,
    `last_name` VARCHAR(85) NULL,
    `hired_at` DATETIME NULL DEFAULT NOW(),
    PRIMARY KEY (`id`),
    INDEX (dept_id),
    
    FOREIGN KEY (dept_id)
	    REFERENCES depts(id)
	    
) ENGINE=INNODB;

INSERT INTO depts (name) VALUES 
('HR'),
('Finance'),
('Operation'),
('Admin'),
('IT'),
('Audit') ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO emps (dept_id,first_name,last_name,hired_at) VALUES (5,'larry','loi',NOW()) ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name), hired_at = VALUES(hired_at);


ALTER TABLE emps ADD email varchar(255);