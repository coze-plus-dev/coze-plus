-- Update deleted_at fields to datetime(3) type
-- Migration: 20250828121000_update_deleted_at_to_datetime

-- Update corporation table
ALTER TABLE `opencoze`.`corporation` 
MODIFY COLUMN `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp";

-- Update corporation_department table  
ALTER TABLE `opencoze`.`corporation_department`
MODIFY COLUMN `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp";

-- Update corporation_employee table
ALTER TABLE `opencoze`.`corporation_employee`
MODIFY COLUMN `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp";

-- Update corporation_employee_department table
ALTER TABLE `opencoze`.`corporation_employee_department`
MODIFY COLUMN `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp";