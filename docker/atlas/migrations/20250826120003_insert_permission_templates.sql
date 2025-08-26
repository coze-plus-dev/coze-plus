-- Insert permission template data
-- Generated from: /Users/aedan/workspace/coze-plus/vibe-coding/today/enterprise-permission-database-design.md
-- Note: All permission templates have is_default=0, role permissions are differentiated in role table permissions field

-- Insert global permission domain templates (全局权限域模板)
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
('EMP_INVITE', '添加人员', 'global', 'employee', '人员管理', 'invite', '添加人员', '添加新成员入组织，设置成员的基本信息和所属部门', 0, 120, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_EDIT', '变更人员部门', 'global', 'employee', '人员管理', 'edit', '变更人员部门', '调整组织成员的部门归属，处理人员调动和组织架构变更', 0, 121, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_MANAGE_POS', '操作离职', 'global', 'employee', '人员管理', 'manage_quit', '操作离职', '处理员工离职，包括账号禁用、权限回收', 0, 122, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('EMP_VIEW', '查看组织人员', 'global', 'employee', '人员管理', 'view', '查看组织人员', '查看组织内所有成员的基本信息、部门归属和联系方式', 0, 123, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 4. 用户管理权限 (User Management)
('USER_CREATE', '创建用户', 'global', 'user', '用户管理', 'create', '创建用户', '在系统中创建新的用户账号，设置登录凭证和基础权限', 0, 200, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_EDIT', '编辑用户', 'global', 'user', '用户管理', 'edit', '编辑用户', '修改用户基本信息、联系方式等', 0, 201, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_DELETE', '删除用户', 'global', 'user', '用户管理', 'delete', '删除用户', '删除用户账号（软删除）', 0, 202, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_DISABLE', '禁用用户', 'global', 'user', '用户管理', 'disable', '禁用用户', '暂时禁用用户账号', 0, 203, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_ENABLE', '启用用户', 'global', 'user', '用户管理', 'enable', '启用用户', '重新启用被禁用的用户账号', 0, 204, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('USER_RESET_PWD', '重置密码', 'global', 'user', '用户管理', 'reset_password', '重置密码', '为用户重置登录密码', 0, 205, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 5. 角色管理权限 (Role Management)
('ROLE_VIEW', '查看角色', 'global', 'role', '角色管理', 'view', '查看角色', '查看系统中的所有角色定义', 0, 300, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_CREATE', '创建角色', 'global', 'role', '角色管理', 'create', '创建角色', '创建新的自定义角色', 0, 301, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_EDIT', '编辑角色', 'global', 'role', '角色管理', 'edit', '编辑角色', '修改角色信息和权限配置', 0, 302, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_DELETE', '删除角色', 'global', 'role', '角色管理', 'delete', '删除角色', '删除自定义角色', 0, 303, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),
('ROLE_ASSIGN', '分配用户角色', 'global', 'role', '角色管理', 'assign', '分配用户角色', '分配和调整用户的角色，如管理员、成员等级别权限', 0, 304, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000),

-- 6. 工作空间管理权限 (Workspace Management)
('WS_CREATE', '新建工作空间', 'global', 'workspace', '工作空间管理', 'create', '新建工作空间', '创建新的工作空间，设置空间访问权限和协作范围', 0, 400, 1, UNIX_TIMESTAMP(NOW()) * 1000, UNIX_TIMESTAMP(NOW()) * 1000);

-- Insert space permission domain templates (空间权限域模板)
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