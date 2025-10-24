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

package impl

import (
	"context"

	crossuser "github.com/coze-dev/coze-studio/backend/crossdomain/user"
	"github.com/coze-dev/coze-studio/backend/domain/user/service"
)

var defaultSVC crossuser.User

type impl struct {
	DomainSVC service.User
}

func InitDomainService(u service.User) crossuser.User {
	defaultSVC = &impl{
		DomainSVC: u,
	}
	return defaultSVC
}

func (u *impl) GetUserSpaceList(ctx context.Context, userID int64) (spaces []*crossuser.EntitySpace, err error) {
	return u.DomainSVC.GetUserSpaceList(ctx, userID)
}

func (u *impl) CreateUser(ctx context.Context, req *crossuser.CreateUserRequest) (user *crossuser.EntityUser, err error) {
	return u.DomainSVC.Create(ctx, req)
}

func (u *impl) ListUsers(ctx context.Context, req *crossuser.ListUsersRequest) (*crossuser.ListUsersResponse, error) {
	return u.DomainSVC.ListUsers(ctx, req)
}

func (u *impl) UpdateUserStatus(ctx context.Context, req *crossuser.UpdateUserStatusRequest) (err error) {
	return u.DomainSVC.UpdateUserStatus(ctx, req)
}

func (u *impl) ResetUserPassword(ctx context.Context, email, newPassword string) (err error) {
	return u.DomainSVC.ResetPassword(ctx, email, newPassword)
}
