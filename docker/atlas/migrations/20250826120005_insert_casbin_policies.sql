-- Insert casbin rule policies data
-- Generated from: /Users/aedan/workspace/coze-plus/vibe-coding/today/enterprise-permission-database-design.md
-- Note: Policies are generated based on role permissions, not permission template is_default values

-- 1. Generate super admin policies from permission templates (all permissions allowed)
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

-- 2. Generate space owner policies from permission templates  
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

-- 3. Generate space admin policies from permission templates (exclude sensitive operations)
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`)
SELECT 
  'p' as ptype,
  'space_admin' as v0,
  pt.domain as v1,
  pt.resource as v2,
  pt.action as v3,
  CASE 
    WHEN pt.action IN ('delete_transfer', 'delete') AND pt.resource IN ('config', 'resource') THEN 'deny'
    ELSE 'allow'
  END as v4,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
FROM permission_template pt
WHERE pt.domain = 'space' AND pt.is_active = 1;

-- 4. Generate space member policies from permission templates (only basic permissions allowed)
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`)
SELECT 
  'p' as ptype,
  'space_member' as v0,
  pt.domain as v1,
  pt.resource as v2,
  pt.action as v3,
  CASE 
    WHEN pt.action IN ('leave', 'create_view_copy', 'import') THEN 'allow'  -- Basic member permissions
    ELSE 'deny'
  END as v4,
  UNIX_TIMESTAMP(NOW()) * 1000 as created_at,
  UNIX_TIMESTAMP(NOW()) * 1000 as updated_at
FROM permission_template pt
WHERE pt.domain = 'space' AND pt.is_active = 1;

-- 5. Insert example user role relationships (g type rules)
-- These are example data - adjust user IDs based on actual system users
INSERT INTO `casbin_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`, `created_at`, `updated_at`) VALUES
-- Super admin (global permission)
('g', 'user:1', 'super_admin', 'global', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- Space owner examples (space-level permissions)
('g', 'user:1001', 'space_owner', 'space:100', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('g', 'user:1002', 'space_owner', 'space:101', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- Space admin examples (space-level permissions) 
('g', 'user:1003', 'space_admin', 'space:100', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('g', 'user:1004', 'space_admin', 'space:101', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- Space member examples (space-level permissions)
('g', 'user:1005', 'space_member', 'space:100', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('g', 'user:1006', 'space_member', 'space:101', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('g', 'user:1007', 'space_member', 'space:100', NULL, NULL, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000);

-- Add index for better query performance
-- These indexes are already defined in the table creation script, but adding comments for clarity:
-- INDEX `idx_ptype_v0_v1` (`ptype`, `v0`, `v1`) - for efficient permission lookup
-- UNIQUE INDEX `uniq_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`) - prevent duplicate rules