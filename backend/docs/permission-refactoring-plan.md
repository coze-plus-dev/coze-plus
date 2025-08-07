# 权限系统渐进式重构方案

## 📋 重构目标

将权限从独立领域重构为基础设施层的横切关注点，采用基于Casbin数据库配置的权限规则管理。

## 🏗️ 重构后的架构设计

### 新架构分层

```
backend/
├── domain/                     # 业务领域 (移除permission领域)
│   ├── agent/                 # 智能体领域
│   ├── workflow/              # 工作流领域  
│   ├── knowledge/             # 知识库领域
│   ├── user/                  # 用户领域 (包含空间和角色定义)
│   └── ...
├── application/               # 应用层 (集成权限检查)
│   ├── agent/                 # 智能体应用服务 + 权限检查
│   ├── workflow/              # 工作流应用服务 + 权限检查
│   └── ...
└── infra/                     # 基础设施层
    ├── permission/            # 权限服务 (横切关注点) ✨ 新增
    │   ├── permission_service.go    # 权限检查服务
    │   ├── rule_manager.go          # 权限规则管理
    │   └── middleware.go            # 权限检查中间件
    ├── impl/
    │   ├── permission/        # 权限缓存实现
    │   └── casbin/            # Casbin权限引擎
    └── contract/permission/   # 权限接口定义
```

### 权限规则管理方式

**采用Casbin数据库配置，而不是配置文件**：

1. **权限策略表** (`casbin_rules`):
   ```sql
   CREATE TABLE casbin_rules (
       id SERIAL PRIMARY KEY,
       ptype VARCHAR(100) NOT NULL,  -- 策略类型: p, g
       v0 VARCHAR(100),              -- subject/role
       v1 VARCHAR(100),              -- object/resource  
       v2 VARCHAR(100),              -- action
       v3 VARCHAR(100),              -- domain
       v4 VARCHAR(100),              -- effect
       v5 VARCHAR(100)               -- 扩展字段
   );
   ```

2. **预定义角色权限**:
   ```
   role:workspace:admin -> * (所有资源) : * (所有操作) : workspace:* : allow
   role:workspace:member -> agent:* : read,write : workspace:* : allow
   role:workspace:viewer -> agent:* : read : workspace:* : allow
   role:external:collaborator -> agent:* : read : workspace:* : allow
   ```

3. **动态权限规则**:
   ```
   user:123:internal -> agent:456 : read,write,delete,manage : workspace:789 : allow
   user:123:internal -> role:workspace:admin : workspace:789 (角色继承)
   ```

## 🔄 渐进式重构步骤

### ✅ 阶段1：创建新的基础设施层权限服务

**已完成**：
- ✅ `infra/permission/permission_service.go` - 基础权限检查服务
- ✅ `infra/permission/rule_manager.go` - 权限规则管理器  
- ✅ `infra/permission/middleware.go` - 权限检查中间件
- ✅ `examples/permission_integration_example.go` - 集成示例

**核心特性**：
- 简化的权限检查API：`Check(userID, resourceType, resourceID, action)`
- 业务领域权限检查器：`Agent().CanRead()`, `Workflow().CanExecute()`
- 权限规则管理：动态添加/删除权限规则到Casbin数据库
- 权限检查切面：`WithPermissionCheck()` 装饰器模式

### ⏳ 阶段2：各业务领域应用层集成权限检查

**计划中**：

1. **智能体应用层集成**:
   ```go
   // application/singleagent/single_agent_with_permission.go
   func (app *AgentApplication) GetAgent(ctx context.Context, userID, agentID int64) (*Agent, error) {
       return app.permissionAspect.Agent().RequireRead(ctx, userID, agentID, func() (interface{}, error) {
           return app.agentService.GetAgent(ctx, agentID)
       })
   }
   ```

2. **工作流应用层集成**:
   ```go
   // application/workflow/workflow_with_permission.go  
   func (app *WorkflowApplication) ExecuteWorkflow(ctx context.Context, userID, workflowID int64) error {
       return app.permissionAspect.Workflow().RequireExecute(ctx, userID, workflowID, func() (interface{}, error) {
           return app.workflowService.Execute(ctx, workflowID)
       })
   }
   ```

3. **知识库应用层集成**:
   ```go
   // application/knowledge/knowledge_with_permission.go
   func (app *KnowledgeApplication) GetKnowledge(ctx context.Context, userID, knowledgeID int64) (*Knowledge, error) {
       return app.permissionAspect.Knowledge().RequireRead(ctx, userID, knowledgeID, func() (interface{}, error) {
           return app.knowledgeService.GetKnowledge(ctx, knowledgeID)
       })
   }
   ```

### ⏳ 阶段3：优化Casbin数据库配置的权限规则管理

**计划中**：

1. **权限规则初始化工具**:
   ```go
   // tools/permission_init.go
   func main() {
       ruleManager := permission.NewRuleManager(casbinEnforcer)
       
       // 初始化默认角色和权限
       ruleManager.InitializeDefaultRoles(ctx)
       
       // 设置系统管理员权限  
       ruleManager.AssignRole(ctx, adminUserID, "system:admin", "global")
   }
   ```

2. **权限规则管理工具**:
   ```bash
   # 添加权限规则
   go run tools/permission_tool.go add-rule \
     --subject="user:123:internal" \
     --object="agent:456" \
     --action="read" \
     --domain="workspace:789"
   
   # 分配角色
   go run tools/permission_tool.go assign-role \
     --user-id=123 \
     --role="workspace:admin" \
     --domain="workspace:789"
   ```

