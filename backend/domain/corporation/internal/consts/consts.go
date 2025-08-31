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

package consts

// Corporation constants
const (
	// Corporation Types
	CorporationTypeGroup   = "group"
	CorporationTypeCompany = "company"
	CorporationTypeBranch  = "branch"
)

// Corporation Source constants
const (
	CorporationSourceManual       = 0
	CorporationSourceEnterpriseWX = 1
	CorporationSourceDingTalk     = 2
	CorporationSourceFeishu       = 3
)

// Department Source constants  
const (
	DepartmentSourceManual       = 0
	DepartmentSourceEnterpriseWX = 1
	DepartmentSourceDingTalk     = 2
	DepartmentSourceFeishu       = 3
)

// Employee Status constants
const (
	EmployeeStatusActive   = 1
	EmployeeStatusInactive = 2
	EmployeeStatusDeleted  = 3
)

// Employee Source constants
const (
	EmployeeSourceManual       = 0
	EmployeeSourceEnterpriseWX = 1
	EmployeeSourceDingTalk     = 2
	EmployeeSourceFeishu       = 3
)

// Department Status constants
const (
	DepartmentStatusActive   = 1
	DepartmentStatusInactive = 2
)

// Default values
const (
	DefaultPage      = 1
	DefaultPageSize   = 20
	MaxPageSize      = 100
	DefaultSortOrder = 0
)

// Validation limits
const (
	MaxCorporationNameLength = 100
	MaxDepartmentNameLength  = 100
	MaxEmployeeNameLength    = 50
	MaxEmailLength          = 254
	MaxPhoneLength          = 20
)