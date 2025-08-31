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

/*
 * Copyright 2025 coze-dev Authors
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

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
)

// UserRoleServiceImpl implements UserRoleService interface
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

// AssignUserToRole assigns a user to a role
func (u *UserRoleServiceImpl) AssignUserToRole(ctx context.Context, request *AssignUserToRoleRequest) error {
	// Check if role exists
	role, err := u.roleRepo.GetByID(ctx, request.RoleID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return fmt.Errorf("role with ID %d not found", request.RoleID)
	}
	
	// Check if role is disabled
	if role.IsDisabled == entity.RoleStatusDisabled {
		return fmt.Errorf("cannot assign disabled role")
	}
	
	// Check if user already has this role
	exists, err := u.userRoleRepo.CheckUserHasRole(ctx, request.UserID, request.RoleID, request.SpaceID)
	if err != nil {
		return fmt.Errorf("failed to check existing role assignment: %w", err)
	}
	if exists {
		return nil // Already assigned, no error
	}
	
	// Assign user to role
	if err := u.userRoleRepo.AssignUserToRole(ctx, request.UserID, request.RoleID, request.SpaceID, request.AssignedBy); err != nil {
		return fmt.Errorf("failed to assign user to role: %w", err)
	}
	
	return nil
}

// RemoveUserFromRole removes a user from a role
func (u *UserRoleServiceImpl) RemoveUserFromRole(ctx context.Context, request *RemoveUserFromRoleRequest) error {
	// Check if user has this role
	exists, err := u.userRoleRepo.CheckUserHasRole(ctx, request.UserID, request.RoleID, request.SpaceID)
	if err != nil {
		return fmt.Errorf("failed to check role assignment: %w", err)
	}
	if !exists {
		return nil // Not assigned, no error
	}
	
	if err := u.userRoleRepo.RemoveUserFromRole(ctx, request.UserID, request.RoleID, request.SpaceID); err != nil {
		return fmt.Errorf("failed to remove user from role: %w", err)
	}
	
	return nil
}

// GetUserRoles gets user roles
func (u *UserRoleServiceImpl) GetUserRoles(ctx context.Context, request *GetUserRolesRequest) (*GetUserRolesResponse, error) {
	userRoles, err := u.userRoleRepo.GetUserRoles(ctx, request.UserID, request.SpaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	
	return &GetUserRolesResponse{
		UserRoles: userRoles,
	}, nil
}

// GetRoleUsers gets role users with pagination
func (u *UserRoleServiceImpl) GetRoleUsers(ctx context.Context, request *GetRoleUsersRequest) (*GetRoleUsersResponse, error) {
	filter := &entity.UserRoleListFilter{
		RoleID:  &request.RoleID,
		SpaceID: request.SpaceID,
		Page:    request.Page,
		Limit:   request.Limit,
	}
	
	userRoles, total, err := u.userRoleRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get role users: %w", err)
	}
	
	hasMore := int64(request.Page*request.Limit) < total
	
	return &GetRoleUsersResponse{
		UserRoles: userRoles,
		Total:     total,
		HasMore:   hasMore,
	}, nil
}

// CheckUserPermission checks if user has specific permission
func (u *UserRoleServiceImpl) CheckUserPermission(ctx context.Context, request *CheckUserPermissionRequest) (*CheckUserPermissionResponse, error) {
	// Get user roles (both global and space-specific if spaceID provided)
	var userRoles []*entity.UserRole
	
	// Get global roles
	globalRoles, err := u.userRoleRepo.GetUserGlobalRoles(ctx, request.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user global roles: %w", err)
	}
	userRoles = append(userRoles, globalRoles...)
	
	// Get space roles if space ID provided
	if request.SpaceID != nil && *request.SpaceID > 0 {
		spaceRoles, err := u.userRoleRepo.GetUserSpaceRoles(ctx, request.UserID, *request.SpaceID)
		if err != nil {
			return nil, fmt.Errorf("failed to get user space roles: %w", err)
		}
		userRoles = append(userRoles, spaceRoles...)
	}
	
	// Check permissions for each role
	for _, userRole := range userRoles {
		role, err := u.roleRepo.GetByID(ctx, userRole.RoleID)
		if err != nil {
			continue // Skip on error
		}
		if role == nil || role.IsDisabled == entity.RoleStatusDisabled {
			continue // Skip disabled roles
		}
		
		// Check if role is super admin
		if role.SuperAdmin == 1 {
			return &CheckUserPermissionResponse{
				HasPermission: true,
			}, nil
		}
		
		// Parse role permissions and check
		if hasPermission := u.checkPermissionInRole(role.Permissions, request.Resource, request.Action); hasPermission {
			return &CheckUserPermissionResponse{
				HasPermission: true,
			}, nil
		}
	}
	
	return &CheckUserPermissionResponse{
		HasPermission: false,
	}, nil
}

// GetUserGlobalRoles gets user's global roles
func (u *UserRoleServiceImpl) GetUserGlobalRoles(ctx context.Context, request *GetUserGlobalRolesRequest) (*GetUserGlobalRolesResponse, error) {
	userRoles, err := u.userRoleRepo.GetUserGlobalRoles(ctx, request.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user global roles: %w", err)
	}
	
	return &GetUserGlobalRolesResponse{
		UserRoles: userRoles,
	}, nil
}

// GetUserSpaceRoles gets user's roles in a specific space
func (u *UserRoleServiceImpl) GetUserSpaceRoles(ctx context.Context, request *GetUserSpaceRolesRequest) (*GetUserSpaceRolesResponse, error) {
	userRoles, err := u.userRoleRepo.GetUserSpaceRoles(ctx, request.UserID, request.SpaceID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user space roles: %w", err)
	}
	
	return &GetUserSpaceRolesResponse{
		UserRoles: userRoles,
	}, nil
}

// BatchAssignUsersToRole assigns multiple users to a role
func (u *UserRoleServiceImpl) BatchAssignUsersToRole(ctx context.Context, request *BatchAssignUsersToRoleRequest) error {
	// Check if role exists
	role, err := u.roleRepo.GetByID(ctx, request.RoleID)
	if err != nil {
		return fmt.Errorf("failed to get role: %w", err)
	}
	if role == nil {
		return fmt.Errorf("role with ID %d not found", request.RoleID)
	}
	
	// Check if role is disabled
	if role.IsDisabled == entity.RoleStatusDisabled {
		return fmt.Errorf("cannot assign disabled role")
	}
	
	if err := u.userRoleRepo.BatchAssignUsersToRole(ctx, request.UserIDs, request.RoleID, request.SpaceID, request.AssignedBy); err != nil {
		return fmt.Errorf("failed to batch assign users to role: %w", err)
	}
	
	return nil
}

// BatchRemoveUsersFromRole removes multiple users from a role
func (u *UserRoleServiceImpl) BatchRemoveUsersFromRole(ctx context.Context, request *BatchRemoveUsersFromRoleRequest) error {
	if err := u.userRoleRepo.BatchRemoveUsersFromRole(ctx, request.UserIDs, request.RoleID, request.SpaceID); err != nil {
		return fmt.Errorf("failed to batch remove users from role: %w", err)
	}
	
	return nil
}

// checkPermissionInRole checks if role permissions contain specific resource and action
func (u *UserRoleServiceImpl) checkPermissionInRole(permissions, resource, action string) bool {
	if permissions == "" {
		return false
	}
	
	// Try to parse as permission template groups format
	var permissionGroups []map[string]interface{}
	if err := json.Unmarshal([]byte(permissions), &permissionGroups); err == nil {
		return u.checkPermissionInGroups(permissionGroups, resource, action)
	}
	
	// Try to parse as simple permission map
	var permissionMap map[string]interface{}
	if err := json.Unmarshal([]byte(permissions), &permissionMap); err == nil {
		return u.checkPermissionInMap(permissionMap, resource, action)
	}
	
	return false
}

// checkPermissionInGroups checks permission in template groups format
func (u *UserRoleServiceImpl) checkPermissionInGroups(groups []map[string]interface{}, resource, action string) bool {
	for _, group := range groups {
		if resources, ok := group["resources"].([]interface{}); ok {
			for _, res := range resources {
				if resourceMap, ok := res.(map[string]interface{}); ok {
					if resourceName, ok := resourceMap["resource"].(string); ok && resourceName == resource {
						if actions, ok := resourceMap["actions"].([]interface{}); ok {
							for _, act := range actions {
								if actionMap, ok := act.(map[string]interface{}); ok {
									if actionName, ok := actionMap["action"].(string); ok && actionName == action {
										return true
									}
								}
							}
						}
					}
				}
			}
		}
	}
	return false
}

// checkPermissionInMap checks permission in simple map format
func (u *UserRoleServiceImpl) checkPermissionInMap(permissionMap map[string]interface{}, resource, action string) bool {
	if resourcePerms, ok := permissionMap[resource]; ok {
		if resourceMap, ok := resourcePerms.(map[string]interface{}); ok {
			if actionPerm, ok := resourceMap[action]; ok {
				if allowed, ok := actionPerm.(bool); ok {
					return allowed
				}
				// If value is not boolean, assume true if exists
				return true
			}
		}
		// If resource exists but action not found, check for wildcard
		if resourceMap, ok := resourcePerms.(map[string]interface{}); ok {
			if wildcardPerm, ok := resourceMap["*"]; ok {
				if allowed, ok := wildcardPerm.(bool); ok {
					return allowed
				}
				return true
			}
		}
	}
	
	// Check for wildcard resource permission
	if wildcardPerms, ok := permissionMap["*"]; ok {
		if wildcardMap, ok := wildcardPerms.(map[string]interface{}); ok {
			if actionPerm, ok := wildcardMap[action]; ok {
				if allowed, ok := actionPerm.(bool); ok {
					return allowed
				}
				return true
			}
			if wildcardAction, ok := wildcardMap["*"]; ok {
				if allowed, ok := wildcardAction.(bool); ok {
					return allowed
				}
				return true
			}
		}
	}
	
	return false
}