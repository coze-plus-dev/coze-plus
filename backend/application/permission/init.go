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

package permission

import (
	"context"
	"fmt"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
	"github.com/coze-dev/coze-studio/backend/domain/permission/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	permissionImpl "github.com/coze-dev/coze-studio/backend/infra/impl/permission"
	permissionMiddleware "github.com/coze-dev/coze-studio/backend/api/middleware"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

type ServiceComponents struct {
	DB       *gorm.DB
	IDGenSVC idgen.IDGenerator
	Cache    cache.Cmdable
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

	// Initialize permission middleware system
	logs.Infof("Initializing permission system - Cache: %v, DB: %v", c.Cache != nil, c.DB != nil)
	if c.Cache != nil {
		if err := initializePermissionMiddleware(context.Background(), c.DB, c.Cache); err != nil {
			logs.Warnf("Failed to initialize permission middleware: %v", err)
		} else {
			logs.Infof("Permission middleware system initialized successfully from InitService")
		}
	} else {
		logs.Warnf("Cache client not provided, permission middleware will not be initialized")
	}

	return PermissionSVC, nil
}

// initializePermissionMiddleware initializes the global permission middleware system
func initializePermissionMiddleware(ctx context.Context, db *gorm.DB, cacheClient cache.Cmdable) error {
	logs.Infof("Creating permission factory with DB: %v, Cache: %v", db != nil, cacheClient != nil)
	
	// Create permission factory with database and cache connections from application layer
	permissionFactory := permissionImpl.NewPermissionFactory(db, cacheClient)
	
	// Set global factory for middleware to use
	permissionImpl.SetGlobalFactory(permissionFactory)
	logs.Infof("Global permission factory set successfully")
	
	// Test if we can create a checker
	if checker, err := permissionFactory.CreateChecker(ctx); err != nil {
		logs.Warnf("Failed to create test permission checker: %v", err)
		return err
	} else {
		logs.Infof("Permission checker created successfully: %v", checker != nil)
	}
	
	// Note: Permission policies are now initialized by database migration scripts
	// No need to call InitializeDefaultPolicies - it has been removed
	
	logs.Infof("Permission middleware system initialized successfully")
	return nil
}

// GetGlobalPermissionMiddleware returns the global permission middleware instance
func GetGlobalPermissionMiddleware(ctx context.Context) (*permissionMiddleware.GlobalPermissionMiddleware, error) {
	permissionFactory := permissionImpl.GetGlobalFactory()
	if permissionFactory == nil {
		return nil, fmt.Errorf("permission system not initialized")
	}
	
	return permissionFactory.CreateGlobalMiddleware(ctx)
}
