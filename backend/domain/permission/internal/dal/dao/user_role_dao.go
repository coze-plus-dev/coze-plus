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

package dao

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

type UserRoleDAO struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
	Query *query.Query
}

// NewUserRoleDAO creates a new user role DAO
func NewUserRoleDAO(db *gorm.DB, idGen idgen.IDGenerator) *UserRoleDAO {
	return &UserRoleDAO{
		DB:    db,
		IDGen: idGen,
		Query: query.Use(db),
	}
}

// Create creates a new user role assignment (global roles only)
func (u *UserRoleDAO) Create(ctx context.Context, userRole *entity.UserRole) (*entity.UserRole, error) {
	if userRole.ID == 0 {
		id, err := u.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		userRole.ID = id
	}

	dbUserRole := &model.UserRole{
		ID:         userRole.ID,
		UserID:     userRole.UserID,
		RoleID:     userRole.RoleID,
		AssignedBy: userRole.AssignedBy,
		AssignedAt: userRole.AssignedAt.Unix(),
	}

	if userRole.ExpiredAt != nil {
		dbUserRole.ExpiredAt = userRole.ExpiredAt.Unix()
	}

	if err := u.Query.UserRole.WithContext(ctx).Create(dbUserRole); err != nil {
		return nil, err
	}

	return u.convertToEntity(dbUserRole), nil
}

// GetByID gets a user role by ID
func (u *UserRoleDAO) GetByID(ctx context.Context, id int64) (*entity.UserRole, error) {
	dbUserRole, err := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	return u.convertToEntity(dbUserRole), nil
}

// Update updates a user role
func (u *UserRoleDAO) Update(ctx context.Context, userRole *entity.UserRole) error {
	updates := map[string]interface{}{
		"user_id":     userRole.UserID,
		"role_id":     userRole.RoleID,
		"assigned_by": userRole.AssignedBy,
		"assigned_at": userRole.AssignedAt.Unix(),
	}

	if userRole.ExpiredAt != nil {
		updates["expired_at"] = userRole.ExpiredAt.Unix()
	} else {
		updates["expired_at"] = gorm.Expr("NULL")
	}

	_, err := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.ID.Eq(userRole.ID)).Updates(updates)
	return err
}

// Delete soft deletes a user role
func (u *UserRoleDAO) Delete(ctx context.Context, id int64) error {
	_, err := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.ID.Eq(id)).Delete()
	return err
}

// List lists user roles with pagination and filters
func (u *UserRoleDAO) List(ctx context.Context, filter *entity.UserRoleListFilter) ([]*entity.UserRole, int64, error) {
	q := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.DeletedAt.IsNull()) // Only active assignments

	// Apply filters
	if filter.UserID != nil {
		q = q.Where(u.Query.UserRole.UserID.Eq(*filter.UserID))
	}
	if filter.RoleID != nil {
		q = q.Where(u.Query.UserRole.RoleID.Eq(*filter.RoleID))
	}

	// Get total count
	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (filter.Page - 1) * filter.Limit
	dbUserRoles, err := q.Offset(offset).Limit(filter.Limit).Order(u.Query.UserRole.AssignedAt.Desc()).Find()
	if err != nil {
		return nil, 0, err
	}

	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}

	return userRoles, total, nil
}

// GetUserRoles gets all active global roles assigned to a user
func (u *UserRoleDAO) GetUserRoles(ctx context.Context, userID int64) ([]*entity.UserRole, error) {
	dbUserRoles, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.DeletedAt.IsNull()). // Only active assignments
		Find()
	if err != nil {
		return nil, err
	}

	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}

	return userRoles, nil
}

// GetRoleUsers gets all users actively assigned to a specific role
func (u *UserRoleDAO) GetRoleUsers(ctx context.Context, roleID int64) ([]*entity.UserRole, error) {
	dbUserRoles, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.RoleID.Eq(roleID)).
		Where(u.Query.UserRole.DeletedAt.IsNull()). // Only active assignments
		Find()
	if err != nil {
		return nil, err
	}

	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}

	return userRoles, nil
}

// CheckUserHasRole checks if user has a specific global role (active assignment only)
func (u *UserRoleDAO) CheckUserHasRole(ctx context.Context, userID, roleID int64) (bool, error) {
	count, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.RoleID.Eq(roleID)).
		Where(u.Query.UserRole.DeletedAt.IsNull()). // Only active (not soft deleted) assignments
		Count()
	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// AssignUserToRole assigns a user to a global role
