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

// NewCorporationSVC creates a new corporation service
func NewCorporationSVC(config *CorporationSVCConfig) Corporation {
	return &corporationSVC{
		corporationRepo: repository.NewCorporationRepo(config.DB, config.IDGen),
		departmentRepo:  repository.NewDepartmentRepo(config.DB, config.IDGen),
		idgen:           config.IDGen,
	}
}

// CorporationSVCConfig configuration for corporation service
type CorporationSVCConfig struct {
	DB    *gorm.DB          // required
	IDGen idgen.IDGenerator // required
}

type corporationSVC struct {
	corporationRepo repository.CorporationRepo
	departmentRepo  repository.DepartmentRepo
	idgen           idgen.IDGenerator
}

// CreateCorporation creates a new corporation
func (s *corporationSVC) CreateCorporation(ctx context.Context, request *CreateCorporationRequest) (*CreateCorporationResponse, error) {
	// Validate request
	if err := s.validateCreateCorporationRequest(request); err != nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("error", err.Error()))
	}

	// Check if parent corporation exists (if provided)
	if request.ParentID != nil {
		parent, err := s.corporationRepo.GetByID(ctx, *request.ParentID)
		if err != nil {
			return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
		if parent == nil {
			return nil, errorx.New(errno.ErrCorporationParentNotFound)
		}
	}

	// Create corporation entity
	corp := &entity.Corporation{
		Name:       request.Name,
		ParentID:   request.ParentID,
		CorpType:   request.CorpType,
		Sort:       request.Sort,
		OutCorpID:  request.OutCorpID,
		CorpSource: request.CorpSource,
		CreatorID:  request.CreatorID,
	}

	// Save to database
	createdCorp, err := s.corporationRepo.Create(ctx, corp)
	if err != nil {
		return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}

	return &CreateCorporationResponse{
		Corporation: createdCorp,
	}, nil
}

// GetCorporationByID gets corporation by ID
func (s *corporationSVC) GetCorporationByID(ctx context.Context, request *GetCorporationByIDRequest) (*GetCorporationByIDResponse, error) {
	if request.ID <= 0 {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("message", "invalid corporation ID"))
	}

	corp, err := s.corporationRepo.GetByID(ctx, request.ID)
	if err != nil {
		return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}
	if corp == nil {
		return nil, errorx.New(errno.ErrCorporationNotFound)
	}

	return &GetCorporationByIDResponse{
		Corporation: corp,
	}, nil
}

// UpdateCorporation updates corporation
func (s *corporationSVC) UpdateCorporation(ctx context.Context, request *UpdateCorporationRequest) error {
	// Validate request
	if request.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("message", "invalid corporation ID"))
	}
	if request.Name != nil && *request.Name == "" {
		return errorx.New(errno.ErrCorporationNameEmpty)
	}

	// Check if corporation exists
	existingCorp, err := s.corporationRepo.GetByID(ctx, request.ID)
	if err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}
	if existingCorp == nil {
		return errorx.New(errno.ErrCorporationNotFound)
	}

	// Check if parent corporation exists (if provided and changed)
	if request.ParentID != nil && (existingCorp.ParentID == nil || *existingCorp.ParentID != *request.ParentID) {
		parent, err := s.corporationRepo.GetByID(ctx, *request.ParentID)
		if err != nil {
			return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
		if parent == nil {
			return errorx.New(errno.ErrCorporationParentNotFound)
		}

		// Prevent circular reference
		if *request.ParentID == request.ID {
			return errorx.New(errno.ErrCorporationCircularRef)
		}
	}

	// Update entity fields
	if request.Name != nil {
		existingCorp.Name = *request.Name
	}
	existingCorp.ParentID = request.ParentID
	if request.CorpType != nil {
		existingCorp.CorpType = *request.CorpType
	}
	if request.Sort != nil {
		existingCorp.Sort = *request.Sort
	}
	if request.OutCorpID != nil {
		existingCorp.OutCorpID = request.OutCorpID
	}
	if request.CorpSource != nil {
		existingCorp.CorpSource = *request.CorpSource
	}

	// Save changes
	if err := s.corporationRepo.Update(ctx, existingCorp); err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}

	// If corporation name changed, update all affected department paths
	if request.Name != nil {
		if err := s.updateAffectedDepartmentPaths(ctx, request.ID); err != nil {
			// Log error but don't fail the operation
			// TODO: Add proper logging here
		}
	}

	return nil
}

