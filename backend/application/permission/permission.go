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
	"fmt"
	"strconv"
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
	// Check if role is bound to any users
	userCount, err := p.DomainSVC.UserRoleService.CountRoleUsers(ctx, req.ID)
	if err != nil {
		logs.CtxErrorf(ctx, "count role users failed for role %d, err: %v", req.ID, err)
		return &permission1.DeleteRoleResponse{}, err
	}

	// If role is bound to users, prevent deletion
	if userCount > 0 {
		logs.CtxWarnf(ctx, "cannot delete role %d: role is assigned to %d users", req.ID, userCount)
		return &permission1.DeleteRoleResponse{}, errorx.New(errno.ErrPermissionRoleInUseCode, errorx.KV("user_count", strconv.FormatInt(userCount, 10)))
	}

	deleteReq := &service.DeleteRoleRequest{
		ID: req.ID,
	}

	err = p.DomainSVC.RoleService.DeleteRole(ctx, deleteReq)
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

	// Handle role_domain filter
	if req.RoleDomain != nil && *req.RoleDomain != "" {
		roleDomain := entity.RoleDomain(*req.RoleDomain)
		// Validate role domain value
		if roleDomain != entity.RoleDomainGlobal && roleDomain != entity.RoleDomainSpace {
			return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid role_domain, must be 'global' or 'space'"))
		}
		listReq.RoleDomain = &roleDomain
	}

	// Handle is_builtin filter
	if req.IsBuiltin != nil {
		listReq.IsBuiltin = req.IsBuiltin
	}

	// Handle is_disabled filter
	if req.IsDisabled != nil {
		isDisabled := entity.RoleStatus(*req.IsDisabled)
		listReq.IsDisabled = &isDisabled
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

	// Parse user_id from string to int64
	userID := parseInt64FromString(req.UserID)
	if userID <= 0 {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid user_id format"))
	}

	// Convert enum to int32 - note the enum values mapping
	// common.UserStatus_ENABLED = 0 maps to IsDisabled = 0
	// common.UserStatus_DISABLED = 1 maps to IsDisabled = 1
	isDisabled := int32(req.IsDisabled)

	// Build request for crossdomain user service
	crossReq := &crossuser.UpdateUserStatusRequest{
		UserID:     userID,
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

// AssignUserMultipleRoles assigns multiple roles to a single user
func (p *PermissionApplicationService) AssignUserMultipleRoles(ctx context.Context, req *permission1.AssignUserMultipleRolesRequest) (*permission1.AssignUserMultipleRolesResponse, error) {
	// Get user ID from context to ensure user is authenticated
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Validate input
	if len(req.RoleIds) == 0 {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "role_ids cannot be empty"))
	}

	// Parse user_id from string to int64
	userID := parseInt64FromString(req.UserID)
	if userID <= 0 {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid user_id format"))
	}
	// Convert string role IDs to int64
	roleIDs := make([]int64, 0, len(req.RoleIds))
	for _, roleIDStr := range req.RoleIds {
		// Parse role ID from string to int64
		roleID := parseInt64FromString(roleIDStr)
		if roleID <= 0 {
			return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid role_id format"))
		}
		roleIDs = append(roleIDs, roleID)
	}

	// Use current user ID as assignedBy
	assignedBy := *uid

	// Get user's current global roles
	getUserRolesReq := &service.GetUserRolesRequest{UserID: userID}
	currentUserRolesResp, err := p.DomainSVC.UserRoleService.GetUserRoles(ctx, getUserRolesReq)
	if err != nil {
		logs.CtxErrorf(ctx, "get current user roles failed for user %s, err: %v", req.UserID, err)
		return nil, err
	}

	// Build current role IDs set for comparison
	currentRoleIDs := make(map[int64]string) // roleID -> roleCode
	for _, userRole := range currentUserRolesResp.UserRoles {
		// Get role code for each current role
		getRoleReq := &service.GetRoleByIDRequest{ID: userRole.RoleID}
		roleResp, err := p.DomainSVC.RoleService.GetRoleByID(ctx, getRoleReq)
		if err != nil {
			logs.CtxWarnf(ctx, "get current role failed for roleID %d, err: %v", userRole.RoleID, err)
			continue
		}
		currentRoleIDs[userRole.RoleID] = roleResp.Role.RoleCode
	}

	// Validate target roles and build target role set

	targetRoleIDs := make(map[int64]string) // roleID -> roleCode
	for _, roleID := range roleIDs {

		// Validate role exists and get role information
		getRoleReq := &service.GetRoleByIDRequest{ID: roleID}
		roleResp, err := p.DomainSVC.RoleService.GetRoleByID(ctx, getRoleReq)
		if err != nil {
			return nil, err
		}
		// Ensure it's a global role
		if roleResp.Role.RoleDomain != entity.RoleDomainGlobal {
			return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "only global roles can be assigned"))
		}

		targetRoleIDs[roleID] = roleResp.Role.RoleCode
	}

	// Calculate roles to add and remove
	var rolesToAdd []int64
	var rolesToRemove []int64

	// Find roles to add (in target but not in current)
	for roleID := range targetRoleIDs {
		if _, exists := currentRoleIDs[roleID]; !exists {
			rolesToAdd = append(rolesToAdd, roleID)
		} else {
			logs.CtxInfof(ctx, "[DEBUG] Role already assigned: %d (%s)", roleID, targetRoleIDs[roleID])
		}
	}

	// Find roles to remove (in current but not in target) and collect role codes
	rolesToRemoveWithCodes := make(map[int64]string) // roleID -> roleCode
	for roleID, roleCode := range currentRoleIDs {
		if _, exists := targetRoleIDs[roleID]; !exists {
			rolesToRemove = append(rolesToRemove, roleID)
			rolesToRemoveWithCodes[roleID] = roleCode
		}
	}
	// Process role additions
	for _, roleID := range rolesToAdd {

		assignReq := &service.AssignUserToRoleRequest{
			UserID:     userID,
			RoleID:     roleID,
			AssignedBy: assignedBy,
		}

		if err := p.DomainSVC.UserRoleService.AssignUserToRole(ctx, assignReq); err != nil {
			return nil, err
		}
	}

	// Process role removals
	for _, roleID := range rolesToRemove {
		removeReq := &service.RemoveUserFromRoleRequest{
			UserID: userID,
			RoleID: roleID,
		}

		if err := p.DomainSVC.UserRoleService.RemoveUserFromRole(ctx, removeReq); err != nil {
			logs.CtxErrorf(ctx, "remove user %s from role %d failed, err: %v", req.UserID, roleID, err)
			return nil, err
		}

		logs.CtxInfof(ctx, "successfully removed user %s from role %d", req.UserID, roleID)
	}

	logs.CtxInfof(ctx, "role sync completed: added %d roles, removed %d roles for user %s", len(rolesToAdd), len(rolesToRemove), req.UserID)

	// Sync casbin group rules for role changes
	userIDStr := req.UserID

	// Add casbin group rules for newly assigned roles
	for _, roleID := range rolesToAdd {
		roleCode := targetRoleIDs[roleID]

		// Get role domain to create domain-specific group rules
		getRoleReq := &service.GetRoleByIDRequest{ID: roleID}
		roleResp, err := p.DomainSVC.RoleService.GetRoleByID(ctx, getRoleReq)
		if err != nil {
			logs.CtxWarnf(ctx, "[DEBUG] WARNING: get role domain failed for roleID %d, err: %v", roleID, err)
			continue
		}

		roleDomain := string(roleResp.Role.RoleDomain)

		if err := p.syncUserRoleGroupPolicyWithDomain(ctx, userIDStr, roleCode, roleDomain); err != nil {
			logs.CtxErrorf(ctx, "create casbin group policy failed for user %s, role %s, domain %s, err: %v", req.UserID, roleCode, roleDomain, err)
			return nil, fmt.Errorf("failed to create casbin group policy for user %s, role %s: %w", req.UserID, roleCode, err)
		}
	}

	// Remove casbin group rules for unassigned roles
	for _, roleID := range rolesToRemove {
		if roleCode, exists := rolesToRemoveWithCodes[roleID]; exists {
			if err := p.removeUserRoleGroupPolicy(ctx, userIDStr, roleCode); err != nil {
				logs.CtxErrorf(ctx, "delete casbin group policy failed for user %s, role %s, err: %v", req.UserID, roleCode, err)
				return nil, fmt.Errorf("failed to delete casbin group policy for user %s, role %s: %w", req.UserID, roleCode, err)
			}
		}
	}
	return &permission1.AssignUserMultipleRolesResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// syncUserRoleGroupPolicyWithDomain synchronizes casbin group policy for user-role relationship with domain
