-- Step 1: Create Permission System Tables

-- Create role table
CREATE TABLE `role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Role ID",
  `role_code` varchar(50) NOT NULL COMMENT "Role code",
  `role_name` varchar(100) NOT NULL COMMENT "Role name",
  `role_domain` varchar(50) NOT NULL DEFAULT 'global' COMMENT "Permission domain: global-Global permissions, space-Space permissions",
  `super_admin` tinyint NOT NULL DEFAULT 0 COMMENT "Is super admin: 0-No, 1-Yes",
  `space_role_type` tinyint NULL COMMENT "Space role type: 1-owner, 2-admin, 3-member (only valid when role_domain=space)",
  `is_builtin` tinyint NOT NULL DEFAULT 0 COMMENT "Is builtin role: 0-No, 1-Yes",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled: 0-Enabled, 1-Disabled",
  `permissions` json COMMENT "Permission matrix JSON configuration",
  `description` text COMMENT "Role description",
  `created_by` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) NULL COMMENT "Soft delete timestamp (NULL means not deleted)",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_role_code` (`role_code`),
  INDEX `idx_role_domain` (`role_domain`),
  INDEX `idx_super_admin` (`super_admin`),
  INDEX `idx_space_role_type` (`space_role_type`),
  INDEX `idx_is_builtin` (`is_builtin`),
  INDEX `idx_is_disabled` (`is_disabled`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT="Role definition table";

-- Create user_role table
CREATE TABLE `user_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT "User ID",
  `role_id` bigint unsigned NOT NULL COMMENT "Role ID",
  `space_id` bigint unsigned COMMENT "Permission scope - Space ID (NULL means global)",
  `assigned_by` bigint unsigned NOT NULL COMMENT "Assigner ID",
  `assigned_at` bigint unsigned NOT NULL COMMENT "Assignment time",
  `expired_at` bigint unsigned NULL COMMENT "Expiration time (NULL means permanent)",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled: 0-Enabled, 1-Disabled",
  `deleted_at` datetime(3) NULL COMMENT "Soft delete timestamp (NULL means not deleted)",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_user_role_space` (`user_id`, `role_id`, `space_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_space_id` (`space_id`),
  INDEX `idx_expired_at` (`expired_at`),
  INDEX `idx_is_disabled` (`is_disabled`),
  INDEX `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT="User role relationship table";

-- Create casbin_rule table
CREATE TABLE `casbin_rule` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ptype` varchar(100) NOT NULL COMMENT "Policy type: p(policy), g(user role)",
  `v0` varchar(100) NOT NULL COMMENT "User ID/Role",
  `v1` varchar(100) NOT NULL COMMENT "Resource domain",
  `v2` varchar(100) NOT NULL COMMENT "Resource type",
  `v3` varchar(100) NULL COMMENT "Action",
  `v4` varchar(100) NULL COMMENT "Effect",
  `v5` varchar(100) NULL COMMENT "Extension field",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_ptype_v0_v1` (`ptype`, `v0`, `v1`),
  UNIQUE INDEX `uniq_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT="Casbin permission policy table";

-- Create permission_template table
CREATE TABLE `permission_template` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Template ID",
  `template_code` varchar(50) NOT NULL COMMENT "Template code",
  `template_name` varchar(100) NOT NULL COMMENT "Template name",
  `domain` varchar(50) NOT NULL COMMENT "Permission domain: global-Global permissions, space-Space permissions",
  `resource` varchar(50) NOT NULL COMMENT "Resource type: agent, workflow, knowledge etc",
  `resource_name` varchar(100) NOT NULL COMMENT "Resource Chinese name",
  `action` varchar(50) NOT NULL COMMENT "Action type: create, read, update, delete etc",
  `action_name` varchar(100) NOT NULL COMMENT "Action Chinese name",
  `description` text COMMENT "Permission description",
  `is_default` tinyint NOT NULL DEFAULT 0 COMMENT "Is default enabled: 0-No, 1-Yes",
  `sort_order` int NOT NULL DEFAULT 0 COMMENT "Sort weight",
  `is_active` tinyint NOT NULL DEFAULT 1 COMMENT "Is active: 0-Disabled, 1-Enabled",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation time",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update time",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_template_domain_resource_action` (`template_code`, `domain`, `resource`, `action`),
  INDEX `idx_template_code` (`template_code`),
  INDEX `idx_domain` (`domain`),
  INDEX `idx_resource` (`resource`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_sort_order` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT="Permission template table";

-- Step 2: Extend existing space_user table for compatibility
ALTER TABLE `space_user`
ADD COLUMN `role_id` bigint unsigned NULL COMMENT 'Custom role ID (NULL uses role_type)' AFTER `role_type`,
ADD COLUMN `expired_at` bigint unsigned NULL COMMENT 'Permission expiration time (NULL means permanent)' AFTER `updated_at`,
ADD INDEX `idx_role_id` (`role_id`);

-- Step 3: Add user_id field to corporation_employee table
ALTER TABLE `opencoze`.`corporation_employee`
ADD COLUMN `user_id` bigint unsigned NULL COMMENT "Associated User ID (NULL if no user account)" AFTER `mobile`;

ALTER TABLE `opencoze`.`corporation_employee`
ADD INDEX `idx_user_id` (`user_id`);

ALTER TABLE `opencoze`.`corporation_employee`
ADD UNIQUE INDEX `uk_user_id` (`user_id`);

-- Step 4: Initialize global permission domain template
INSERT INTO `permission_template` (`template_code`, `template_name`, `domain`, `resource`, `resource_name`, `action`, `action_name`, `description`, `is_default`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES

-- 1. 组织管理权限 (Organization Management)
('ORG_CREATE', '创建组织', 'global', 'organization', '组织管理', 'create', '创建组织', '可以创建新的组织架构', 0, 100, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ORG_EDIT', '编辑组织', 'global', 'organization', '组织管理', 'edit', '编辑组织', '编辑组织基本信息', 0, 101, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ORG_DELETE', '删除组织', 'global', 'organization', '组织管理', 'delete', '删除组织', '删除不需要的组织单位', 0, 102, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 2. 部门管理权限 (Department Management)
('DEPT_CREATE', '添加部门', 'global', 'department', '部门管理', 'create', '添加部门', '在组织架构中创建新的部门，设置部门层级关系和基本信息', 0, 110, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('DEPT_EDIT', '编辑部门', 'global', 'department', '部门管理', 'edit', '编辑部门', '修改部门信息、调整部门层级、删除空部门或不需要的部门', 0, 111, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('DEPT_DELETE', '删除部门', 'global', 'department', '部门管理', 'delete', '删除部门', '删除空部门或不需要的部门', 0, 112, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 3. 人员管理权限 (Employee Management)
('EMP_INVITE', '添加人员', 'global', 'employee', '人员管理', 'create', '添加人员', '添加新成员入组织，设置成员的基本信息和所属部门', 0, 120, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_EDIT', '编辑人员', 'global', 'employee', '人员管理', 'edit', '修改人员基本信息', '修改人员基本信息', 0, 121, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_MANAGE_POS', '操作离职', 'global', 'employee', '人员管理', 'manage_quit', '操作离职', '处理员工离职，包括账号禁用、权限回收', 0, 122, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_CHANGE_DEPT', '变更人员部门', 'global', 'employee', '人员管理', 'change_department', '变更人员部门', '调整组织成员的部门归属，处理人员调动和组织架构变更', 0, 123, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_VIEW', '查看组织人员', 'global', 'employee', '人员管理', 'view', '查看组织人员', '查看组织内所有成员的基本信息、部门归属和联系方式', 0, 124, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 4. 用户管理权限 (User Management)
('USER_DISABLE_ENABLE', '启用/禁用用户', 'global', 'user', '用户管理', 'disable_enable', '启用/禁用用户', '控制用户账号的启用和禁用状态', 0, 200, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_RESET_PWD', '重置密码', 'global', 'user', '用户管理', 'reset_password', '重置密码', '为用户重置登录密码', 0, 201, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_ROLE_ASSIGN', '分配用户角色', 'global', 'user', '用户管理', 'assign', '分配用户角色', '分配和调整用户的角色，如管理员、成员等级别权限', 0, 202, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_ROLE_UNBIND', '解绑用户角色', 'global', 'user', '用户管理', 'unbind', '解绑用户角色', '移除用户的特定角色绑定关系，回收对应权限', 0, 203, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 5. 角色管理权限 (Role Management)
('ROLE_VIEW', '查看角色', 'global', 'role', '角色管理', 'view', '查看角色', '查看系统中的所有角色定义', 0, 300, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_CREATE', '创建角色', 'global', 'role', '角色管理', 'create', '创建角色', '创建新的自定义角色', 0, 301, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_EDIT', '编辑角色', 'global', 'role', '角色管理', 'edit', '编辑角色', '修改角色信息和权限配置', 0, 302, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_DELETE', '删除角色', 'global', 'role', '角色管理', 'delete', '删除角色', '删除自定义角色', 0, 303, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 6. 工作空间管理权限 (Workspace Management)
('WS_CREATE', '新建工作空间', 'global', 'workspace', '工作空间管理', 'create', '新建工作空间', '创建新的工作空间，设置空间访问权限和协作范围', 0, 400, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000);

-- Initialize space permission domain template
INSERT INTO `permission_template` (`template_code`, `template_name`, `domain`, `resource`, `resource_name`, `action`, `action_name`, `description`, `is_default`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES

-- 1. 管理空间权限 (Space Management)
('SPACE_INVITE_MEMBER', '添加成员', 'space', 'member', '成员管理', 'invite', '添加成员', '将用户添加到空间中', 0, 100, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_REMOVE_MEMBER', '移除成员', 'space', 'member', '成员管理', 'remove', '移除成员', '从空间中移除某个用户', 0, 101, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_ADJUST_ROLE', '调整角色', 'space', 'member', '成员管理', 'adjust_role', '调整角色', '控制为空间中的用户设置空间角色，可以设置为成员或管理员', 0, 102, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_DELETE_SPACE', '删除空间、修改空间名称、转让空间所有权', 'space', 'config', '空间配置', 'delete_transfer', '删除空间、修改空间名称、转让空间所有权', '空间一旦删除无法恢复，空间内的所有资源和数据也会同步删除', 0, 110, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_LEAVE', '离开空间', 'space', 'config', '空间配置', 'leave', '离开空间', '普通成员和管理员可以随时离开空间，所有者转移空间所有权后才能离开空间。离开空间后，用户创建的资源会转移给空间所有者，这些资源的协作者权限不会变', 1, 111, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 2. 管理资源权限 (Resource Management)
('SPACE_CREATE_RESOURCE', '创建、查看、复制', 'space', 'resource', '管理资源', 'create_view_copy', '创建、查看、复制', '在空间中创建、查看、复制智能体等资源', 1, 200, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_EDIT_PUBLISH', '修改、发布', 'space', 'resource', '管理资源', 'edit_publish', '修改、发布', '默认仅资源的所有者可修改、发布资源。创建者也可以将其他成员设置为智能体或工作流的协作者，协作者可以协同编辑、发布智能体或工作流。其他资源仅资源所有者或管理员可以修改、发布资源', 0, 201, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_IMPORT_EXPORT', '导入', 'space', 'workflow', '工作流', 'import', '导入', '目前仅工作流支持导入功能', 1, 210, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_EXPORT', '导出', 'space', 'workflow', '工作流', 'export', '导出', '目前仅工作流支持导出功能。工作流的所有者、空间所有者或管理员可以导出工作流。空间成员不可导出其他成员拥有的工作流', 0, 211, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('SPACE_DELETE_RESOURCE', '删除资源', 'space', 'resource', '管理资源', 'delete', '删除资源', '空间成员不可删除其他成员拥有的资源', 0, 220, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000);

-- Step 5: Initialize builtin roles with list<PermissionTemplateGroup> structure
-- 1. Super Admin Role (has all global permissions)
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT
  1 as id,
  'super_admin' as role_code,
  '超级管理员' as role_name,
  'global' as role_domain,
  1 as super_admin,
  NULL as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON - Super Admin has all permissions enabled (is_default=1)
  JSON_ARRAY(
    JSON_OBJECT(
      'domain', 'global',
      'domain_name', '全局权限域',
      'resources', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'resource', resource_group.resource,
            'resource_name', resource_group.resource_name,
            'actions', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', CAST(pt2.id AS CHAR),
                  'template_code', pt2.template_code,
                  'template_name', pt2.template_name,
                  'domain', pt2.domain,
                  'resource', pt2.resource,
                  'resource_name', pt2.resource_name,
                  'action', pt2.action,
                  'action_name', pt2.action_name,
                  'description', pt2.description,
                  'is_default', 1,  -- Super Admin: all permissions enabled
                  'sort_order', pt2.sort_order,
                  'is_active', pt2.is_active
                )
              )
              FROM permission_template pt2
              WHERE pt2.domain = 'global'
                AND pt2.resource = resource_group.resource
                AND pt2.is_active = 1
              ORDER BY pt2.sort_order
            )
          )
        )
        FROM (
          SELECT DISTINCT resource,
                 FIRST_VALUE(resource_name) OVER (PARTITION BY resource ORDER BY sort_order) as resource_name
          FROM permission_template
          WHERE domain = 'global' AND is_active = 1
        ) as resource_group
        ORDER BY resource_group.resource
      )
    )
  ) as permissions,
  '系统超级管理员，拥有完整的功能级权限，可管理组织、权限、工作空间和系统配置' as description,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at;

-- 2. Space Owner Role (ID=2, corresponds to space_user.role_type=1)
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT
  2 as id,
  'space_owner' as role_code,
  '空间所有者' as role_name,
  'space' as role_domain,
  0 as super_admin,
  1 as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON - Space Owner has all space permissions enabled (is_default=1)
  JSON_ARRAY(
    JSON_OBJECT(
      'domain', 'space',
      'domain_name', '工作空间',
      'resources', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'resource', resource_group.resource,
            'resource_name', resource_group.resource_name,
            'actions', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', CAST(pt2.id AS CHAR),
                  'template_code', pt2.template_code,
                  'template_name', pt2.template_name,
                  'domain', pt2.domain,
                  'resource', pt2.resource,
                  'resource_name', pt2.resource_name,
                  'action', pt2.action,
                  'action_name', pt2.action_name,
                  'description', pt2.description,
                  'is_default', 1,  -- Space Owner: all space permissions enabled
                  'sort_order', pt2.sort_order,
                  'is_active', pt2.is_active
                )
              )
              FROM permission_template pt2
              WHERE pt2.domain = 'space'
                AND pt2.resource = resource_group.resource
                AND pt2.is_active = 1
              ORDER BY pt2.sort_order
            )
          )
        )
        FROM (
          SELECT DISTINCT resource,
                 FIRST_VALUE(resource_name) OVER (PARTITION BY resource ORDER BY sort_order) as resource_name
          FROM permission_template
          WHERE domain = 'space' AND is_active = 1
        ) as resource_group
        ORDER BY resource_group.resource
      )
    )
  ) as permissions,
  '空间所有者，拥有空间完全控制权，包括成员管理、空间配置、内容协作等所有权限' as description,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at;

-- 3. Space Admin Role (ID=3, corresponds to space_user.role_type=2)
-- Note: Space Admin includes all space permissions but some are disabled (is_default=0)
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT
  3 as id,
  'space_admin' as role_code,
  '空间管理员' as role_name,
  'space' as role_domain,
  0 as super_admin,
  2 as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON - Space Admin: include all permissions but set is_default based on access rights
  JSON_ARRAY(
    JSON_OBJECT(
      'domain', 'space',
      'domain_name', '工作空间',
      'resources', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'resource', resource_group.resource,
            'resource_name', resource_group.resource_name,
            'actions', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', CAST(pt2.id AS CHAR),
                  'template_code', pt2.template_code,
                  'template_name', pt2.template_name,
                  'domain', pt2.domain,
                  'resource', pt2.resource,
                  'resource_name', pt2.resource_name,
                  'action', pt2.action,
                  'action_name', pt2.action_name,
                  'description', pt2.description,
                  'is_default', CASE
                    WHEN pt2.action IN ('delete_transfer', 'delete') THEN 0  -- Space Admin: disable delete/delete_transfer permissions
                    ELSE 1  -- Space Admin: enable other permissions
                  END,
                  'sort_order', pt2.sort_order,
                  'is_active', pt2.is_active
                )
              )
              FROM permission_template pt2
              WHERE pt2.domain = 'space'
                AND pt2.resource = resource_group.resource
                AND pt2.is_active = 1
              ORDER BY pt2.sort_order
            )
          )
        )
        FROM (
          SELECT DISTINCT resource,
                 FIRST_VALUE(resource_name) OVER (PARTITION BY resource ORDER BY sort_order) as resource_name
          FROM permission_template
          WHERE domain = 'space' AND is_active = 1
        ) as resource_group
        ORDER BY resource_group.resource
      )
    )
  ) as permissions,
  '空间管理员，可管理成员、编辑内容，但不能管理空间配置' as description,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at;

