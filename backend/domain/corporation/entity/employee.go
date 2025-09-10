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

package entity

import (
	"errors"
	"regexp"
	"strings"
)

// Employee entity represents an employee in the domain
type Employee struct {
	ID         int64          `json:"id"`
	Name       string         `json:"name"`
	Email      *string        `json:"email"`
	Phone      *string        `json:"phone"`
	UserID     *int64         `json:"user_id"`    // Associated User ID (NULL if no user account)
	EmployeeID *string        `json:"employee_id"`
	Position   *string        `json:"position"`
	AvatarURI  *string        `json:"avatar_uri"` // Storage URI for avatar image
	Status     EmployeeStatus `json:"status"`
	OutEmpID   *string        `json:"out_emp_id"`
	EmpSource  EmployeeSource `json:"emp_source"`
	CreatorID  int64          `json:"creator_id"`
	CreatedAt  int64          `json:"created_at"`
	UpdatedAt  int64          `json:"updated_at"`
	DeletedAt  *int64         `json:"deleted_at"`

	// Aggregated fields (not stored in DB)
	AvatarURL   *string                       `json:"avatar_url,omitempty"` // Generated URL for avatar
	Departments []*EmployeeDepartmentRelation `json:"departments,omitempty"`
}

// EmployeeStatus defines employee status enum
type EmployeeStatus int32

const (
	EmployeeStatusActive   EmployeeStatus = 1
	EmployeeStatusInactive EmployeeStatus = 2
	EmployeeStatusDeleted  EmployeeStatus = 3
)

// EmployeeSource defines data source enum
type EmployeeSource int32

const (
	EmployeeSourceManual       EmployeeSource = 0
	EmployeeSourceEnterpriseWX EmployeeSource = 1
	EmployeeSourceDingTalk     EmployeeSource = 2
	EmployeeSourceFeishu       EmployeeSource = 3
)

// CreateEmployeeMeta contains metadata for creating employee
type CreateEmployeeMeta struct {
	Name       string         `json:"name"`
	Email      *string        `json:"email"`
	Phone      *string        `json:"phone"`
	EmployeeID *string        `json:"employee_id"`
	Position   *string        `json:"position"`
	AvatarURI  *string        `json:"avatar_uri"`
	Status     EmployeeStatus `json:"status"`
	OutEmpID   *string        `json:"out_emp_id"`
	EmpSource  EmployeeSource `json:"emp_source"`
	CreatorID  int64          `json:"creator_id"`
}

// UpdateEmployeeMeta contains metadata for updating employee
type UpdateEmployeeMeta struct {
	Name       *string         `json:"name"`
	Email      *string         `json:"email"`
	Phone      *string         `json:"phone"`
	EmployeeID *string         `json:"employee_id"`
	Position   *string         `json:"position"`
	AvatarURI  *string         `json:"avatar_uri"`
	Status     *EmployeeStatus `json:"status"`
	OutEmpID   *string         `json:"out_emp_id"`
	EmpSource  *EmployeeSource `json:"emp_source"`
}

// EmployeeListFilter contains filter criteria for listing employees
type EmployeeListFilter struct {
	CorpID    *int64          `json:"corp_id"`
	DeptID    *int64          `json:"dept_id"`
	Status    *EmployeeStatus `json:"status"`
	EmpSource *EmployeeSource `json:"emp_source"`
	CreatorID *int64          `json:"creator_id"`
	Keyword   *string         `json:"keyword"` // Search in name, email, phone
	Limit     int             `json:"limit"`
	Page      int             `json:"page"`
}

// EmployeeDepartmentRelation represents employee-department relationship
type EmployeeDepartmentRelation struct {
	ID        int64                    `json:"id"`
	CorpID    int64                    `json:"corp_id"`
	EmpID     int64                    `json:"emp_id"`
	DeptID    int64                    `json:"dept_id"`
	JobTitle  *string                  `json:"job_title"`
	Status    EmployeeDepartmentStatus `json:"status"`
	IsLeader  bool                     `json:"is_leader"`
	IsPrimary bool                     `json:"is_primary"`
	CreatorID int64                    `json:"creator_id"`
	CreatedAt int64                    `json:"created_at"`
	UpdatedAt int64                    `json:"updated_at"`
	DeletedAt *int64                   `json:"deleted_at"`

	// Optional aggregated fields
	Employee    *Employee    `json:"employee,omitempty"`
	Department  *Department  `json:"department,omitempty"`
	Corporation *Corporation `json:"corporation,omitempty"`
}

// EmployeeDepartmentStatus defines employee-department relationship status
type EmployeeDepartmentStatus int32

const (
	EmployeeDepartmentStatusActive   EmployeeDepartmentStatus = 1
	EmployeeDepartmentStatusInactive EmployeeDepartmentStatus = 0
)

// Business methods

// ValidateName validates employee name
func (e *Employee) ValidateName(name string) error {
	name = strings.TrimSpace(name)
	if len(name) == 0 {
		return errors.New("employee name cannot be empty")
	}
	if len(name) > 50 {
		return errors.New("employee name cannot exceed 50 characters")
	}
	return nil
}

// ValidateEmail validates email format
func (e *Employee) ValidateEmail(email *string) error {
	if email == nil || *email == "" {
		return nil // Email is optional
	}

	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	if !emailRegex.MatchString(*email) {
		return errors.New("invalid email format")
	}
	return nil
}

// ValidatePhone validates phone format
func (e *Employee) ValidatePhone(phone *string) error {
	if phone == nil || *phone == "" {
		return nil // Phone is optional
	}

	// Simple phone validation - can be enhanced based on requirements
	phoneRegex := regexp.MustCompile(`^[0-9+\-\s()]{7,20}$`)
	if !phoneRegex.MatchString(*phone) {
		return errors.New("invalid phone format")
	}
	return nil
}

// IsActive checks if employee is active
func (e *Employee) IsActive() bool {
	return e.Status == EmployeeStatusActive
}

// CanDelete checks if employee can be deleted
func (e *Employee) CanDelete() bool {
	// Business logic for deletion - e.g., check if has active assignments
	return true
}

// AddDepartment adds a department relationship
func (e *Employee) AddDepartment(rel *EmployeeDepartmentRelation) {
	if e.Departments == nil {
		e.Departments = make([]*EmployeeDepartmentRelation, 0)
	}
	e.Departments = append(e.Departments, rel)
}

// IsLeaderOf checks if employee is leader of given department
func (e *Employee) IsLeaderOf(deptID int64) bool {
	for _, rel := range e.Departments {
		if rel.DeptID == deptID && rel.IsLeader {
			return true
		}
	}
	return false
}