// DeleteCorporation deletes corporation
func (s *corporationSVC) DeleteCorporation(ctx context.Context, request *DeleteCorporationRequest) error {
	if request.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("message", "invalid corporation ID"))
	}

	// Check if corporation exists
	corp, err := s.corporationRepo.GetByID(ctx, request.ID)
	if err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}
	if corp == nil {
		return errorx.New(errno.ErrCorporationNotFound)
	}

	// Check if corporation has children
	children, err := s.corporationRepo.GetByParentID(ctx, request.ID)
	if err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}
	if len(children) > 0 {
		return errorx.New(errno.ErrCorporationCannotDelete)
	}

	// Check if corporation has departments
	departments, err := s.departmentRepo.GetByCorpID(ctx, request.ID)
	if err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}
	if len(departments) > 0 {
		return errorx.New(errno.ErrCorporationCannotDelete)
	}

	// Delete corporation
	if err := s.corporationRepo.Delete(ctx, request.ID); err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}

	return nil
}

// ListCorporations lists corporations with filters
func (s *corporationSVC) ListCorporations(ctx context.Context, request *ListCorporationsRequest) (*ListCorporationsResponse, error) {
	// Validate pagination
	page := request.Page
	limit := request.Limit
	if page <= 0 {
		page = consts.DefaultPage
	}
	if limit <= 0 || limit > consts.MaxPageSize {
		limit = consts.DefaultPageSize
	}

	// Create filter
	filter := &entity.CorporationListFilter{
		ParentID:   request.ParentID,
		CorpType:   request.CorpType,
		CorpSource: request.CorpSource,
		CreatorID:  request.CreatorID,
		Keyword:    request.Keyword,
		Page:       page,
		Limit:      limit,
	}

	// Get corporations
	corps, hasMore, err := s.corporationRepo.List(ctx, filter)
	if err != nil {
		return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}

	return &ListCorporationsResponse{
		Corporations: corps,
		HasMore:      hasMore,
		Total:        int64(len(corps)),
	}, nil
}

// GetCorporationTree gets corporation hierarchy tree
func (s *corporationSVC) GetCorporationTree(ctx context.Context, request *GetCorporationTreeRequest) (*GetCorporationTreeResponse, error) {
	var rootCorps []*entity.Corporation
	var err error

	if request.RootID != nil {
		// Get specific root and its children tree
		rootCorps, err = s.corporationRepo.GetCorporationTree(ctx, *request.RootID)
		if err != nil {
			return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
	} else {
		// Get all corporations to build the full tree
		// First get all root corporations
		rootCorps, err = s.corporationRepo.GetRootCorporations(ctx)
		if err != nil {
			return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
		
		// Then get full tree for each root
		allCorps := make([]*entity.Corporation, 0)
		for _, root := range rootCorps {
			treeCorps, err := s.corporationRepo.GetCorporationTree(ctx, root.ID)
			if err != nil {
				return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
			}
			allCorps = append(allCorps, treeCorps...)
		}
		rootCorps = allCorps
	}

	return &GetCorporationTreeResponse{
		Corporations: rootCorps,
	}, nil
}

// MoveCorporation moves corporation to new parent
func (s *corporationSVC) MoveCorporation(ctx context.Context, request *MoveCorporationRequest) error {
	if request.ID <= 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("message", "invalid corporation ID"))
	}

	// Check if corporation exists
	corp, err := s.corporationRepo.GetByID(ctx, request.ID)
	if err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}
	if corp == nil {
		return errorx.New(errno.ErrCorporationNotFound)
	}

	// Check if new parent exists (if provided)
	if request.NewParentID != nil {
		parent, err := s.corporationRepo.GetByID(ctx, *request.NewParentID)
		if err != nil {
			return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
		if parent == nil {
			return errorx.New(errno.ErrCorporationParentNotFound)
		}

		// Prevent circular reference
		if *request.NewParentID == request.ID {
			return errorx.New(errno.ErrCorporationCircularRef)
		}
	}

	// Update parent ID
	corp.ParentID = request.NewParentID
	if err := s.corporationRepo.Update(ctx, corp); err != nil {
		return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}

	return nil
}