-- 4. Space Member Role (ID=4, corresponds to space_user.role_type=3)
-- Note: Space Member includes all space permissions but only basic ones are enabled (is_default matches original template)
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT
  4 as id,
  'space_member' as role_code,
  '空间成员' as role_name,
  'space' as role_domain,
  0 as super_admin,
  3 as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON - Space Member: include all permissions, use original is_default values
  JSON_ARRAY(
    JSON_OBJECT(
      'domain', 'space',
      'domain_name', '工作空间',
      'resources', (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'resource', resource_group.resource,
            'resource_name', resource_group.resource_name,
            'actions', (
              SELECT JSON_ARRAYAGG(
                JSON_OBJECT(
                  'id', CAST(pt2.id AS CHAR),
                  'template_code', pt2.template_code,
                  'template_name', pt2.template_name,
                  'domain', pt2.domain,
                  'resource', pt2.resource,
                  'resource_name', pt2.resource_name,
                  'action', pt2.action,
                  'action_name', pt2.action_name,
                  'description', pt2.description,
                  'is_default', pt2.is_default,  -- Space Member: use original template is_default values
                  'sort_order', pt2.sort_order,
                  'is_active', pt2.is_active
                )
              )
              FROM permission_template pt2
              WHERE pt2.domain = 'space'
                AND pt2.resource = resource_group.resource
                AND pt2.is_active = 1
              ORDER BY pt2.sort_order
            )
          )
        )
        FROM (
          SELECT DISTINCT resource,
                 FIRST_VALUE(resource_name) OVER (PARTITION BY resource ORDER BY sort_order) as resource_name
          FROM permission_template
          WHERE domain = 'space' AND is_active = 1
        ) as resource_group
        ORDER BY resource_group.resource
      )
    )
  ) as permissions,
  '空间普通成员，可创建、查看资源和离开空间，权限固定' as description,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at;

