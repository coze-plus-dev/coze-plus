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
	"errors"
	"strings"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// NewEmployeeSVC creates a new employee service
func NewEmployeeSVC(config *EmployeeSVCConfig) Employee {
	return &employeeSVC{
		employeeRepo:   repository.NewEmployeeRepo(config.DB, config.IDGen),
		departmentRepo: repository.NewDepartmentRepo(config.DB, config.IDGen),
		storage:        config.Storage,
		idgen:          config.IDGen,
	}
}

// EmployeeSVCConfig configuration for employee service
type EmployeeSVCConfig struct {
	DB      *gorm.DB          // required
	IDGen   idgen.IDGenerator // required
	Storage storage.Storage   // required for avatar handling
}

type employeeSVC struct {
	employeeRepo   repository.EmployeeRepo
	departmentRepo repository.DepartmentRepo
	storage        storage.Storage
	idgen          idgen.IDGenerator
}

// CreateEmployee creates a new employee
func (s *employeeSVC) CreateEmployee(ctx context.Context, req *CreateEmployeeRequest) (*CreateEmployeeResponse, error) {
	// Validate request
	if err := s.validateCreateEmployeeRequest(req); err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInvalidParamCode)
	}

	// Check if employee ID is unique (if provided)
	if req.EmployeeID != nil {
		existing, err := s.employeeRepo.GetByEmployeeID(ctx, *req.EmployeeID)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if existing != nil {
			return nil, errorx.New(errno.ErrEmployeeIDExists)
		}
	}

	// Check if email is unique (if provided)
	if req.Email != nil {
		existing, err := s.employeeRepo.GetByEmail(ctx, *req.Email)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if existing != nil {
			return nil, errorx.New(errno.ErrEmployeeEmailExists)
		}
	}

	// Check if phone is unique (if provided)
	if req.Phone != nil {
		existing, err := s.employeeRepo.GetByPhone(ctx, *req.Phone)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if existing != nil {
			return nil, errorx.New(errno.ErrEmployeePhoneExists)
		}
	}

	// Create employee entity
	emp := &entity.Employee{
		Name:       req.Name,
		Email:      req.Email,
		Phone:      req.Phone,
		EmployeeID: req.EmployeeID,
		Position:   req.Position,
		AvatarURI:  req.AvatarURI,
		Status:     req.Status,
		OutEmpID:   req.OutEmpID,
		EmpSource:  req.EmpSource,
		CreatorID:  req.CreatorID,
	}

	// Save to database
	createdEmp, err := s.employeeRepo.Create(ctx, emp)
	if err != nil {
		// Check for unique constraint violations
		return nil, s.handleEmployeeCreateError(err)
	}

	// Generate avatar URL if avatar URI exists
	if err := s.populateAvatarURL(ctx, createdEmp); err != nil {
		return nil, err
	}

	return &CreateEmployeeResponse{
		Employee: createdEmp,
	}, nil
}

// GetEmployeeByID gets employee by ID
func (s *employeeSVC) GetEmployeeByID(ctx context.Context, req *GetEmployeeByIDRequest) (*GetEmployeeByIDResponse, error) {
	if req.ID <= 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee ID"))
	}

	emp, err := s.employeeRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if emp == nil {
		return nil, errorx.New(errno.ErrEmployeeNotFound)
	}

	// Get department relationships for the employee
	deptResp, err := s.GetDepartmentsByEmployee(ctx, &GetDepartmentsByEmployeeRequest{
		EmpID: req.ID,
	})
	if err != nil {
		return nil, err
	}

	// Attach department relations to employee
	emp.Departments = deptResp.Relations

	// Generate avatar URL if avatar URI exists
	if err := s.populateAvatarURL(ctx, emp); err != nil {
		return nil, err
	}

	return &GetEmployeeByIDResponse{
		Employee: emp,
	}, nil
}

