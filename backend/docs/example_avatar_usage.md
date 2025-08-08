# Employee Avatar功能使用示例

## 概览

本文档展示如何在Employee Service中使用新增的avatar功能，该功能参考了Knowledge Service的storage使用模式。

## 功能特性

### 1. Entity层更新
- `Employee` 实体添加了 `AvatarURI` 字段用于存储头像的storage URI
- `Employee` 实体添加了 `AvatarURL` 字段用于返回生成的头像访问URL
- `CreateEmployeeMeta` 和 `UpdateEmployeeMeta` 支持头像URI

### 2. Service层更新
- `EmployeeSVCConfig` 添加了 `Storage` 字段
- `CreateEmployeeRequest` 和 `UpdateEmployeeRequest` 支持 `AvatarURI` 字段
- 自动为所有返回的Employee实体生成Avatar URL

### 3. Storage集成
- 使用与Knowledge Service相同的storage接口
- 自动生成临时访问URL
- 支持各种对象存储后端(OSS、S3等)

## 使用示例

### 创建员工时设置头像

```go
// 1. 首先上传头像到storage并获取URI
avatarURI := "employees/avatars/emp_123456_avatar.jpg"
err := storage.PutObject(ctx, avatarURI, avatarData)
if err != nil {
    return err
}

// 2. 创建员工时包含头像URI
req := &CreateEmployeeRequest{
    CorpID:     1001,
    Name:       "张三",
    Email:      &email,
    AvatarURI:  &avatarURI,  // 新增字段
    Status:     entity.EmployeeStatusActive,
    EmpSource:  entity.EmployeeSourceManual,
    CreatorID:  100,
}

resp, err := employeeService.CreateEmployee(ctx, req)
if err != nil {
    return err
}

// 3. 返回的Employee会自动包含AvatarURL
fmt.Printf("Employee avatar URL: %s", *resp.Employee.AvatarURL)
```

### 更新员工头像

```go
// 1. 上传新头像
newAvatarURI := "employees/avatars/emp_123456_avatar_v2.jpg"
err := storage.PutObject(ctx, newAvatarURI, newAvatarData)
if err != nil {
    return err
}

// 2. 更新员工头像
req := &UpdateEmployeeRequest{
    ID:        123456,
    AvatarURI: &newAvatarURI,  // 更新头像URI
}

err = employeeService.UpdateEmployee(ctx, req)
if err != nil {
    return err
}
```

### 获取员工信息(包含头像URL)

```go
req := &GetEmployeeByIDRequest{
    ID: 123456,
}

resp, err := employeeService.GetEmployeeByID(ctx, req)
if err != nil {
    return err
}

// Employee会自动包含生成的头像URL
if resp.Employee.AvatarURL != nil {
    fmt.Printf("Employee avatar: %s", *resp.Employee.AvatarURL)
}
```

### 列出员工(批量生成头像URL)

```go
req := &ListEmployeesRequest{
    CorpID: 1001,
    Limit:  10,
    Page:   1,
}

resp, err := employeeService.ListEmployees(ctx, req)
if err != nil {
    return err
}

// 所有员工的头像URL都会自动生成
for _, emp := range resp.Employees {
    if emp.AvatarURL != nil {
        fmt.Printf("Employee %s avatar: %s", emp.Name, *emp.AvatarURL)
    }
}
```

## Service配置

### 配置Storage

```go
// 创建Employee Service时需要提供Storage
config := &EmployeeSVCConfig{
    DB:      db,
    IDGen:   idgen,
    Storage: storage,  // 新增必需配置
}

employeeService := NewEmployeeSVC(config)
```

## 实现细节

### Avatar URL生成逻辑

```go
func (s *employeeSVC) populateAvatarURL(ctx context.Context, emp *entity.Employee) error {
    if emp == nil || emp.AvatarURI == nil || *emp.AvatarURI == "" {
        return nil
    }
    
    avatarURL, err := s.storage.GetObjectUrl(ctx, *emp.AvatarURI)
    if err != nil {
        // 头像URL生成失败不影响主要功能
        return nil
    }
    
    emp.AvatarURL = &avatarURL
    return nil
}
```

### 自动调用时机

- `CreateEmployee`: 创建后自动生成URL
- `GetEmployeeByID`: 获取时自动生成URL  
- `ListEmployees`: 列表查询时批量生成URL

## 注意事项

1. **可选字段**: `AvatarURI` 是可选字段，可以为空
2. **容错设计**: Avatar URL生成失败不会影响主要业务逻辑
3. **性能考虑**: `ListEmployees` 会为每个员工生成URL，大量数据时需注意性能
4. **Storage依赖**: Service配置中必须提供Storage实例
5. **URI格式**: 建议使用有意义的URI路径，如 `employees/avatars/{emp_id}_avatar.{ext}`

## 兼容性

- 现有代码无需修改即可兼容新功能
- 不提供 `AvatarURI` 时，`AvatarURL` 字段为nil
- 所有现有的Employee相关API都会自动支持avatar字段