func (p *PermissionApplicationService) syncUserRoleGroupPolicyWithDomain(ctx context.Context, userID, roleCode, domain string) error {
	// Create casbin group rule: g, user:{user_id}, role_code, domain
	userSubject := fmt.Sprintf("user:%s", userID)
	createReq := &service.CreateGroupRuleWithDomainRequest{
		UserID:   userSubject,
		RoleCode: roleCode,
		Domain:   domain,
	}

	err := p.DomainSVC.CasbinRuleService.CreateGroupRuleWithDomain(ctx, createReq)
	if err != nil {
		return err
	}

	logs.CtxInfof(ctx, "Created casbin group rule with domain: g, %s, %s, %s", userSubject, roleCode, domain)
	return nil
}

// syncUserRoleGroupPolicy synchronizes casbin group policy for user-role relationship (legacy method)
func (p *PermissionApplicationService) syncUserRoleGroupPolicy(ctx context.Context, userID, roleCode string) error {
	// For backward compatibility, default to global domain
	return p.syncUserRoleGroupPolicyWithDomain(ctx, userID, roleCode, "global")
}

// removeUserRoleGroupPolicyWithDomain removes casbin group policy for user-role relationship with domain
func (p *PermissionApplicationService) removeUserRoleGroupPolicyWithDomain(ctx context.Context, userID, roleCode, domain string) error {
	// Delete casbin group rule: g, user:{user_id}, role_code, domain
	userSubject := fmt.Sprintf("user:%s", userID)
	deleteReq := &service.DeleteGroupRuleWithDomainRequest{
		UserID:   userSubject,
		RoleCode: roleCode,
		Domain:   domain,
	}

	err := p.DomainSVC.CasbinRuleService.DeleteGroupRuleWithDomain(ctx, deleteReq)
	if err != nil {
		return err
	}

	logs.CtxInfof(ctx, "Deleted casbin group rule with domain: g, %s, %s, %s", userSubject, roleCode, domain)
	return nil
}

