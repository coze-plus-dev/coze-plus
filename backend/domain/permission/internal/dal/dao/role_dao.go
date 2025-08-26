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

package dao

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

type RoleDAO struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
	Query *query.Query
}

// Create creates a new role
func (r *RoleDAO) Create(ctx context.Context, role *entity.Role) (*entity.Role, error) {
	if role.ID == 0 {
		id, err := r.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		role.ID = id
	}
	
	now := time.Now()
	
	// Handle permissions field - use empty array if permissions is empty
	permissions := role.Permissions
	if permissions == "" {
		permissions = "[]"
	}
	
	dbRole := &model.Role{
		ID:            role.ID,
		RoleCode:      role.RoleCode,
		RoleName:      role.RoleName,
		RoleDomain:    string(role.RoleDomain),
		SuperAdmin:    role.SuperAdmin,
		SpaceRoleType: int32(role.SpaceRoleType),
		IsBuiltin:     role.IsBuiltin,
		IsDisabled:    int32(role.IsDisabled),
		Permissions:   permissions,
		Description:   role.Description,
		CreatedBy:     role.CreatedBy,
		CreatedAt:     now.UnixMilli(),
		UpdatedAt:     now.UnixMilli(),
	}
	
	if err := r.Query.Role.WithContext(ctx).Create(dbRole); err != nil {
		return nil, err
	}
	
	return r.convertToEntity(dbRole), nil
}

// GetByID gets a role by ID
func (r *RoleDAO) GetByID(ctx context.Context, id int64) (*entity.Role, error) {
	dbRole, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	return r.convertToEntity(dbRole), nil
}

// Update updates a role
func (r *RoleDAO) Update(ctx context.Context, role *entity.Role) error {
	// Handle permissions field - use empty array if permissions is empty
	permissions := role.Permissions
	if permissions == "" {
		permissions = "[]"
	}
	
	updates := map[string]interface{}{
		"role_name":       role.RoleName,
		"role_domain":     string(role.RoleDomain),
		"super_admin":     role.SuperAdmin,
		"space_role_type": int32(role.SpaceRoleType),
		"is_disabled":     int32(role.IsDisabled),
		"permissions":     permissions,
		"description":     role.Description,
		"updated_at":      time.Now().UnixMilli(),
	}
	
	_, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.ID.Eq(role.ID)).Updates(updates)
	return err
}

// Delete deletes a role (soft delete)
func (r *RoleDAO) Delete(ctx context.Context, id int64) error {
	_, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.ID.Eq(id)).Delete()
	return err
}

// List lists roles with pagination and filters
func (r *RoleDAO) List(ctx context.Context, filter *entity.RoleListFilter) ([]*entity.Role, int64, error) {
	q := r.Query.Role.WithContext(ctx)
	
	// Apply filters
	if filter.RoleDomain != nil {
		q = q.Where(r.Query.Role.RoleDomain.Eq(string(*filter.RoleDomain)))
	}
	if filter.SpaceRoleType != nil {
		q = q.Where(r.Query.Role.SpaceRoleType.Eq(int32(*filter.SpaceRoleType)))
	}
	if filter.IsBuiltin != nil {
		q = q.Where(r.Query.Role.IsBuiltin.Eq(*filter.IsBuiltin))
	}
	if filter.IsDisabled != nil {
		q = q.Where(r.Query.Role.IsDisabled.Eq(int32(*filter.IsDisabled)))
	}
	if filter.CreatedBy != nil {
		q = q.Where(r.Query.Role.CreatedBy.Eq(*filter.CreatedBy))
	}
	if filter.Keyword != nil && *filter.Keyword != "" {
		keyword := "%" + *filter.Keyword + "%"
		q = q.Where(r.Query.Role.RoleName.Like(keyword)).Or(r.Query.Role.RoleCode.Like(keyword))
	}
	
	// Get total count
	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}
	
	// Apply pagination and ordering
	offset := (filter.Page - 1) * filter.Limit
	dbRoles, err := q.Offset(offset).Limit(filter.Limit).
		Order(r.Query.Role.CreatedAt.Desc()).
		Order(r.Query.Role.ID.Desc()).Find()
	if err != nil {
		return nil, 0, err
	}
	
	roles := make([]*entity.Role, len(dbRoles))
	for i, dbRole := range dbRoles {
		roles[i] = r.convertToEntity(dbRole)
	}
	
	return roles, total, nil
}

