# Coze Plus 权限设计方案

## 概述

Coze Plus 采用基于 Casbin 的 RBAC (Role-Based Access Control) 权限模型，支持多层级权限控制、资源级精细化权限管理和动态权限检查。系统设计遵循最小权限原则，确保安全性的同时提供灵活的权限配置能力。

## 架构设计

### 权限模型 (RBAC+)

采用 Casbin 的增强型 RBAC 模型，支持以下格式：

```
Subject(主体): user:123, role:space_admin
Domain(域): global, space:456
Object(资源): agent:*, workflow:789, knowledge:*
Action(操作): create, read, update, delete, execute, publish
Effect(效果): allow, deny
```

### Casbin 模型配置

```ini
[request_definition]
r = sub, dom, obj, act

[policy_definition]  
p = sub, dom, obj, act, eft

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow)) && !some(where (p.eft == deny))

[matchers]
m = g(r.sub, p.sub, r.dom) && r.dom == p.dom && keyMatch2(r.obj, p.obj) && r.act == p.act
```

## 核心实体设计

### 1. 角色 (Role) 实体

```go
type Role struct {
    ID            int64         `json:"id"`
    RoleCode      string        `json:"role_code"`        // 角色代码
    RoleName      string        `json:"role_name"`        // 角色名称
    RoleDomain    RoleDomain    `json:"role_domain"`      // global/space
    SuperAdmin    int32         `json:"super_admin"`      // 是否超级管理员
    SpaceRoleType SpaceRoleType `json:"space_role_type"`  // 空间角色类型
    IsBuiltin     int32         `json:"is_builtin"`       // 是否内置角色
    IsDisabled    RoleStatus    `json:"is_disabled"`      // 角色状态
    Permissions   string        `json:"permissions"`      // JSON格式权限配置
    Description   string        `json:"description"`      // 角色描述
    CreatedBy     int64         `json:"created_by"`
    CreatedAt     time.Time     `json:"created_at"`
    UpdatedAt     time.Time     `json:"updated_at"`
}
```

### 2. 权限模板 (Permission Template) 实体

```go
type PermissionTemplate struct {
    ID           int64                     `json:"id"`
    TemplateCode string                    `json:"template_code"`
    TemplateName string                    `json:"template_name"`
    Domain       string                    `json:"domain"`       // global, space
    Resource     string                    `json:"resource"`     // agent, workflow, knowledge等
    ResourceName string                    `json:"resource_name"`
    Action       string                    `json:"action"`       // create, read, update, delete等
    ActionName   string                    `json:"action_name"`
    Description  string                    `json:"description"`
    IsDefault    int32                     `json:"is_default"`   // 是否默认选中
    SortOrder    int32                     `json:"sort_order"`
    IsActive     PermissionTemplateStatus  `json:"is_active"`
}
```

### 3. 用户角色关系 (User Role) 实体

```go
type UserRole struct {
    ID         int64      `json:"id"`
    UserID     int64      `json:"user_id"`
    RoleID     int64      `json:"role_id"`
    AssignedBy int64      `json:"assigned_by"`
    AssignedAt time.Time  `json:"assigned_at"`
    ExpiredAt  *time.Time `json:"expired_at,omitempty"`
}
```

## 权限域设计

### 1. 全局域 (Global Domain)

- **作用域**: 整个系统级别
- **适用角色**: super_admin
- **权限范围**: 系统管理、用户管理、组织管理等

### 2. 空间域 (Space Domain)

- **作用域**: 工作空间级别  
- **适用角色**: space_owner, space_admin, space_member
- **权限范围**: 空间内资源管理

#### 空间角色类型

```go
const (
    SpaceRoleTypeNormal    SpaceRoleType = 0 // 普通空间角色
    SpaceRoleTypeOwner     SpaceRoleType = 1 // 空间所有者
    SpaceRoleTypeAdmin     SpaceRoleType = 2 // 空间管理员  
    SpaceRoleTypeMember    SpaceRoleType = 3 // 空间成员
)
```

## 资源类型定义

### 核心资源类型

| 资源类型 | 资源代码 | 描述 | 支持操作 |
|---------|----------|------|---------|
| 智能体 | `agent` | AI Bot/智能体 | create, read, update, delete, execute, publish |
| 工作流 | `workflow` | 工作流程 | create, read, update, delete, execute, publish |
| 知识库 | `knowledge` | 知识库和文档 | create, read, update, delete, manage |
| 插件 | `plugin` | 插件和工具 | create, read, update, delete, install |
| 数据库 | `database` | 数据库表 | create, read, update, delete, query |
| 文件 | `file` | 文件和媒体 | create, read, update, delete, download |

### 操作类型定义

