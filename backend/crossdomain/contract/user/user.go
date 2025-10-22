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

package crossuser

import (
	"context"
)

// CreateUserRequest represents user creation request in crossdomain contract
type CreateUserRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	Name        string `json:"name"`
	UniqueName  string `json:"unique_name"`
	Description string `json:"description"`
	SpaceID     int64  `json:"space_id"`
	Locale      string `json:"locale"`
	CreatedBy   int64 `json:"created_by"`
}

// UserInfo represents user information in crossdomain contract
type UserInfo struct {
	ID           int64  `json:"id"`
	Email        string `json:"email"`
	Name         string `json:"name"`
	UniqueName   string `json:"unique_name"`
	Description  string `json:"description"`
	IconURI      string `json:"icon_uri"`
	IconURL      string `json:"icon_url"`
	UserVerified bool   `json:"user_verified"`
	IsDisabled   int32  `json:"is_disabled"`
	Locale       string `json:"locale"`
	CreatedAt    int64  `json:"created_at"`
	UpdatedAt    int64  `json:"updated_at"`
}

// ListUsersRequest represents user list request in crossdomain contract
type ListUsersRequest struct {
	Keyword    *string `json:"keyword,omitempty"`
	IsDisabled *int32  `json:"is_disabled,omitempty"`
	Page       int     `json:"page"`
	Limit      int     `json:"limit"`
}

// ListUsersResponse represents user list response in crossdomain contract
type ListUsersResponse struct {
	Users   []*UserInfo `json:"users"`
	Total   int64       `json:"total"`
	HasMore bool        `json:"has_more"`
}

// UpdateUserStatusRequest represents user status update request in crossdomain contract
type UpdateUserStatusRequest struct {
	UserID     int64 `json:"user_id"`
	IsDisabled int32 `json:"is_disabled"`
}

// ResetUserPasswordRequest represents user password reset request in crossdomain contract
type ResetUserPasswordRequest struct {
	Email       string `json:"email"`
	NewPassword string `json:"new_password"`
}

// Space represents space information in crossdomain contract
type Space struct {
	ID        int64  `json:"id"`
	Name      string `json:"name"`
	CreatorID int64  `json:"creator_id"`
	CreatedAt int64  `json:"created_at"`
	UpdatedAt int64  `json:"updated_at"`
}

//go:generate mockgen -destination ../../../internal/mock/crossdomain/crossuser/crossuser.go --package mockCrossUser -source crossuser.go
type User interface {
	GetUserSpaceList(ctx context.Context, userID int64) (spaces []*Space, err error)
	CreateUser(ctx context.Context, req *CreateUserRequest) (user *UserInfo, err error)
	ListUsers(ctx context.Context, req *ListUsersRequest) (*ListUsersResponse, error)
	UpdateUserStatus(ctx context.Context, req *UpdateUserStatusRequest) (err error)
	ResetUserPassword(ctx context.Context, req *ResetUserPasswordRequest) (err error)
}

var defaultSVC User

func DefaultSVC() User {
	return defaultSVC
}

func SetDefaultSVC(u User) {
	defaultSVC = u
}