// removeUserRoleGroupPolicy removes casbin group policy for user-role relationship (legacy method)
func (p *PermissionApplicationService) removeUserRoleGroupPolicy(ctx context.Context, userID, roleCode string) error {
	// For backward compatibility, default to global domain
	return p.removeUserRoleGroupPolicyWithDomain(ctx, userID, roleCode, "global")
}

// GetUserRoles gets roles assigned to a user
func (p *PermissionApplicationService) GetUserRoles(ctx context.Context, req *permission1.GetUserRolesRequest) (*permission1.GetUserRolesResponse, error) {
	// Get user ID from context to ensure user is authenticated
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Parse user_id from string to int64
	userID := parseInt64FromString(req.UserID)
	if userID <= 0 {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid user_id format"))
	}

	// Use efficient JOIN query for better performance (single query vs N+1)
	getUserRolesReq := &service.GetUserRolesRequest{UserID: userID}
	userRoleInfosResp, err := p.DomainSVC.UserRoleService.GetUserRolesWithRoleInfo(ctx, getUserRolesReq)
	if err != nil {
		logs.CtxErrorf(ctx, "get user roles with role info failed for user %s, err: %v", req.UserID, err)
		return &permission1.GetUserRolesResponse{}, err
	}

	// Convert to role data with basic info (no permissions field)
	roles := make([]*permission1.RoleData, 0, len(userRoleInfosResp.UserRoleInfos))
	for _, userRoleInfo := range userRoleInfosResp.UserRoleInfos {
		roleData := &permission1.RoleData{
			ID:          &userRoleInfo.RoleID,
			RoleCode:    &userRoleInfo.RoleCode,
			RoleName:    &userRoleInfo.RoleName,
			Description: &userRoleInfo.Description,
		}
		roles = append(roles, roleData)
	}

	logs.CtxInfof(ctx, "retrieved %d roles for user %s", len(roles), req.UserID)

	return &permission1.GetUserRolesResponse{
		Code: 0,
		Msg:  "success",
		Data: roles,
	}, nil
}