| 操作 | 代码 | 描述 |
|-----|------|------|
| 创建 | `create` | 创建新资源 |
| 读取 | `read` | 查看资源详情 |
| 更新 | `update` | 修改资源内容 |
| 删除 | `delete` | 删除资源 |
| 执行 | `execute` | 运行/执行资源 |
| 发布 | `publish` | 发布资源到市场 |
| 管理 | `manage` | 管理资源权限 |

## 数据库表设计

### 1. 角色表 (role)

```sql
CREATE TABLE `role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Role ID",
  `role_code` varchar(50) NOT NULL COMMENT "Role code",
  `role_name` varchar(100) NOT NULL COMMENT "Role name", 
  `role_domain` varchar(50) NOT NULL DEFAULT 'global' COMMENT "Permission domain",
  `super_admin` tinyint NOT NULL DEFAULT 0 COMMENT "Is super admin",
  `space_role_type` tinyint NULL COMMENT "Space role type",
  `is_builtin` tinyint NOT NULL DEFAULT 0 COMMENT "Is builtin role",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled",
  `permissions` json COMMENT "Permission matrix JSON configuration",
  `description` text COMMENT "Role description",
  `created_by` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_role_code` (`role_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. 用户角色关系表 (user_role)

```sql
CREATE TABLE `user_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT "User ID",
  `role_id` bigint unsigned NOT NULL COMMENT "Role ID", 
  `space_id` bigint unsigned COMMENT "Permission scope - Space ID",
  `assigned_by` bigint unsigned NOT NULL COMMENT "Assigner ID",
  `assigned_at` bigint unsigned NOT NULL COMMENT "Assignment time",
  `expired_at` bigint unsigned NULL COMMENT "Expiration time",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_user_role_space` (`user_id`, `role_id`, `space_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 3. 权限模板表 (permission_template)

