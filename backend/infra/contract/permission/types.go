/*
 * Copyright 2025 coze-plus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package permission

// Resource types - Global domain
const (
	ResourceOrganization = "organization" // 组织管理
	ResourceDepartment   = "department"   // 部门管理
	ResourceEmployee     = "employee"     // 人员管理
	ResourceUser         = "user"         // 用户管理
	ResourceRole         = "role"         // 角色管理
	ResourceWorkspace    = "workspace"    // 工作空间管理
)

// Resource types - Space domain
const (
	ResourceMember   = "member"   // 成员管理
	ResourceConfig   = "config"   // 空间配置
	ResourceResource = "resource" // 管理资源
	ResourceWorkflow = "workflow" // 工作流

	// Legacy resources (for backward compatibility)
	ResourceAgent     = "agent"
	ResourceKnowledge = "knowledge"
	ResourcePlugin    = "plugin"
	ResourceSystem    = "system"
)

// Actions - Global domain
const (
	// Organization actions
	ActionCreate = "create"
	ActionEdit   = "edit"
	ActionDelete = "delete"

	// Employee actions
	ActionInvite     = "invite"
	ActionManageQuit = "manage_quit"
	ActionView       = "view"
	ActionChangeDpt  = "change_department"

	// User actions
	ActionDisable     = "disable"
	ActionEnable      = "enable"
	ActionResetPwd    = "reset_password"
	ActionUpdateUserStutus = "disable_enable"

	// Role actions
	ActionAssign = "assign"
	ActionUnbind = "unbind"

	// Legacy actions (for backward compatibility)
	ActionRead    = "read"
	ActionWrite   = "write"
	ActionExecute = "execute"
	ActionPublish = "publish"
	ActionManage  = "manage"
)

// Actions - Space domain
const (
	// Member actions
	ActionRemove     = "remove"
	ActionAdjustRole = "adjust_role"

	// Config actions
	ActionDeleteTransfer = "delete_transfer"
	ActionLeave          = "leave"

	// Resource actions
	ActionCreateViewCopy = "create_view_copy"
	ActionEditPublish    = "edit_publish"
	ActionImport         = "import"
	ActionExport         = "export"
)

// Domains
const (
	DomainGlobal = "global"
	DomainSpace  = "space"
)

// Role types
const (
	RoleSuperAdmin  = "super_admin"
	RoleSpaceOwner  = "space_owner"
	RoleSpaceAdmin  = "space_admin"
	RoleSpaceMember = "space_member"
)

// Common permission patterns
var (
	// RESTful method to action mapping
	HTTPMethodToAction = map[string]string{
		"GET":    ActionRead,
		"PUT":    ActionWrite,
		"PATCH":  ActionWrite,
		"DELETE": ActionDelete,
		"POST":   ActionCreate,
	}

	// Skip permission check paths
	SkipPermissionPaths = map[string]bool{
		"/api/passport/web/email/login":       true,
		"/api/passport/web/email/register/v2": true,
		"/api/passport/web/logout":            true,
		"/api/passport/account/info/v2":       true,
		"/api/user/update_profile":            true,
		"/api/common/upload/apply_upload_action": true,
		"/api/developer/get_icon":             true,
		"/api/developer/get_mode_config":      true,
		"/health":                             true,
		"/metrics":                            true,
	}
)