3. **权限规则迁移脚本**:
   ```go
   // migrations/permission_migration.go
   func MigrateFromOldPermissionSystem(ctx context.Context) error {
       // 从旧的权限系统迁移到新的Casbin规则
       oldPermissions := getOldPermissions()
       
       for _, oldPerm := range oldPermissions {
           newRule := convertToNewRule(oldPerm)
           ruleManager.AddPermissionRule(ctx, newRule.Subject, newRule.Object, newRule.Action, newRule.Domain)
       }
   }
   ```

### ⏳ 阶段4：创建权限管理工具和迁移脚本

**计划中**：

1. **权限管理CLI工具**:
   ```bash
   # 查看用户权限
   permission-cli user permissions --user-id=123 --workspace-id=456
   
   # 角色管理
   permission-cli role assign --user-id=123 --role="workspace:admin" --domain="workspace:456"
   permission-cli role revoke --user-id=123 --role="workspace:admin" --domain="workspace:456"
   
   # 权限规则管理
   permission-cli rule add --subject="user:123" --object="agent:456" --action="read" --domain="workspace:789"
   permission-cli rule remove --subject="user:123" --object="agent:456" --action="read" --domain="workspace:789"
   
   # 批量操作
   permission-cli bulk-import --file=permissions.json
   ```

2. **权限迁移脚本**:
   ```go
   // scripts/migrate_permissions.go
   func main() {
       // 从现有的企业权限系统迁移到新的基础设施层权限系统
       migrator := NewPermissionMigrator()
       
       if err := migrator.MigrateFromEnterprisePermission(); err != nil {
           log.Fatal(err)
       }
   }
   ```

## 💡 重构优势

### 1. **架构清晰化**
- ✅ 权限成为真正的横切关注点
- ✅ 业务领域专注于业务逻辑
- ✅ 消除领域间的循环依赖

### 2. **使用简化**
```go
// 重构前：需要构造复杂的权限请求对象
result, err := permissionApp.CheckPermission(ctx, &entity.PermissionRequest{
    UserID: 123, Resource: "bot:789", Action: "read", WorkspaceID: 456,
})

// 重构后：简化的API调用
allowed, err := permissionService.Agent().CanRead(ctx, userID, agentID)
```

### 3. **权限规则数据库化**
- ✅ 权限规则存储在Casbin数据库表中，支持动态修改
- ✅ 支持复杂的权限继承和角色管理
- ✅ 权限规则可以通过管理工具和API动态调整
- ✅ 支持权限规则的版本管理和审计

### 4. **性能优化**
- ✅ 保留4级缓存架构，确保高性能
- ✅ 权限检查从领域调用变为基础设施调用，减少调用层次
- ✅ 批量权限检查支持，提高批量操作性能

### 5. **开发效率**
```go
// 业务开发者只需要在应用层使用权限切面
result, err := app.permissionAspect.Agent().RequireRead(ctx, userID, agentID, func() (interface{}, error) {
    return app.agentService.GetAgent(ctx, agentID)
})
```

## 📚 使用指南

### 1. **应用层集成权限检查**

```go
type AgentApplication struct {
    agentService     domain.AgentService
    permissionAspect *permission.CheckPermissionAspect
}

func (app *AgentApplication) GetAgent(ctx context.Context, userID, agentID int64) (*Agent, error) {
    result, err := app.permissionAspect.Agent().RequireRead(ctx, userID, agentID, func() (interface{}, error) {
        return app.agentService.GetAgent(ctx, agentID)
    })
    return result.(*Agent), err
}
```

### 2. **权限规则管理**

```go
// 创建智能体时自动设置权限
func (app *AgentApplication) CreateAgent(ctx context.Context, userID int64, req *CreateAgentRequest) (*Agent, error) {
    agent, err := app.agentService.Create(ctx, req)
    if err != nil {
        return nil, err
    }
    
    // 为创建者设置管理权限
    domain := fmt.Sprintf("workspace:%d", req.WorkspaceID)
    app.ruleManager.SetupAgentPermissions(ctx, userID, agent.ID, domain)
    
    return agent, nil
}
```

### 3. **权限初始化**

```go
// 系统启动时初始化默认权限规则
func InitializePermissions(ctx context.Context, ruleManager *permission.RuleManager) error {
    return ruleManager.InitializeDefaultRoles(ctx)
}
```

## 🔧 迁移计划

### 兼容性保证
1. **保留现有权限API** - 在重构期间继续支持
2. **渐进式迁移** - 逐个业务领域迁移，不影响现有功能
3. **数据迁移工具** - 提供自动化迁移脚本

### 迁移时间线
- **第1周**: 完成基础设施层权限服务
- **第2-3周**: 各业务领域应用层集成权限检查
- **第4周**: 权限规则管理工具和迁移脚本
- **第5周**: 测试和优化
- **第6周**: 上线和监控

### 风险控制
1. **功能开关** - 可以在新旧权限系统间切换
2. **权限审计** - 记录所有权限变更操作
3. **性能监控** - 监控权限检查性能，确保不劣化
4. **回滚方案** - 如有问题可快速回滚到旧系统

## 📈 预期收益

1. **架构清晰度** - 权限作为横切关注点，架构更清晰
2. **开发效率** - 简化的权限API，提高开发效率
3. **维护成本** - 权限规则集中管理，降低维护成本
4. **扩展性** - 基于Casbin数据库配置，扩展性更好
5. **性能** - 保持现有的高性能缓存架构