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

package entity

import (
	"errors"
	"strings"
)

// Department entity represents a department in the domain
type Department struct {
	ID           int64             `json:"id"`
	CorpID       int64             `json:"corp_id"`
	ParentDeptID *int64            `json:"parent_dept_id"`
	Name         string            `json:"name"`
	Code         *string           `json:"code"`
	Level        int32             `json:"level"`
	FullPath     string            `json:"full_path"`
	LeaderID     *int64            `json:"leader_id"`
	Sort         int32             `json:"sort"`
	Status       DepartmentStatus  `json:"status"`
	OutDeptID    *string           `json:"out_dept_id"`
	DeptSource   DepartmentSource  `json:"dept_source"`
	CreatorID    int64             `json:"creator_id"`
	CreatedAt    int64             `json:"created_at"`
	UpdatedAt    int64             `json:"updated_at"`
	DeletedAt    *int64            `json:"deleted_at"`
	
	// Aggregated fields (not stored in DB)
	Children  []*Department `json:"children,omitempty"`
	Employees []*Employee   `json:"employees,omitempty"`
}

// DepartmentSource defines data source enum
type DepartmentSource int32

const (
	DepartmentSourceManual       DepartmentSource = 0
	DepartmentSourceEnterpriseWX DepartmentSource = 1
	DepartmentSourceDingTalk     DepartmentSource = 2
	DepartmentSourceFeishu       DepartmentSource = 3
)

// DepartmentStatus defines department status enum
type DepartmentStatus int32

const (
	DepartmentStatusActive   DepartmentStatus = 1
	DepartmentStatusInactive DepartmentStatus = 2
)

// CreateDepartmentMeta contains metadata for creating department
type CreateDepartmentMeta struct {
	CorpID       int64            `json:"corp_id"`
	ParentDeptID *int64           `json:"parent_dept_id"`
	Name         string           `json:"name"`
	Sort         int32            `json:"sort"`
	OutDeptID    *string          `json:"out_dept_id"`
	DeptSource   DepartmentSource `json:"dept_source"`
	CreatorID    int64            `json:"creator_id"`
}

// UpdateDepartmentMeta contains metadata for updating department
type UpdateDepartmentMeta struct {
	ParentDeptID *int64           `json:"parent_dept_id"`
	Name         *string          `json:"name"`
	Sort         *int32           `json:"sort"`
	OutDeptID    *string          `json:"out_dept_id"`
	DeptSource   *DepartmentSource `json:"dept_source"`
}

// DepartmentListFilter contains filter criteria for listing departments
type DepartmentListFilter struct {
	CorpID       *int64           `json:"corp_id"`
	ParentDeptID *int64           `json:"parent_dept_id"`
	Status       *DepartmentStatus `json:"status"`
	DeptSource   *DepartmentSource `json:"dept_source"`
	CreatorID    *int64           `json:"creator_id"`
	Keyword      *string          `json:"keyword"` // Search in name
	Limit        int              `json:"limit"`
	Page         int              `json:"page"`
}

// Business methods

// ValidateName validates department name
func (d *Department) ValidateName(name string) error {
	name = strings.TrimSpace(name)
	if len(name) == 0 {
		return errors.New("department name cannot be empty")
	}
	if len(name) > 100 {
		return errors.New("department name cannot exceed 100 characters")
	}
	return nil
}

// CanDelete checks if department can be deleted
func (d *Department) CanDelete() bool {
	// Cannot delete if has children or employees
	return len(d.Children) == 0 && len(d.Employees) == 0
}

// IsRootDepartment checks if this is a root department
func (d *Department) IsRootDepartment() bool {
	return d.ParentDeptID == nil
}

// CanMoveTo checks if department can be moved to target parent
func (d *Department) CanMoveTo(targetParentID *int64) bool {
	// Cannot move to self or descendant
	if targetParentID != nil && *targetParentID == d.ID {
		return false
	}
	// Additional logic to prevent circular references would be needed
	return true
}

// AddChild adds a child department (for tree building)
func (d *Department) AddChild(child *Department) {
	if d.Children == nil {
		d.Children = make([]*Department, 0)
	}
	d.Children = append(d.Children, child)
}

// AddEmployee adds an employee (for aggregation)
func (d *Department) AddEmployee(emp *Employee) {
	if d.Employees == nil {
		d.Employees = make([]*Employee, 0)
	}
	d.Employees = append(d.Employees, emp)
}