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

package errno

import "github.com/coze-dev/coze-studio/backend/pkg/errorx/code"

// Corporation: 120 000 000 ~ 120 999 999
const (
	// General errors
	ErrCorporationInvalidParamCode = 120000000
	ErrCorporationNotFound         = 120000001
	ErrCorporationInternalError    = 120000002
	ErrCorporationPermissionDenied = 120000003

	// Corporation specific errors
	ErrCorporationNameEmpty      = 120100001
	ErrCorporationParentNotFound = 120100002
	ErrCorporationCannotDelete   = 120100003
	ErrCorporationCircularRef    = 120100004

	// Department specific errors
	ErrDepartmentNotFound       = 120200001
	ErrDepartmentNameEmpty      = 120200002
	ErrDepartmentParentNotFound = 120200003
	ErrDepartmentCannotDelete   = 120200004
	ErrDepartmentCircularRef    = 120200005

	// Employee specific errors
	ErrEmployeeNotFound                   = 120300001
	ErrEmployeeNameEmpty                  = 120300002
	ErrEmployeeEmailExists                = 120300003
	ErrEmployeeIDExists                   = 120300004
	ErrEmployeePhoneExists                = 120300005
	ErrEmployeeDepartmentRelationNotFound = 120300006
)

func init() {
	// General errors
	code.Register(
		ErrCorporationInvalidParamCode,
		"invalid parameter",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCorporationNotFound,
		"corporation not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCorporationInternalError,
		"internal server error",
		code.WithAffectStability(true),
	)

	code.Register(
		ErrCorporationPermissionDenied,
		"permission denied",
		code.WithAffectStability(false),
	)

	// Corporation specific errors
	code.Register(
		ErrCorporationNameEmpty,
		"corporation name cannot be empty",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCorporationParentNotFound,
		"parent corporation not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCorporationCannotDelete,
		"cannot delete corporation with child corporations or departments",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrCorporationCircularRef,
		"corporation cannot be its own parent",
		code.WithAffectStability(false),
	)

	// Department specific errors
	code.Register(
		ErrDepartmentNotFound,
		"department not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrDepartmentNameEmpty,
		"department name cannot be empty",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrDepartmentParentNotFound,
		"parent department not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrDepartmentCannotDelete,
		"cannot delete department with child departments or employees",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrDepartmentCircularRef,
		"department cannot be its own parent",
		code.WithAffectStability(false),
	)

	// Employee specific errors
	code.Register(
		ErrEmployeeNotFound,
		"employee not found",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrEmployeeNameEmpty,
		"employee name cannot be empty",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrEmployeeEmailExists,
		"email already exists",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrEmployeeIDExists,
		"employee ID already exists",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrEmployeePhoneExists,
		"phone number already exists",
		code.WithAffectStability(false),
	)

	code.Register(
		ErrEmployeeDepartmentRelationNotFound,
		"employee department relationship not found",
		code.WithAffectStability(false),
	)
}