// UnassignUserRoles removes multiple roles from a single user
func (p *PermissionApplicationService) UnassignUserRoles(ctx context.Context, req *permission1.UnassignUserRolesRequest) (*permission1.UnassignUserRolesResponse, error) {
	// Get user ID from context to ensure user is authenticated
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Validate input
	if len(req.RoleIds) == 0 {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "role_ids cannot be empty"))
	}

	// Parse user_id from string to int64
	userID := parseInt64FromString(req.UserID)
	if userID <= 0 {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid user_id format"))
	}

	// Convert string role IDs to int64
	roleIDs := make([]int64, 0, len(req.RoleIds))
	for _, roleIDStr := range req.RoleIds {
		roleID := parseInt64FromString(roleIDStr)
		if roleID <= 0 {
			logs.CtxErrorf(ctx, "invalid role_id: %s", roleIDStr)
			return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "invalid role_id format"))
		}
		roleIDs = append(roleIDs, roleID)
	}

	// Get user's current roles to validate the roles exist and are assigned
	getUserRolesReq := &service.GetUserRolesRequest{UserID: userID}
	currentUserRolesResp, err := p.DomainSVC.UserRoleService.GetUserRoles(ctx, getUserRolesReq)
	if err != nil {
		logs.CtxErrorf(ctx, "get current user roles failed for user %d, err: %v", userID, err)
		return nil, err
	}

	// Build current role IDs set for validation
	currentRoleIDs := make(map[int64]string) // roleID -> roleCode
	for _, userRole := range currentUserRolesResp.UserRoles {
		// Get role code for each current role
		getRoleReq := &service.GetRoleByIDRequest{ID: userRole.RoleID}
		roleResp, err := p.DomainSVC.RoleService.GetRoleByID(ctx, getRoleReq)
		if err != nil {
			logs.CtxWarnf(ctx, "get current role failed for roleID %d, err: %v", userRole.RoleID, err)
			continue
		}
		currentRoleIDs[userRole.RoleID] = roleResp.Role.RoleCode
	}

	// Validate that all roles to unassign are currently assigned to the user
	var rolesToRemove []int64
	roleCodesToRemove := make(map[int64]string) // roleID -> roleCode

	for _, roleID := range roleIDs {
		if roleCode, exists := currentRoleIDs[roleID]; exists {
			rolesToRemove = append(rolesToRemove, roleID)
			roleCodesToRemove[roleID] = roleCode
		} else {
			// Role is not assigned to user, log warning but don't fail
			logs.CtxWarnf(ctx, "role %d is not assigned to user %d, skipping", roleID, userID)
		}
	}

	// If no valid roles to remove, return success
	if len(rolesToRemove) == 0 {
		logs.CtxInfof(ctx, "no roles to remove for user %d", userID)
		return &permission1.UnassignUserRolesResponse{
			Code: 0,
			Msg:  "success",
		}, nil
	}

	// Process role removals
	for _, roleID := range rolesToRemove {
		removeReq := &service.RemoveUserFromRoleRequest{
			UserID: userID,
			RoleID: roleID,
		}

		if err := p.DomainSVC.UserRoleService.RemoveUserFromRole(ctx, removeReq); err != nil {
			logs.CtxErrorf(ctx, "remove user %d from role %d failed, err: %v", userID, roleID, err)
			return nil, err
		}

		logs.CtxInfof(ctx, "successfully removed user %d from role %d", userID, roleID)
	}

	// Remove casbin group rules for unassigned roles
	userIDStr := req.UserID
	for _, roleID := range rolesToRemove {
		if roleCode, exists := roleCodesToRemove[roleID]; exists {
			if err := p.removeUserRoleGroupPolicy(ctx, userIDStr, roleCode); err != nil {
				logs.CtxWarnf(ctx, "delete casbin group policy failed for user %s, role %s, err: %v", userIDStr, roleCode, err)
			} else {
				logs.CtxInfof(ctx, "deleted casbin group policy: user %s -> role %s", userIDStr, roleCode)
			}
		}
	}

	logs.CtxInfof(ctx, "successfully removed %d roles from user %d", len(rolesToRemove), userID)

	return &permission1.UnassignUserRolesResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// ResetUserPassword resets a user's password by email
func (p *PermissionApplicationService) ResetUserPassword(ctx context.Context, req *permission1.ResetUserPasswordRequest) (*permission1.ResetUserPasswordResponse, error) {
	// Get user ID from context to ensure user is authenticated
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Validate input
	if req.Email == "" {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "email cannot be empty"))
	}
	if req.NewPassword == "" {
		return nil, errorx.New(errno.ErrPermissionInvalidParamCode, errorx.KV("msg", "new_password cannot be empty"))
	}

	// Call crossdomain user service to reset password
	resetReq := &crossuser.ResetUserPasswordRequest{
		Email:       req.Email,
		NewPassword: req.NewPassword,
	}

	if err := crossuser.DefaultSVC().ResetUserPassword(ctx, resetReq); err != nil {
		logs.CtxErrorf(ctx, "reset user password failed for email %s, err: %v", req.Email, err)
		return nil, err
	}

	logs.CtxInfof(ctx, "successfully reset password for user email %s", req.Email)

	return &permission1.ResetUserPasswordResponse{
		Code: 0,
		Msg:  "success",
	}, nil
}

// parseInt64FromString parses string to int64, returns 0 if invalid
func parseInt64FromString(s string) int64 {
	// Try to parse as int64
	if val, err := strconv.ParseInt(s, 10, 64); err == nil {
		return val
	}
	return 0
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
