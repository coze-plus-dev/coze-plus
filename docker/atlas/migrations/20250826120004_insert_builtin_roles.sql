-- Insert builtin roles data (optimized version)
-- Generated from: /Users/aedan/workspace/coze-plus/vibe-coding/today/enterprise-permission-database-design.md
-- Note: Super admin has all permissions with is_default=1 in permissions field
-- Space roles include all space permissions, with is_default differentiated by role

-- 1. Insert super admin role (ID=1) - all global permissions is_default=1
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT 
  1 as id,
  'super_admin' as role_code,
  '超级管理员' as role_name,
  'global' as role_domain,
  1 as super_admin,
  NULL as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON with all permissions is_default=1
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
                  'is_default', 1,  -- Super admin: all permissions is_default=1
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

-- 2. Insert space owner role (ID=2) - all space permissions is_default=1
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT 
  2 as id,
  'space_owner' as role_code,
  '空间所有者' as role_name,
  'space' as role_domain,
  0 as super_admin,
  1 as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON with all permissions is_default=1
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
                  'is_default', 1,  -- Space owner: all permissions is_default=1
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

-- 3. Insert space admin role (ID=3) - all space permissions included, but some is_default=0
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT 
  3 as id,
  'space_admin' as role_code,
  '空间管理员' as role_name,
  'space' as role_domain,
  0 as super_admin,
  2 as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON with selective is_default
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
                    WHEN pt2.action IN ('delete_transfer', 'delete') THEN 0  -- Space admin cannot delete space or resources
                    ELSE 1
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
  '空间管理员，可管理成员、编辑内容，但不能删除空间或资源' as description,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at;

-- 4. Insert space member role (ID=4) - all space permissions included, only basic permissions is_default=1
INSERT INTO `role` (`id`, `role_code`, `role_name`, `role_domain`, `super_admin`, `space_role_type`, `is_builtin`, `permissions`, `description`, `created_by`, `created_at`, `updated_at`)
SELECT 
  4 as id,
  'space_member' as role_code,
  '空间成员' as role_name,
  'space' as role_domain,
  0 as super_admin,
  3 as space_role_type,
  1 as is_builtin,
  -- Generate list<PermissionTemplateGroup> format JSON with only basic permissions is_default=1
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
                    WHEN pt2.action IN ('leave', 'create_view_copy', 'import') THEN 1  -- Basic permissions for members
                    ELSE 0
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
  '空间普通成员，可创建、查看资源和离开空间，权限有限' as description,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at;