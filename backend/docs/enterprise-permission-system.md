# 企业级权限系统 (Enterprise Permission System)

## 概述

本企业级权限系统基于DDD(领域驱动设计)架构实现，采用Casbin RBAC+模型，支持企业级多层次权限管理，包括：

- **多级组织架构**: 支持公司、部门、工作组层级管理
- **外部用户协作**: 支持邀请外部用户参与特定工作空间
- **4级缓存架构**: L1(sync.Map) → L2(Redis) → L3(数据库缓存) → L4(实时计算)
- **事件驱动**: 权限变更事件驱动缓存失效和审计日志
- **高性能**: 预期99%+缓存命中率，微秒级权限检查

## 架构设计

### DDD分层架构

 

### 权限模型设计

采用Casbin RBAC+模型，支持以下权限格式：

```
Subject: user:123:internal, role:workspace:456:admin
Object: bot:789, workspace:456:*, dataset:*
Action: read, write, delete, manage
Domain: workspace:456, company:123
Effect: allow, deny
```

## 核心功能

### 1. 权限检查 API

```go
// 单个权限检查
result, err := permissionApp.CheckPermission(ctx, &entity.PermissionRequest{
    UserID:      123,
    Resource:    "bot:789",
    Action:      "read",
    WorkspaceID: 456,
})

// 批量权限检查
results, err := permissionApp.CheckPermissionBatch(ctx, requests)

// 获取用户所有权限
permissions, err := permissionApp.GetUserPermissions(ctx, userID, workspaceID)
```

### 2. 角色管理 API

```go
// 创建角色
role, err := permissionApp.CreateRole(ctx, &entity.CreateRoleRequest{
    RoleName:    "workspace-admin",
    RoleType:    "workspace",
    ScopeID:     456,
    ScopeType:   "workspace",
    Description: "工作空间管理员",
})

// 分配角色
err := permissionApp.AssignRole(ctx, &entity.AssignRoleRequest{
    UserID: 123,
    RoleID: role.ID,
    Domain: "workspace:456",
})

// 撤销角色
err := permissionApp.RevokeRole(ctx, &entity.RevokeRoleRequest{
    UserID: 123,
    RoleID: role.ID,
    Domain: "workspace:456",
})
```

### 3. 工作空间权限管理

```go
// 绑定用户到工作空间
err := permissionApp.BindWorkspace(ctx, &entity.BindWorkspaceRequest{
    UserID:      123,
    UserType:    "internal",
    WorkspaceID: 456,
    RoleID:      role.ID,
    Permissions: []string{"bot:read", "dataset:write"},
})

// 解绑工作空间
err := permissionApp.UnbindWorkspace(ctx, &entity.UnbindWorkspaceRequest{
    UserID:      123,
    WorkspaceID: 456,
})

// 获取工作空间成员
members, err := permissionApp.GetWorkspaceMembers(ctx, workspaceID)
```

### 4. 外部用户管理

```go
// 邀请外部用户
externalUser, err := permissionApp.InviteExternalUser(ctx, &entity.InviteExternalUserRequest{
    Email:         "external@company.com",
    WorkspaceID:   456,
    RoleID:        role.ID,
    Permissions:   []string{"bot:read"},
    ExpiresHours:  168, // 7天
    InviteMessage: "邀请您参与我们的AI项目协作",
})

// 撤销外部用户
err := permissionApp.RevokeExternalUser(ctx, &entity.RevokeExternalUserRequest{
    ExternalUserID: externalUser.ID,
    WorkspaceID:    456,
})
```

### 5. 缓存管理

```go
// 失效缓存
err := permissionApp.InvalidateCache(ctx, &entity.InvalidateCacheRequest{
    Type:   "user",
    UserID: 123,
})

// 获取缓存统计
stats, err := permissionApp.GetCacheStats(ctx)

// 预计算权限
err := permissionApp.PreCalculatePermissions(ctx, &entity.PreCalculatePermissionsRequest{
    Type:        "user",
    UserID:      123,
    WorkspaceID: 456,
})
```

