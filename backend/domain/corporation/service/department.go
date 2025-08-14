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

package service

import (
	"context"
	"errors"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/consts"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/repository"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// NewDepartmentSVC creates a new department service
func NewDepartmentSVC(config *DepartmentSVCConfig) Department {
	return &departmentSVC{
		departmentRepo:  repository.NewDepartmentRepo(config.DB, config.IDGen),
		corporationRepo: repository.NewCorporationRepo(config.DB, config.IDGen),
		employeeRepo:    repository.NewEmployeeRepo(config.DB, config.IDGen),
		idgen:          config.IDGen,
	}
}

// DepartmentSVCConfig configuration for department service
type DepartmentSVCConfig struct {
	DB    *gorm.DB          // required
	IDGen idgen.IDGenerator // required
}

type departmentSVC struct {
	departmentRepo  repository.DepartmentRepo
	corporationRepo repository.CorporationRepo
	employeeRepo    repository.EmployeeRepo
	idgen          idgen.IDGenerator
}

// CreateDepartment creates a new department
func (s *departmentSVC) CreateDepartment(ctx context.Context, req *CreateDepartmentRequest) (*CreateDepartmentResponse, error) {
	// Validate request
	if err := s.validateCreateDepartmentReq(req); err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInvalidParamCode)
	}

	// Check if corporation exists
	corp, err := s.corporationRepo.GetByID(ctx, req.CorpID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if corp == nil {
		return nil, errorx.New(errno.ErrCorporationNotFound)
	}

	// Check if parent department exists (if provided)
	if req.ParentDeptID != nil {
		parent, err := s.departmentRepo.GetByID(ctx, *req.ParentDeptID)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if parent == nil {
			return nil, errorx.New(errno.ErrDepartmentParentNotFound)
		}
		// Parent department must belong to the same corporation
		if parent.CorpID != req.CorpID {
			return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "parent department must belong to the same corporation"))
		}
	}

	// Create department entity
	dept := &entity.Department{
		CorpID:       req.CorpID,
		ParentDeptID: req.ParentDeptID,
		Name:         req.Name,
		Code:         req.Code,
		Level:        req.Level,
		FullPath:     req.FullPath,
		LeaderID:     req.LeaderID,
		Sort:         req.Sort,
		Status:       req.Status,
		OutDeptID:    req.OutDeptID,
		DeptSource:   req.DeptSource,
		CreatorID:    req.CreatorID,
	}

	// Generate full path if not provided
	if dept.FullPath == "" {
		dept.FullPath, err = s.generateDepartmentPath(ctx, dept)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
	}

	// Calculate level if not provided
	if dept.Level == 0 {
		dept.Level = s.calculateDepartmentLevel(dept.FullPath)
	}

	// Save to database
	createdDept, err := s.departmentRepo.Create(ctx, dept)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return &CreateDepartmentResponse{
		Department: createdDept,
	}, nil
}

// GetDepartment gets department by ID
func (s *departmentSVC) GetDepartmentByID(ctx context.Context, req *GetDepartmentByIDRequest) (*GetDepartmentByIDResponse, error) {
	if req.ID <= 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid department ID"))
	}

	dept, err := s.departmentRepo.GetByID(ctx, req.ID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if dept == nil {
		return nil, errorx.New(errno.ErrDepartmentNotFound)
	}

	return &GetDepartmentByIDResponse{
		Department: dept,
	}, nil
}

