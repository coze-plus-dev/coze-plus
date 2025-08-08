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

	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
)

// Corporation defines corporation domain service interface
type Corporation interface {
	// Basic operations
	CreateCorporation(ctx context.Context, request *CreateCorporationRequest) (*CreateCorporationResponse, error)
	UpdateCorporation(ctx context.Context, request *UpdateCorporationRequest) error
	DeleteCorporation(ctx context.Context, request *DeleteCorporationRequest) error
	GetCorporationByID(ctx context.Context, request *GetCorporationByIDRequest) (*GetCorporationByIDResponse, error)
	ListCorporations(ctx context.Context, request *ListCorporationsRequest) (*ListCorporationsResponse, error)
	
	// Business operations
	GetCorporationTree(ctx context.Context, request *GetCorporationTreeRequest) (*GetCorporationTreeResponse, error)
	MoveCorporation(ctx context.Context, request *MoveCorporationRequest) error
	SortCorporations(ctx context.Context, request *SortCorporationsRequest) error
	GetRootCorporations(ctx context.Context, request *GetRootCorporationsRequest) (*GetRootCorporationsResponse, error)
}

// Department defines department domain service interface
type Department interface {
	// Basic operations
	CreateDepartment(ctx context.Context, request *CreateDepartmentRequest) (*CreateDepartmentResponse, error)
	UpdateDepartment(ctx context.Context, request *UpdateDepartmentRequest) error
	DeleteDepartment(ctx context.Context, request *DeleteDepartmentRequest) error
	GetDepartmentByID(ctx context.Context, request *GetDepartmentByIDRequest) (*GetDepartmentByIDResponse, error)
	ListDepartments(ctx context.Context, request *ListDepartmentsRequest) (*ListDepartmentsResponse, error)
	
	// Business operations
	GetDepartmentTree(ctx context.Context, request *GetDepartmentTreeRequest) (*GetDepartmentTreeResponse, error)
	MoveDepartment(ctx context.Context, request *MoveDepartmentRequest) error
	SortDepartments(ctx context.Context, request *SortDepartmentsRequest) error
}

// Employee defines employee domain service interface  
type Employee interface {
	// Basic operations
	CreateEmployee(ctx context.Context, request *CreateEmployeeRequest) (*CreateEmployeeResponse, error)
	UpdateEmployee(ctx context.Context, request *UpdateEmployeeRequest) error
	DeleteEmployee(ctx context.Context, request *DeleteEmployeeRequest) error
	GetEmployeeByID(ctx context.Context, request *GetEmployeeByIDRequest) (*GetEmployeeByIDResponse, error)
	ListEmployees(ctx context.Context, request *ListEmployeesRequest) (*ListEmployeesResponse, error)
	
	// Business operations
	AssignEmployeeToDepartment(ctx context.Context, request *AssignEmployeeToDepartmentRequest) error
	RemoveEmployeeFromDepartment(ctx context.Context, request *RemoveEmployeeFromDepartmentRequest) error
	UpdateEmployeeStatus(ctx context.Context, request *UpdateEmployeeStatusRequest) error
	GetEmployeesByDepartment(ctx context.Context, request *GetEmployeesByDepartmentRequest) (*GetEmployeesByDepartmentResponse, error)
	GetDepartmentsByEmployee(ctx context.Context, request *GetDepartmentsByEmployeeRequest) (*GetDepartmentsByEmployeeResponse, error)
}

// Request/Response structures for Corporation service

type CreateCorporationRequest struct {
	Name       string                         `json:"name"`
	ParentID   *int64                         `json:"parent_id,omitempty"`
	CorpType   entity.CorporationType         `json:"corp_type"`
	Sort       int32                          `json:"sort"`
	OutCorpID  *string                        `json:"out_corp_id,omitempty"`
	CorpSource entity.CorporationSource       `json:"corp_source"`
	CreatorID  int64                          `json:"creator_id"`
}

type CreateCorporationResponse struct {
	Corporation *entity.Corporation `json:"corporation"`
}

type UpdateCorporationRequest struct {
	ID         int64                           `json:"id"`
	Name       *string                         `json:"name,omitempty"`
	ParentID   *int64                          `json:"parent_id,omitempty"`
	CorpType   *entity.CorporationType         `json:"corp_type,omitempty"`
	Sort       *int32                          `json:"sort,omitempty"`
	OutCorpID  *string                         `json:"out_corp_id,omitempty"`
	CorpSource *entity.CorporationSource       `json:"corp_source,omitempty"`
}