// UpdateEmployee updates employee
func (s *employeeSVC) UpdateEmployee(ctx context.Context, req *UpdateEmployeeRequest) error {
	// Validate request
	if req.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee ID"))
	}
	if req.Name != nil && *req.Name == "" {
		return errorx.New(errno.ErrEmployeeNameEmpty)
	}

	// Check if employee exists
	existingEmp, err := s.employeeRepo.GetByID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if existingEmp == nil {
		return errorx.New(errno.ErrEmployeeNotFound)
	}

	// Check if employee ID is unique (if provided and changed)
	if req.EmployeeID != nil && (existingEmp.EmployeeID == nil || *existingEmp.EmployeeID != *req.EmployeeID) {
		existing, err := s.employeeRepo.GetByEmployeeID(ctx, *req.EmployeeID)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if existing != nil && existing.ID != req.ID {
			return errorx.New(errno.ErrEmployeeIDExists)
		}
	}

	// Check if email is unique (if provided and changed)
	if req.Email != nil && (existingEmp.Email == nil || *existingEmp.Email != *req.Email) {
		existing, err := s.employeeRepo.GetByEmail(ctx, *req.Email)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if existing != nil && existing.ID != req.ID {
			return errorx.New(errno.ErrEmployeeEmailExists)
		}
	}

	// Check if phone is unique (if provided and changed)
	if req.Phone != nil && (existingEmp.Phone == nil || *existingEmp.Phone != *req.Phone) {
		existing, err := s.employeeRepo.GetByPhone(ctx, *req.Phone)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if existing != nil && existing.ID != req.ID {
			return errorx.New(errno.ErrEmployeePhoneExists)
		}
	}

	// Update entity
	if req.Name != nil {
		existingEmp.Name = *req.Name
	}
	existingEmp.Email = req.Email
	existingEmp.Phone = req.Phone
	existingEmp.EmployeeID = req.EmployeeID
	existingEmp.Position = req.Position
	existingEmp.AvatarURI = req.AvatarURI
	if req.Status != nil {
		existingEmp.Status = *req.Status
	}
	existingEmp.OutEmpID = req.OutEmpID

	// Save changes
	if err := s.employeeRepo.Update(ctx, existingEmp); err != nil {
		return s.handleEmployeeUpdateError(err)
	}

	return nil
}

// DeleteEmployee deletes employee
func (s *employeeSVC) DeleteEmployee(ctx context.Context, req *DeleteEmployeeRequest) error {
	if req.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee ID"))
	}

	// Check if employee exists
	emp, err := s.employeeRepo.GetByID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if emp == nil {
		return errorx.New(errno.ErrEmployeeNotFound)
	}

	// Delete employee
	if err := s.employeeRepo.Delete(ctx, req.ID); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// ListEmployees lists employees with filters
func (s *employeeSVC) ListEmployees(ctx context.Context, req *ListEmployeesRequest) (*ListEmployeesResponse, error) {
	// Validate pagination
	if req.Page <= 0 {
		req.Page = consts.DefaultPage
	}
	if req.Limit <= 0 || req.Limit > consts.MaxPageSize {
		req.Limit = consts.DefaultPageSize
	}

	// Create filter
	filter := &entity.EmployeeListFilter{
		CorpID:    req.CorpID,
		Status:    req.Status,
		DeptID:    req.DeptID,
		EmpSource: req.EmpSource,
		CreatorID: req.CreatorID,
		Keyword:   req.Keyword,
		Page:      req.Page,
		Limit:     req.Limit,
	}

	// Get employees with total count
	emps, hasMore, total, err := s.employeeRepo.List(ctx, filter)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	// Generate avatar URLs for all employees
	for _, emp := range emps {
		if err := s.populateAvatarURL(ctx, emp); err != nil {
			// Continue processing other employees even if one fails
			continue
		}
	}

	return &ListEmployeesResponse{
		Employees: emps,
		HasMore:   hasMore,
		Total:     total,
	}, nil
}

// GetEmployeesByDepartment gets employees by department ID
func (s *employeeSVC) GetEmployeesByDepartment(ctx context.Context, req *GetEmployeesByDepartmentRequest) (*GetEmployeesByDepartmentResponse, error) {
	if req.DeptID <= 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid department ID"))
	}

	// Check if department exists
	dept, err := s.departmentRepo.GetByID(ctx, req.DeptID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if dept == nil {
		return nil, errorx.New(errno.ErrDepartmentNotFound)
	}

	// Temporary simple implementation - will be improved later
	return &GetEmployeesByDepartmentResponse{
		Relations: []*entity.EmployeeDepartmentRelation{},
		Total:     0,
	}, nil
}

