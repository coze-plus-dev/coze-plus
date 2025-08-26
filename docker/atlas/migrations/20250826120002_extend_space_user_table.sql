-- Extend existing space_user table for permission system compatibility
-- Generated from: /Users/aedan/workspace/coze-plus/vibe-coding/today/enterprise-permission-database-design.md

-- Add new columns to space_user table for role system integration
ALTER TABLE `space_user` 
ADD COLUMN `role_id` bigint unsigned NULL COMMENT 'Custom role ID (NULL means use role_type)' AFTER `role_type`,
ADD COLUMN `expired_at` bigint unsigned NULL COMMENT 'Permission expiration time (NULL means permanent)' AFTER `updated_at`,
ADD INDEX `idx_role_id` (`role_id`);