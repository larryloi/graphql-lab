CREATE DATABASE IF NOT EXISTS demonslayer
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;
USE demonslayer;

CREATE TABLE IF NOT EXISTS `slayers` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NULL,
    `breathing_style` VARCHAR(85) NULL,
    `age` INT NULL,
    PRIMARY KEY (`id`)
 ) ENGINE=INNODB
     DEFAULT CHARSET=utf8mb4
     COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `demons` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(85) NULL,
    `level` INT NULL,
    `age` INT NULL,
    PRIMARY KEY (`id`)
 ) ENGINE=INNODB
     DEFAULT CHARSET=utf8mb4
     COLLATE=utf8mb4_unicode_ci;

INSERT INTO slayers (name, breathing_style, age) VALUES 
('富岡義勇', 'Water Breathing', 23),
('我妻善逸', 'Thunder Breathing', 16),
('嘴平伊之助', 'Beast Breathing', 15),
('竈門炭治郎', 'Sun Breathing', 15),
('竈門禰豆子', 'Demon', 14),
('悲鳴嶼行冥', 'Stone Breathing', 27),
('不死川実弥', 'Wind Breathing', 25),
('煉獄杏壽郎', 'Flame Breathing', 26),
('胡蝶しのぶ', 'Insect Breathing', 22),
('宇髄天元', 'Sound Breathing', 28),
('甘露寺蜜璃', 'Love Breathing', 24),
('時透無一郎', 'Mist Breathing', 14),
('伊黒小芭内', 'Serpent Breathing', 21) 
ON DUPLICATE KEY UPDATE name = VALUES(name), breathing_style = VALUES(breathing_style), age = VALUES(age);


INSERT INTO demons (name, level, age) VALUES ('鬼舞辻無惨', 100, 1000),
('猗窩座', 80, 200),
('堕姫', 70, 100),
('妓夫太郎', 70, 100),
('煉獄杏壽郎', 60, 150),
('累', 75, 30),
('響凱', 65, 120),
('手鬼', 50, 300),
('黒死牟', 90, 500),
('童磨', 85, 400),
('玉壺', 60, 250),
('猿嶋', 55, 220),
('鳴女', 45, 180),
('矢琶羽', 50, 200),
('朱紗丸', 50, 200) 
ON DUPLICATE KEY UPDATE name = VALUES(name), level = VALUES(level), age = VALUES(age);