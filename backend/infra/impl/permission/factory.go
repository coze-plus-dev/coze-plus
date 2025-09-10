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

	"github.com/coze-dev/coze-studio/backend/api/middleware"
	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/permission"
	casbinImpl "github.com/coze-dev/coze-studio/backend/infra/impl/permission/casbin"
)

// PermissionFactory creates permission system components
type PermissionFactory struct {
	db          any // Database connection
	redisClient cache.Cmdable
}

// NewPermissionFactory creates a new permission factory
func NewPermissionFactory(db any, redisClient cache.Cmdable) *PermissionFactory {
	return &PermissionFactory{
		db:          db,
		redisClient: redisClient,
	}
}

// CreateChecker creates a permission checker
func (f *PermissionFactory) CreateChecker(ctx context.Context) (permission.Checker, error) {
	// Create Casbin checker with direct cache client
	checker, err := casbinImpl.NewCasbinChecker(f.db, f.redisClient)
	if err != nil {
		return nil, fmt.Errorf("failed to create casbin checker: %w", err)
	}

	return checker, nil
}

// CreateGlobalMiddleware creates the global permission middleware
func (f *PermissionFactory) CreateGlobalMiddleware(ctx context.Context) (*middleware.GlobalPermissionMiddleware, error) {
	checker, err := f.CreateChecker(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to create permission checker: %w", err)
	}

	return middleware.NewGlobalPermissionMiddleware(checker), nil
}


// Global factory instance
var globalFactory *PermissionFactory

// SetGlobalFactory sets the global permission factory
func SetGlobalFactory(factory *PermissionFactory) {
	globalFactory = factory
}

// GetGlobalFactory gets the global permission factory
func GetGlobalFactory() *PermissionFactory {
	return globalFactory
}