type DeleteCorporationRequest struct {
	ID int64 `json:"id"`
}

type GetCorporationByIDRequest struct {
	ID int64 `json:"id"`
}

type GetCorporationByIDResponse struct {
	Corporation *entity.Corporation `json:"corporation"`
}

type ListCorporationsRequest struct {
	ParentID   *int64                         `json:"parent_id,omitempty"`
	CorpType   *entity.CorporationType        `json:"corp_type,omitempty"`
	CorpSource *entity.CorporationSource      `json:"corp_source,omitempty"`
	CreatorID  *int64                         `json:"creator_id,omitempty"`
	Keyword    *string                        `json:"keyword,omitempty"`
	Limit      int                            `json:"limit"`
	Page       int                            `json:"page"`
}

type ListCorporationsResponse struct {
	Corporations []*entity.Corporation `json:"corporations"`
	Total        int64                 `json:"total"`
	HasMore      bool                  `json:"has_more"`
}

type GetCorporationTreeRequest struct {
	RootID *int64 `json:"root_id,omitempty"` // If nil, get all root corporations
}

type GetCorporationTreeResponse struct {
	Corporations []*entity.Corporation `json:"corporations"`
}

type MoveCorporationRequest struct {
	ID           int64  `json:"id"`
	NewParentID  *int64 `json:"new_parent_id"`
}

type SortCorporationsRequest struct {
	Items []SortItem `json:"items"`
}

type SortItem struct {
	ID   int64 `json:"id"`
	Sort int32 `json:"sort"`
}

type GetRootCorporationsRequest struct {
	Limit int `json:"limit"`
	Page  int `json:"page"`
}

type GetRootCorporationsResponse struct {
	Corporations []*entity.Corporation `json:"corporations"`
	Total        int64                 `json:"total"`
	HasMore      bool                  `json:"has_more"`
}

// Request/Response structures for Department service

type CreateDepartmentRequest struct {
	CorpID       int64                        `json:"corp_id"`
	ParentDeptID *int64                       `json:"parent_dept_id,omitempty"`
	Name         string                       `json:"name"`
	Code         *string                      `json:"code,omitempty"`
	Level        int32                        `json:"level"`
	FullPath     string                       `json:"full_path"`
	LeaderID     *int64                       `json:"leader_id,omitempty"`
	Sort         int32                        `json:"sort"`
	Status       entity.DepartmentStatus      `json:"status"`
	OutDeptID    *string                      `json:"out_dept_id,omitempty"`
	DeptSource   entity.DepartmentSource      `json:"dept_source"`
	CreatorID    int64                        `json:"creator_id"`
}

type CreateDepartmentResponse struct {
	Department *entity.Department `json:"department"`
}

type UpdateDepartmentRequest struct {
	ID           int64                       `json:"id"`
	ParentDeptID *int64                      `json:"parent_dept_id,omitempty"`
	Name         *string                     `json:"name,omitempty"`
	Code         *string                     `json:"code,omitempty"`
	Level        *int32                      `json:"level,omitempty"`
	FullPath     *string                     `json:"full_path,omitempty"`
	LeaderID     *int64                      `json:"leader_id,omitempty"`
	Sort         *int32                      `json:"sort,omitempty"`
	Status       *entity.DepartmentStatus    `json:"status,omitempty"`
	OutDeptID    *string                     `json:"out_dept_id,omitempty"`
	DeptSource   *entity.DepartmentSource    `json:"dept_source,omitempty"`
}

type DeleteDepartmentRequest struct {
	ID int64 `json:"id"`
}

type GetDepartmentByIDRequest struct {
	ID int64 `json:"id"`
}

type GetDepartmentByIDResponse struct {
	Department *entity.Department `json:"department"`
}

type ListDepartmentsRequest struct {
	CorpID       *int64                      `json:"corp_id,omitempty"`
	ParentDeptID *int64                      `json:"parent_dept_id,omitempty"`
	Status       *entity.DepartmentStatus    `json:"status,omitempty"`
	DeptSource   *entity.DepartmentSource    `json:"dept_source,omitempty"`
	CreatorID    *int64                      `json:"creator_id,omitempty"`
	Keyword      *string                     `json:"keyword,omitempty"`
	Limit        int                         `json:"limit"`
	Page         int                         `json:"page"`
}