func (u *UserRoleDAO) AssignUserToRole(ctx context.Context, userID, roleID int64, assignedBy int64) error {
	// Check if already exists
	exists, err := u.CheckUserHasRole(ctx, userID, roleID)
	if err != nil {
		return err
	}
	if exists {
		return nil // Already assigned
	}

	id, err := u.IDGen.GenID(ctx)
	if err != nil {
		return err
	}

	userRole := &model.UserRole{
		ID:         id,
		UserID:     userID,
		RoleID:     roleID,
		AssignedBy: assignedBy,
		AssignedAt: time.Now().Unix(),
	}

	return u.Query.UserRole.WithContext(ctx).Create(userRole)
}

// RemoveUserFromRole removes a user from a global role
func (u *UserRoleDAO) RemoveUserFromRole(ctx context.Context, userID, roleID int64) error {
	_, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.RoleID.Eq(roleID)).
		Delete()
	return err
}

// BatchAssignUsersToRole assigns multiple users to a global role
func (u *UserRoleDAO) BatchAssignUsersToRole(ctx context.Context, userIDs []int64, roleID int64, assignedBy int64) error {
	userRoles := make([]*model.UserRole, 0, len(userIDs))
	now := time.Now().Unix()

	for _, userID := range userIDs {
		// Check if already exists
		exists, err := u.CheckUserHasRole(ctx, userID, roleID)
		if err != nil {
			return err
		}
		if exists {
			continue // Skip if already assigned
		}

		id, err := u.IDGen.GenID(ctx)
		if err != nil {
			return err
		}

		userRole := &model.UserRole{
			ID:         id,
			UserID:     userID,
			RoleID:     roleID,
			AssignedBy: assignedBy,
			AssignedAt: now,
		}
		userRoles = append(userRoles, userRole)
	}

	if len(userRoles) == 0 {
		return nil // All users already assigned
	}

	return u.Query.UserRole.WithContext(ctx).CreateInBatches(userRoles, 100)
}

// BatchRemoveUsersFromRole removes multiple users from a global role
func (u *UserRoleDAO) BatchRemoveUsersFromRole(ctx context.Context, userIDs []int64, roleID int64) error {
	_, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.In(userIDs...)).
		Where(u.Query.UserRole.RoleID.Eq(roleID)).
		Delete()
	return err
}

// CountRoleUsers counts active users assigned to a role
func (u *UserRoleDAO) CountRoleUsers(ctx context.Context, roleID int64) (int64, error) {
	return u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.RoleID.Eq(roleID)).
		Where(u.Query.UserRole.DeletedAt.IsNull()). // Only count active assignments
		Count()
}

// GetUsersByRoleCode gets users assigned to roles with specific role code
func (u *UserRoleDAO) GetUsersByRoleCode(ctx context.Context, roleCode string) ([]int64, error) {
	// First get role IDs by role code
	roles, err := u.Query.Role.WithContext(ctx).Where(u.Query.Role.RoleCode.Eq(roleCode)).Find()
	if err != nil {
		return nil, err
	}

	if len(roles) == 0 {
		return []int64{}, nil
	}

	roleIDs := make([]int64, len(roles))
	for i, role := range roles {
		roleIDs[i] = role.ID
	}

	// Get active user roles
	dbUserRoles, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.RoleID.In(roleIDs...)).
		Where(u.Query.UserRole.DeletedAt.IsNull()). // Only active assignments
		Find()
	if err != nil {
		return nil, err
	}

	userIDs := make([]int64, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userIDs[i] = dbUserRole.UserID
	}

	return userIDs, nil
}

// GetUserRolesWithRoleInfo gets user roles with role info using JOIN query
func (u *UserRoleDAO) GetUserRolesWithRoleInfo(ctx context.Context, userID int64) ([]entity.UserRoleWithRole, error) {
	var results []entity.UserRoleWithRole
	err := u.DB.WithContext(ctx).
		Table("user_role ur").
		Select("ur.role_id, r.role_code, r.role_name, r.description").
		Joins("INNER JOIN role r ON ur.role_id = r.id").
		Where("ur.user_id = ? AND ur.deleted_at IS NULL AND r.deleted_at IS NULL", userID).
		Find(&results).Error

	return results, err
}

// convertToEntity converts model to entity
func (u *UserRoleDAO) convertToEntity(dbUserRole *model.UserRole) *entity.UserRole {
	userRole := &entity.UserRole{
		ID:         dbUserRole.ID,
		UserID:     dbUserRole.UserID,
		RoleID:     dbUserRole.RoleID,
		AssignedBy: dbUserRole.AssignedBy,
		AssignedAt: time.Unix(dbUserRole.AssignedAt, 0),
	}

	if dbUserRole.ExpiredAt != 0 {
		expiredAt := time.Unix(dbUserRole.ExpiredAt, 0)
		userRole.ExpiredAt = &expiredAt
	}

	return userRole
}
