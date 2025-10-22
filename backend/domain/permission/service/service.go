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

package service

import (
	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
)

// ServiceConfig holds the configuration for permission services
type ServiceConfig struct {
	RoleRepo             repository.RoleRepo
	PermissionTemplateRepo repository.PermissionTemplateRepo
	UserRoleRepo         repository.UserRoleRepo
	CasbinRuleRepo       repository.CasbinRuleRepo
}

// Services holds all permission domain services
type Services struct {
	RoleService              RoleService
	PermissionTemplateService PermissionTemplateService
	UserRoleService          UserRoleService
	CasbinRuleService        CasbinRuleService
}

// NewServices creates and initializes all permission domain services
func NewServices(config *ServiceConfig) *Services {
	roleService := NewRoleService(config.RoleRepo, config.UserRoleRepo, config.CasbinRuleRepo)
	templateService := NewPermissionTemplateService(config.PermissionTemplateRepo)
	userRoleService := NewUserRoleService(config.UserRoleRepo, config.RoleRepo, config.PermissionTemplateRepo)
	casbinRuleService := NewCasbinRuleService(config.CasbinRuleRepo)

	return &Services{
		RoleService:              roleService,
		PermissionTemplateService: templateService,
		UserRoleService:          userRoleService,
		CasbinRuleService:        casbinRuleService,
	}
}
