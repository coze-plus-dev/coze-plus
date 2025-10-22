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

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	dal "github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/dao"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

// NewRoleRepo creates a new role repository
func NewRoleRepo(db *gorm.DB, idGen idgen.IDGenerator) RoleRepo {
	return &dal.RoleDAO{
		DB:    db,
		IDGen: idGen,
		Query: query.Use(db),
	}
}

// NewPermissionTemplateRepo creates a new permission template repository
func NewPermissionTemplateRepo(db *gorm.DB, idGen idgen.IDGenerator) PermissionTemplateRepo {
	return dal.NewPermissionTemplateDAO(db, idGen)
}

// NewUserRoleRepo creates a new user role repository
func NewUserRoleRepo(db *gorm.DB, idGen idgen.IDGenerator) UserRoleRepo {
	return dal.NewUserRoleDAO(db, idGen)
}

// NewCasbinRuleRepo creates a new casbin rule repository
func NewCasbinRuleRepo(db *gorm.DB, idGen idgen.IDGenerator) CasbinRuleRepo {
	return dal.NewCasbinRuleDAO(db, idGen)
}

// RoleRepo defines role repository interface
type RoleRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, role *entity.Role) (*entity.Role, error)
	GetByID(ctx context.Context, id int64) (*entity.Role, error)
	Update(ctx context.Context, role *entity.Role) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.RoleListFilter) ([]*entity.Role, int64, error)

	// Business specific operations
	GetByRoleCode(ctx context.Context, roleCode string) (*entity.Role, error)
	GetByDomain(ctx context.Context, domain entity.RoleDomain) ([]*entity.Role, error)
	GetBuiltinRoles(ctx context.Context) ([]*entity.Role, error)
	GetRolesByCreator(ctx context.Context, creatorID int64) ([]*entity.Role, error)
	UpdateStatus(ctx context.Context, id int64, status entity.RoleStatus) error
	CheckRoleCodeExists(ctx context.Context, roleCode string, excludeID *int64) (bool, error)
}

// PermissionTemplateRepo defines permission template repository interface
type PermissionTemplateRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, template *entity.PermissionTemplate) (*entity.PermissionTemplate, error)
	GetByID(ctx context.Context, id int64) (*entity.PermissionTemplate, error)
	Update(ctx context.Context, template *entity.PermissionTemplate) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.PermissionTemplateListFilter) ([]*entity.PermissionTemplate, int64, error)

	// Business specific operations
	GetByDomain(ctx context.Context, domain string) ([]*entity.PermissionTemplate, error)
	GetByResource(ctx context.Context, domain, resource string) ([]*entity.PermissionTemplate, error)
	GetActiveTemplates(ctx context.Context) ([]*entity.PermissionTemplate, error)
	GetDefaultTemplates(ctx context.Context, domain string) ([]*entity.PermissionTemplate, error)
	GetByTemplateCode(ctx context.Context, templateCode string) (*entity.PermissionTemplate, error)
	UpdateStatus(ctx context.Context, id int64, status entity.PermissionTemplateStatus) error
	BatchUpdateStatus(ctx context.Context, ids []int64, status entity.PermissionTemplateStatus) error
}

// UserRoleRepo defines user role repository interface
// Note: Only manages global roles now, space roles are managed by space_user table
type UserRoleRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, userRole *entity.UserRole) (*entity.UserRole, error)
	GetByID(ctx context.Context, id int64) (*entity.UserRole, error)
	Update(ctx context.Context, userRole *entity.UserRole) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.UserRoleListFilter) ([]*entity.UserRole, int64, error)

	// Business specific operations (global roles only)
	GetUserRoles(ctx context.Context, userID int64) ([]*entity.UserRole, error)
	GetRoleUsers(ctx context.Context, roleID int64) ([]*entity.UserRole, error)
	CheckUserHasRole(ctx context.Context, userID, roleID int64) (bool, error)
	AssignUserToRole(ctx context.Context, userID, roleID int64, assignedBy int64) error
	RemoveUserFromRole(ctx context.Context, userID, roleID int64) error
	BatchAssignUsersToRole(ctx context.Context, userIDs []int64, roleID int64, assignedBy int64) error
	BatchRemoveUsersFromRole(ctx context.Context, userIDs []int64, roleID int64) error
	CountRoleUsers(ctx context.Context, roleID int64) (int64, error)
	GetUsersByRoleCode(ctx context.Context, roleCode string) ([]int64, error)
	// JOIN query for better performance
	GetUserRolesWithRoleInfo(ctx context.Context, userID int64) ([]entity.UserRoleWithRole, error)
}

// CasbinRuleRepo defines casbin rule repository interface
type CasbinRuleRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, rule *entity.CasbinRule) (*entity.CasbinRule, error)
	GetByID(ctx context.Context, id int64) (*entity.CasbinRule, error)
	Update(ctx context.Context, rule *entity.CasbinRule) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.CasbinRuleListFilter) ([]*entity.CasbinRule, int64, error)

	// Business specific operations
	GetRolePolicies(ctx context.Context, roleCode string) ([]*entity.CasbinRule, error)
	DeleteRolePolicies(ctx context.Context, roleCode string) error
	BatchCreate(ctx context.Context, rules []*entity.CasbinRule) error
	SyncRolePolicies(ctx context.Context, roleCode string, policies []*entity.CasbinRule) error
}
