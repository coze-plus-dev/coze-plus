-- Create Super Admin User and Default Personal Space
-- This migration initializes the system with a super admin user
-- Email: administrator@coze-plus.cn
-- Password: coze-plus123456 (will be properly hashed)
-- Note: The actual password hash must be generated using the project's password hashing mechanism

-- Step 1: Create Super Admin User (with placeholder password - will be updated after migration)
INSERT INTO `opencoze`.`user` (
  `id`,
  `name`,
  `unique_name`,
  `email`,
  `password`,
  `description`,
  `icon_uri`,
  `user_verified`,
  `locale`,
  `is_disabled`,
  `created_by`,
  `created_at`,
  `updated_at`
)
SELECT
  1 as id,
  '超级管理员' as name,
  'Administrator' as unique_name,
  'administrator@coze-plus.cn' as email,
  '$argon2id$v=19$m=65536,t=3,p=4$4VgdFFA0A1yfSdK/iZEiRQ$GQG5+aEz4zYnhZ7SByTiEZOMrZl/dXSra5psuQPAoYs' as password,
  '系统超级管理员，拥有完整的系统管理权限' as description,
  'default_icon/user_default_icon.png' as icon_uri,
  1 as user_verified,
  'zh-CN' as locale,
  0 as is_disabled,
  1 as created_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM `opencoze`.`user` WHERE `email` = 'administrator@coze-plus.cn'
);

-- Step 2: Assign Super Admin Role
INSERT INTO `opencoze`.`user_role` (
  `user_id`,
  `role_id`,
  `assigned_by`,
  `assigned_at`
)
SELECT
  1 as user_id,
  1 as role_id,  -- Super Admin role (already exists from 20250901130000_update.sql)
  1 as assigned_by,
  UNIX_TIMESTAMP(NOW()) * 1000 as assigned_at
WHERE NOT EXISTS (
  SELECT 1 FROM `opencoze`.`user_role` WHERE `user_id` = 1 AND `role_id` = 1
);

-- Step 3: Create Super Admin's Personal Space
INSERT INTO `opencoze`.`space` (
  `id`,
  `owner_id`,
  `name`,
  `description`,
  `icon_uri`,
  `creator_id`,
  `created_at`,
  `updated_at`
)
SELECT
  1 as id,
  1 as owner_id,
  '管理员工作空间' as name,
  '超级管理员的默认工作空间，用于系统管理和初始配置' as description,
  'default_icon/team_default_icon.png' as icon_uri,
  1 as creator_id,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM `opencoze`.`space` WHERE `id` = 1
);

-- Step 4: Add Super Admin to Personal Space as Owner
INSERT INTO `opencoze`.`space_user` (
  `space_id`,
  `user_id`,
  `role_type`,
  `created_at`,
  `updated_at`
)
SELECT
  1 as space_id,
  1 as user_id,
  1 as role_type,  -- 1 = owner (from space_user.role_type definition)
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM `opencoze`.`space_user` WHERE `space_id` = 1 AND `user_id` = 1
);

-- Step 5: Add Casbin group rule to link super admin user to super admin role
-- Format: ptype='g', v0=user:{user_id}, v1=role_code, v2=domain ('global' for global roles)
INSERT INTO `opencoze`.`casbin_rule` (
  `ptype`,
  `v0`,
  `v1`,
  `v2`,
  `v3`,
  `v4`,
  `v5`,
  `created_at`,
  `updated_at`
)
SELECT
  'g' as ptype,
  'user:1' as v0,  -- user subject format: user:{user_id}
  'super_admin' as v1,  -- role_code = super_admin
  'global' as v2,  -- domain = global (for global roles)
  '' as v3,  -- unused for group rules
  '' as v4,  -- unused for group rules
  '' as v5,  -- unused for group rules
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
WHERE NOT EXISTS (
  SELECT 1 FROM `opencoze`.`casbin_rule`
  WHERE `ptype` = 'g' AND `v0` = 'user:1' AND `v1` = 'super_admin' AND `v2` = 'global'
);