// SortCorporations updates sort order for corporations
func (s *corporationSVC) SortCorporations(ctx context.Context, request *SortCorporationsRequest) error {
	if len(request.Items) == 0 {
		return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("message", "no items to sort"))
	}

	// Update each corporation's sort order
	for _, item := range request.Items {
		if item.ID <= 0 {
			return errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("message", "invalid corporation ID"))
		}

		corp, err := s.corporationRepo.GetByID(ctx, item.ID)
		if err != nil {
			return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
		if corp == nil {
			return errorx.New(errno.ErrCorporationNotFound)
		}

		corp.Sort = item.Sort
		if err := s.corporationRepo.Update(ctx, corp); err != nil {
			return errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
		}
	}

	return nil
}

// GetRootCorporations gets root corporations
func (s *corporationSVC) GetRootCorporations(ctx context.Context, request *GetRootCorporationsRequest) (*GetRootCorporationsResponse, error) {
	// Validate pagination
	page := request.Page
	limit := request.Limit
	if page <= 0 {
		page = consts.DefaultPage
	}
	if limit <= 0 || limit > consts.MaxPageSize {
		limit = consts.DefaultPageSize
	}

	// Create filter for root corporations (ParentID is nil)
	filter := &entity.CorporationListFilter{
		ParentID: nil,
		Page:     page,
		Limit:    limit,
	}

	// Get root corporations
	corps, hasMore, err := s.corporationRepo.List(ctx, filter)
	if err != nil {
		return nil, errorx.New(errno.ErrCorporationInternalError, errorx.KV("error", err.Error()))
	}

	return &GetRootCorporationsResponse{
		Corporations: corps,
		HasMore:      hasMore,
		Total:        int64(len(corps)),
	}, nil
}

// validateCreateCorporationRequest validates create corporation request
func (s *corporationSVC) validateCreateCorporationRequest(request *CreateCorporationRequest) error {
	if request.Name == "" {
		return errors.New("corporation name cannot be empty")
	}
	if request.CreatorID <= 0 {
		return errors.New("invalid creator ID")
	}
	return nil
}

// updateAffectedDepartmentPaths updates all department paths affected by corporation name change
func (s *corporationSVC) updateAffectedDepartmentPaths(ctx context.Context, corpID int64) error {
	// Get all departments in this corporation and its descendants
	affectedCorps, err := s.corporationRepo.GetCorporationTree(ctx, corpID)
	if err != nil {
		return err
	}

	// Update departments for each affected corporation
	for _, corp := range affectedCorps {
		// Get all departments in this corporation
		depts, err := s.departmentRepo.GetByCorpID(ctx, corp.ID)
		if err != nil {
			continue // Skip on error
		}

		// Update each department's path
		for _, dept := range depts {
			newPath, err := s.generateDepartmentPathForCorp(ctx, dept, corp.ID)
			if err != nil {
				continue // Skip on error
			}
			
			dept.FullPath = newPath
			dept.Level = s.calculateDepartmentLevel(newPath)
			
			// Update in database
			s.departmentRepo.Update(ctx, dept)
		}
	}

	return nil
}

// generateDepartmentPathForCorp generates department path for a specific corporation
func (s *corporationSVC) generateDepartmentPathForCorp(ctx context.Context, dept *entity.Department, corpID int64) (string, error) {
	// Generate corporation path
	corpPath, err := s.generateCorporationPath(ctx, corpID)
	if err != nil {
		return "", err
	}

	// Generate department hierarchy within the corporation
	deptPath := dept.Name
	if dept.ParentDeptID != nil {
		parentDept, err := s.departmentRepo.GetByID(ctx, *dept.ParentDeptID)
		if err != nil {
			return "", err
		}
		if parentDept != nil {
			parentDeptPath, err := s.generateDepartmentPathForCorp(ctx, parentDept, corpID)
			if err != nil {
				return "", err
			}
			// Extract department part from parent path (remove corp path prefix)
			corpPathLen := len(corpPath)
			if len(parentDeptPath) > corpPathLen+1 {
				deptHierarchy := parentDeptPath[corpPathLen+1:] // Remove "corpPath/"
				deptPath = deptHierarchy + "/" + dept.Name
			}
		}
	}

	return corpPath + "/" + deptPath, nil
}

// generateCorporationPath generates full path for corporation hierarchy
func (s *corporationSVC) generateCorporationPath(ctx context.Context, corpID int64) (string, error) {
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
func (s *corporationSVC) calculateDepartmentLevel(fullPath string) int32 {
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