### 6. 组织架构同步

```go
// 同步组织架构
err := permissionApp.SyncOrganizationStructure(ctx, &entity.SyncOrganizationRequest{
    OrganizationID: 789,
    // OrganizationData: ... 组织数据
})

// 补充组织权限
err := permissionApp.SupplementOrganizationPermissions(ctx, organizationID)
```

## 4级缓存架构

### L1 缓存 (进程内存)
- **存储**: sync.Map
- **TTL**: 30秒
- **特点**: 最快访问速度，无网络开销
- **适用**: 频繁访问的权限检查

### L2 缓存 (Redis)
- **存储**: Redis
- **TTL**: 5分钟
- **特点**: 分布式共享，支持集群
- **适用**: 跨实例权限共享

### L3 缓存 (数据库缓存表)
- **存储**: PostgreSQL缓存表
- **TTL**: 1小时
- **特点**: 持久化存储，支持复杂查询
- **适用**: 权限预计算结果

### L4 计算 (实时权限计算)
- **计算**: Casbin + 数据库查询
- **特点**: 实时准确，支持复杂权限逻辑
- **适用**: 缓存未命中时的最终计算

## 性能特性

### 缓存命中率
- **L1 缓存**: 预期 85%+ 命中率
- **L2 缓存**: 预期 10%+ 命中率  
- **L3 缓存**: 预期 4%+ 命中率
- **L4 计算**: < 1% 的请求需要实时计算
- **总体**: 99%+ 请求通过缓存响应

### 性能指标
- **L1 响应时间**: < 1微秒
- **L2 响应时间**: < 1毫秒
- **L3 响应时间**: < 10毫秒
- **L4 响应时间**: < 100毫秒

## 配置说明

### Casbin 配置

```go
config := &EnforcerConfig{
    ModelText:        getDefaultModelText(), // RBAC+ 模型定义
    TableName:        "casbin_rules",        // 策略存储表
    AutoSave:         true,                  // 自动保存策略
    AutoSaveInterval: 5 * time.Minute,       // 保存间隔
    EnableLog:        true,                  // 启用日志
    EnableCache:      true,                  // 启用缓存
}
```

### 缓存配置

```go
// 缓存TTL配置
const (
    CacheL1TTL = 30   // L1缓存30秒
    CacheL2TTL = 300  // L2缓存5分钟  
    CacheL3TTL = 3600 // L3缓存1小时
)
```

## 使用示例

### 完整初始化示例

```go
package main

import (
    "context"
    "log"
    
    "github.com/coze-dev/coze-studio/backend/application/permission"
    "github.com/coze-dev/coze-studio/backend/domain/permission/enterprise/entity"
)

func main() {
    // 1. 初始化权限应用服务
    permissionApp := permission.InitEnterprisePermissionApplication()
    
    ctx := context.Background()
    
    // 2. 创建工作空间管理员角色
    role, err := permissionApp.CreateRole(ctx, &entity.CreateRoleRequest{
        RoleName:    "workspace-admin",
        RoleType:    "workspace", 
        ScopeID:     456,
        ScopeType:   "workspace",
        Description: "工作空间管理员，拥有工作空间所有权限",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // 3. 分配角色给用户
    err = permissionApp.AssignRole(ctx, &entity.AssignRoleRequest{
        UserID: 123,
        RoleID: role.ID,
        Domain: "workspace:456",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    // 4. 检查用户权限
    result, err := permissionApp.CheckPermission(ctx, &entity.PermissionRequest{
        UserID:      123,
        Resource:    "bot:789",
        Action:      "read",
        WorkspaceID: 456,
    })
    if err != nil {
        log.Fatal(err)
    }
    
    if result.Allow {
        log.Println("权限检查通过: 用户123可以读取bot:789")
    } else {
        log.Println("权限检查失败:", result.Reason)
    }
    
    // 5. 邀请外部用户协作
    externalUser, err := permissionApp.InviteExternalUser(ctx, &entity.InviteExternalUserRequest{
        Email:         "external@partner.com",
        WorkspaceID:   456,
        RoleID:        role.ID,
        Permissions:   []string{"bot:read", "dataset:read"},
        ExpiresHours:  168, // 7天有效期
        InviteMessage: "邀请您参与AI Bot开发项目",
    })
    if err != nil {
        log.Fatal(err)
    }
    
    log.Printf("外部用户邀请成功: ID=%d, Email=%s", externalUser.ID, externalUser.Email)
    
    // 6. 获取缓存统计
    stats, err := permissionApp.GetCacheStats(ctx)
    if err != nil {
        log.Fatal(err)
    }
    
    log.Printf("缓存统计: L1命中率=%.2f%%, 总请求数=%d", 
        stats.L1Stats.HitRate*100, stats.Total.TotalRequests)
}
```

