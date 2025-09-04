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

package service

import (
	"context"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
)

// RoleService defines role domain service interface
type RoleService interface {
	// Basic operations
	CreateRole(ctx context.Context, request *CreateRoleRequest) (*CreateRoleResponse, error)
	UpdateRole(ctx context.Context, request *UpdateRoleRequest) error
	DeleteRole(ctx context.Context, request *DeleteRoleRequest) error
	GetRoleByID(ctx context.Context, request *GetRoleByIDRequest) (*GetRoleByIDResponse, error)
	ListRoles(ctx context.Context, request *ListRolesRequest) (*ListRolesResponse, error)

	// Business operations
	GetRoleByCode(ctx context.Context, request *GetRoleByCodeRequest) (*GetRoleByCodeResponse, error)
	GetRolesByDomain(ctx context.Context, request *GetRolesByDomainRequest) (*GetRolesByDomainResponse, error)
	GetBuiltinRoles(ctx context.Context, request *GetBuiltinRolesRequest) (*GetBuiltinRolesResponse, error)
	UpdateRoleStatus(ctx context.Context, request *UpdateRoleStatusRequest) error
	ValidateRolePermissions(ctx context.Context, request *ValidateRolePermissionsRequest) error
}

// PermissionTemplateService defines permission template domain service interface
type PermissionTemplateService interface {
	// Basic operations
	CreatePermissionTemplate(ctx context.Context, request *CreatePermissionTemplateRequest) (*CreatePermissionTemplateResponse, error)
	UpdatePermissionTemplate(ctx context.Context, request *UpdatePermissionTemplateRequest) error
	DeletePermissionTemplate(ctx context.Context, request *DeletePermissionTemplateRequest) error
	GetPermissionTemplateByID(ctx context.Context, request *GetPermissionTemplateByIDRequest) (*GetPermissionTemplateByIDResponse, error)
	ListPermissionTemplates(ctx context.Context, request *ListPermissionTemplatesRequest) (*ListPermissionTemplatesResponse, error)

	// Business operations
	GetPermissionTemplatesByDomain(ctx context.Context, request *GetPermissionTemplatesByDomainRequest) (*GetPermissionTemplatesByDomainResponse, error)
	GetActivePermissionTemplates(ctx context.Context, request *GetActivePermissionTemplatesRequest) (*GetActivePermissionTemplatesResponse, error)
	GetDefaultPermissionTemplates(ctx context.Context, request *GetDefaultPermissionTemplatesRequest) (*GetDefaultPermissionTemplatesResponse, error)
	GroupPermissionTemplatesByResource(ctx context.Context, request *GroupPermissionTemplatesByResourceRequest) (*GroupPermissionTemplatesByResourceResponse, error)
	UpdatePermissionTemplateStatus(ctx context.Context, request *UpdatePermissionTemplateStatusRequest) error
}

// UserRoleService defines user role domain service interface
// Note: Only manages global roles now, space roles are managed separately
type UserRoleService interface {
	// Basic operations (global roles only)
	AssignUserToRole(ctx context.Context, request *AssignUserToRoleRequest) error
	RemoveUserFromRole(ctx context.Context, request *RemoveUserFromRoleRequest) error
	GetUserRoles(ctx context.Context, request *GetUserRolesRequest) (*GetUserRolesResponse, error)
	GetUserRolesWithRoleInfo(ctx context.Context, request *GetUserRolesRequest) (*GetUserRolesWithRoleInfoResponse, error)
	GetRoleUsers(ctx context.Context, request *GetRoleUsersRequest) (*GetRoleUsersResponse, error)
	ListUserRoles(ctx context.Context, request *ListUserRolesRequest) (*ListUserRolesResponse, error)

	// Business operations
	CheckUserPermission(ctx context.Context, request *CheckUserPermissionRequest) (*CheckUserPermissionResponse, error)
	BatchAssignUsersToRole(ctx context.Context, request *BatchAssignUsersToRoleRequest) error
	BatchRemoveUsersFromRole(ctx context.Context, request *BatchRemoveUsersFromRoleRequest) error
	GetUsersByRoleCode(ctx context.Context, roleCode string) ([]int64, error)
	CountRoleUsers(ctx context.Context, roleID int64) (int64, error)
}

// CasbinRuleService defines casbin rule domain service interface
type CasbinRuleService interface {
	// Group rule operations (user-role relationships)
	CreateGroupRule(ctx context.Context, request *CreateGroupRuleRequest) error
	DeleteGroupRule(ctx context.Context, request *DeleteGroupRuleRequest) error
	GetUserRoles(ctx context.Context, userID string) ([]string, error)
	BatchCreateGroupRules(ctx context.Context, request *BatchCreateGroupRulesRequest) error
}

