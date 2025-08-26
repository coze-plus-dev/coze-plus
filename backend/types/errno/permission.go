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

package errno

import "github.com/coze-dev/coze-studio/backend/pkg/errorx/code"

// Permission: 108 000 000 ~ 108 999 999
const (
	ErrPermissionInvalidParamCode = 108000000
	ErrPermissionRoleCodeExistsCode = 108000001
	ErrPermissionRoleNotFoundCode = 108000002
	ErrPermissionRoleBuiltinCode = 108000003
	ErrPermissionRoleInUseCode = 108000004
	ErrPermissionInvalidJSONCode = 108000005
)

func init() {
	code.Register(
		ErrPermissionInvalidParamCode,
		"invalid parameter : {msg}",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPermissionRoleCodeExistsCode,
		"role code '{role_code}' already exists",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPermissionRoleNotFoundCode,
		"role with ID {role_id} not found",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPermissionRoleBuiltinCode,
		"builtin roles cannot be modified or deleted",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPermissionRoleInUseCode,
		"role is assigned to {user_count} users and cannot be deleted",
		code.WithAffectStability(false),
	)
	code.Register(
		ErrPermissionInvalidJSONCode,
		"invalid permissions JSON format: {msg}",
		code.WithAffectStability(false),
	)
}
