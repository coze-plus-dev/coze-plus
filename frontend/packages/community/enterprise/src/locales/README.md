# 企业管理模块多语言配置

## 概览

企业管理模块的多语言配置已经完全整理并集成到全局多语言系统中，支持中英文双语。

## 文件结构

```
src/locales/
├── keys.ts              # 多语言key常量定义
└── README.md            # 本说明文档
```

## 使用方式

### 方式一: 使用企业模块专用的 t 函数（推荐）

```typescript
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';

// 使用类型安全的 t 函数
<span>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_NAME)}</span>

// 带参数的翻译（使用字符串替换）
<span>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_CONTENT).replace('{name}', employee.name)}</span>
```

### 方式二: 直接使用全局 I18n

```typescript
import { I18n } from '@coze-arch/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';

// 需要类型断言
<span>{I18n.t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_NAME as any)}</span>
```

### 多语言工具函数

企业模块提供了额外的工具函数（可选使用）：

```typescript
import { t, tBatch, tWithDefault } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';

// 批量翻译
const labels = tBatch([
  ENTERPRISE_I18N_KEYS.ENTERPRISE_NAME,
  ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL,
  ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE
]);

// 带默认值的翻译
const fallbackText = tWithDefault(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOADING, 'Loading...');
```

## 多语言key分类

### 通用字段
- `ENTERPRISE_NAME`: "姓名" / "Name"
- `ENTERPRISE_STATUS`: "状态" / "Status"  
- `ENTERPRISE_MOBILE`: "手机号" / "Mobile"
- `ENTERPRISE_EMAIL`: "邮箱" / "Email"
- `ENTERPRISE_DEPARTMENT`: "部门" / "Department"
- `ENTERPRISE_ACTIONS`: "操作" / "Actions"

### 员工表格
- `ENTERPRISE_MEMBER_TABLE_COLUMN_*`: 表格列标题
- `ENTERPRISE_MEMBER_TABLE_ACTION_*`: 操作按钮文本
- `ENTERPRISE_MEMBER_TABLE_EMPTY_*`: 空状态提示

### 员工详情
- `ENTERPRISE_MEMBER_DETAIL_SECTION_*`: 信息区块标题
- `ENTERPRISE_MEMBER_DETAIL_FIELD_*`: 字段标签
- `ENTERPRISE_MEMBER_DETAIL_ACTION_*`: 操作按钮
- `ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_*`: 部门相关标签

### 状态标签
- `ENTERPRISE_STATUS_EMPLOYED`: "在职" / "Employed"
- `ENTERPRISE_STATUS_QUIT`: "离职" / "Quit"

### 验证消息
- `ENTERPRISE_VALIDATION_*`: 表单验证错误信息

## 全局配置集成

所有企业模块的多语言配置都已成功添加到全局多语言资源文件中：

- `/frontend/packages/arch/resources/studio-i18n-resource/src/locales/zh-CN.json`
- `/frontend/packages/arch/resources/studio-i18n-resource/src/locales/en.json`

使用扁平化的key结构，与现有多语言系统完全兼容。

### 已集成的配置内容

包含137个多语言key，覆盖以下功能模块：
- **基础字段**: 姓名、状态、手机号、邮箱、部门、操作等通用字段
- **员工表格**: 表格列标题、操作按钮、空状态提示等
- **员工详情**: 信息区块标题、字段标签、操作按钮等  
- **状态管理**: 在职、离职状态标签
- **离职恢复**: 离职确认、恢复在职相关流程文案
- **部门选择**: 部门选择器、变更提示等
- **员工创建**: 创建员工表单验证和提示
- **部门管理**: 创建/编辑部门相关功能
- **组织管理**: 创建/编辑组织相关功能
- **表单验证**: 各类表单验证错误信息

## 添加新的多语言配置

1. 在 `keys.ts` 中添加新的key常量
2. 在全局多语言资源文件中添加对应的中英文翻译
3. 在组件中使用新的key常量

注意：全局资源文件的构建是自动的，无需手动运行构建命令。

## 工具函数详解

### `t(key, options?)` 
企业模块专用的类型安全翻译函数，会自动处理类型转换。

```typescript
// 基础用法
t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NAME) // "姓名"

// 带参数（使用字符串替换）
t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_CONTENT).replace('{name}', '张三')
// "确定要让 张三 离职吗？"
```

### `tBatch(keys[])`
批量翻译多个key，返回翻译后的字符串数组。

```typescript
const [nameLabel, emailLabel, mobileLabel] = tBatch([
  ENTERPRISE_I18N_KEYS.ENTERPRISE_NAME,
  ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL, 
  ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE
]);
```

### `tWithDefault(key, defaultValue)`
带默认值的翻译，当翻译失败时返回默认值。

```typescript
// 如果key不存在，返回 "Unknown Status"
const statusText = tWithDefault(someKey, 'Unknown Status');
```

## 注意事项

### ✅ 推荐做法
- 优先使用企业模块的 `t` 函数，提供更好的类型安全
- 使用 `ENTERPRISE_I18N_KEYS` 常量，避免拼写错误
- 使用扁平化的key结构，保持与全局系统一致
- 所有新增的UI文本都要添加多语言配置
- 利用 `tBatch` 和 `tWithDefault` 等工具函数提高效率

### ❌ 避免做法
- 不要直接使用硬编码的中文字符串
- 不要使用嵌套结构的多语言key
- 避免在全局 I18n 中使用未定义的key
- 不要绕过类型检查直接传入字符串

## 相关组件

多语言配置已经在以下组件中完成集成：

- `pages/address-book/components/member-table/index.tsx` - 员工表格组件
- `pages/address-book/components/member-detail-panel/index.tsx` - 员工详情面板
- `pages/address-book/components/org-tree/index.tsx` - 组织树组件
- `pages/address-book/components/create-employee-modal/index.tsx` - 创建员工弹窗
- `pages/address-book/components/create-department-modal/index.tsx` - 创建部门弹窗
- `pages/address-book/components/create-organization-modal/index.tsx` - 创建组织弹窗
- `pages/address-book/components/edit-department-modal/index.tsx` - 编辑部门弹窗
- `pages/address-book/components/edit-organization-modal/index.tsx` - 编辑组织弹窗
- `pages/address-book/components/change-department-modal/index.tsx` - 变更部门弹窗
- `pages/address-book/components/department-selector/index.tsx` - 部门选择器
- `pages/address-book/components/toolbar/index.tsx` - 工具栏组件