```sql
CREATE TABLE `permission_template` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Template ID",
  `template_code` varchar(50) NOT NULL COMMENT "Template code",
  `template_name` varchar(100) NOT NULL COMMENT "Template name",
  `domain` varchar(50) NOT NULL COMMENT "Permission domain",
  `resource` varchar(50) NOT NULL COMMENT "Resource type",
  `resource_name` varchar(100) NOT NULL COMMENT "Resource Chinese name", 
  `action` varchar(50) NOT NULL COMMENT "Action type",
  `action_name` varchar(100) NOT NULL COMMENT "Action Chinese name",
  `description` text COMMENT "Permission description",
  `is_default` tinyint NOT NULL DEFAULT 0 COMMENT "Is default enabled",
  `sort_order` int NOT NULL DEFAULT 0 COMMENT "Sort weight",
  `is_active` tinyint NOT NULL DEFAULT 1 COMMENT "Is active",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_template_domain_resource_action` (`template_code`, `domain`, `resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 4. Casbin 策略表 (casbin_rule)

```sql
CREATE TABLE `casbin_rule` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ptype` varchar(100) NOT NULL COMMENT "Policy type: p(policy), g(user role)",
  `v0` varchar(100) NOT NULL COMMENT "User ID/Role", 
  `v1` varchar(100) NOT NULL COMMENT "Resource domain",
  `v2` varchar(100) NOT NULL COMMENT "Resource type", 
  `v3` varchar(100) NULL COMMENT "Action",
  `v4` varchar(100) NULL COMMENT "Effect",
  `v5` varchar(100) NULL COMMENT "Extension field",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 权限检查接口

### 权限检查请求

```go
type CheckRequest struct {
    UserID     int64  `json:"user_id"`     // 用户ID
    Resource   string `json:"resource"`    // 资源类型: agent, workflow, knowledge等
    ResourceID string `json:"resource_id"` // 具体资源ID，"*"表示所有资源  
    Action     string `json:"action"`      // 操作: read, write, delete等
    Domain     string `json:"domain"`      // 域: workspace:123, global等
}
```

### 权限检查响应

```go
type CheckResponse struct {
    Allowed bool   `json:"allowed"` // 是否允许
    Reason  string `json:"reason"`  // 拒绝原因
}
```

### 权限检查接口

```go
type Checker interface {
    // 单个权限检查
    Check(ctx context.Context, req *CheckRequest) (*CheckResponse, error)
    
    // 批量权限检查  
    BatchCheck(ctx context.Context, reqs []*CheckRequest) ([]*CheckResponse, error)
    
    // 检查用户角色
    CheckUserRole(ctx context.Context, userID int64, roleCode string) (bool, error)
}
```

## 内置角色配置

### 1. 超级管理员 (super_admin)

- **权限范围**: 全局所有权限
- **特殊性质**: 绕过所有权限检查
- **管理功能**: 用户管理、系统配置、权限管理

### 2. 空间所有者 (space_owner)

- **权限范围**: 空间内所有权限
- **核心权限**: 
  - 空间管理和配置
  - 成员邀请和管理  
  - 所有资源的 CRUD 权限

### 3. 空间管理员 (space_admin) 

- **权限范围**: 空间管理权限
- **核心权限**:
  - 成员管理
  - 资源管理
  - 部门管理

### 4. 空间成员 (space_member)

- **权限范围**: 基础使用权限
- **核心权限**:
  - 创建和编辑自己的智能体
  - 查看共享资源
  - 基本协作功能

## 权限检查流程

### 1. 超级管理员检查

```
if user.isSuperAdmin() {
    return ALLOW
}
```

### 2. Casbin 策略检查

```
subject = "user:" + userID
domain = request.domain  
object = request.resource + ":" + request.resourceID
action = request.action

result = casbin.Enforce(subject, domain, object, action)
```

### 3. 权限继承检查

- 检查用户在指定域内的角色
- 根据角色权限配置进行检查
- 支持权限继承和组合

## 权限配置示例

### 权限模板数据

```json
[
  {
    "domain": "global",
    "domain_name": "全局权限",
    "resources": [
      {
        "resource": "user",
        "resource_name": "用户管理",
        "actions": [
          {
            "template_code": "user_create",
            "action": "create",
            "action_name": "创建用户",
            "is_default": 0
          },
          {
            "template_code": "user_read", 
            "action": "read",
            "action_name": "查看用户",
            "is_default": 1
          }
        ]
      }
    ]
  },
  {
    "domain": "space", 
    "domain_name": "空间权限",
    "resources": [
      {
        "resource": "agent",
        "resource_name": "智能体",
        "actions": [
          {
            "template_code": "agent_create",
            "action": "create", 
            "action_name": "创建智能体",
            "is_default": 1
          },
          {
            "template_code": "agent_execute",
            "action": "execute",
            "action_name": "执行智能体", 
            "is_default": 1
          }
        ]
      }
    ]
  }
]
```

### Casbin 策略示例

```
# 用户角色分配 (Grouping Policy)
g, user:123, space_admin, space:456
g, user:456, space_member, space:456

# 角色权限策略 (Policy)  
p, space_admin, space:456, agent:*, create, allow
p, space_admin, space:456, agent:*, read, allow
p, space_admin, space:456, agent:*, update, allow
p, space_admin, space:456, agent:*, delete, allow

p, space_member, space:456, agent:*, read, allow
p, space_member, space:456, agent:*, create, allow
```

## API 接口设计

### 1. 角色管理

```http
# 创建角色
POST /api/permission/roles
{
  "role_code": "custom_role",
  "role_name": "自定义角色", 
  "description": "自定义权限角色",
  "permissions": [...]
}

# 更新角色
PUT /api/permission/roles/:id
{
  "role_name": "更新的角色名",
  "permissions": [...]
}

# 获取角色列表
GET /api/permission/roles?domain=space&page=1&limit=20
```

### 2. 用户角色分配

```http  
# 分配多个角色
POST /api/permission/users/:userId/roles
{
  "role_ids": ["1", "2", "3"]
}

# 获取用户角色
GET /api/permission/users/:userId/roles

# 撤销用户角色
DELETE /api/permission/users/:userId/roles  
{
  "role_ids": ["1", "2"]
}
```

### 3. 权限检查

```http
# 权限检查（中间件使用）
POST /api/permission/check
{
  "user_id": 123,
  "resource": "agent", 
  "resource_id": "789",
  "action": "read",
  "domain": "space:456"
}
```

## 最佳实践

### 1. 权限设计原则

- **最小权限原则**: 用户只获得完成工作所需的最小权限
- **职责分离**: 不同角色承担不同职责
- **定期审查**: 定期审查和清理权限配置

### 2. 性能优化

- **缓存策略**: 使用多级缓存提升权限检查性能
- **批量检查**: 尽量使用批量权限检查接口
- **权限预计算**: 对频繁访问的权限进行预计算

### 3. 安全考虑

- **拒绝优先**: 明确拒绝的权限优先于允许
- **日志审计**: 记录所有权限检查和变更操作
- **权限隔离**: 确保不同空间之间的权限隔离

## 监控和调试

### 1. 权限检查日志

```json
{
  "user_id": 123,
  "resource": "agent:789", 
  "action": "read",
  "domain": "space:456",
  "result": true,
  "reason": "",
  "timestamp": "2025-01-01T12:00:00Z"
}
```

### 2. 性能监控

- 权限检查响应时间
- 缓存命中率统计
- 权限策略加载性能

### 3. 调试工具

- 用户权限查询接口
- 策略验证工具  
- 权限矩阵可视化

## 总结

Coze Plus 权限系统采用现代化的 RBAC+ 模型，通过 Casbin 实现灵活的权限控制。系统支持多层级权限域、精细化资源权限和高性能权限检查，能够满足企业级应用的复杂权限需求。通过合理的数据库设计和接口规范，确保了系统的可扩展性和维护性。