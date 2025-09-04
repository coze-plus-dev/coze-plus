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
	"fmt"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
)

// UserRoleServiceImpl implements UserRoleService interface
// Note: Only manages global roles now, space roles are managed separately
type UserRoleServiceImpl struct {
	userRoleRepo repository.UserRoleRepo
	roleRepo     repository.RoleRepo
	templateRepo repository.PermissionTemplateRepo
}

// NewUserRoleService creates a new user role service
func NewUserRoleService(userRoleRepo repository.UserRoleRepo, roleRepo repository.RoleRepo, templateRepo repository.PermissionTemplateRepo) UserRoleService {
	return &UserRoleServiceImpl{
		userRoleRepo: userRoleRepo,
		roleRepo:     roleRepo,
		templateRepo: templateRepo,
	}
}

// AssignUserToRole assigns a user to a global role
func (u *UserRoleServiceImpl) AssignUserToRole(ctx context.Context, request *AssignUserToRoleRequest) error {
	// Check if role exists
	role, err := u.roleRepo.GetByID(ctx, request.RoleID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return fmt.Errorf("role with ID %d not found", request.RoleID)
	}

	// Check if role is global domain
	if role.RoleDomain != entity.RoleDomainGlobal {
		return fmt.Errorf("only global roles can be assigned through this service")
	}

	// Check if role is disabled
	if role.IsDisabled == entity.RoleStatusDisabled {
		return fmt.Errorf("cannot assign disabled role")
	}

	// Check if user already has this role
	exists, err := u.userRoleRepo.CheckUserHasRole(ctx, request.UserID, request.RoleID)
	if err != nil {
		return fmt.Errorf("failed to check existing role assignment: %w", err)
	}
	if exists {
		return nil // Already assigned, no error
	}

	// Assign user to role
	if err := u.userRoleRepo.AssignUserToRole(ctx, request.UserID, request.RoleID, request.AssignedBy); err != nil {
		return fmt.Errorf("failed to assign user to role: %w", err)
	}

	return nil
}

// RemoveUserFromRole removes a user from a global role
func (u *UserRoleServiceImpl) RemoveUserFromRole(ctx context.Context, request *RemoveUserFromRoleRequest) error {
	// Check if user has this role
	exists, err := u.userRoleRepo.CheckUserHasRole(ctx, request.UserID, request.RoleID)
	if err != nil {
		return fmt.Errorf("failed to check role assignment: %w", err)
	}
	if !exists {
		return nil // Not assigned, no error
	}

	if err := u.userRoleRepo.RemoveUserFromRole(ctx, request.UserID, request.RoleID); err != nil {
		return fmt.Errorf("failed to remove user from role: %w", err)
	}

	return nil
}

// GetUserRoles gets user global roles
func (u *UserRoleServiceImpl) GetUserRoles(ctx context.Context, request *GetUserRolesRequest) (*GetUserRolesResponse, error) {
	userRoles, err := u.userRoleRepo.GetUserRoles(ctx, request.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}

	return &GetUserRolesResponse{
		UserRoles: userRoles,
	}, nil
}

// ListUserRoles lists user roles with pagination and filters
func (u *UserRoleServiceImpl) ListUserRoles(ctx context.Context, request *ListUserRolesRequest) (*ListUserRolesResponse, error) {
	filter := &entity.UserRoleListFilter{
		UserID: request.UserID,
		RoleID: request.RoleID,
		Page:   request.Page,
		Limit:  request.Limit,
	}

	userRoles, total, err := u.userRoleRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list user roles: %w", err)
	}

	return &ListUserRolesResponse{
		UserRoles: userRoles,
		Total:     total,
		Page:      request.Page,
		Limit:     request.Limit,
	}, nil
}

// GetRoleUsers gets users assigned to a specific global role
func (u *UserRoleServiceImpl) GetRoleUsers(ctx context.Context, request *GetRoleUsersRequest) (*GetRoleUsersResponse, error) {
	userRoles, err := u.userRoleRepo.GetRoleUsers(ctx, request.RoleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role users: %w", err)
	}

	return &GetRoleUsersResponse{
		UserRoles: userRoles,
	}, nil
}

// BatchAssignUsersToRole assigns multiple users to a global role
func (u *UserRoleServiceImpl) BatchAssignUsersToRole(ctx context.Context, request *BatchAssignUsersToRoleRequest) error {
	// Check if role exists and is global
	role, err := u.roleRepo.GetByID(ctx, request.RoleID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return fmt.Errorf("role with ID %d not found", request.RoleID)
	}
	if role.RoleDomain != entity.RoleDomainGlobal {
		return fmt.Errorf("only global roles can be assigned through this service")
	}

	// Batch assign users to role
	if err := u.userRoleRepo.BatchAssignUsersToRole(ctx, request.UserIDs, request.RoleID, request.AssignedBy); err != nil {
		return fmt.Errorf("failed to batch assign users to role: %w", err)
	}

	return nil
}

// BatchRemoveUsersFromRole removes multiple users from a global role
func (u *UserRoleServiceImpl) BatchRemoveUsersFromRole(ctx context.Context, request *BatchRemoveUsersFromRoleRequest) error {
	if err := u.userRoleRepo.BatchRemoveUsersFromRole(ctx, request.UserIDs, request.RoleID); err != nil {
		return fmt.Errorf("failed to batch remove users from role: %w", err)
	}

	return nil
}

// GetUsersByRoleCode gets users assigned to roles with specific role code
func (u *UserRoleServiceImpl) GetUsersByRoleCode(ctx context.Context, roleCode string) ([]int64, error) {
	userIDs, err := u.userRoleRepo.GetUsersByRoleCode(ctx, roleCode)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by role code: %w", err)
	}

	return userIDs, nil
}

// GetUserRolesWithRoleInfo gets user roles with role info using JOIN query  
func (u *UserRoleServiceImpl) GetUserRolesWithRoleInfo(ctx context.Context, request *GetUserRolesRequest) (*GetUserRolesWithRoleInfoResponse, error) {
	results, err := u.userRoleRepo.GetUserRolesWithRoleInfo(ctx, request.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles with role info: %w", err)
	}

	return &GetUserRolesWithRoleInfoResponse{
		UserRoleInfos: results,
	}, nil
}

// CountRoleUsers counts users assigned to a role
func (u *UserRoleServiceImpl) CountRoleUsers(ctx context.Context, roleID int64) (int64, error) {
	count, err := u.userRoleRepo.CountRoleUsers(ctx, roleID)
	if err != nil {
		return 0, fmt.Errorf("failed to count role users: %w", err)
	}

	return count, nil
}

// CheckUserPermission checks if user has specific permission (placeholder - should integrate with Casbin)
func (u *UserRoleServiceImpl) CheckUserPermission(ctx context.Context, request *CheckUserPermissionRequest) (*CheckUserPermissionResponse, error) {
	// This is a simplified implementation
	// In a full implementation, this should integrate with Casbin for permission checking
	// For now, we'll just check if user has any global roles
	userRoles, err := u.userRoleRepo.GetUserRoles(ctx, request.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}

	// Simple permission check - if user has any global roles, assume they have permission
	// This should be replaced with proper Casbin integration
	hasPermission := len(userRoles) > 0

	return &CheckUserPermissionResponse{
		HasPermission: hasPermission,
	}, nil
}