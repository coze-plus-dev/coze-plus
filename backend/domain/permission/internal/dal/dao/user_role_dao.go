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

// Create creates a new user role
func (u *UserRoleDAO) Create(ctx context.Context, userRole *entity.UserRole) (*entity.UserRole, error) {
	if userRole.ID == 0 {
		id, err := u.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		userRole.ID = id
	}
	
	var spaceID int64
	if userRole.SpaceID != nil {
		spaceID = *userRole.SpaceID
	}
	
	dbUserRole := &model.UserRole{
		ID:         userRole.ID,
		UserID:     userRole.UserID,
		RoleID:     userRole.RoleID,
		SpaceID:    spaceID,
		AssignedBy: userRole.AssignedBy,
		AssignedAt: userRole.AssignedAt.Unix(),
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
	var spaceID int64
	if userRole.SpaceID != nil {
		spaceID = *userRole.SpaceID
	}
	
	updates := map[string]interface{}{
		"user_id":     userRole.UserID,
		"role_id":     userRole.RoleID,
		"space_id":    spaceID,
		"assigned_by": userRole.AssignedBy,
		"assigned_at": userRole.AssignedAt.Unix(),
	}
	
	_, err := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.ID.Eq(userRole.ID)).Updates(updates)
	return err
}

// Delete deletes a user role
func (u *UserRoleDAO) Delete(ctx context.Context, id int64) error {
	_, err := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.ID.Eq(id)).Delete()
	return err
}

// List lists user roles with pagination and filters
func (u *UserRoleDAO) List(ctx context.Context, filter *entity.UserRoleListFilter) ([]*entity.UserRole, int64, error) {
	q := u.Query.UserRole.WithContext(ctx)
	
	// Apply filters
	if filter.UserID != nil {
		q = q.Where(u.Query.UserRole.UserID.Eq(*filter.UserID))
	}
	if filter.RoleID != nil {
		q = q.Where(u.Query.UserRole.RoleID.Eq(*filter.RoleID))
	}
	if filter.SpaceID != nil {
		if *filter.SpaceID == 0 {
			// Query for global roles (space_id is null)
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*filter.SpaceID))
		}
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

// GetUserRoles gets user roles by user ID and optional space ID
func (u *UserRoleDAO) GetUserRoles(ctx context.Context, userID int64, spaceID *int64) ([]*entity.UserRole, error) {
	q := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.UserID.Eq(userID))
	
	if spaceID != nil {
		if *spaceID == 0 {
			// Query for global roles (space_id is null)
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*spaceID))
		}
	}
	
	dbUserRoles, err := q.Find()
	if err != nil {
		return nil, err
	}
	
	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}
	
	return userRoles, nil
}

// GetRoleUsers gets role users by role ID and optional space ID
func (u *UserRoleDAO) GetRoleUsers(ctx context.Context, roleID int64, spaceID *int64) ([]*entity.UserRole, error) {
	q := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.RoleID.Eq(roleID))
	
	if spaceID != nil {
		if *spaceID == 0 {
			// Query for global roles (space_id is null)
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*spaceID))
		}
	}
	
	dbUserRoles, err := q.Find()
	if err != nil {
		return nil, err
	}
	
	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}
	
	return userRoles, nil
}

// CheckUserHasRole checks if user has a specific role
func (u *UserRoleDAO) CheckUserHasRole(ctx context.Context, userID, roleID int64, spaceID *int64) (bool, error) {
	q := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.RoleID.Eq(roleID))
		
	if spaceID != nil {
		if *spaceID == 0 {
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*spaceID))
		}
	}
	
	count, err := q.Count()
	if err != nil {
		return false, err
	}
	
	return count > 0, nil
}

// AssignUserToRole assigns a user to a role
func (u *UserRoleDAO) AssignUserToRole(ctx context.Context, userID, roleID int64, spaceID *int64, assignedBy int64) error {
	// Check if already exists
	exists, err := u.CheckUserHasRole(ctx, userID, roleID, spaceID)
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
	
	var dbSpaceID int64
	if spaceID != nil {
		dbSpaceID = *spaceID
	}
	
	userRole := &model.UserRole{
		ID:         id,
		UserID:     userID,
		RoleID:     roleID,
		SpaceID:    dbSpaceID,
		AssignedBy: assignedBy,
		AssignedAt: time.Now().Unix(),
	}
	
	return u.Query.UserRole.WithContext(ctx).Create(userRole)
}

