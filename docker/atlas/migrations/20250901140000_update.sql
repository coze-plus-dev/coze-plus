-- Add user management fields to user table
-- This migration adds:
-- - is_disabled: user status field (0-enabled, 1-disabled)
-- - created_by: creator user ID
-- - deleted_by: deleter user ID

ALTER TABLE `opencoze`.`user` 
ADD COLUMN `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT 'User status: 0-enabled, 1-disabled' AFTER `user_verified`,
ADD COLUMN `created_by` bigint unsigned NULL COMMENT 'Creator user ID' AFTER `locale`,
ADD COLUMN `deleted_by` bigint unsigned NULL COMMENT 'Deleter user ID' AFTER `deleted_at`;

-- Add indexes for the new fields
ALTER TABLE `opencoze`.`user`
ADD INDEX `idx_is_disabled` (`is_disabled`),
ADD INDEX `idx_created_by` (`created_by`),
ADD INDEX `idx_deleted_by` (`deleted_by`);