## 审计和监控

### 权限访问日志

系统自动记录所有权限检查操作：

```go
type AccessLog struct {
    UserID       int64     `json:"user_id"`       // 用户ID
    UserType     string    `json:"user_type"`     // 用户类型
    ResourceType string    `json:"resource_type"` // 资源类型
    ResourceID   int64     `json:"resource_id"`   // 资源ID
    Action       string    `json:"action"`        // 操作
    Result       bool      `json:"result"`        // 检查结果
    Domain       string    `json:"domain"`        // 域
    IPAddress    string    `json:"ip_address"`    // IP地址
    UserAgent    string    `json:"user_agent"`    // 用户代理
    CreatedAt    time.Time `json:"created_at"`    // 创建时间
}
```

### 事件系统

权限系统支持以下事件：

- **PermissionCheckEvent**: 权限检查事件
- **RoleChangeEvent**: 角色变更事件  
- **RoleAssignmentEvent**: 角色分配事件

## 最佳实践

### 1. 权限设计原则

- **最小权限原则**: 用户只获得完成工作所需的最小权限
- **职责分离**: 不同角色承担不同职责，避免权限冲突
- **定期审查**: 定期审查和清理不必要的权限

### 2. 缓存策略

- **预热缓存**: 系统启动时预计算核心用户权限
- **懒加载**: 权限首次访问时计算并缓存
- **失效策略**: 权限变更时及时失效相关缓存

### 3. 性能优化

- **批量操作**: 使用批量权限检查API减少网络开销
- **异步处理**: 权限变更事件异步处理，不阻塞主流程
- **监控告警**: 监控缓存命中率和响应时间

## 故障排查

### 常见问题

1. **权限检查总是返回false**
   - 检查用户是否有对应角色
   - 检查Casbin策略是否正确加载
   - 检查域格式是否正确

2. **缓存命中率低**  
   - 检查缓存TTL配置
   - 检查Redis连接状态
   - 分析权限访问模式

3. **权限变更不生效**
   - 检查缓存失效是否正常执行
   - 检查事件处理是否正常
   - 手动清理相关缓存

### 调试工具

```go
// 获取用户所有权限用于调试
permissions, err := permissionApp.GetUserPermissions(ctx, userID, workspaceID)

// 获取缓存统计用于性能分析  
stats, err := permissionApp.GetCacheStats(ctx)

// 手动失效缓存用于测试
err := permissionApp.InvalidateCache(ctx, &entity.InvalidateCacheRequest{
    Type:   "user", 
    UserID: userID,
})
```

## 总结

本企业级权限系统提供了完整的权限管理解决方案，支持企业级多层次权限控制、外部用户协作、高性能缓存和完整的审计日志。通过DDD架构设计，系统具有良好的可扩展性和维护性，能够满足复杂企业场景的权限管理需求。