// UpdateDepartment updates department
func (s *departmentSVC) UpdateDepartment(ctx context.Context, req *UpdateDepartmentRequest) error {
	// Validate request
	if req.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid department ID"))
	}
	if req.Name != nil && *req.Name == "" {
		return errorx.New(errno.ErrDepartmentNameEmpty)
	}

	// Check if department exists
	existingDept, err := s.departmentRepo.GetByID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if existingDept == nil {
		return errorx.New(errno.ErrDepartmentNotFound)
	}

	// Check if parent department exists (if provided and changed)
	if req.ParentDeptID != nil && (existingDept.ParentDeptID == nil || *existingDept.ParentDeptID != *req.ParentDeptID) {
		parent, err := s.departmentRepo.GetByID(ctx, *req.ParentDeptID)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if parent == nil {
			return errorx.New(errno.ErrDepartmentParentNotFound)
		}

		// Parent department must belong to the same corporation
		if parent.CorpID != existingDept.CorpID {
			return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "parent department must belong to the same corporation"))
		}

		// Prevent circular reference
		if *req.ParentDeptID == req.ID {
			return errorx.New(errno.ErrDepartmentCircularRef)
		}
	}

	// Check what needs to be updated before making changes
	nameChanged := req.Name != nil && *req.Name != existingDept.Name
	parentChanged := req.ParentDeptID != existingDept.ParentDeptID
	
	// Update entity
	if req.Name != nil {
		existingDept.Name = *req.Name
	}
	existingDept.ParentDeptID = req.ParentDeptID
	if req.Code != nil {
		existingDept.Code = req.Code
	}
	if req.LeaderID != nil {
		existingDept.LeaderID = req.LeaderID
	}
	if req.Sort != nil {
		existingDept.Sort = *req.Sort
	}
	if req.Status != nil {
		existingDept.Status = *req.Status
	}
	existingDept.OutDeptID = req.OutDeptID

	// Regenerate path if parent changed or name changed
	needPathUpdate := parentChanged || nameChanged
	
	if needPathUpdate {
		newPath, err := s.generateDepartmentPath(ctx, existingDept)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		existingDept.FullPath = newPath
		existingDept.Level = s.calculateDepartmentLevel(newPath)
	}

	// Save changes
	if err := s.departmentRepo.Update(ctx, existingDept); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	// If department name changed, update all child departments' paths
	if nameChanged {
		if err := s.updateChildDepartmentPaths(ctx, existingDept.ID); err != nil {
			// Log error but don't fail the operation
			// TODO: Add proper logging here
		}
	}

	return nil
}

