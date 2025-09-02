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

	crossuser "github.com/coze-dev/coze-studio/backend/crossdomain/contract/user"
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

func (u *impl) GetUserSpaceList(ctx context.Context, userID int64) (spaces []*crossuser.Space, err error) {
	domainSpaces, err := u.DomainSVC.GetUserSpaceList(ctx, userID)
	if err != nil {
		return nil, err
	}

	// Convert domain entities to crossdomain contract models
	spaces = make([]*crossuser.Space, len(domainSpaces))
	for i, space := range domainSpaces {
		spaces[i] = &crossuser.Space{
			ID:        space.ID,
			Name:      space.Name,
			CreatorID: space.CreatorID,
			CreatedAt: space.CreatedAt,
			UpdatedAt: space.UpdatedAt,
		}
	}

	return spaces, nil
}

func (u *impl) CreateUser(ctx context.Context, req *crossuser.CreateUserRequest) (user *crossuser.UserInfo, err error) {
	// Convert crossdomain contract request to domain service request
	domainReq := &service.CreateUserRequest{
		Email:       req.Email,
		Password:    req.Password,
		Name:        req.Name,
		UniqueName:  req.UniqueName,
		Description: req.Description,
		SpaceID:     req.SpaceID,
		Locale:      req.Locale,
		CreatedBy:   req.CreatedBy,
	}

	// Call domain service
	domainUser, err := u.DomainSVC.Create(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	// Convert domain entity to crossdomain contract model
	return &crossuser.UserInfo{
		ID:           domainUser.UserID,
		Email:        domainUser.Email,
		Name:         domainUser.Name,
		UniqueName:   domainUser.UniqueName,
		Description:  domainUser.Description,
		IconURI:      domainUser.IconURI,
		IconURL:      domainUser.IconURL,
		UserVerified: domainUser.UserVerified,
		IsDisabled:   domainUser.IsDisabled,
		Locale:       domainUser.Locale,
		CreatedAt:    domainUser.CreatedAt,
		UpdatedAt:    domainUser.UpdatedAt,
	}, nil
}

func (u *impl) ListUsers(ctx context.Context, req *crossuser.ListUsersRequest) (*crossuser.ListUsersResponse, error) {
	// Convert crossdomain contract request to domain service request
	domainReq := &service.ListUsersRequest{
		Keyword:    req.Keyword,
		IsDisabled: req.IsDisabled,
		Page:       req.Page,
		Limit:      req.Limit,
	}

	// Call domain service
	domainResp, err := u.DomainSVC.ListUsers(ctx, domainReq)
	if err != nil {
		return nil, err
	}

	// Convert domain entities to crossdomain contract models
	users := make([]*crossuser.UserInfo, len(domainResp.Users))
	for i, domainUser := range domainResp.Users {
		users[i] = &crossuser.UserInfo{
			ID:           domainUser.UserID,
			Email:        domainUser.Email,
			Name:         domainUser.Name,
			UniqueName:   domainUser.UniqueName,
			Description:  domainUser.Description,
			IconURI:      domainUser.IconURI,
			IconURL:      domainUser.IconURL,
			UserVerified: domainUser.UserVerified,
			IsDisabled:   domainUser.IsDisabled,
			Locale:       domainUser.Locale,
			CreatedAt:    domainUser.CreatedAt,
			UpdatedAt:    domainUser.UpdatedAt,
		}
	}

	return &crossuser.ListUsersResponse{
		Users:   users,
		Total:   domainResp.Total,
		HasMore: domainResp.HasMore,
	}, nil
}

func (u *impl) UpdateUserStatus(ctx context.Context, req *crossuser.UpdateUserStatusRequest) (err error) {
	// Convert crossdomain contract request to domain service request
	domainReq := &service.UpdateUserStatusRequest{
		UserID:     req.UserID,
		IsDisabled: req.IsDisabled,
	}

	// Call domain service
	err = u.DomainSVC.UpdateUserStatus(ctx, domainReq)
	if err != nil {
		return err
	}

	return nil
}