// Request/Response structures for RoleService

type CreateRoleRequest struct {
	RoleCode      string                `json:"role_code"`
	RoleName      string                `json:"role_name"`
	RoleDomain    entity.RoleDomain     `json:"role_domain"`
	SpaceRoleType entity.SpaceRoleType  `json:"space_role_type"`
	Permissions   string                `json:"permissions"`
	Description   string                `json:"description"`
	CreatedBy     int64                 `json:"created_by"`
}

type CreateRoleResponse struct {
	Role *entity.Role `json:"role"`
}

type UpdateRoleRequest struct {
	ID          int64                  `json:"id"`
	RoleName    *string                `json:"role_name,omitempty"`
	Permissions *string                `json:"permissions,omitempty"`
	Description *string                `json:"description,omitempty"`
	IsDisabled  *entity.RoleStatus     `json:"is_disabled,omitempty"`
}

type DeleteRoleRequest struct {
	ID int64 `json:"id"`
}

type GetRoleByIDRequest struct {
	ID int64 `json:"id"`
}

type GetRoleByIDResponse struct {
	Role *entity.Role `json:"role"`
}

type ListRolesRequest struct {
	RoleDomain    *entity.RoleDomain    `json:"role_domain,omitempty"`
	SpaceRoleType *entity.SpaceRoleType `json:"space_role_type,omitempty"`
	IsBuiltin     *int32                `json:"is_builtin,omitempty"`
	IsDisabled    *entity.RoleStatus    `json:"is_disabled,omitempty"`
	Keyword       *string               `json:"keyword,omitempty"`
	CreatedBy     *int64                `json:"created_by,omitempty"`
	Page          int                   `json:"page"`
	Limit         int                   `json:"limit"`
}

type ListRolesResponse struct {
	Roles   []*entity.Role `json:"roles"`
	Total   int64          `json:"total"`
	HasMore bool           `json:"has_more"`
}

type GetRoleByCodeRequest struct {
	RoleCode string `json:"role_code"`
}

type GetRoleByCodeResponse struct {
	Role *entity.Role `json:"role"`
}

type GetRolesByDomainRequest struct {
	Domain entity.RoleDomain `json:"domain"`
}

type GetRolesByDomainResponse struct {
	Roles []*entity.Role `json:"roles"`
}

type GetBuiltinRolesRequest struct{}

type GetBuiltinRolesResponse struct {
	Roles []*entity.Role `json:"roles"`
}

type UpdateRoleStatusRequest struct {
	ID     int64              `json:"id"`
	Status entity.RoleStatus  `json:"status"`
}

type ValidateRolePermissionsRequest struct {
	Permissions string `json:"permissions"`
}

// Request/Response structures for PermissionTemplateService

type CreatePermissionTemplateRequest struct {
	TemplateCode string `json:"template_code"`
	TemplateName string `json:"template_name"`
	Domain       string `json:"domain"`
	Resource     string `json:"resource"`
	ResourceName string `json:"resource_name"`
	Action       string `json:"action"`
	ActionName   string `json:"action_name"`
	Description  string `json:"description"`
	IsDefault    int32  `json:"is_default"`
	SortOrder    int32  `json:"sort_order"`
}

type CreatePermissionTemplateResponse struct {
	Template *entity.PermissionTemplate `json:"template"`
}

type UpdatePermissionTemplateRequest struct {
	ID           int64                                  `json:"id"`
	TemplateName *string                                `json:"template_name,omitempty"`
	ResourceName *string                                `json:"resource_name,omitempty"`
	ActionName   *string                                `json:"action_name,omitempty"`
	Description  *string                                `json:"description,omitempty"`
	IsDefault    *int32                                 `json:"is_default,omitempty"`
	SortOrder    *int32                                 `json:"sort_order,omitempty"`
	IsActive     *entity.PermissionTemplateStatus       `json:"is_active,omitempty"`
}

type DeletePermissionTemplateRequest struct {
	ID int64 `json:"id"`
}

type GetPermissionTemplateByIDRequest struct {
	ID int64 `json:"id"`
}

type GetPermissionTemplateByIDResponse struct {
	Template *entity.PermissionTemplate `json:"template"`
}

type ListPermissionTemplatesRequest struct {
	Domain    *string                            `json:"domain,omitempty"`
	Resource  *string                            `json:"resource,omitempty"`
	IsActive  *entity.PermissionTemplateStatus   `json:"is_active,omitempty"`
	IsDefault *int32                             `json:"is_default,omitempty"`
	Keyword   *string                            `json:"keyword,omitempty"`
	Page      int                                `json:"page"`
	Limit     int                                `json:"limit"`
}

