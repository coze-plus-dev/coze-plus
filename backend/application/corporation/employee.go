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

package corporation

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/corporation/common"
	employeeAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/employee"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// Employee methods
func (s *CorporationApplicationService) CreateEmployee(ctx context.Context, req *employeeAPI.CreateEmployeeRequest) (*employeeAPI.CreateEmployeeResponse, error) {
	// Get user ID from session context
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Validate that at least one department is provided
	if len(req.GetDepartmentIds()) == 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "at least one department must be specified"))
	}

	// Convert from API model to Domain service request using the correct field names
	serviceReq := &service.CreateEmployeeRequest{
		Name:       req.GetName(),
		Email:      getStringPtr(req.GetEmail()),
		Phone:      getStringPtr(req.GetMobile()),
		EmployeeID: getStringPtr(req.GetEmployeeNo()),
		Position:   getStringPtr(""), // Will be set per department
		AvatarURI:  getStringPtr(req.GetAvatar()),
		Status:     entity.EmployeeStatusActive, // Default status
		OutEmpID:   getStringPtr(req.GetOutEmployeeID()),
		EmpSource:  convertApiEmployeeSourceToEntity(req.GetEmployeeSource()),
		CreatorID:  ptr.From(uid),
	}

	var serviceResp *service.CreateEmployeeResponse
	var err error

	err = s.db.Transaction(func(tx *gorm.DB) error {
		serviceResp, err = s.DomainEmployeeSVC.CreateEmployee(ctx, serviceReq)
		if err != nil {
			return err
		}

		// Assign employee to each department
		for _, deptInfo := range req.GetDepartmentIds() {
			assignReq := &service.AssignEmployeeToDepartmentRequest{
				EmpID:     serviceResp.Employee.ID,
				DeptID:    deptInfo.GetDepartmentID(),
				IsLeader:  false,
				IsPrimary: deptInfo.GetIsPrimary(),
			}
			err = s.DomainEmployeeSVC.AssignEmployeeToDepartment(ctx, assignReq)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Get employee with department info
	getResp, err := s.DomainEmployeeSVC.GetEmployeeByID(ctx, &service.GetEmployeeByIDRequest{
		ID: serviceResp.Employee.ID,
	})
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewCreateEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToEmployeeDataWithDepartments(getResp.Employee)

	return resp, nil
}

func (s *CorporationApplicationService) GetEmployeeByID(ctx context.Context, req *employeeAPI.GetEmployeeRequest) (*employeeAPI.GetEmployeeResponse, error) {
	serviceResp, err := s.DomainEmployeeSVC.GetEmployeeByID(ctx, &service.GetEmployeeByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewGetEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToEmployeeDataWithDepartments(serviceResp.Employee)

	return resp, nil
}

func (s *CorporationApplicationService) UpdateEmployee(ctx context.Context, req *employeeAPI.UpdateEmployeeRequest) (*employeeAPI.UpdateEmployeeResponse, error) {
	// Get user ID from session context
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	serviceReq := &service.UpdateEmployeeRequest{
		ID: req.GetID(),
	}

	if req.IsSetName() {
		name := req.GetName()
		serviceReq.Name = &name
	}
	if req.IsSetEmployeeNo() {
		employeeNo := req.GetEmployeeNo()
		serviceReq.EmployeeID = &employeeNo
	}
	if req.IsSetAvatar() {
		avatar := req.GetAvatar()
		serviceReq.AvatarURI = &avatar
	}
	if req.IsSetEmail() {
		email := req.GetEmail()
		serviceReq.Email = &email
	}
	if req.IsSetMobile() {
		mobile := req.GetMobile()
		serviceReq.Phone = &mobile
	}
	if req.IsSetStatus() {
		status := convertApiEmployeeStatusToEntity(req.GetStatus())
		serviceReq.Status = &status
	}
	if req.IsSetOutEmployeeID() {
		outEmployeeID := req.GetOutEmployeeID()
		serviceReq.OutEmpID = &outEmployeeID
	}
	if req.IsSetEmployeeSource() {
		employeeSource := convertApiEmployeeSourceToEntity(req.GetEmployeeSource())
		serviceReq.EmpSource = &employeeSource
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		// Update employee basic info
		err := s.DomainEmployeeSVC.UpdateEmployee(ctx, serviceReq)
		if err != nil {
			return err
		}

		// Handle department updates if provided
		if req.IsSetDepartments() {
			// Get current department relations
			currentRelations, err := s.DomainEmployeeSVC.GetDepartmentsByEmployee(ctx, &service.GetDepartmentsByEmployeeRequest{
				EmpID: req.GetID(),
			})
			if err != nil {
				return err
			}

			// Build maps for comparison
			currentDeptMap := make(map[int64]*entity.EmployeeDepartmentRelation)
			for _, rel := range currentRelations.Relations {
				currentDeptMap[rel.DeptID] = rel
			}

			newDeptMap := make(map[int64]*employeeAPI.EmployeeDepartmentInfo)
			for _, dept := range req.GetDepartments() {
				newDeptMap[dept.GetDepartmentID()] = dept
			}

			// Remove departments not in new list
			for _, rel := range currentRelations.Relations {
				if _, exists := newDeptMap[rel.DeptID]; !exists {
					err := s.DomainEmployeeSVC.RemoveEmployeeFromDepartment(ctx, &service.RemoveEmployeeFromDepartmentRequest{
						EmpID:  req.GetID(),
						DeptID: rel.DeptID,
					})
					if err != nil {
						return err
					}
				}
			}

			// Add new departments or update existing ones
			for _, deptInfo := range req.GetDepartments() {
				deptID := deptInfo.GetDepartmentID()
				isPrimary := deptInfo.GetIsPrimary()

				if existingRel, exists := currentDeptMap[deptID]; !exists {
					// Add new department relation
					err := s.DomainEmployeeSVC.AssignEmployeeToDepartment(ctx, &service.AssignEmployeeToDepartmentRequest{
						EmpID:     req.GetID(),
						DeptID:    deptID,
						IsLeader:  false,
						IsPrimary: isPrimary,
					})
					if err != nil {
						return err
					}
				} else {
					// Update existing relation if needed
					needUpdate := false
					updateReq := &service.UpdateEmployeeDepartmentRequest{
						ID: existingRel.ID, // Use the relation ID
					}

					if existingRel.IsPrimary != isPrimary {
						updateReq.IsPrimary = &isPrimary
						needUpdate = true
					}

					if deptInfo.IsSetJobTitle() {
						jobTitle := deptInfo.GetJobTitle()
						if existingRel.JobTitle == nil || *existingRel.JobTitle != jobTitle {
							updateReq.JobTitle = &jobTitle
							needUpdate = true
						}
					}

					if needUpdate {
						err := s.DomainEmployeeSVC.UpdateEmployeeDepartment(ctx, updateReq)
						if err != nil {
							return err
						}
					}
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewUpdateEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""

	return resp, nil
}

func (s *CorporationApplicationService) DeleteEmployee(ctx context.Context, req *employeeAPI.DeleteEmployeeRequest) (*employeeAPI.DeleteEmployeeResponse, error) {
	err := s.DomainEmployeeSVC.DeleteEmployee(ctx, &service.DeleteEmployeeRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewDeleteEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""

	return resp, nil
}

func (s *CorporationApplicationService) ListEmployees(ctx context.Context, req *employeeAPI.ListEmployeeRequest) (*employeeAPI.ListEmployeeResponse, error) {
	serviceReq := &service.ListEmployeesRequest{
		Limit: int(req.GetPageSize()),
		Page:  int(req.GetPage()),
	}

	// 添加corp_id过滤
	corpID := req.GetCorpID()
	serviceReq.CorpID = &corpID

	if req.IsSetDepartmentID() {
		deptID := req.GetDepartmentID()
		serviceReq.DeptID = &deptID
	}
	if req.IsSetStatus() {
		status := convertApiEmployeeStatusToEntity(req.GetStatus())
		serviceReq.Status = &status
	}
	if req.IsSetKeyword() {
		keyword := req.GetKeyword()
		serviceReq.Keyword = &keyword
	}

	serviceResp, err := s.DomainEmployeeSVC.ListEmployees(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	empData := make([]*employeeAPI.EmployeeData, len(serviceResp.Employees))
	for i, emp := range serviceResp.Employees {
		empData[i] = convertEntityToEmployeeDataWithDepartments(emp)
	}

	resp := employeeAPI.NewListEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = empData
	resp.Total = serviceResp.Total

	return resp, nil
}

func (s *CorporationApplicationService) ChangeEmployeeDepartment(ctx context.Context, req *employeeAPI.ChangeEmployeeDepartmentRequest) (*employeeAPI.ChangeEmployeeDepartmentResponse, error) {
	// Get user ID from session context
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Validate that at least one department is provided
	if len(req.GetDepartments()) == 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "at least one department must be specified"))
	}

	// Get current department relations
	currentRelations, err := s.DomainEmployeeSVC.GetDepartmentsByEmployee(ctx, &service.GetDepartmentsByEmployeeRequest{
		EmpID: req.GetID(),
	})
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError, errorx.KV("msg", "failed to get current department relations"))
	}

	// Build maps for comparison
	currentDeptMap := make(map[int64]*entity.EmployeeDepartmentRelation)
	for _, rel := range currentRelations.Relations {
		currentDeptMap[rel.DeptID] = rel
	}

	newDeptMap := make(map[int64]*employeeAPI.EmployeeDepartmentInfo)
	for _, dept := range req.GetDepartments() {
		newDeptMap[dept.GetDepartmentID()] = dept
	}

	// Remove departments not in new list
	for _, rel := range currentRelations.Relations {
		if _, exists := newDeptMap[rel.DeptID]; !exists {
			err := s.DomainEmployeeSVC.RemoveEmployeeFromDepartment(ctx, &service.RemoveEmployeeFromDepartmentRequest{
				EmpID:  req.GetID(),
				DeptID: rel.DeptID,
			})
			if err != nil {
				return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError, errorx.KV("msg", "failed to remove employee from department"))
			}
		}
	}

	// Add new departments or update existing ones
	for _, deptInfo := range req.GetDepartments() {
		deptID := deptInfo.GetDepartmentID()
		isPrimary := deptInfo.GetIsPrimary()

		if existingRel, exists := currentDeptMap[deptID]; !exists {
			// Add new department relation
			err := s.DomainEmployeeSVC.AssignEmployeeToDepartment(ctx, &service.AssignEmployeeToDepartmentRequest{
				EmpID:     req.GetID(),
				DeptID:    deptID,
				IsLeader:  false,
				IsPrimary: isPrimary,
			})
			if err != nil {
				return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError, errorx.KV("msg", "failed to assign employee to department"))
			}
		} else {
			// Update existing relation if needed
			needUpdate := false
			updateReq := &service.UpdateEmployeeDepartmentRequest{
				ID: existingRel.ID, // Use the relation ID
			}

			if existingRel.IsPrimary != isPrimary {
				updateReq.IsPrimary = &isPrimary
				needUpdate = true
			}

			if deptInfo.IsSetJobTitle() {
				jobTitle := deptInfo.GetJobTitle()
				if existingRel.JobTitle == nil || *existingRel.JobTitle != jobTitle {
					updateReq.JobTitle = &jobTitle
					needUpdate = true
				}
			}

			if needUpdate {
				err := s.DomainEmployeeSVC.UpdateEmployeeDepartment(ctx, updateReq)
				if err != nil {
					return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError, errorx.KV("msg", "failed to update employee department relationship"))
				}
			}
		}
	}

	// Get updated employee with department info
	getResp, err := s.DomainEmployeeSVC.GetEmployeeByID(ctx, &service.GetEmployeeByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewChangeEmployeeDepartmentResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToEmployeeDataWithDepartments(getResp.Employee)

	return resp, nil
}

// Helper conversion functions for employee
func convertApiEmployeeStatusToEntity(apiStatus common.EmployeeStatus) entity.EmployeeStatus {
	switch apiStatus {
	case common.EmployeeStatus_EMPLOYED:
		return entity.EmployeeStatusActive
	case common.EmployeeStatus_QUIT:
		return entity.EmployeeStatusInactive
	default:
		return entity.EmployeeStatusActive
	}
}

func convertEntityEmployeeStatusToCommon(entityStatus entity.EmployeeStatus) common.EmployeeStatus {
	switch entityStatus {
	case entity.EmployeeStatusActive:
		return common.EmployeeStatus_EMPLOYED
	case entity.EmployeeStatusInactive:
		return common.EmployeeStatus_QUIT
	default:
		return common.EmployeeStatus_EMPLOYED
	}
}

func convertApiEmployeeSourceToEntity(apiSource common.DataSource) entity.EmployeeSource {
	return entity.EmployeeSource(apiSource)
}

func convertEntityToEmployeeData(emp *entity.Employee) *employeeAPI.EmployeeData {
	if emp == nil {
		return nil
	}

	empData := &employeeAPI.EmployeeData{
		ID:     emp.ID,
		Name:   emp.Name,
		Status: convertEntityEmployeeStatusToCommon(emp.Status),
	}

	// Map Phone field from entity to Mobile field in API
	if emp.Phone != nil {
		empData.Mobile = *emp.Phone
	}
	if emp.EmployeeID != nil {
		empData.EmployeeNo = emp.EmployeeID
	}
	if emp.AvatarURI != nil {
		empData.Avatar = emp.AvatarURI
	}
	if emp.Email != nil {
		empData.Email = emp.Email
	}
	if emp.OutEmpID != nil {
		empData.OutEmployeeID = emp.OutEmpID
	}
	if emp.EmpSource != entity.EmployeeSourceManual {
		employeeSource := common.DataSource(emp.EmpSource)
		empData.EmployeeSource = &employeeSource
	}

	return empData
}

func convertEntityToEmployeeDataWithDepartments(emp *entity.Employee) *employeeAPI.EmployeeData {
	if emp == nil {
		return nil
	}

	// Start with basic employee data
	empData := convertEntityToEmployeeData(emp)

	// Add department information if available
	if emp.Departments != nil && len(emp.Departments) > 0 {
		deptInfoList := make([]*employeeAPI.EmployeeDepartmentInfo, len(emp.Departments))
		for i, rel := range emp.Departments {
			deptInfo := &employeeAPI.EmployeeDepartmentInfo{
				DepartmentID:   rel.DeptID,
				DepartmentName: "Department", // Default name
				CorpID:         rel.CorpID,
				CorpName:       "Corporation", // Default name
			}

			// Use actual department name and path if available
			if rel.Department != nil {
				deptInfo.DepartmentName = rel.Department.Name
				if rel.Department.FullPath != "" {
					deptInfo.DepartmentPath = &rel.Department.FullPath
				}
			}

			// Use actual corporation name if available
			if rel.Corporation != nil {
				deptInfo.CorpName = rel.Corporation.Name
			}

			if rel.JobTitle != nil {
				deptInfo.JobTitle = rel.JobTitle
			}
			if rel.IsPrimary {
				isPrimary := rel.IsPrimary
				deptInfo.IsPrimary = &isPrimary
			}
			deptInfoList[i] = deptInfo
		}
		empData.Departments = deptInfoList
	}

	return empData
}

func (s *CorporationApplicationService) ResignEmployee(ctx context.Context, req *employeeAPI.ResignEmployeeRequest) (*employeeAPI.ResignEmployeeResponse, error) {
	// Get user ID from session context
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Update employee status to inactive (quit)
	status := entity.EmployeeStatusInactive
	updateReq := &service.UpdateEmployeeRequest{
		ID:     req.GetID(),
		Status: &status,
	}

	var getResp *service.GetEmployeeByIDResponse
	var err error

	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Update employee status
		err := s.DomainEmployeeSVC.UpdateEmployee(ctx, updateReq)
		if err != nil {
			return err
		}

		// Mark all department relationships as inactive instead of deleting them
		// This preserves the historical record while indicating the employee is no longer active in those departments
		currentRelations, err := s.DomainEmployeeSVC.GetDepartmentsByEmployee(ctx, &service.GetDepartmentsByEmployeeRequest{
			EmpID: req.GetID(),
		})
		if err != nil {
			return err
		}

		// Set all department relationships to inactive status
		for _, rel := range currentRelations.Relations {
			// Instead of removing, update the relationship status to inactive
			status := entity.EmployeeDepartmentStatusInactive
			updateReq := &service.UpdateEmployeeDepartmentRequest{
				ID:     rel.ID,
				Status: &status, // Mark as inactive
			}
			err := s.DomainEmployeeSVC.UpdateEmployeeDepartment(ctx, updateReq)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Get updated employee info
	getResp, err = s.DomainEmployeeSVC.GetEmployeeByID(ctx, &service.GetEmployeeByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewResignEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToEmployeeDataWithDepartments(getResp.Employee)

	return resp, nil
}

func (s *CorporationApplicationService) RestoreEmployee(ctx context.Context, req *employeeAPI.RestoreEmployeeRequest) (*employeeAPI.RestoreEmployeeResponse, error) {
	// Get user ID from session context
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	// Validate that at least one department is provided
	if len(req.GetDepartments()) == 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "at least one department must be specified"))
	}

	// Update employee status to active (employed)
	status := entity.EmployeeStatusActive
	updateReq := &service.UpdateEmployeeRequest{
		ID:     req.GetID(),
		Status: &status,
	}

	var getResp *service.GetEmployeeByIDResponse
	var err error

	// Use transaction to ensure data consistency
	err = s.db.Transaction(func(tx *gorm.DB) error {
		// Update employee status
		err := s.DomainEmployeeSVC.UpdateEmployee(ctx, updateReq)
		if err != nil {
			return err
		}

		// First, get all existing department relationships (including inactive ones)
		currentRelations, err := s.DomainEmployeeSVC.GetDepartmentsByEmployee(ctx, &service.GetDepartmentsByEmployeeRequest{
			EmpID: req.GetID(),
		})
		if err != nil {
			return err
		}

		// Soft delete all existing department relationships
		// Use force deletion to avoid department existence checks during restore
		for _, rel := range currentRelations.Relations {
			err := s.DomainEmployeeSVC.ForceDeleteEmployeeDepartment(ctx, rel.ID)
			if err != nil {
				// If deletion fails, skip this relationship and continue
				// This handles edge cases where the relationship might already be deleted
				continue
			}
		}

		// Assign employee to new departments
		for _, deptInfo := range req.GetDepartments() {
			assignReq := &service.AssignEmployeeToDepartmentRequest{
				EmpID:     req.GetID(),
				DeptID:    deptInfo.GetDepartmentID(),
				IsLeader:  false,
				IsPrimary: deptInfo.GetIsPrimary(),
			}

			err := s.DomainEmployeeSVC.AssignEmployeeToDepartment(ctx, assignReq)
			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Get updated employee info
	getResp, err = s.DomainEmployeeSVC.GetEmployeeByID(ctx, &service.GetEmployeeByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	// Verify that the employee has department relationships after restore
	if getResp.Employee.Departments == nil || len(getResp.Employee.Departments) == 0 {
		return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("msg", "employee has no department relationships after restore"))
	}

	resp := employeeAPI.NewRestoreEmployeeResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToEmployeeDataWithDepartments(getResp.Employee)

	return resp, nil
}