// RemoveUserFromRole removes a user from a role
func (u *UserRoleDAO) RemoveUserFromRole(ctx context.Context, userID, roleID int64, spaceID *int64) error {
	q := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.RoleID.Eq(roleID))
		
	if spaceID != nil {
		if *spaceID == 0 {
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*spaceID))
		}
	}
	
	_, err := q.Delete()
	return err
}

// GetUserGlobalRoles gets user's global roles
func (u *UserRoleDAO) GetUserGlobalRoles(ctx context.Context, userID int64) ([]*entity.UserRole, error) {
	dbUserRoles, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.SpaceID.IsNull()).Find()
	if err != nil {
		return nil, err
	}
	
	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}
	
	return userRoles, nil
}

// GetUserSpaceRoles gets user's roles in a specific space
func (u *UserRoleDAO) GetUserSpaceRoles(ctx context.Context, userID, spaceID int64) ([]*entity.UserRole, error) {
	dbUserRoles, err := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.Eq(userID)).
		Where(u.Query.UserRole.SpaceID.Eq(spaceID)).Find()
	if err != nil {
		return nil, err
	}
	
	userRoles := make([]*entity.UserRole, len(dbUserRoles))
	for i, dbUserRole := range dbUserRoles {
		userRoles[i] = u.convertToEntity(dbUserRole)
	}
	
	return userRoles, nil
}

// BatchAssignUsersToRole assigns multiple users to a role
func (u *UserRoleDAO) BatchAssignUsersToRole(ctx context.Context, userIDs []int64, roleID int64, spaceID *int64, assignedBy int64) error {
	userRoles := make([]*model.UserRole, 0, len(userIDs))
	now := time.Now().Unix()
	
	var dbSpaceID int64
	if spaceID != nil {
		dbSpaceID = *spaceID
	}
	
	for _, userID := range userIDs {
		// Check if already exists
		exists, err := u.CheckUserHasRole(ctx, userID, roleID, spaceID)
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
			SpaceID:    dbSpaceID,
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

// BatchRemoveUsersFromRole removes multiple users from a role
func (u *UserRoleDAO) BatchRemoveUsersFromRole(ctx context.Context, userIDs []int64, roleID int64, spaceID *int64) error {
	q := u.Query.UserRole.WithContext(ctx).
		Where(u.Query.UserRole.UserID.In(userIDs...)).
		Where(u.Query.UserRole.RoleID.Eq(roleID))
		
	if spaceID != nil {
		if *spaceID == 0 {
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*spaceID))
		}
	}
	
	_, err := q.Delete()
	return err
}

// CountRoleUsers counts users assigned to a role
func (u *UserRoleDAO) CountRoleUsers(ctx context.Context, roleID int64, spaceID *int64) (int64, error) {
	q := u.Query.UserRole.WithContext(ctx).Where(u.Query.UserRole.RoleID.Eq(roleID))
	
	if spaceID != nil {
		if *spaceID == 0 {
			q = q.Where(u.Query.UserRole.SpaceID.IsNull())
		} else {
			q = q.Where(u.Query.UserRole.SpaceID.Eq(*spaceID))
		}
	}
	
	return q.Count()
}

// convertToEntity converts model to entity
func (u *UserRoleDAO) convertToEntity(dbUserRole *model.UserRole) *entity.UserRole {
	var spaceID *int64
	if dbUserRole.SpaceID != 0 {
		spaceID = &dbUserRole.SpaceID
	}
	
	return &entity.UserRole{
		ID:         dbUserRole.ID,
		UserID:     dbUserRole.UserID,
		RoleID:     dbUserRole.RoleID,
		SpaceID:    spaceID,
		AssignedBy: dbUserRole.AssignedBy,
		AssignedAt: time.Unix(dbUserRole.AssignedAt, 0),
	}
}