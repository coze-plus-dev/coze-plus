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
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// RoleServiceImpl implements RoleService interface
type RoleServiceImpl struct {
	roleRepo       repository.RoleRepo
	userRoleRepo   repository.UserRoleRepo
	casbinRuleRepo repository.CasbinRuleRepo
}

// NewRoleService creates a new role service
func NewRoleService(roleRepo repository.RoleRepo, userRoleRepo repository.UserRoleRepo, casbinRuleRepo repository.CasbinRuleRepo) RoleService {
	return &RoleServiceImpl{
		roleRepo:       roleRepo,
		userRoleRepo:   userRoleRepo,
		casbinRuleRepo: casbinRuleRepo,
	}
}

// CreateRole creates a new role
func (r *RoleServiceImpl) CreateRole(ctx context.Context, request *CreateRoleRequest) (*CreateRoleResponse, error) {
	// Validate role code uniqueness
	exists, err := r.roleRepo.CheckRoleCodeExists(ctx, request.RoleCode, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to check role code existence: %w", err)
	}
	if exists {
		return nil, errorx.New(errno.ErrPermissionRoleCodeExistsCode, errorx.KV("role_code", request.RoleCode))
	}

	// Validate permissions JSON if provided
	if request.Permissions != "" {
		if err := r.validatePermissionsJSON(request.Permissions); err != nil {
			return nil, errorx.New(errno.ErrPermissionInvalidJSONCode, errorx.KV("msg", err.Error()))
		}
	}

	// Create role entity
	role := &entity.Role{
		RoleCode:      request.RoleCode,
		RoleName:      request.RoleName,
		RoleDomain:    request.RoleDomain,
		SuperAdmin:    0, // User-created roles are not super admin
		SpaceRoleType: request.SpaceRoleType,
		IsBuiltin:     0, // User-created roles are not builtin
		IsDisabled:    entity.RoleStatusActive,
		Permissions:   request.Permissions,
		Description:   request.Description,
		CreatedBy:     request.CreatedBy,
	}

	createdRole, err := r.roleRepo.Create(ctx, role)
	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	return &CreateRoleResponse{
		Role: createdRole,
	}, nil
}

// UpdateRole updates an existing role
func (r *RoleServiceImpl) UpdateRole(ctx context.Context, request *UpdateRoleRequest) error {
	// Check if role exists
	role, err := r.roleRepo.GetByID(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return errorx.New(errno.ErrPermissionRoleNotFoundCode, errorx.KV("role_id", strconv.FormatInt(request.ID, 10)))
	}

	// Check if role is builtin (cannot be modified)
	if role.IsBuiltin == 1 {
		return errorx.New(errno.ErrPermissionRoleBuiltinCode)
	}

	// Update role fields
	if request.RoleName != nil {
		role.RoleName = *request.RoleName
	}
	if request.Permissions != nil {
		if *request.Permissions != "" {
			if err := r.validatePermissionsJSON(*request.Permissions); err != nil {
				return errorx.New(errno.ErrPermissionInvalidJSONCode, errorx.KV("msg", err.Error()))
			}
		}
		role.Permissions = *request.Permissions
	}
	if request.Description != nil {
		role.Description = *request.Description
	}
	if request.IsDisabled != nil {
		role.IsDisabled = *request.IsDisabled
	}

	if err := r.roleRepo.Update(ctx, role); err != nil {
		return fmt.Errorf("failed to update role: %w", err)
	}

	// Sync casbin policies if permissions were updated
	if request.Permissions != nil && *request.Permissions != "" {
		if err := r.syncCasbinPolicies(ctx, role.RoleCode, *request.Permissions); err != nil {
			return fmt.Errorf("failed to sync casbin policies: %w", err)
		}
	}

	return nil
}

