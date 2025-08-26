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

package permission

import (
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
	"github.com/coze-dev/coze-studio/backend/domain/permission/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

type ServiceComponents struct {
	DB       *gorm.DB
	IDGenSVC idgen.IDGenerator
}

func InitService(c *ServiceComponents) (*PermissionApplicationService, error) {
	// Initialize Repositories using the constructor functions from repository.go
	roleRepo := repository.NewRoleRepo(c.DB, c.IDGenSVC)
	permissionTemplateRepo := repository.NewPermissionTemplateRepo(c.DB, c.IDGenSVC)
	userRoleRepo := repository.NewUserRoleRepo(c.DB, c.IDGenSVC)
	casbinRuleRepo := repository.NewCasbinRuleRepo(c.DB, c.IDGenSVC)

	// Initialize Domain Services
	domainServices := service.NewServices(&service.ServiceConfig{
		RoleRepo:               roleRepo,
		PermissionTemplateRepo: permissionTemplateRepo,
		UserRoleRepo:           userRoleRepo,
		CasbinRuleRepo:         casbinRuleRepo,
	})

	// Initialize Application Service
	PermissionSVC.DomainSVC = domainServices

	return PermissionSVC, nil
}