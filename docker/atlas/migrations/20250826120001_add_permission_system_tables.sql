-- Add permission system tables
-- Generated from: /Users/aedan/workspace/coze-plus/vibe-coding/today/enterprise-permission-database-design.md

-- Create role table - 角色定义表
CREATE TABLE `role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Role ID",
  `role_code` varchar(50) NOT NULL COMMENT "Role code",
  `role_name` varchar(100) NOT NULL COMMENT "Role name", 
  `role_domain` varchar(50) NOT NULL DEFAULT 'global' COMMENT "Permission domain: global-global permissions, space-space permissions",
  `super_admin` tinyint NOT NULL DEFAULT 0 COMMENT "Is super admin: 0-no, 1-yes",
  `space_role_type` tinyint NULL COMMENT "Space role type: 1-owner, 2-admin, 3-member (only valid when role_domain=space)",
  `is_builtin` tinyint NOT NULL DEFAULT 0 COMMENT "Is builtin role: 0-no, 1-yes",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled: 0-enabled, 1-disabled", 
  `permissions` json COMMENT "Permission matrix JSON configuration",
  `description` text COMMENT "Role description",
  `created_by` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) NULL COMMENT "Soft delete time (NULL means not deleted)",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_role_code` (`role_code`),
  INDEX `idx_role_domain` (`role_domain`),
  INDEX `idx_super_admin` (`super_admin`),
  INDEX `idx_space_role_type` (`space_role_type`),
  INDEX `idx_is_builtin` (`is_builtin`),
  INDEX `idx_is_disabled` (`is_disabled`),
  INDEX `idx_deleted_at` (`deleted_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Role definition table";

-- Create user_role table - 用户角色关系表
CREATE TABLE `user_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT "User ID",
  `role_id` bigint unsigned NOT NULL COMMENT "Role ID",
  `space_id` bigint unsigned COMMENT "Permission scope - Space ID (NULL means global)",
  `assigned_by` bigint unsigned NOT NULL COMMENT "Assigned by user ID",
  `assigned_at` bigint unsigned NOT NULL COMMENT "Assignment time",
  `expired_at` bigint unsigned NULL COMMENT "Expiration time (NULL means permanent)",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled: 0-enabled, 1-disabled",
  `deleted_at` datetime(3) NULL COMMENT "Soft delete time (NULL means not deleted)",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_user_role_space` (`user_id`, `role_id`, `space_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_space_id` (`space_id`),
  INDEX `idx_expired_at` (`expired_at`),
  INDEX `idx_is_disabled` (`is_disabled`),
  INDEX `idx_deleted_at` (`deleted_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "User role relationship table";

-- Create casbin_rule table - Casbin策略表
CREATE TABLE `casbin_rule` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ptype` varchar(100) NOT NULL COMMENT "Policy type: p(policy), g(user role)",
  `v0` varchar(100) NOT NULL COMMENT "User ID/Role",
  `v1` varchar(100) NOT NULL COMMENT "Resource domain",
  `v2` varchar(100) NOT NULL COMMENT "Resource type", 
  `v3` varchar(100) NULL COMMENT "Action",
  `v4` varchar(100) NULL COMMENT "Effect",
  `v5` varchar(100) NULL COMMENT "Extended field",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_ptype_v0_v1` (`ptype`, `v0`, `v1`),
  UNIQUE INDEX `uniq_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Casbin permission policy table";

-- Create permission_template table - 权限模板表
CREATE TABLE `permission_template` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Template ID",
  `template_code` varchar(50) NOT NULL COMMENT "Template code",
  `template_name` varchar(100) NOT NULL COMMENT "Template name",
  `domain` varchar(50) NOT NULL COMMENT "Permission domain: global-global permissions, space-space permissions",
  `resource` varchar(50) NOT NULL COMMENT "Resource type: agent, workflow, knowledge, etc",
  `resource_name` varchar(100) NOT NULL COMMENT "Resource display name",
  `action` varchar(50) NOT NULL COMMENT "Action type: create, read, update, delete, etc", 
  `action_name` varchar(100) NOT NULL COMMENT "Action display name",
  `description` text COMMENT "Permission description",
  `is_default` tinyint NOT NULL DEFAULT 0 COMMENT "Is default enabled: 0-no, 1-yes",
  `sort_order` int NOT NULL DEFAULT 0 COMMENT "Sort order",
  `is_active` tinyint NOT NULL DEFAULT 1 COMMENT "Is active: 0-disabled, 1-enabled",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Created time",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Updated time",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_template_domain_resource_action` (`template_code`, `domain`, `resource`, `action`),
  INDEX `idx_template_code` (`template_code`),
  INDEX `idx_domain` (`domain`),
  INDEX `idx_resource` (`resource`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Permission template table";