// DeleteRole deletes a role
func (r *RoleServiceImpl) DeleteRole(ctx context.Context, request *DeleteRoleRequest) error {
	// Check if role exists
	role, err := r.roleRepo.GetByID(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return errorx.New(errno.ErrPermissionRoleNotFoundCode, errorx.KV("role_id", strconv.FormatInt(request.ID, 10)))
	}

	// Check if role is builtin (cannot be deleted)
	if role.IsBuiltin == 1 {
		return errorx.New(errno.ErrPermissionRoleBuiltinCode)
	}

	// Check if role is in use
	userCount, err := r.userRoleRepo.CountRoleUsers(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to check role usage: %w", err)
	}
	if userCount > 0 {
		return errorx.New(errno.ErrPermissionRoleInUseCode, errorx.KV("user_count", strconv.FormatInt(userCount, 10)))
	}

	if err := r.roleRepo.Delete(ctx, request.ID); err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}

	return nil
}

// GetRoleByID gets a role by ID
func (r *RoleServiceImpl) GetRoleByID(ctx context.Context, request *GetRoleByIDRequest) (*GetRoleByIDResponse, error) {
	role, err := r.roleRepo.GetByID(ctx, request.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return nil, errorx.New(errno.ErrPermissionRoleNotFoundCode, errorx.KV("role_id", strconv.FormatInt(request.ID, 10)))
	}

	return &GetRoleByIDResponse{
		Role: role,
	}, nil
}

// ListRoles lists roles with pagination and filters
func (r *RoleServiceImpl) ListRoles(ctx context.Context, request *ListRolesRequest) (*ListRolesResponse, error) {
	filter := &entity.RoleListFilter{
		RoleDomain:    request.RoleDomain,
		SpaceRoleType: request.SpaceRoleType,
		IsBuiltin:     request.IsBuiltin,
		IsDisabled:    request.IsDisabled,
		Keyword:       request.Keyword,
		CreatedBy:     request.CreatedBy,
		Page:          request.Page,
		Limit:         request.Limit,
	}

	roles, total, err := r.roleRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list roles: %w", err)
	}

	hasMore := int64(request.Page*request.Limit) < total

	return &ListRolesResponse{
		Roles:   roles,
		Total:   total,
		HasMore: hasMore,
	}, nil
}

// GetRoleByCode gets a role by role code
func (r *RoleServiceImpl) GetRoleByCode(ctx context.Context, request *GetRoleByCodeRequest) (*GetRoleByCodeResponse, error) {
	role, err := r.roleRepo.GetByRoleCode(ctx, request.RoleCode)
	if err != nil {
		return nil, fmt.Errorf("failed to get role by code: %w", err)
	}
	if role == nil {
		return nil, fmt.Errorf("role with code '%s' not found", request.RoleCode)
	}

	return &GetRoleByCodeResponse{
		Role: role,
	}, nil
}

// GetRolesByDomain gets roles by domain
func (r *RoleServiceImpl) GetRolesByDomain(ctx context.Context, request *GetRolesByDomainRequest) (*GetRolesByDomainResponse, error) {
	roles, err := r.roleRepo.GetByDomain(ctx, request.Domain)
	if err != nil {
		return nil, fmt.Errorf("failed to get roles by domain: %w", err)
	}

	return &GetRolesByDomainResponse{
		Roles: roles,
	}, nil
}

// GetBuiltinRoles gets all builtin roles
func (r *RoleServiceImpl) GetBuiltinRoles(ctx context.Context, request *GetBuiltinRolesRequest) (*GetBuiltinRolesResponse, error) {
	roles, err := r.roleRepo.GetBuiltinRoles(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get builtin roles: %w", err)
	}

	return &GetBuiltinRolesResponse{
		Roles: roles,
	}, nil
}

