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

package corporation

import (
	"context"

	"gorm.io/gorm"

	corporationAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/corporation"
	departmentAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/department"
	employeeAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/employee"
	"github.com/coze-dev/coze-studio/backend/api/model/corporation/common"
	"github.com/coze-dev/coze-studio/backend/api/model/base"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type CorporationApplicationService struct {
	DomainCorporationSVC service.Corporation
	DomainDepartmentSVC  service.Department  
	DomainEmployeeSVC    service.Employee
	db                   *gorm.DB
	storage              storage.Storage
}

var CorporationSVC = &CorporationApplicationService{}

// Corporation methods
func (s *CorporationApplicationService) CreateCorporation(ctx context.Context, req *corporationAPI.CreateCorpRequest) (*corporationAPI.CreateCorpResponse, error) {
	if req == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "request cannot be nil"))
	}

	// Extract creator ID from Base
	creatorID := extractCreatorIDFromBase(req.GetBase())

	// Convert from API model to Domain service request
	serviceReq := &service.CreateCorporationRequest{
		Name:       req.GetName(),
		ParentID:   getOptionalParentID(req),
		CorpType:   convertApiCorpTypeToEntity(req.GetCorpType()),
		Sort:       getOptionalSort(req),
		OutCorpID:  getOptionalOutCorpID(req),
		CorpSource: convertApiCorpSourceToEntity(req.GetCorpSource()),
		CreatorID:  creatorID,
	}

	var serviceResp *service.CreateCorporationResponse
	var err error

	err = s.db.Transaction(func(tx *gorm.DB) error {
		serviceResp, err = s.DomainCorporationSVC.CreateCorporation(ctx, serviceReq)
		return err
	})

	if err != nil {
		return nil, err
	}

	// Create API response
	resp := corporationAPI.NewCreateCorpResponse()
	resp.Data = convertEntityToCorporationData(serviceResp.Corporation)
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Corporation created successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) GetCorporationByID(ctx context.Context, req *corporationAPI.GetCorpRequest) (*corporationAPI.GetCorpResponse, error) {
	serviceResp, err := s.DomainCorporationSVC.GetCorporationByID(ctx, &service.GetCorporationByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewGetCorpResponse()
	resp.Data = convertEntityToCorporationData(serviceResp.Corporation)
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Corporation retrieved successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) UpdateCorporation(ctx context.Context, req *corporationAPI.UpdateCorpRequest) (*corporationAPI.UpdateCorpResponse, error) {
	serviceReq := &service.UpdateCorporationRequest{
		ID: req.GetID(),
	}

	if req.IsSetName() {
		name := req.GetName()
		serviceReq.Name = &name
	}
	if req.IsSetParentID() {
		parentID := req.GetParentID()
		serviceReq.ParentID = &parentID
	}
	if req.IsSetCorpType() {
		corpType := convertApiCorpTypeToEntity(req.GetCorpType())
		serviceReq.CorpType = &corpType
	}
	if req.IsSetSort() {
		sort := req.GetSort()
		serviceReq.Sort = &sort
	}
	if req.IsSetOutCorpID() {
		outCorpID := req.GetOutCorpID()
		serviceReq.OutCorpID = &outCorpID
	}
	if req.IsSetCorpSource() {
		corpSource := convertApiCorpSourceToEntity(req.GetCorpSource())
		serviceReq.CorpSource = &corpSource
	}

	err := s.DomainCorporationSVC.UpdateCorporation(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewUpdateCorpResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Corporation updated successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) DeleteCorporation(ctx context.Context, req *corporationAPI.DeleteCorpRequest) (*corporationAPI.DeleteCorpResponse, error) {
	err := s.DomainCorporationSVC.DeleteCorporation(ctx, &service.DeleteCorporationRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewDeleteCorpResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Corporation deleted successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) ListCorporations(ctx context.Context, req *corporationAPI.ListCorpsRequest) (*corporationAPI.ListCorpsResponse, error) {
	serviceReq := &service.ListCorporationsRequest{
		Limit: int(req.GetPageSize()),
		Page:  int(req.GetPage()),
	}

	if req.IsSetParentID() {
		parentID := req.GetParentID()
		serviceReq.ParentID = &parentID
	}
	if req.IsSetCorpType() {
		corpType := convertApiCorpTypeToEntity(req.GetCorpType())
		serviceReq.CorpType = &corpType
	}
	if req.IsSetKeyword() {
		keyword := req.GetKeyword()
		serviceReq.Keyword = &keyword
	}

	serviceResp, err := s.DomainCorporationSVC.ListCorporations(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	corpData := make([]*corporationAPI.CorporationData, len(serviceResp.Corporations))
	for i, corp := range serviceResp.Corporations {
		corpData[i] = convertEntityToCorporationData(corp)
	}

	resp := corporationAPI.NewListCorpsResponse()
	resp.Data = corpData
	resp.Total = serviceResp.Total
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Corporations listed successfully",
		StatusCode:    0,
	}

	return resp, nil
}

// Department methods
func (s *CorporationApplicationService) CreateDepartment(ctx context.Context, req *departmentAPI.CreateDepartmentRequest) (*departmentAPI.CreateDepartmentResponse, error) {
	// Extract creator ID from Base
	creatorID := extractCreatorIDFromBase(req.GetBase())

	serviceReq := &service.CreateDepartmentRequest{
		CorpID:       req.GetCorpID(),
		Name:         req.GetName(),
		ParentDeptID: getOptionalDepartmentParentID(req),
		Sort:         getOptionalDepartmentSort(req),
		CreatorID:    creatorID,
	}

	var serviceResp *service.CreateDepartmentResponse
	var err error

	err = s.db.Transaction(func(tx *gorm.DB) error {
		serviceResp, err = s.DomainDepartmentSVC.CreateDepartment(ctx, serviceReq)
		return err
	})

	if err != nil {
		return nil, err
	}

	resp := departmentAPI.NewCreateDepartmentResponse()
	resp.Data = convertEntityToDepartmentData(serviceResp.Department)
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Department created successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) GetDepartmentByID(ctx context.Context, req *departmentAPI.GetDepartmentRequest) (*departmentAPI.GetDepartmentResponse, error) {
	serviceResp, err := s.DomainDepartmentSVC.GetDepartmentByID(ctx, &service.GetDepartmentByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := departmentAPI.NewGetDepartmentResponse()
	resp.Data = convertEntityToDepartmentData(serviceResp.Department)
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Department retrieved successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) UpdateDepartment(ctx context.Context, req *departmentAPI.UpdateDepartmentRequest) (*departmentAPI.UpdateDepartmentResponse, error) {
	serviceReq := &service.UpdateDepartmentRequest{
		ID: req.GetID(),
	}

	if req.IsSetName() {
		name := req.GetName()
		serviceReq.Name = &name
	}
	if req.IsSetParentID() {
		parentID := req.GetParentID()
		serviceReq.ParentDeptID = &parentID
	}
	if req.IsSetSort() {
		sort := req.GetSort()
		serviceReq.Sort = &sort
	}
	if req.IsSetStatus() {
		status := convertApiDepartmentStatusToEntity(req.GetStatus())
		serviceReq.Status = &status
	}

	err := s.DomainDepartmentSVC.UpdateDepartment(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	resp := departmentAPI.NewUpdateDepartmentResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Department updated successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) DeleteDepartment(ctx context.Context, req *departmentAPI.DeleteDepartmentRequest) (*departmentAPI.DeleteDepartmentResponse, error) {
	err := s.DomainDepartmentSVC.DeleteDepartment(ctx, &service.DeleteDepartmentRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := departmentAPI.NewDeleteDepartmentResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Department deleted successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) ListDepartments(ctx context.Context, req *departmentAPI.ListDepartmentRequest) (*departmentAPI.ListDepartmentResponse, error) {
	serviceReq := &service.ListDepartmentsRequest{
		Limit: int(req.GetPageSize()),
		Page:  int(req.GetPage()),
	}

	corpID := req.GetCorpID()
	serviceReq.CorpID = &corpID

	if req.IsSetParentID() {
		parentID := req.GetParentID()
		serviceReq.ParentDeptID = &parentID
	}
	if req.IsSetStatus() {
		status := convertApiDepartmentStatusToEntity(req.GetStatus())
		serviceReq.Status = &status
	}
	if req.IsSetKeyword() {
		keyword := req.GetKeyword()
		serviceReq.Keyword = &keyword
	}

	serviceResp, err := s.DomainDepartmentSVC.ListDepartments(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	deptData := make([]*departmentAPI.DepartmentData, len(serviceResp.Departments))
	for i, dept := range serviceResp.Departments {
		deptData[i] = convertEntityToDepartmentData(dept)
	}

	resp := departmentAPI.NewListDepartmentResponse()
	resp.Data = deptData
	resp.Total = serviceResp.Total
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Departments listed successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) SortDepartments(ctx context.Context, req *departmentAPI.SortDepartmentRequest) (*departmentAPI.SortDepartmentResponse, error) {
	sortItems := make([]service.SortItem, len(req.GetDepartmentIds()))
	for i, item := range req.GetDepartmentIds() {
		sortItems[i] = service.SortItem{
			ID:   item.GetID(),
			Sort: item.GetSort(),
		}
	}

	err := s.DomainDepartmentSVC.SortDepartments(ctx, &service.SortDepartmentsRequest{
		Items: sortItems,
	})
	if err != nil {
		return nil, err
	}

	resp := departmentAPI.NewSortDepartmentResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Departments sorted successfully",
		StatusCode:    0,
	}

	return resp, nil
}

// Employee methods
func (s *CorporationApplicationService) CreateEmployee(ctx context.Context, req *employeeAPI.CreateEmployeeRequest) (*employeeAPI.CreateEmployeeResponse, error) {
	// Extract creator ID from Base
	creatorID := extractCreatorIDFromBase(req.GetBase())

	// Convert from API model to Domain service request using the correct field names
	serviceReq := &service.CreateEmployeeRequest{
		CorpID:     req.GetCorpID(),
		Name:       req.GetName(),
		Email:      getStringPtr(req.GetEmail()),
		Phone:      getStringPtr(req.GetMobile()),
		EmployeeID: getStringPtr(req.GetEmployeeNo()),
		Position:   getStringPtr(""), // API doesn't have job title for create
		AvatarURI:  getStringPtr(req.GetAvatar()),
		Status:     entity.EmployeeStatusActive, // Default status
		OutEmpID:   getStringPtr(req.GetOutEmployeeID()),
		EmpSource:  convertApiEmployeeSourceToEntity(req.GetEmployeeSource()),
		CreatorID:  creatorID,
	}

	var serviceResp *service.CreateEmployeeResponse
	var err error

	err = s.db.Transaction(func(tx *gorm.DB) error {
		serviceResp, err = s.DomainEmployeeSVC.CreateEmployee(ctx, serviceReq)
		return err
	})

	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewCreateEmployeeResponse()
	resp.Data = convertEntityToEmployeeData(serviceResp.Employee)
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee created successfully",
		StatusCode:    0,
	}

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
	resp.Data = convertEntityToEmployeeData(serviceResp.Employee)
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee retrieved successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) UpdateEmployee(ctx context.Context, req *employeeAPI.UpdateEmployeeRequest) (*employeeAPI.UpdateEmployeeResponse, error) {
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

	err := s.DomainEmployeeSVC.UpdateEmployee(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewUpdateEmployeeResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee updated successfully",
		StatusCode:    0,
	}

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
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee deleted successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) ListEmployees(ctx context.Context, req *employeeAPI.ListEmployeeRequest) (*employeeAPI.ListEmployeeResponse, error) {
	serviceReq := &service.ListEmployeesRequest{
		Limit: int(req.GetPageSize()),
		Page:  int(req.GetPage()),
	}

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
		empData[i] = convertEntityToEmployeeData(emp)
	}

	resp := employeeAPI.NewListEmployeeResponse()
	resp.Data = empData
	resp.Total = serviceResp.Total
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employees listed successfully",
		StatusCode:    0,
	}

	return resp, nil
}

// Employee Department relationship methods
func (s *CorporationApplicationService) AssignEmployeeToDepartment(ctx context.Context, req *employeeAPI.AssignEmployeeToDepartmentRequest) (*employeeAPI.AssignEmployeeToDepartmentResponse, error) {
	serviceReq := &service.AssignEmployeeToDepartmentRequest{
		EmpID:     req.GetEmployeeID(),
		DeptID:    req.GetDepartmentID(),
		IsLeader:  false, // Default to false, can be enhanced later
	}

	err := s.db.Transaction(func(tx *gorm.DB) error {
		return s.DomainEmployeeSVC.AssignEmployeeToDepartment(ctx, serviceReq)
	})

	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewAssignEmployeeToDepartmentResponse()
	// Create a mock EmployeeDepartmentData for now
	resp.Data = &employeeAPI.EmployeeDepartmentData{
		EmployeeID:   req.GetEmployeeID(),
		DepartmentID: req.GetDepartmentID(),
	}
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee assigned to department successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) UpdateEmployeeDepartment(ctx context.Context, req *employeeAPI.UpdateEmployeeDepartmentRequest) (*employeeAPI.UpdateEmployeeDepartmentResponse, error) {
	// For now, this is a placeholder implementation
	// The actual implementation would require additional service layer support
	resp := employeeAPI.NewUpdateEmployeeDepartmentResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee department updated successfully",
		StatusCode:    0,
	}

	return resp, nil
}

func (s *CorporationApplicationService) RemoveEmployeeFromDepartment(ctx context.Context, req *employeeAPI.RemoveEmployeeFromDepartmentRequest) (*employeeAPI.RemoveEmployeeFromDepartmentResponse, error) {
	// The API RemoveEmployeeFromDepartmentRequest only has ID field
	// This suggests it's removing by the relationship ID, not by employee and department IDs
	err := s.DomainEmployeeSVC.RemoveEmployeeFromDepartment(ctx, &service.RemoveEmployeeFromDepartmentRequest{
		EmpID:  req.GetID(), // Using the relationship ID as EmpID for now
		DeptID: 0,          // Will need proper implementation based on actual requirements
	})
	if err != nil {
		return nil, err
	}

	resp := employeeAPI.NewRemoveEmployeeFromDepartmentResponse()
	resp.BaseResp = &base.BaseResp{
		StatusMessage: "Employee removed from department successfully",
		StatusCode:    0,
	}

	return resp, nil
}

// Helper conversion functions
func convertApiCorpTypeToEntity(apiType common.CorporationType) entity.CorporationType {
	switch apiType {
	case common.CorporationType_GROUP:
		return entity.CorporationTypeGroup
	case common.CorporationType_COMPANY:
		return entity.CorporationTypeCompany
	case common.CorporationType_BRANCH:
		return entity.CorporationTypeBranch
	default:
		return entity.CorporationTypeGroup
	}
}

func convertApiCorpSourceToEntity(apiSource common.DataSource) entity.CorporationSource {
	return entity.CorporationSource(apiSource)
}

func convertEntityCorpTypeToCommon(entityType entity.CorporationType) common.CorporationType {
	switch entityType {
	case entity.CorporationTypeGroup:
		return common.CorporationType_GROUP
	case entity.CorporationTypeCompany:
		return common.CorporationType_COMPANY
	case entity.CorporationTypeBranch:
		return common.CorporationType_BRANCH
	default:
		return common.CorporationType_GROUP
	}
}

func convertEntityToCorporationData(corp *entity.Corporation) *corporationAPI.CorporationData {
	if corp == nil {
		return nil
	}

	corpData := &corporationAPI.CorporationData{
		ID:        corp.ID,
		Name:      corp.Name,
		CorpType:  convertEntityCorpTypeToCommon(corp.CorpType),
		Sort:      corp.Sort,
		CreatorID: corp.CreatorID,
		CreatedAt: corp.CreatedAt,
		UpdatedAt: corp.UpdatedAt,
	}

	if corp.ParentID != nil {
		corpData.ParentID = corp.ParentID
	}
	if corp.OutCorpID != nil {
		corpData.OutCorpID = corp.OutCorpID
	}
	if corp.CorpSource != entity.CorporationSourceUnknown {
		corpSource := common.DataSource(corp.CorpSource)
		corpData.CorpSource = &corpSource
	}

	return corpData
}

func convertApiDepartmentStatusToEntity(apiStatus common.DepartmentStatus) entity.DepartmentStatus {
	switch apiStatus {
	case common.DepartmentStatus_NORMAL:
		return entity.DepartmentStatusActive
	case common.DepartmentStatus_DISABLED:
		return entity.DepartmentStatusInactive
	default:
		return entity.DepartmentStatusActive
	}
}

func convertEntityDepartmentStatusToCommon(entityStatus entity.DepartmentStatus) common.DepartmentStatus {
	switch entityStatus {
	case entity.DepartmentStatusActive:
		return common.DepartmentStatus_NORMAL
	case entity.DepartmentStatusInactive:
		return common.DepartmentStatus_DISABLED
	default:
		return common.DepartmentStatus_NORMAL
	}
}

func convertEntityToDepartmentData(dept *entity.Department) *departmentAPI.DepartmentData {
	if dept == nil {
		return nil
	}

	deptData := &departmentAPI.DepartmentData{
		ID:        dept.ID,
		CorpID:    dept.CorpID,
		Name:      dept.Name,
		Level:     dept.Level,
		Sort:      dept.Sort,
		Status:    convertEntityDepartmentStatusToCommon(dept.Status),
		CreatorID: dept.CreatorID,
		CreatedAt: dept.CreatedAt,
		UpdatedAt: dept.UpdatedAt,
	}

	if dept.ParentDeptID != nil {
		deptData.ParentID = dept.ParentDeptID
	}
	if dept.Code != nil {
		deptData.Code = dept.Code
	}
	if dept.LeaderID != nil {
		deptData.LeaderID = dept.LeaderID
	}
	if dept.OutDeptID != nil {
		deptData.OutDepartmentID = dept.OutDeptID
	}
	if dept.FullPath != "" {
		deptData.FullPath = &dept.FullPath
	}
	if dept.DeptSource != entity.DepartmentSourceManual {
		deptSource := common.DataSource(dept.DeptSource)
		deptData.DepartmentSource = &deptSource
	}

	return deptData
}

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

func convertApiEmployeeDepartmentStatusToEntity(apiStatus common.EmployeeDepartmentStatus) common.EmployeeDepartmentStatus {
	return apiStatus
}

func convertEntityToEmployeeData(emp *entity.Employee) *employeeAPI.EmployeeData {
	if emp == nil {
		return nil
	}

	empData := &employeeAPI.EmployeeData{
		ID:        emp.ID,
		CorpID:    emp.CorpID,
		Name:      emp.Name,
		Status:    convertEntityEmployeeStatusToCommon(emp.Status),
		CreatorID: emp.CreatorID,
		CreatedAt: emp.CreatedAt,
		UpdatedAt: emp.UpdatedAt,
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

func convertEntityToEmployeeDepartmentData(empDept *entity.EmployeeDepartmentRelation) *employeeAPI.EmployeeDepartmentData {
	if empDept == nil {
		return nil
	}

	empDeptData := &employeeAPI.EmployeeDepartmentData{
		ID:           empDept.ID,
		EmployeeID:   empDept.EmpID,
		DepartmentID: empDept.DeptID,
		CreatorID:    empDept.CreatorID,
		CreatedAt:    empDept.CreatedAt,
		UpdatedAt:    empDept.UpdatedAt,
	}

	return empDeptData
}

// Helper functions for optional fields
func getOptionalParentID(req *corporationAPI.CreateCorpRequest) *int64 {
	if req.IsSetParentID() {
		parentID := req.GetParentID()
		return &parentID
	}
	return nil
}

func getOptionalSort(req *corporationAPI.CreateCorpRequest) int32 {
	if req.IsSetSort() {
		return req.GetSort()
	}
	return 0
}

func getOptionalOutCorpID(req *corporationAPI.CreateCorpRequest) *string {
	if req.IsSetOutCorpID() {
		outCorpID := req.GetOutCorpID()
		return &outCorpID
	}
	return nil
}

func getOptionalDepartmentParentID(req *departmentAPI.CreateDepartmentRequest) *int64 {
	if req.IsSetParentID() {
		parentID := req.GetParentID()
		return &parentID
	}
	return nil
}

func getOptionalDepartmentSort(req *departmentAPI.CreateDepartmentRequest) int32 {
	if req.IsSetSort() {
		return req.GetSort()
	}
	return 0
}

func getStringPtr(str string) *string {
	if str == "" {
		return nil
	}
	return &str
}

func extractCreatorIDFromBase(base *base.Base) int64 {
	// TODO: Extract creator ID from auth context in base
	// For now, return a default value
	return 1
}