// UpdateEmployeeStatus updates employee status
func (s *employeeSVC) UpdateEmployeeStatus(ctx context.Context, req *UpdateEmployeeStatusRequest) error {
	if req.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee ID"))
	}

	// Check if employee exists
	emp, err := s.employeeRepo.GetByID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if emp == nil {
		return errorx.New(errno.ErrEmployeeNotFound)
	}

	// Update status
	if err := s.employeeRepo.UpdateStatus(ctx, req.ID, int32(req.Status)); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// AssignEmployeeToDepartment assigns employee to department
func (s *employeeSVC) AssignEmployeeToDepartment(ctx context.Context, req *AssignEmployeeToDepartmentRequest) error {
	// Validate request
	if req.EmpID <= 0 || req.DeptID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee or department ID"))
	}

	// Check if employee exists
	emp, err := s.employeeRepo.GetByID(ctx, req.EmpID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if emp == nil {
		return errorx.New(errno.ErrEmployeeNotFound)
	}

	// Check if department exists
	dept, err := s.departmentRepo.GetByID(ctx, req.DeptID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if dept == nil {
		return errorx.New(errno.ErrDepartmentNotFound)
	}

	// Create employee department relation
	relation := &entity.EmployeeDepartmentRelation{
		CorpID:    dept.CorpID,
		EmpID:     req.EmpID,
		DeptID:    req.DeptID,
		Status:    entity.EmployeeDepartmentStatusActive,
		IsLeader:  req.IsLeader,
		IsPrimary: req.IsPrimary,
		CreatorID: emp.CreatorID, // Use employee creator ID
	}

	// Assign employee to department
	if err := s.employeeRepo.AssignEmployeeToDepartment(ctx, relation); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// UpdateEmployeeDepartment updates employee department relationship
func (s *employeeSVC) UpdateEmployeeDepartment(ctx context.Context, req *UpdateEmployeeDepartmentRequest) error {
	if req.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee department relation ID"))
	}

	// Get existing relationship
	relation, err := s.employeeRepo.GetEmployeeDepartmentByID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if relation == nil {
		return errorx.New(errno.ErrEmployeeDepartmentRelationNotFound)
	}

	// Update fields if provided
	if req.JobTitle != nil {
		relation.JobTitle = req.JobTitle
	}
	if req.Status != nil {
		relation.Status = *req.Status
	}
	if req.IsPrimary != nil {
		relation.IsPrimary = *req.IsPrimary

		// If setting this as primary, update other departments to non-primary
		if *req.IsPrimary {
			allRelations, err := s.employeeRepo.GetEmployeeDepartments(ctx, relation.EmpID)
			if err != nil {
				return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
			}

			// Update other relations in the same corporation to non-primary
			for _, otherRel := range allRelations {
				if otherRel.ID != relation.ID && otherRel.CorpID == relation.CorpID && otherRel.IsPrimary {
					otherRel.IsPrimary = false
					if err := s.employeeRepo.UpdateEmployeeDepartment(ctx, otherRel); err != nil {
						return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
					}
				}
			}
		}
	}

	// Save changes
	if err := s.employeeRepo.UpdateEmployeeDepartment(ctx, relation); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// RemoveEmployeeFromDepartment removes employee from department
func (s *employeeSVC) RemoveEmployeeFromDepartment(ctx context.Context, req *RemoveEmployeeFromDepartmentRequest) error {
	if req.EmpID <= 0 || req.DeptID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee or department ID"))
	}

	// Check if employee exists
	emp, err := s.employeeRepo.GetByID(ctx, req.EmpID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if emp == nil {
		return errorx.New(errno.ErrEmployeeNotFound)
	}

	// Check if department exists
	dept, err := s.departmentRepo.GetByID(ctx, req.DeptID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if dept == nil {
		return errorx.New(errno.ErrDepartmentNotFound)
	}

	// Get employee's current department relations
	relations, err := s.employeeRepo.GetEmployeeDepartments(ctx, req.EmpID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	// Find the specific relation to delete
	var relationToDelete *entity.EmployeeDepartmentRelation
	for _, rel := range relations {
		if rel.DeptID == req.DeptID {
			relationToDelete = rel
			break
		}
	}

	if relationToDelete == nil {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "employee is not assigned to this department"))
	}

	// Delete the relation
	if err := s.employeeRepo.DeleteEmployeeDepartment(ctx, relationToDelete.ID); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// ForceDeleteEmployeeDepartment force deletes employee department relationship without validation
func (s *employeeSVC) ForceDeleteEmployeeDepartment(ctx context.Context, relationID int64) error {
	if relationID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid relation ID"))
	}

	// Delete the relation directly without any validation checks
	if err := s.employeeRepo.DeleteEmployeeDepartment(ctx, relationID); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// GetDepartmentsByEmployee gets departments by employee
func (s *employeeSVC) GetDepartmentsByEmployee(ctx context.Context, req *GetDepartmentsByEmployeeRequest) (*GetDepartmentsByEmployeeResponse, error) {
	if req.EmpID <= 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid employee ID"))
	}

	// Check if employee exists
	emp, err := s.employeeRepo.GetByID(ctx, req.EmpID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if emp == nil {
		return nil, errorx.New(errno.ErrEmployeeNotFound)
	}

	// Get all department relationships for the employee
	relations, err := s.employeeRepo.GetEmployeeDepartments(ctx, req.EmpID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return &GetDepartmentsByEmployeeResponse{
		Relations: relations,
	}, nil
}

// validateCreateEmployeeRequest validates create employee request
func (s *employeeSVC) validateCreateEmployeeRequest(req *CreateEmployeeRequest) error {
	if req.Name == "" {
		return errors.New("employee name cannot be empty")
	}
	if req.CreatorID <= 0 {
		return errors.New("invalid creator ID")
	}
	if req.Email != nil && *req.Email == "" {
		return errors.New("email cannot be empty string")
	}
	if req.Phone != nil && *req.Phone == "" {
		return errors.New("phone cannot be empty string")
	}
	if req.EmployeeID != nil && *req.EmployeeID == "" {
		return errors.New("employee ID cannot be empty string")
	}
	return nil
}

// populateAvatarURL generates avatar URL from avatar URI if exists
func (s *employeeSVC) populateAvatarURL(ctx context.Context, emp *entity.Employee) error {
	if emp == nil || emp.AvatarURI == nil || *emp.AvatarURI == "" {
		return nil
	}

	avatarURL, err := s.storage.GetObjectUrl(ctx, *emp.AvatarURI)
	if err != nil {
		// Log error but don't fail the request for avatar URL generation
		// logs.CtxWarnf(ctx, "Failed to generate avatar URL for employee %d: %v", emp.ID, err)
		return nil
	}

	emp.AvatarURL = &avatarURL
	return nil
}

// handleEmployeeCreateError handles database errors during employee creation
func (s *employeeSVC) handleEmployeeCreateError(err error) error {
	errStr := err.Error()

	// Check for MySQL/PostgreSQL unique constraint violations
	if strings.Contains(errStr, "Duplicate entry") ||
		strings.Contains(errStr, "duplicate key") ||
		strings.Contains(errStr, "UNIQUE constraint failed") {

		// Check which field caused the constraint violation
		if strings.Contains(errStr, "email") || strings.Contains(errStr, "Email") {
			return errorx.New(errno.ErrEmployeeEmailExists)
		}
		if strings.Contains(errStr, "mobile") || strings.Contains(errStr, "Mobile") || strings.Contains(errStr, "phone") {
			return errorx.New(errno.ErrEmployeePhoneExists)
		}
		if strings.Contains(errStr, "employee_no") || strings.Contains(errStr, "employee_id") {
			return errorx.New(errno.ErrEmployeeIDExists)
		}
	}

	// For other database errors, return generic internal error
	return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
}

// handleEmployeeUpdateError handles database errors during employee update
func (s *employeeSVC) handleEmployeeUpdateError(err error) error {
	errStr := err.Error()

	// Check for MySQL/PostgreSQL unique constraint violations
	if strings.Contains(errStr, "Duplicate entry") ||
		strings.Contains(errStr, "duplicate key") ||
		strings.Contains(errStr, "UNIQUE constraint failed") {

		// Check which field caused the constraint violation
		if strings.Contains(errStr, "email") || strings.Contains(errStr, "Email") {
			return errorx.New(errno.ErrEmployeeEmailExists)
		}
		if strings.Contains(errStr, "mobile") || strings.Contains(errStr, "Mobile") || strings.Contains(errStr, "phone") {
			return errorx.New(errno.ErrEmployeePhoneExists)
		}
		if strings.Contains(errStr, "employee_no") || strings.Contains(errStr, "employee_id") {
			return errorx.New(errno.ErrEmployeeIDExists)
		}
	}

	// For other database errors, return generic internal error
	return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
}
