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

	"github.com/coze-dev/coze-studio/backend/domain/user/entity"
	"github.com/coze-dev/coze-studio/backend/domain/user/service"
)

// Re-export domain types as crossdomain types
type EntitySpace = entity.Space
type EntityUser = entity.User
type CreateUserRequest = service.CreateUserRequest
type ListUsersRequest = service.ListUsersRequest
type ListUsersResponse = service.ListUsersResponse
type UpdateUserStatusRequest = service.UpdateUserStatusRequest

//go:generate mockgen -destination ../../../internal/mock/crossdomain/crossuser/crossuser.go --package mockCrossUser -source contract.go
type User interface {
	GetUserSpaceList(ctx context.Context, userID int64) (spaces []*EntitySpace, err error)
	CreateUser(ctx context.Context, req *CreateUserRequest) (user *EntityUser, err error)
	ListUsers(ctx context.Context, req *ListUsersRequest) (*ListUsersResponse, error)
	UpdateUserStatus(ctx context.Context, req *UpdateUserStatusRequest) (err error)
	ResetUserPassword(ctx context.Context, email, newPassword string) (err error)
}

var defaultSVC User

func DefaultSVC() User {
	return defaultSVC
}

func SetDefaultSVC(u User) {
	defaultSVC = u
}
