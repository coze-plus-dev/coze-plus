-- Create "corporation" table
CREATE TABLE `opencoze`.`corporation` (`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Corporation ID", `parent_id` bigint unsigned NULL COMMENT "Parent Corporation ID (NULL for root corporation)", `name` varchar(150) NOT NULL COMMENT "Corporation Name", `corp_type` varchar(50) NOT NULL DEFAULT "company" COMMENT "Corporation Type: group,company,branch", `sort` int NOT NULL DEFAULT 0 COMMENT "Sort Order", `out_corp_id` varchar(100) NULL COMMENT "External Corporation ID", `corp_source` tinyint unsigned NULL COMMENT "Data Source: 1-Enterprise WeChat,2-DingTalk,3-Feishu,4-Manual", `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID", `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds", `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds", `deleted_at` bigint unsigned NULL COMMENT "Delete Time in Milliseconds", PRIMARY KEY (`id`), INDEX `idx_parent_id` (`parent_id`), INDEX `idx_corp_type` (`corp_type`), INDEX `idx_corp_source` (`corp_source`), INDEX `idx_creator_id` (`creator_id`), INDEX `idx_deleted_at` (`deleted_at`), INDEX `idx_sort` (`sort`), UNIQUE INDEX `uk_out_corp_source` (`out_corp_id`, `corp_source`), UNIQUE INDEX `uk_parent_name` (`parent_id`, `name`)) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Corporation Info Table";

-- Create "corporation_department" table
CREATE TABLE `opencoze`.`corporation_department` (`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Department ID", `corp_id` bigint unsigned NOT NULL COMMENT "Corporation ID", `parent_id` bigint unsigned NULL COMMENT "Parent Department ID (NULL for root department)", `name` varchar(150) NOT NULL COMMENT "Department Name", `code` varchar(32) NULL COMMENT "Department Code", `level` int NOT NULL DEFAULT 1 COMMENT "Department Level", `full_path` varchar(500) NULL COMMENT "Department Full Path", `leader_id` bigint unsigned NULL COMMENT "Department Leader ID", `sort` int NOT NULL DEFAULT 0 COMMENT "Sort Order", `status` tinyint NOT NULL DEFAULT 1 COMMENT "Status: 1-Active, 2-Inactive", `out_department_id` varchar(100) NULL COMMENT "External Department ID", `department_source` tinyint unsigned NULL COMMENT "Data Source: 1-Enterprise WeChat,2-DingTalk,3-Feishu,4-Manual", `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID", `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds", `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds", `deleted_at` bigint unsigned NULL COMMENT "Delete Time in Milliseconds", PRIMARY KEY (`id`), UNIQUE INDEX `uk_corp_code` (`corp_id`, `code`), INDEX `idx_corp_id` (`corp_id`), INDEX `idx_parent_id` (`parent_id`), INDEX `idx_level` (`level`), INDEX `idx_leader_id` (`leader_id`), INDEX `idx_status` (`status`), INDEX `idx_department_source` (`department_source`), INDEX `idx_deleted_at` (`deleted_at`), INDEX `idx_corp_parent_level` (`corp_id`, `parent_id`, `level`), INDEX `idx_corp_status` (`corp_id`, `status`), UNIQUE INDEX `uk_out_dept_source` (`out_department_id`, `department_source`, `corp_id`), UNIQUE INDEX `uk_corp_parent_dept_name` (`corp_id`, `parent_id`, `name`)) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Department Info Table";

-- Create "corporation_employee" table
CREATE TABLE `opencoze`.`corporation_employee` (`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Employee ID", `corp_id` bigint unsigned NOT NULL COMMENT "Corporation ID", `employee_no` varchar(32) NULL COMMENT "Employee Number (unique in corporation)", `name` varchar(50) NOT NULL COMMENT "Employee Name", `en_name` varchar(50) NULL COMMENT "English Name", `nickname` varchar(50) NULL COMMENT "Nickname", `avatar` varchar(255) NULL COMMENT "Avatar URL", `email` varchar(100) NULL COMMENT "Email Address", `mobile` varchar(20) NOT NULL COMMENT "Mobile Phone", `status` tinyint NOT NULL DEFAULT 1 COMMENT "Employee Status: 1-Active, 2-Resigned", `out_employee_id` varchar(100) NULL COMMENT "External Employee ID", `employee_source` tinyint unsigned NULL COMMENT "Data Source: 1-Enterprise WeChat,2-DingTalk,3-Feishu,4-Manual", `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID", `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds", `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds", `deleted_at` bigint unsigned NULL COMMENT "Delete Time in Milliseconds", PRIMARY KEY (`id`), INDEX `idx_corp_id` (`corp_id`), INDEX `idx_status` (`status`), INDEX `idx_employee_source` (`employee_source`), INDEX `idx_creator_id` (`creator_id`), INDEX `idx_deleted_at` (`deleted_at`), INDEX `idx_corp_status` (`corp_id`, `status`), UNIQUE INDEX `uk_corp_employee_no` (`corp_id`, `employee_no`), UNIQUE INDEX `uk_corp_mobile` (`corp_id`, `mobile`), UNIQUE INDEX `uk_corp_email` (`corp_id`, `email`), UNIQUE INDEX `uk_out_emp_source_corp` (`out_employee_id`, `employee_source`, `corp_id`)) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Employee Info Table";

-- Create "corporation_employee_department" table
CREATE TABLE `opencoze`.`corporation_employee_department` (`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Relationship ID", `employee_id` bigint unsigned NOT NULL COMMENT "Employee ID", `department_id` bigint unsigned NOT NULL COMMENT "Department ID", `job_title` varchar(100) NULL COMMENT "Job Title", `status` tinyint NOT NULL DEFAULT 1 COMMENT "Status: 1-Active, 2-Transferred", `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID", `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds", `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds", `deleted_at` bigint unsigned NULL COMMENT "Delete Time in Milliseconds", PRIMARY KEY (`id`), INDEX `idx_employee_id` (`employee_id`), INDEX `idx_department_id` (`department_id`), INDEX `idx_status` (`status`), INDEX `idx_creator_id` (`creator_id`), INDEX `idx_deleted_at` (`deleted_at`), INDEX `idx_dept_status` (`department_id`, `status`), UNIQUE INDEX `uk_employee_department` (`employee_id`, `department_id`)) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Employee Department Relationship Table";

-- Add corp_id and is_primary columns to corporation_employee_department table
ALTER TABLE `opencoze`.`corporation_employee_department`
ADD COLUMN `corp_id` bigint unsigned NOT NULL COMMENT 'Corporation ID (departments corporation)' AFTER `department_id`,
ADD COLUMN `is_primary` tinyint NOT NULL DEFAULT 0 COMMENT 'Is Primary Department: 0-No, 1-Yes' AFTER `job_title`;

ALTER TABLE `opencoze`.`corporation_employee_department`
ADD INDEX `idx_corp_id` (`corp_id`),
ADD INDEX `idx_is_primary` (`is_primary`),
ADD INDEX `idx_employee_corp` (`employee_id`, `corp_id`);

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
