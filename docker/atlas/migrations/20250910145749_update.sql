-- Modify "opencoze" schema
ALTER DATABASE `opencoze` COLLATE utf8mb4_0900_ai_ci;
-- Modify "casbin_rule" table
ALTER TABLE `opencoze`.`casbin_rule` MODIFY COLUMN `ptype` varchar(100) NULL, MODIFY COLUMN `v0` varchar(100) NULL, MODIFY COLUMN `v1` varchar(100) NULL, MODIFY COLUMN `v2` varchar(100) NULL, MODIFY COLUMN `v3` varchar(100) NULL, MODIFY COLUMN `v4` varchar(100) NULL, MODIFY COLUMN `v5` varchar(100) NULL, ADD UNIQUE INDEX `idx_casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `v5`);