// GetByRoleCode gets a role by role code
func (r *RoleDAO) GetByRoleCode(ctx context.Context, roleCode string) (*entity.Role, error) {
	dbRole, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.RoleCode.Eq(roleCode)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	return r.convertToEntity(dbRole), nil
}

// GetByDomain gets roles by domain
func (r *RoleDAO) GetByDomain(ctx context.Context, domain entity.RoleDomain) ([]*entity.Role, error) {
	dbRoles, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.RoleDomain.Eq(string(domain))).Find()
	if err != nil {
		return nil, err
	}
	
	roles := make([]*entity.Role, len(dbRoles))
	for i, dbRole := range dbRoles {
		roles[i] = r.convertToEntity(dbRole)
	}
	
	return roles, nil
}

// GetBuiltinRoles gets all builtin roles
func (r *RoleDAO) GetBuiltinRoles(ctx context.Context) ([]*entity.Role, error) {
	dbRoles, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.IsBuiltin.Eq(1)).Find()
	if err != nil {
		return nil, err
	}
	
	roles := make([]*entity.Role, len(dbRoles))
	for i, dbRole := range dbRoles {
		roles[i] = r.convertToEntity(dbRole)
	}
	
	return roles, nil
}

// GetRolesByCreator gets roles by creator ID
func (r *RoleDAO) GetRolesByCreator(ctx context.Context, creatorID int64) ([]*entity.Role, error) {
	dbRoles, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.CreatedBy.Eq(creatorID)).Find()
	if err != nil {
		return nil, err
	}
	
	roles := make([]*entity.Role, len(dbRoles))
	for i, dbRole := range dbRoles {
		roles[i] = r.convertToEntity(dbRole)
	}
	
	return roles, nil
}

// UpdateStatus updates role status
func (r *RoleDAO) UpdateStatus(ctx context.Context, id int64, status entity.RoleStatus) error {
	_, err := r.Query.Role.WithContext(ctx).Where(r.Query.Role.ID.Eq(id)).Update(r.Query.Role.IsDisabled, int32(status))
	return err
}

// CheckRoleCodeExists checks if role code exists
func (r *RoleDAO) CheckRoleCodeExists(ctx context.Context, roleCode string, excludeID *int64) (bool, error) {
	q := r.Query.Role.WithContext(ctx).Where(r.Query.Role.RoleCode.Eq(roleCode))
	if excludeID != nil {
		q = q.Where(r.Query.Role.ID.Neq(*excludeID))
	}
	
	count, err := q.Count()
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}

// convertToEntity converts model to entity
func (r *RoleDAO) convertToEntity(dbRole *model.Role) *entity.Role {
	return &entity.Role{
		ID:            dbRole.ID,
		RoleCode:      dbRole.RoleCode,
		RoleName:      dbRole.RoleName,
		RoleDomain:    entity.RoleDomain(dbRole.RoleDomain),
		SuperAdmin:    dbRole.SuperAdmin,
		SpaceRoleType: entity.SpaceRoleType(dbRole.SpaceRoleType),
		IsBuiltin:     dbRole.IsBuiltin,
		IsDisabled:    entity.RoleStatus(dbRole.IsDisabled),
		Permissions:   dbRole.Permissions,
		Description:   dbRole.Description,
		CreatedBy:     dbRole.CreatedBy,
		CreatedAt:     time.UnixMilli(dbRole.CreatedAt),
		UpdatedAt:     time.UnixMilli(dbRole.UpdatedAt),
	}
}