// UpdateRoleStatus updates role status
func (r *RoleServiceImpl) UpdateRoleStatus(ctx context.Context, request *UpdateRoleStatusRequest) error {
	// Check if role exists
	role, err := r.roleRepo.GetByID(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return errorx.New(errno.ErrPermissionRoleNotFoundCode, errorx.KV("role_id", strconv.FormatInt(request.ID, 10)))
	}

	// Check if role is builtin (cannot be modified)
	if role.IsBuiltin == 1 {
		return errorx.New(errno.ErrPermissionRoleBuiltinCode)
	}

	if err := r.roleRepo.UpdateStatus(ctx, request.ID, request.Status); err != nil {
		return fmt.Errorf("failed to update role status: %w", err)
	}

	return nil
}

// ValidateRolePermissions validates role permissions JSON format
func (r *RoleServiceImpl) ValidateRolePermissions(ctx context.Context, request *ValidateRolePermissionsRequest) error {
	return r.validatePermissionsJSON(request.Permissions)
}

// validatePermissionsJSON validates permissions JSON format
func (r *RoleServiceImpl) validatePermissionsJSON(permissions string) error {
	if permissions == "" {
		return nil
	}

	// Parse as array format (permissions should be an array of permission groups)
	var permissionArray []interface{}
	if err := json.Unmarshal([]byte(permissions), &permissionArray); err != nil {
		return fmt.Errorf("invalid JSON format: %w", err)
	}

	// Additional validation logic can be added here
	// For example, validate specific permission structure, allowed keys, etc.

	return nil
}

// syncCasbinPolicies synchronizes casbin_rule policies based on permissions JSON
func (r *RoleServiceImpl) syncCasbinPolicies(ctx context.Context, roleCode string, permissionsJSON string) error {
	// Parse permissions JSON
	var permissionArray []interface{}
	if err := json.Unmarshal([]byte(permissionsJSON), &permissionArray); err != nil {
		return fmt.Errorf("invalid permissions JSON: %w", err)
	}

	// Collect policies to create
	var policiesToCreate []*entity.CasbinRule

	// Traverse permissions structure
	for _, permGroup := range permissionArray {
		groupMap, ok := permGroup.(map[string]interface{})
		if !ok {
			continue
		}

		// Get domain from permission group
		domain, ok := groupMap["domain"].(string)
		if !ok {
			continue
		}

		// Get resources from permission group
		resources, ok := groupMap["resources"].([]interface{})
		if !ok {
			continue
		}

		// Process each resource
		for _, resource := range resources {
			resourceMap, ok := resource.(map[string]interface{})
			if !ok {
				continue
			}

			resourceType, ok := resourceMap["resource"].(string)
			if !ok {
				continue
			}

			// Get actions from resource
			actions, ok := resourceMap["actions"].([]interface{})
			if !ok {
				continue
			}

			// Process each action
			for _, action := range actions {
				actionMap, ok := action.(map[string]interface{})
				if !ok {
					continue
				}

				actionName, ok := actionMap["action"].(string)
				if !ok {
					continue
				}

				// Check is_default flag
				isDefaultInterface, exists := actionMap["is_default"]
				if !exists {
					continue
				}

				// Handle is_default as both float64 (from JSON) and int
				var isDefault int
				switch v := isDefaultInterface.(type) {
				case float64:
					isDefault = int(v)
				case int:
					isDefault = v
				default:
					continue
				}

				// Handle casbin policy based on is_default value:
				// - is_default = 1: create "allow" policy
				// - is_default = 0: don't create policy (will be deleted by sync operation)
				if isDefault == 1 {
					policy := entity.NewCasbinRule(roleCode, domain, resourceType, actionName, "allow")
					policiesToCreate = append(policiesToCreate, policy)
				}
				// Note: When is_default = 0, we don't add any policy to policiesToCreate.
				// The SyncRolePolicies method will delete all existing policies for this role
				// and only create the policies in policiesToCreate, effectively removing
				// any policies for actions with is_default = 0.
			}
		}
	}

	// Sync policies in database (delete existing + create new)
	if err := r.casbinRuleRepo.SyncRolePolicies(ctx, roleCode, policiesToCreate); err != nil {
		return fmt.Errorf("failed to sync role policies: %w", err)
	}

	return nil
}
