-- Remove corp_id from corporation_employee table to support true multi-organization employment
-- First drop indexes that include corp_id
ALTER TABLE `opencoze`.`corporation_employee` 
DROP INDEX `idx_corp_id`,
DROP INDEX `idx_corp_status`,
DROP INDEX `uk_corp_employee_no`,
DROP INDEX `uk_corp_mobile`, 
DROP INDEX `uk_corp_email`,
DROP INDEX `uk_out_emp_source_corp`;

-- Drop the corp_id column
ALTER TABLE `opencoze`.`corporation_employee`
DROP COLUMN `corp_id`;

-- Re-create unique indexes without corp_id
ALTER TABLE `opencoze`.`corporation_employee`
ADD UNIQUE INDEX `uk_employee_no` (`employee_no`),
ADD UNIQUE INDEX `uk_mobile` (`mobile`),
ADD UNIQUE INDEX `uk_email` (`email`),
ADD UNIQUE INDEX `uk_out_emp_source` (`out_employee_id`, `employee_source`);