type ListPermissionTemplatesResponse struct {
	Templates []*entity.PermissionTemplate `json:"templates"`
	Total     int64                        `json:"total"`
	HasMore   bool                         `json:"has_more"`
}

type GetPermissionTemplatesByDomainRequest struct {
	Domain string `json:"domain"`
}

type GetPermissionTemplatesByDomainResponse struct {
	Templates []*entity.PermissionTemplate `json:"templates"`
}

type GetActivePermissionTemplatesRequest struct{}

type GetActivePermissionTemplatesResponse struct {
	Templates []*entity.PermissionTemplate `json:"templates"`
}

type GetDefaultPermissionTemplatesRequest struct {
	Domain string `json:"domain"`
}

type GetDefaultPermissionTemplatesResponse struct {
	Templates []*entity.PermissionTemplate `json:"templates"`
}

type GroupPermissionTemplatesByResourceRequest struct {
	Domain   *string                            `json:"domain,omitempty"`
	IsActive *entity.PermissionTemplateStatus   `json:"is_active,omitempty"`
}

type GroupPermissionTemplatesByResourceResponse struct {
	Groups []*entity.PermissionTemplateGroup `json:"groups"`
}

type UpdatePermissionTemplateStatusRequest struct {
	ID     int64                             `json:"id"`
	Status entity.PermissionTemplateStatus  `json:"status"`
}

// Request/Response structures for UserRoleService

type AssignUserToRoleRequest struct {
	UserID     int64 `json:"user_id"`
	RoleID     int64 `json:"role_id"`
	AssignedBy int64 `json:"assigned_by"`
}

type RemoveUserFromRoleRequest struct {
	UserID int64 `json:"user_id"`
	RoleID int64 `json:"role_id"`
}

type GetUserRolesRequest struct {
	UserID int64 `json:"user_id"`
}

type GetUserRolesResponse struct {
	UserRoles []*entity.UserRole `json:"user_roles"`
}

// GetUserRolesWithRoleInfoResponse contains user roles with role info joined
type GetUserRolesWithRoleInfoResponse struct {
	UserRoleInfos []entity.UserRoleWithRole `json:"user_role_infos"`
}

type ListUserRolesRequest struct {
	UserID *int64 `json:"user_id,omitempty"`
	RoleID *int64 `json:"role_id,omitempty"`
	Page   int    `json:"page"`
	Limit  int    `json:"limit"`
}

type ListUserRolesResponse struct {
	UserRoles []*entity.UserRole `json:"user_roles"`
	Total     int64              `json:"total"`
	Page      int                `json:"page"`
	Limit     int                `json:"limit"`
}

type GetRoleUsersRequest struct {
	RoleID int64 `json:"role_id"`
	Page   int   `json:"page"`
	Limit  int   `json:"limit"`
}

type GetRoleUsersResponse struct {
	UserRoles []*entity.UserRole `json:"user_roles"`
}

type CheckUserPermissionRequest struct {
	UserID     int64  `json:"user_id"`
	SpaceID    *int64 `json:"space_id,omitempty"`
	Resource   string `json:"resource"`
	Action     string `json:"action"`
}

type CheckUserPermissionResponse struct {
	HasPermission bool `json:"has_permission"`
}

type GetUserGlobalRolesRequest struct {
	UserID int64 `json:"user_id"`
}

type GetUserGlobalRolesResponse struct {
	UserRoles []*entity.UserRole `json:"user_roles"`
}

type GetUserSpaceRolesRequest struct {
	UserID  int64 `json:"user_id"`
	SpaceID int64 `json:"space_id"`
}

type GetUserSpaceRolesResponse struct {
	UserRoles []*entity.UserRole `json:"user_roles"`
}

type BatchAssignUsersToRoleRequest struct {
	UserIDs    []int64 `json:"user_ids"`
	RoleID     int64   `json:"role_id"`
	AssignedBy int64   `json:"assigned_by"`
}

type BatchRemoveUsersFromRoleRequest struct {
	UserIDs []int64 `json:"user_ids"`
	RoleID  int64   `json:"role_id"`
}

// Request/Response structures for CasbinRuleService

type CreateGroupRuleRequest struct {
	UserID   string `json:"user_id"`
	RoleCode string `json:"role_code"`
}

type DeleteGroupRuleRequest struct {
	UserID   string `json:"user_id"`
	RoleCode string `json:"role_code"`
}

type BatchCreateGroupRulesRequest struct {
	UserID    string   `json:"user_id"`
	RoleCodes []string `json:"role_codes"`
}
