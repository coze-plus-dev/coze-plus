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

package entity

import "time"

// RoleStatus represents the status of role
type RoleStatus int32

const (
	RoleStatusActive   RoleStatus = 0 // 激活状态
	RoleStatusDisabled RoleStatus = 1 // 禁用状态
)

// RoleDomain represents the domain of role
type RoleDomain string

const (
	RoleDomainGlobal RoleDomain = "global" // 全局角色
	RoleDomainSpace  RoleDomain = "space"  // 空间角色
)

// SpaceRoleType represents the type of space role
type SpaceRoleType int32

const (
	SpaceRoleTypeNormal    SpaceRoleType = 0 // 普通空间角色
	SpaceRoleTypeOwner     SpaceRoleType = 1 // 空间所有者
	SpaceRoleTypeAdmin     SpaceRoleType = 2 // 空间管理员
	SpaceRoleTypeMember    SpaceRoleType = 3 // 空间成员
)

// Role represents a permission role entity
type Role struct {
	ID            int64         `json:"id"`
	RoleCode      string        `json:"role_code"`
	RoleName      string        `json:"role_name"`
	RoleDomain    RoleDomain    `json:"role_domain"`
	SuperAdmin    int32         `json:"super_admin"`    // 0: 非超级管理员, 1: 超级管理员
	SpaceRoleType SpaceRoleType `json:"space_role_type"`
	IsBuiltin     int32         `json:"is_builtin"`     // 0: 非内置, 1: 内置
	IsDisabled    RoleStatus    `json:"is_disabled"`
	Permissions   string        `json:"permissions"`    // JSON格式的权限配置
	Description   string        `json:"description"`
	CreatedBy     int64         `json:"created_by"`
	CreatedAt     time.Time     `json:"created_at"`
	UpdatedAt     time.Time     `json:"updated_at"`
}

// RoleListFilter represents filter conditions for listing roles
type RoleListFilter struct {
	RoleDomain    *RoleDomain    `json:"role_domain,omitempty"`
	SpaceRoleType *SpaceRoleType `json:"space_role_type,omitempty"`
	IsBuiltin     *int32         `json:"is_builtin,omitempty"`
	IsDisabled    *RoleStatus    `json:"is_disabled,omitempty"`
	Keyword       *string        `json:"keyword,omitempty"`
	CreatedBy     *int64         `json:"created_by,omitempty"`
	Page          int            `json:"page"`
	Limit         int            `json:"limit"`
}

// UserRole represents the relationship between user and role
type UserRole struct {
	ID       int64 `json:"id"`
	UserID   int64 `json:"user_id"`
	RoleID   int64 `json:"role_id"`
	SpaceID  *int64 `json:"space_id,omitempty"` // 空间ID，全局角色时为null
	AssignedBy int64 `json:"assigned_by"`
	AssignedAt time.Time `json:"assigned_at"`
}

// UserRoleListFilter represents filter conditions for listing user roles
type UserRoleListFilter struct {
	UserID  *int64 `json:"user_id,omitempty"`
	RoleID  *int64 `json:"role_id,omitempty"`
	SpaceID *int64 `json:"space_id,omitempty"`
	Page    int    `json:"page"`
	Limit   int    `json:"limit"`
}