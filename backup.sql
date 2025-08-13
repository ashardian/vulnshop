-- backup.sql
-- VulnShop DB backup (sample)
CREATE TABLE users(id INT, email TEXT, password TEXT, created_at TEXT);
INSERT INTO users VALUES(1,'alice@example.com','$2y$10$hash','2024-10-21 10:12:04');
INSERT INTO users VALUES(2,'bob@example.com','$2y$10$hash','2024-10-22 14:45:17');