-- Step 6: Initialize Casbin policy rules for all builtin roles based on permission templates
-- 1. Generate Super Admin policies (all global permissions)
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`)
SELECT
  'p' as ptype,
  'super_admin' as v0,
  pt.domain as v1,
  pt.resource as v2,
  pt.action as v3,
  'allow' as v4,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
FROM permission_template pt
WHERE pt.domain = 'global' AND pt.is_active = 1;

-- 2. Generate Space Owner policies (all space permissions)
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`)
SELECT
  'p' as ptype,
  'space_owner' as v0,
  pt.domain as v1,
  pt.resource as v2,
  pt.action as v3,
  'allow' as v4,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
FROM permission_template pt
WHERE pt.domain = 'space' AND pt.is_active = 1;

-- 3. Generate Space Admin policies (deny delete_transfer and delete actions, allow others)
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`)
SELECT
  'p' as ptype,
  'space_admin' as v0,
  pt.domain as v1,
  pt.resource as v2,
  pt.action as v3,
  CASE
    WHEN pt.action IN ('delete_transfer', 'delete') THEN 'deny'  -- Space Admin: deny delete operations
    ELSE 'allow'  -- Space Admin: allow other operations
  END as v4,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
FROM permission_template pt
WHERE pt.domain = 'space' AND pt.is_active = 1;

-- 4. Generate Space Member policies (allow if original template is_default=1, deny others)
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`)
SELECT
  'p' as ptype,
  'space_member' as v0,
  pt.domain as v1,
  pt.resource as v2,
  pt.action as v3,
  CASE
    WHEN pt.is_default = 1 THEN 'allow'  -- Space Member: allow only basic permissions
    ELSE 'deny'  -- Space Member: deny advanced permissions
  END as v4,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
FROM permission_template pt
WHERE pt.domain = 'space' AND pt.is_active = 1;
