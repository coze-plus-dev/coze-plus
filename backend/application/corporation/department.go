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

package corporation

import (
	"context"

	"gorm.io/gorm"

	departmentAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/department"
	"github.com/coze-dev/coze-studio/backend/api/model/corporation/common"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/service"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// Department methods
func (s *CorporationApplicationService) CreateDepartment(ctx context.Context, req *departmentAPI.CreateDepartmentRequest) (*departmentAPI.CreateDepartmentResponse, error) {
	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	serviceReq := &service.CreateDepartmentRequest{
		CorpID:       req.GetCorpID(),
		Name:         req.GetName(),
		ParentDeptID: getOptionalDepartmentParentID(req),
		Sort:         getOptionalDepartmentSort(req),
		CreatorID:    ptr.From(uid),
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
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToDepartmentData(serviceResp.Department)

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
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToDepartmentData(serviceResp.Department)

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
	resp.Code = 0
	resp.Msg = ""

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
	resp.Code = 0
	resp.Msg = ""

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
	resp.Code = 0
	resp.Msg = ""
	resp.Data = deptData
	resp.Total = serviceResp.Total

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
	resp.Code = 0
	resp.Msg = ""

	return resp, nil
}

// GetDepartmentTree returns the department tree structure for a corporation
func (s *CorporationApplicationService) GetDepartmentTree(ctx context.Context, req *departmentAPI.GetDepartmentTreeRequest) (*departmentAPI.GetDepartmentTreeResponse, error) {
	resp := departmentAPI.NewGetDepartmentTreeResponse()
	resp.Code = 0
	resp.Msg = ""
	
	corpID := req.GetCorpID()
	
	var parentID *int64
	if req.IsSetParentID() {
		id := req.GetParentID()
		parentID = &id
	}
	
	depth := int32(0) // 0 means all levels
	if req.IsSetDepth() {
		depth = req.GetDepth()
	}
	
	includeEmployeeCount := false
	if req.IsSetIncludeEmployeeCount() {
		includeEmployeeCount = req.GetIncludeEmployeeCount()
	}
	
	// Get department tree
	deptTreeReq := &service.GetDepartmentTreeRequest{
		CorpID:     corpID,
		RootDeptID: parentID,
	}
	
	deptTreeResp, err := s.DomainDepartmentSVC.GetDepartmentTree(ctx, deptTreeReq)
	if err != nil {
		return nil, err
	}
	
	// Build tree nodes
	treeNodes := make([]*departmentAPI.DepartmentTreeNode, 0)
	deptMap := make(map[int64]*departmentAPI.DepartmentTreeNode)
	
	// First pass: create all department nodes
	for _, dept := range deptTreeResp.Departments {
		node := &departmentAPI.DepartmentTreeNode{
			ID:            dept.ID,
			CorpID:        dept.CorpID,
			ParentID:      dept.ParentDeptID,
			Name:          dept.Name,
			Code:          dept.Code,
			Level:         dept.Level,
			FullPath:      &dept.FullPath,
			LeaderID:      dept.LeaderID,
			Sort:          dept.Sort,
			Status:        convertEntityDepartmentStatusToCommon(dept.Status),
			EmployeeCount: 0,
			Children:      make([]*departmentAPI.DepartmentTreeNode, 0),
			HasChildren:   false,
			IsExpanded:    false,
		}
		deptMap[dept.ID] = node
	}
	
	// Build department hierarchy
	for _, dept := range deptTreeResp.Departments {
		node := deptMap[dept.ID]
		if dept.ParentDeptID == nil || (parentID != nil && dept.ID == *parentID) {
			// Root node or specified root
			treeNodes = append(treeNodes, node)
		} else if parentNode, exists := deptMap[*dept.ParentDeptID]; exists {
			parentNode.Children = append(parentNode.Children, node)
			parentNode.HasChildren = true
		}
	}
	
	// Apply depth limit if specified
	if depth > 0 {
		for _, node := range treeNodes {
			s.applyDepthLimitToDepartmentTree(node, 1, depth)
		}
	}
	
	// If include employee count, calculate counts
	if includeEmployeeCount {
		for _, node := range treeNodes {
			s.calculateDepartmentEmployeeCount(ctx, node)
		}
	}
	
	resp.Data = treeNodes
	return resp, nil
}

// Helper conversion functions for department
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

func (s *CorporationApplicationService) applyDepthLimitToDepartmentTree(node *departmentAPI.DepartmentTreeNode, currentDepth, maxDepth int32) {
	if currentDepth >= maxDepth {
		// Mark that it has children but don't load them
		if len(node.Children) > 0 {
			node.HasChildren = true
			node.Children = make([]*departmentAPI.DepartmentTreeNode, 0)
		}
		return
	}
	
	for _, child := range node.Children {
		s.applyDepthLimitToDepartmentTree(child, currentDepth+1, maxDepth)
	}
}

func (s *CorporationApplicationService) calculateDepartmentEmployeeCount(ctx context.Context, node *departmentAPI.DepartmentTreeNode) int32 {
	// Get employee count for this department
	empReq := &service.ListEmployeesRequest{
		DeptID: &node.ID,
		Limit:  1,
		Page:   1,
	}
	
	count := int32(0)
	empResp, err := s.DomainEmployeeSVC.ListEmployees(ctx, empReq)
	if err == nil {
		count = int32(empResp.Total)
	}
	
	// Add counts from children
	for _, child := range node.Children {
		count += s.calculateDepartmentEmployeeCount(ctx, child)
	}
	
	node.EmployeeCount = count
	return count
}