// DeleteDepartment deletes department
func (s *departmentSVC) DeleteDepartment(ctx context.Context, req *DeleteDepartmentRequest) error {
	if req.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid department ID"))
	}

	// Check if department exists
	dept, err := s.departmentRepo.GetByID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if dept == nil {
		return errorx.New(errno.ErrDepartmentNotFound)
	}

	// Check if department has children
	children, err := s.departmentRepo.GetByParentDeptID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if len(children) > 0 {
		return errorx.New(errno.ErrDepartmentCannotDelete)
	}

	// Check if department has employees
	employees, err := s.employeeRepo.GetByDeptID(ctx, req.ID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if len(employees) > 0 {
		return errorx.New(errno.ErrDepartmentCannotDelete)
	}

	// Delete department
	if err := s.departmentRepo.Delete(ctx, req.ID); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// ListDepartments lists departments with filters
func (s *departmentSVC) ListDepartments(ctx context.Context, req *ListDepartmentsRequest) (*ListDepartmentsResponse, error) {
	// Validate pagination
	if req.Page <= 0 {
		req.Page = consts.DefaultPage
	}
	if req.Limit <= 0 || req.Limit > consts.MaxPageSize {
		req.Limit = consts.DefaultPageSize
	}

	// Create filter
	filter := &entity.DepartmentListFilter{
		CorpID:       req.CorpID,
		ParentDeptID: req.ParentDeptID,
		Status:       req.Status,
		DeptSource:   req.DeptSource,
		CreatorID:    req.CreatorID,
		Keyword:      req.Keyword,
		Page:         req.Page,
		Limit:        req.Limit,
	}

	// Get departments
	depts, hasMore, err := s.departmentRepo.List(ctx, filter)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return &ListDepartmentsResponse{
		Departments: depts,
		HasMore:     hasMore,
		Total:       int64(len(depts)),
	}, nil
}

// GetDepartmentTree gets department hierarchy tree
func (s *departmentSVC) GetDepartmentTree(ctx context.Context, req *GetDepartmentTreeRequest) (*GetDepartmentTreeResponse, error) {
	if req.CorpID <= 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid corporation ID"))
	}

	var rootDepts []*entity.Department
	var err error

	if req.RootDeptID != nil {
		// Get specific root and its children
		root, err := s.departmentRepo.GetByID(ctx, *req.RootDeptID)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if root == nil {
			return nil, errorx.New(errno.ErrDepartmentNotFound)
		}
		rootDepts = []*entity.Department{root}
	} else {
		// Get all root departments for the corporation
		filter := &entity.DepartmentListFilter{
			CorpID:       &req.CorpID,
			ParentDeptID: nil, // Root departments have no parent
			Page:         1,
			Limit:        1000, // Large limit to get all roots
		}
		rootDepts, _, err = s.departmentRepo.List(ctx, filter)
		if err != nil {
			return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
	}

	// Build tree structure
	treeNodes := make([]*entity.Department, 0, len(rootDepts))
	for _, dept := range rootDepts {
		node, err := s.buildDepartmentTreeNode(ctx, dept)
		if err != nil {
			return nil, err
		}
		treeNodes = append(treeNodes, node)
	}

	return &GetDepartmentTreeResponse{
		Departments: treeNodes,
	}, nil
}

// MoveDepartment moves department to new parent
func (s *departmentSVC) MoveDepartment(ctx context.Context, req *MoveDepartmentRequest) error {
	if req.DeptID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid department ID"))
	}

	// Check if department exists
	dept, err := s.departmentRepo.GetByID(ctx, req.DeptID)
	if err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}
	if dept == nil {
		return errorx.New(errno.ErrDepartmentNotFound)
	}

	// Check if new parent exists (if provided)
	if req.NewParentID != 0 {
		parent, err := s.departmentRepo.GetByID(ctx, req.NewParentID)
		if err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
		if parent == nil {
			return errorx.New(errno.ErrDepartmentParentNotFound)
		}

		// Parent must belong to same corporation
		if parent.CorpID != dept.CorpID {
			return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "new parent must belong to same corporation"))
		}

		// Prevent circular reference
		if req.NewParentID == req.DeptID {
			return errorx.New(errno.ErrDepartmentCircularRef)
		}
	}

	// Move department
	if err := s.departmentRepo.MoveDepartment(ctx, req.DeptID, req.NewParentID); err != nil {
		return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	return nil
}

// Helper functions

// generateDepartmentPath generates full path for department including corporation path
func (s *departmentSVC) generateDepartmentPath(ctx context.Context, dept *entity.Department) (string, error) {
	if dept.ParentDeptID == nil {
		// For top-level departments, include corporation path
		corpPath, err := s.generateCorporationPath(ctx, dept.CorpID)
		if err != nil {
			return "", err
		}
		return corpPath + "/" + dept.Name, nil
	}

	parent, err := s.departmentRepo.GetByID(ctx, *dept.ParentDeptID)
	if err != nil {
		return "", err
	}
	if parent == nil {
		return "", errors.New("parent department not found")
	}

	// If parent's FullPath is empty, recursively generate it
	parentPath := parent.FullPath
	if parentPath == "" {
		parentPath, err = s.generateDepartmentPath(ctx, parent)
		if err != nil {
			return "", err
		}
		// Update parent's FullPath in database
		parent.FullPath = parentPath
		parent.Level = s.calculateDepartmentLevel(parentPath)
		if updateErr := s.departmentRepo.Update(ctx, parent); updateErr != nil {
			// Log error but don't fail the operation
			// TODO: Add proper logging here
		}
	}

	return parentPath + "/" + dept.Name, nil
}

// generateCorporationPath generates full path for corporation hierarchy
func (s *departmentSVC) generateCorporationPath(ctx context.Context, corpID int64) (string, error) {
	corp, err := s.corporationRepo.GetByID(ctx, corpID)
	if err != nil {
		return "", err
	}
	if corp == nil {
		return "", errors.New("corporation not found")
	}

	if corp.ParentID == nil {
		// Root corporation
		return corp.Name, nil
	}

	// Get parent corporation path recursively
	parentPath, err := s.generateCorporationPath(ctx, *corp.ParentID)
	if err != nil {
		return "", err
	}

	return parentPath + "/" + corp.Name, nil
}