type ListDepartmentsResponse struct {
	Departments []*entity.Department `json:"departments"`
	Total       int64                `json:"total"`
	HasMore     bool                 `json:"has_more"`
}

type GetDepartmentTreeRequest struct {
	CorpID     int64  `json:"corp_id"`
	RootDeptID *int64 `json:"root_dept_id,omitempty"`
}

type GetDepartmentTreeResponse struct {
	Departments []*entity.Department `json:"departments"`
}

type MoveDepartmentRequest struct {
	DeptID        int64 `json:"dept_id"`
	NewParentID   int64 `json:"new_parent_id"`
}

type SortDepartmentsRequest struct {
	Items []SortItem `json:"items"`
}

// Request/Response structures for Employee service

type CreateEmployeeRequest struct {
	CorpID     int64                       `json:"corp_id"`
	Name       string                      `json:"name"`
	Email      *string                     `json:"email,omitempty"`
	Phone      *string                     `json:"phone,omitempty"`
	EmployeeID *string                     `json:"employee_id,omitempty"`
	Position   *string                     `json:"position,omitempty"`
	AvatarURI  *string                     `json:"avatar_uri,omitempty"`
	Status     entity.EmployeeStatus       `json:"status"`
	OutEmpID   *string                     `json:"out_emp_id,omitempty"`
	EmpSource  entity.EmployeeSource       `json:"emp_source"`
	CreatorID  int64                       `json:"creator_id"`
}

type CreateEmployeeResponse struct {
	Employee *entity.Employee `json:"employee"`
}

type UpdateEmployeeRequest struct {
	ID         int64                     `json:"id"`
	Name       *string                   `json:"name,omitempty"`
	Email      *string                   `json:"email,omitempty"`
	Phone      *string                   `json:"phone,omitempty"`
	EmployeeID *string                   `json:"employee_id,omitempty"`
	Position   *string                   `json:"position,omitempty"`
	AvatarURI  *string                   `json:"avatar_uri,omitempty"`
	Status     *entity.EmployeeStatus    `json:"status,omitempty"`
	OutEmpID   *string                   `json:"out_emp_id,omitempty"`
	EmpSource  *entity.EmployeeSource    `json:"emp_source,omitempty"`
}

type DeleteEmployeeRequest struct {
	ID int64 `json:"id"`
}

type GetEmployeeByIDRequest struct {
	ID int64 `json:"id"`
}

type GetEmployeeByIDResponse struct {
	Employee *entity.Employee `json:"employee"`
}

type ListEmployeesRequest struct {
	CorpID     *int64                    `json:"corp_id,omitempty"`
	DeptID     *int64                    `json:"dept_id,omitempty"`
	Status     *entity.EmployeeStatus    `json:"status,omitempty"`
	EmpSource  *entity.EmployeeSource    `json:"emp_source,omitempty"`
	CreatorID  *int64                    `json:"creator_id,omitempty"`
	Keyword    *string                   `json:"keyword,omitempty"`
	Limit      int                       `json:"limit"`
	Page       int                       `json:"page"`
}

type ListEmployeesResponse struct {
	Employees []*entity.Employee `json:"employees"`
	Total     int64              `json:"total"`
	HasMore   bool               `json:"has_more"`
}

type AssignEmployeeToDepartmentRequest struct {
	EmpID    int64 `json:"emp_id"`
	DeptID   int64 `json:"dept_id"`
	IsLeader bool  `json:"is_leader"`
}

type RemoveEmployeeFromDepartmentRequest struct {
	EmpID  int64 `json:"emp_id"`
	DeptID int64 `json:"dept_id"`
}

type UpdateEmployeeStatusRequest struct {
	ID     int64                 `json:"id"`
	Status entity.EmployeeStatus `json:"status"`
}

type GetEmployeesByDepartmentRequest struct {
	DeptID int64 `json:"dept_id"`
	Limit  int   `json:"limit"`
	Page   int   `json:"page"`
}

type GetEmployeesByDepartmentResponse struct {
	Relations []*entity.EmployeeDepartmentRelation `json:"relations"`
	Total     int64                                `json:"total"`
	HasMore   bool                                 `json:"has_more"`
}

type GetDepartmentsByEmployeeRequest struct {
	EmpID int64 `json:"emp_id"`
}

type GetDepartmentsByEmployeeResponse struct {
	Relations []*entity.EmployeeDepartmentRelation `json:"relations"`
}