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

import (
	"context"
	"encoding/json"
	"time"

	"github.com/coze-dev/coze-studio/backend/api/model/permission/common"
	permission1 "github.com/coze-dev/coze-studio/backend/api/model/permission/permission"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	crossuser "github.com/coze-dev/coze-studio/backend/crossdomain/contract/user"
	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type PermissionApplicationService struct {
	DomainSVC *service.Services
}

var PermissionSVC = &PermissionApplicationService{}

// CreateRole creates a new role
func (p *PermissionApplicationService) CreateRole(ctx context.Context, req *permission1.CreateRoleRequest) (*permission1.CreateRoleResponse, error) {
	// Get user ID from context
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	createReq := &service.CreateRoleRequest{
		RoleCode:      req.RoleCode,
		RoleName:      req.RoleName,
		RoleDomain:    entity.RoleDomainGlobal, // Default to global domain
		// SpaceRoleType will be set based on domain
		Permissions:   "",                      // Empty permissions initially
		Description:   "",
		CreatedBy:     *uid, // Set from context
	}

	if req.Description != nil {
		createReq.Description = *req.Description
	}

	_, err := p.DomainSVC.RoleService.CreateRole(ctx, createReq)
	if err != nil {
		logs.CtxErrorf(ctx, "create role failed, err: %v", err)
		return &permission1.CreateRoleResponse{}, err
	}

	return &permission1.CreateRoleResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// UpdateRole updates an existing role
func (p *PermissionApplicationService) UpdateRole(ctx context.Context, req *permission1.UpdateRoleRequest) (*permission1.UpdateRoleResponse, error) {
	// Get user ID from context to ensure user is authenticated
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	updateReq := &service.UpdateRoleRequest{
		ID:          req.ID,
		RoleName:    req.RoleName,
		Permissions: nil, // Will be set if provided
		Description: req.Description,
		IsDisabled:  nil, // Will be set if provided
	}

	// Handle permissions if provided
	if req.Permissions != nil && len(req.Permissions) > 0 {
		// Convert permission groups to JSON string
		permissionsJSON, err := json.Marshal(req.Permissions)
		if err != nil {
			logs.CtxErrorf(ctx, "marshal permissions failed, err: %v", err)
			return &permission1.UpdateRoleResponse{}, err
		}
		permissionsStr := string(permissionsJSON)
		updateReq.Permissions = &permissionsStr
	}

	// Handle is_disabled if provided
	if req.IsDisabled != nil {
		isDisabled := entity.RoleStatus(*req.IsDisabled)
		updateReq.IsDisabled = &isDisabled
	}

	err := p.DomainSVC.RoleService.UpdateRole(ctx, updateReq)
	if err != nil {
		logs.CtxErrorf(ctx, "update role failed, err: %v", err)
		return &permission1.UpdateRoleResponse{}, err
	}

	return &permission1.UpdateRoleResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// DeleteRole deletes a role
func (p *PermissionApplicationService) DeleteRole(ctx context.Context, req *permission1.DeleteRoleRequest) (*permission1.DeleteRoleResponse, error) {
	deleteReq := &service.DeleteRoleRequest{
		ID: req.ID,
	}

	err := p.DomainSVC.RoleService.DeleteRole(ctx, deleteReq)
	if err != nil {
		logs.CtxErrorf(ctx, "delete role failed, err: %v", err)
		return &permission1.DeleteRoleResponse{}, err
	}

	return &permission1.DeleteRoleResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// GetRole gets a role by ID
func (p *PermissionApplicationService) GetRole(ctx context.Context, req *permission1.GetRoleRequest) (*permission1.GetRoleResponse, error) {
	getRoleReq := &service.GetRoleByIDRequest{
		ID: req.ID,
	}

	domainResp, err := p.DomainSVC.RoleService.GetRoleByID(ctx, getRoleReq)
	if err != nil {
		logs.CtxErrorf(ctx, "get role failed, err: %v", err)
		return &permission1.GetRoleResponse{}, err
	}

	return &permission1.GetRoleResponse{
		Code: 0,
		Msg:  "success",
		Data: convertRoleEntity2Data(domainResp.Role),
	}, nil
}

// ListRoles lists roles with pagination and filters
func (p *PermissionApplicationService) ListRoles(ctx context.Context, req *permission1.ListRolesRequest) (*permission1.ListRolesResponse, error) {
	listReq := &service.ListRolesRequest{
		RoleDomain:    nil,
		SpaceRoleType: nil,
		IsBuiltin:     nil,
		IsDisabled:    nil,
		Keyword:       req.Keyword,
		// CreatedBy will be set from context
		Page:          int(req.GetPage()),
		Limit:         int(req.GetPageSize()),
	}

	domainResp, err := p.DomainSVC.RoleService.ListRoles(ctx, listReq)
	if err != nil {
		logs.CtxErrorf(ctx, "list roles failed, err: %v", err)
		return &permission1.ListRolesResponse{}, err
	}

	roles := make([]*permission1.RoleData, 0, len(domainResp.Roles))
	for _, role := range domainResp.Roles {
		roles = append(roles, convertRoleEntity2Data(role))
	}

	total := domainResp.Total
	page := req.GetPage()
	pageSize := req.GetPageSize()

	return &permission1.ListRolesResponse{
		Code: 0,
		Msg:  "success",
		Data: &permission1.ListRolesResponseData{
			Roles:    roles,
			Total:    &total,
			Page:     &page,
			PageSize: &pageSize,
		},
	}, nil
}

// ListPermissionTemplates lists permission templates
func (p *PermissionApplicationService) ListPermissionTemplates(ctx context.Context, req *permission1.ListPermissionTemplatesRequest) (*permission1.ListPermissionTemplatesResponse, error) {
	// Use domain service to get grouped permission templates
	groupReq := &service.GroupPermissionTemplatesByResourceRequest{
		Domain:   req.Domain,
		IsActive: nil,
	}

	domainResp, err := p.DomainSVC.PermissionTemplateService.GroupPermissionTemplatesByResource(ctx, groupReq)
	if err != nil {
		logs.CtxErrorf(ctx, "group permission templates failed, err: %v", err)
		return &permission1.ListPermissionTemplatesResponse{}, err
	}

	// Convert domain groups to API model groups
	groups := make([]*common.PermissionTemplateGroup, 0, len(domainResp.Groups))
	for _, group := range domainResp.Groups {
		groups = append(groups, convertTemplateGroupEntity2Model(group))
	}

	return &permission1.ListPermissionTemplatesResponse{
		Code: 0,
		Msg:  "success",
		Data: groups,
	}, nil
}

// convertRoleEntity2Data converts domain role entity to RoleData
func convertRoleEntity2Data(role *entity.Role) *permission1.RoleData {
	if role == nil {
		return nil
	}

	// Parse permissions JSON string to permission groups
	var permissions []*common.PermissionTemplateGroup
	if role.Permissions != "" {
		// Try to parse JSON permissions string
		if err := json.Unmarshal([]byte(role.Permissions), &permissions); err != nil {
			logs.Errorf("Failed to parse role permissions JSON: %v", err)
			permissions = []*common.PermissionTemplateGroup{}
		}
	}

	roleData := &permission1.RoleData{
		ID:            &role.ID,
		RoleCode:      &role.RoleCode,
		RoleName:      &role.RoleName,
		SuperAdmin:    &role.SuperAdmin,
		IsBuiltin:     &role.IsBuiltin,
		Description:   &role.Description,
		Permissions:   permissions,
		CreatedBy:     &role.CreatedBy,
	}

	// Convert enum values
	spaceRoleType := int32(role.SpaceRoleType)
	roleData.SpaceRoleType = &spaceRoleType

	isDisabled := int32(role.IsDisabled)
	roleData.IsDisabled = &isDisabled

	createdAt := role.CreatedAt.Unix()
	updatedAt := role.UpdatedAt.Unix()
	roleData.CreatedAt = &createdAt
	roleData.UpdatedAt = &updatedAt

	return roleData
}

// convertTemplateGroupEntity2Model converts domain permission template group to API model
func convertTemplateGroupEntity2Model(group *entity.PermissionTemplateGroup) *common.PermissionTemplateGroup {
	if group == nil {
		return nil
	}

	resources := make([]*common.PermissionResourceGroup, 0, len(group.Resources))
	for _, resource := range group.Resources {
		actions := make([]*common.PermissionTemplateData, 0, len(resource.Actions))
		for _, action := range resource.Actions {
			isDefault := int32(0)
			if action.IsDefault == 1 {
				isDefault = int32(1)
			}

			// Convert all fields according to IDL protocol
			id := int64(action.ID)
			sortOrder := int32(action.SortOrder)
			isActive := int32(action.IsActive)

			actionData := &common.PermissionTemplateData{
				ID:           &id,
				TemplateCode: &action.TemplateCode,
				TemplateName: &action.TemplateName,
				Domain:       &action.Domain,
				Resource:     &action.Resource,
				ResourceName: &action.ResourceName,
				Action:       &action.Action,
				ActionName:   &action.ActionName,
				Description:  &action.Description,
				IsDefault:    &isDefault,
				SortOrder:    &sortOrder,
				IsActive:     &isActive,
			}
			actions = append(actions, actionData)
		}

		resourceGroup := &common.PermissionResourceGroup{
			Resource:     &resource.Resource,
			ResourceName: &resource.ResourceName,
			Actions:      actions,
		}
		resources = append(resources, resourceGroup)
	}

	return &common.PermissionTemplateGroup{
		Domain:     &group.Domain,
		DomainName: &group.DomainName,
		Resources:  resources,
	}
}

// ListUsers lists users with pagination and filters
func (p *PermissionApplicationService) ListUsers(ctx context.Context, req *permission1.ListUsersRequest) (*permission1.ListUsersResponse, error) {
	// Build request for crossdomain user service
	crossReq := &crossuser.ListUsersRequest{
		Keyword:    req.Keyword,
		IsDisabled: req.IsDisabled,
		Page:       int(req.GetPage()),
		Limit:      int(req.GetLimit()),
	}

	// Call crossdomain user service
	crossResp, err := crossuser.DefaultSVC().ListUsers(ctx, crossReq)
	if err != nil {
		logs.CtxErrorf(ctx, "list users failed, err: %v", err)
		return &permission1.ListUsersResponse{}, err
	}

	// Convert crossdomain users to API model users
	users := make([]*permission1.UserData, 0, len(crossResp.Users))
	for _, crossUser := range crossResp.Users {
		users = append(users, convertCrossUserToAPIModel(crossUser))
	}

	return &permission1.ListUsersResponse{
		Code: 0,
		Msg:  "success",
		Data: &permission1.ListUsersResponseData{
			Users:   users,
			Total:   &crossResp.Total,
			HasMore: &crossResp.HasMore,
		},
	}, nil
}

// UpdateUserStatus updates user status (enabled/disabled)
func (p *PermissionApplicationService) UpdateUserStatus(ctx context.Context, req *permission1.UpdateUserStatusRequest) (*permission1.UpdateUserStatusResponse, error) {
	// Get user ID from context to ensure user is authenticated
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Convert enum to int32 - note the enum values mapping
	// common.UserStatus_ENABLED = 0 maps to IsDisabled = 0
	// common.UserStatus_DISABLED = 1 maps to IsDisabled = 1
	isDisabled := int32(req.IsDisabled)

	// Build request for crossdomain user service
	crossReq := &crossuser.UpdateUserStatusRequest{
		UserID:     req.UserID,
		IsDisabled: isDisabled,
	}

	// Call crossdomain user service
	err := crossuser.DefaultSVC().UpdateUserStatus(ctx, crossReq)
	if err != nil {
		logs.CtxErrorf(ctx, "update user status failed, err: %v", err)
		return &permission1.UpdateUserStatusResponse{}, err
	}

	return &permission1.UpdateUserStatusResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// convertCrossUserToAPIModel converts crossdomain user to API model
func convertCrossUserToAPIModel(crossUser *crossuser.UserInfo) *permission1.UserData {
	if crossUser == nil {
		return nil
	}

	createdAt := time.Unix(crossUser.CreatedAt/1000, 0).Format("2006-01-02 15:04:05")
	updatedAt := time.Unix(crossUser.UpdatedAt/1000, 0).Format("2006-01-02 15:04:05")

	return &permission1.UserData{
		UserID:       &crossUser.ID,
		Name:         &crossUser.Name,
		UniqueName:   &crossUser.UniqueName,
		Email:        &crossUser.Email,
		Description:  &crossUser.Description,
		IconURI:      &crossUser.IconURI,
		IconURL:      &crossUser.IconURL,
		UserVerified: &crossUser.UserVerified,
		IsDisabled:   &crossUser.IsDisabled,
		Locale:       &crossUser.Locale,
		CreatedAt:    &createdAt,
		UpdatedAt:    &updatedAt,
	}
}