// calculateDepartmentLevel calculates department level based on path
func (s *departmentSVC) calculateDepartmentLevel(fullPath string) int32 {
	if fullPath == "" {
		return 1
	}
	// Count slashes + 1
	count := int32(1)
	for _, char := range fullPath {
		if char == '/' {
			count++
		}
	}
	return count
}

// buildDepartmentTreeNode recursively builds department tree node
func (s *departmentSVC) buildDepartmentTreeNode(ctx context.Context, dept *entity.Department) (*entity.Department, error) {
	node := &entity.Department{
		ID:           dept.ID,
		CorpID:       dept.CorpID,
		ParentDeptID: dept.ParentDeptID,
		Name:         dept.Name,
		Code:         dept.Code,
		Level:        dept.Level,
		FullPath:     dept.FullPath,
		LeaderID:     dept.LeaderID,
		Sort:         dept.Sort,
		Status:       dept.Status,
		OutDeptID:    dept.OutDeptID,
		DeptSource:   dept.DeptSource,
		CreatorID:    dept.CreatorID,
		CreatedAt:    dept.CreatedAt,
		UpdatedAt:    dept.UpdatedAt,
		Children:     []*entity.Department{},
	}

	// Get children
	children, err := s.departmentRepo.GetByParentDeptID(ctx, dept.ID)
	if err != nil {
		return nil, errorx.WrapByCode(err, errno.ErrCorporationInternalError)
	}

	// Recursively build children nodes
	for _, child := range children {
		childNode, err := s.buildDepartmentTreeNode(ctx, child)
		if err != nil {
			return nil, err
		}
		node.Children = append(node.Children, childNode)
	}

	return node, nil
}

// validateCreateDepartmentReq validates create department request
func (s *departmentSVC) validateCreateDepartmentReq(req *CreateDepartmentRequest) error {
	if req.CorpID <= 0 {
		return errors.New("invalid corporation ID")
	}
	if req.Name == "" {
		return errors.New("department name cannot be empty")
	}
	if req.CreatorID <= 0 {
		return errors.New("invalid creator ID")
	}
	return nil
}

// SortDepartments updates the sort order of multiple departments
func (s *departmentSVC) SortDepartments(ctx context.Context, req *SortDepartmentsRequest) error {
	if len(req.Items) == 0 {
		return nil
	}

	// Validate all items first
	for _, item := range req.Items {
		if item.ID <= 0 {
			return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid department ID"))
		}
		if item.Sort < 0 {
			return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "invalid sort value"))
		}
	}

	// Update sort values
	for _, item := range req.Items {
		if err := s.departmentRepo.UpdateSort(ctx, item.ID, item.Sort); err != nil {
			return errorx.WrapByCode(err, errno.ErrCorporationInternalError)
		}
	}

	return nil
}

// updateChildDepartmentPaths updates all child departments' paths when parent department name changes
func (s *departmentSVC) updateChildDepartmentPaths(ctx context.Context, parentDeptID int64) error {
	// Get all child departments
	children, err := s.departmentRepo.GetByParentDeptID(ctx, parentDeptID)
	if err != nil {
		return err
	}

	// Update each child department recursively
	for _, child := range children {
		// Regenerate path for this child
		newPath, err := s.generateDepartmentPath(ctx, child)
		if err != nil {
			continue // Skip on error
		}
		
		child.FullPath = newPath
		child.Level = s.calculateDepartmentLevel(newPath)
		
		// Update in database
		if err := s.departmentRepo.Update(ctx, child); err != nil {
			continue // Skip on error
		}
		
		// Recursively update grandchildren
		if err := s.updateChildDepartmentPaths(ctx, child.ID); err != nil {
			continue // Skip on error
		}
	}

	return nil
}