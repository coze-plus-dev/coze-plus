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

package repository

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	dal "github.com/coze-dev/coze-studio/backend/domain/corporation/internal/dal/dao"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

// NewCorporationRepo creates a new corporation repository
func NewCorporationRepo(db *gorm.DB, idGen idgen.IDGenerator) CorporationRepo {
	return &dal.CorporationDAO{
		DB:    db,
		IDGen: idGen,
		Query: query.Use(db),
	}
}

// NewDepartmentRepo creates a new department repository
func NewDepartmentRepo(db *gorm.DB, idGen idgen.IDGenerator) DepartmentRepo {
	return dal.NewDepartmentDAO(db, idGen)
}

// NewEmployeeRepo creates a new employee repository
func NewEmployeeRepo(db *gorm.DB, idGen idgen.IDGenerator) EmployeeRepo {
	return dal.NewEmployeeDAO(db, idGen)
}

// CorporationRepo defines corporation repository interface
type CorporationRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, corp *entity.Corporation) (*entity.Corporation, error)
	GetByID(ctx context.Context, id int64) (*entity.Corporation, error)
	Update(ctx context.Context, corp *entity.Corporation) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.CorporationListFilter) ([]*entity.Corporation, bool, error)
	
	// Business specific operations
	GetByParentID(ctx context.Context, parentID int64) ([]*entity.Corporation, error)
	GetRootCorporations(ctx context.Context) ([]*entity.Corporation, error)
	GetCorporationTree(ctx context.Context, rootID int64) ([]*entity.Corporation, error)
	UpdateSort(ctx context.Context, id int64, sort int32) error
	GetByCreatorID(ctx context.Context, creatorID int64) ([]*entity.Corporation, error)
}

// DepartmentRepo defines department repository interface
type DepartmentRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, dept *entity.Department) (*entity.Department, error)
	GetByID(ctx context.Context, id int64) (*entity.Department, error)
	Update(ctx context.Context, dept *entity.Department) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.DepartmentListFilter) ([]*entity.Department, bool, error)
	
	// Business specific operations
	GetByCorpID(ctx context.Context, corpID int64) ([]*entity.Department, error)
	GetByParentDeptID(ctx context.Context, parentDeptID int64) ([]*entity.Department, error)
	GetDepartmentTree(ctx context.Context, corpID int64, rootDeptID *int64) ([]*entity.Department, error)
	UpdateSort(ctx context.Context, id int64, sort int32) error
	MoveDepartment(ctx context.Context, deptID, newParentID int64) error
}

// EmployeeRepo defines employee repository interface
type EmployeeRepo interface {
	// Basic CRUD operations
	Create(ctx context.Context, emp *entity.Employee) (*entity.Employee, error)
	GetByID(ctx context.Context, id int64) (*entity.Employee, error)
	Update(ctx context.Context, emp *entity.Employee) error
	Delete(ctx context.Context, id int64) error
	List(ctx context.Context, filter *entity.EmployeeListFilter) ([]*entity.Employee, bool, int64, error)
	
	// Business specific operations
	GetByDeptID(ctx context.Context, deptID int64) ([]*entity.Employee, error)
	GetByEmail(ctx context.Context, email string) (*entity.Employee, error)
	GetByPhone(ctx context.Context, phone string) (*entity.Employee, error)
	GetByEmployeeID(ctx context.Context, employeeID string) (*entity.Employee, error)
	UpdateStatus(ctx context.Context, id int64, status int32) error
	BatchUpdateDepartments(ctx context.Context, empID int64, deptIDs []int64, isLeader []bool) error
	
	// Employee Department relationship operations
	AssignEmployeeToDepartment(ctx context.Context, relation *entity.EmployeeDepartmentRelation) error
	GetEmployeeDepartments(ctx context.Context, empID int64) ([]*entity.EmployeeDepartmentRelation, error)
	GetEmployeeDepartmentByID(ctx context.Context, id int64) (*entity.EmployeeDepartmentRelation, error)
	UpdateEmployeeDepartment(ctx context.Context, relation *entity.EmployeeDepartmentRelation) error
	DeleteEmployeeDepartment(ctx context.Context, id int64) error
}

// EmployeeDepartmentRepo defines employee-department relationship repository interface
type EmployeeDepartmentRepo interface {
	// Relationship operations
	AddEmployeeToDepartment(ctx context.Context, rel *entity.EmployeeDepartmentRelation) error
	RemoveEmployeeFromDepartment(ctx context.Context, empID, deptID int64) error
	UpdateEmployeeDepartmentRole(ctx context.Context, empID, deptID int64, isLeader bool) error
	GetEmployeeDepartments(ctx context.Context, empID int64) ([]*entity.EmployeeDepartmentRelation, error)
	GetDepartmentEmployees(ctx context.Context, deptID int64) ([]*entity.EmployeeDepartmentRelation, error)
	GetDepartmentLeaders(ctx context.Context, deptID int64) ([]*entity.EmployeeDepartmentRelation, error)
}