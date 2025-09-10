-- Add corp_id and is_primary columns to corporation_employee_department table
ALTER TABLE `opencoze`.`corporation_employee_department` 
ADD COLUMN `corp_id` bigint unsigned NOT NULL COMMENT 'Corporation ID (department\'s corporation)' AFTER `department_id`,
ADD COLUMN `is_primary` tinyint NOT NULL DEFAULT 0 COMMENT 'Is Primary Department: 0-No, 1-Yes' AFTER `job_title`;

-- Add indexes for the new columns
ALTER TABLE `opencoze`.`corporation_employee_department`
ADD INDEX `idx_corp_id` (`corp_id`),
ADD INDEX `idx_is_primary` (`is_primary`),
ADD INDEX `idx_employee_corp` (`employee_id`, `corp_id`);