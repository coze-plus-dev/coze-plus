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

package casbin

import (
	"context"
	"fmt"
	"os"
	"strings"

	"github.com/casbin/casbin/v2"
	gormadapter "github.com/casbin/gorm-adapter/v3"
	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/infra/contract/cache"
	"github.com/coze-dev/coze-studio/backend/infra/contract/permission"
)

// Casbin dependencies added to go.mod

// CasbinChecker implements permission.Checker using Casbin
type CasbinChecker struct {
	enforcer *casbin.Enforcer // Casbin enforcer for permission checks
	db       *gorm.DB // Direct database access for casbin_rule queries
}

// CasbinConfig holds configuration options for CasbinChecker
type CasbinConfig struct {
	ModelPath  string
	EnableLog  bool
	AutoSave   bool
	AutoBuild  bool
}

// DefaultCasbinConfig returns default configuration for CasbinChecker
// Reads configuration from environment variables with fallback to defaults
func DefaultCasbinConfig() *CasbinConfig {
	config := &CasbinConfig{
		ModelPath:  "resources/conf/permission/casbin_model.conf",
		EnableLog:  false,
		AutoSave:   true,
		AutoBuild:  true,
	}

	// Read configuration from environment variables
	if modelPath := os.Getenv("CASBIN_MODEL_PATH"); modelPath != "" {
		config.ModelPath = modelPath
	}

	if enableLog := os.Getenv("CASBIN_ENABLE_LOG"); enableLog != "" {
		config.EnableLog = strings.ToLower(enableLog) == "true"
	}

	if autoSave := os.Getenv("CASBIN_AUTO_SAVE"); autoSave != "" {
		config.AutoSave = strings.ToLower(autoSave) == "true"
	}

	if autoBuild := os.Getenv("CASBIN_AUTO_BUILD_ROLE_LINKS"); autoBuild != "" {
		config.AutoBuild = strings.ToLower(autoBuild) == "true"
	}

	return config
}

// NewCasbinChecker creates a new Casbin permission checker with default configuration
func NewCasbinChecker(db any, cacheClient cache.Cmdable) (*CasbinChecker, error) {
	return NewCasbinCheckerWithConfig(db, cacheClient, DefaultCasbinConfig())
}

// NewCasbinCheckerWithConfig creates a new Casbin permission checker with custom configuration
func NewCasbinCheckerWithConfig(db any, cacheClient cache.Cmdable, config *CasbinConfig) (*CasbinChecker, error) {
	if config == nil {
		config = DefaultCasbinConfig()
	}
	// Validate input parameters
	if db == nil {
		return nil, fmt.Errorf("database connection cannot be nil")
	}
	if cacheClient == nil {
		return nil, fmt.Errorf("cache client cannot be nil")
	}

	// Convert and validate database connection
	gormDB, ok := db.(*gorm.DB)
	if !ok {
		return nil, fmt.Errorf("database must be a *gorm.DB instance")
	}

	// Test database connection
	sqlDB, err := gormDB.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying database connection: %w", err)
	}
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("database connection test failed: %w", err)
	}

	// Create Casbin adapter
	adapter, err := gormadapter.NewAdapterByDB(gormDB)
	if err != nil {
		return nil, fmt.Errorf("failed to create casbin adapter: %w", err)
	}

	// Create Casbin enforcer with model configuration
	enforcer, err := casbin.NewEnforcer(config.ModelPath, adapter)
	if err != nil {
		return nil, fmt.Errorf("failed to create casbin enforcer: %w", err)
	}

	// Configure enforcer based on settings
	enforcer.EnableAutoSave(config.AutoSave)
	enforcer.EnableAutoBuildRoleLinks(config.AutoBuild)
	enforcer.EnableLog(config.EnableLog)

	// Load policy from database
	if err := enforcer.LoadPolicy(); err != nil {
		return nil, fmt.Errorf("failed to load casbin policy: %w", err)
	}

	return &CasbinChecker{
		enforcer: enforcer,
		db:       gormDB,
	}, nil
}

// Check implements permission.Checker
func (c *CasbinChecker) Check(ctx context.Context, req *permission.CheckRequest) (*permission.CheckResponse, error) {
	if req == nil {
		return &permission.CheckResponse{Allowed: false, Reason: "invalid request"}, nil
	}
	result := c.checkPermissionLogic(ctx, req)

	return result, nil
}

// BatchCheck implements permission.Checker
func (c *CasbinChecker) BatchCheck(ctx context.Context, reqs []*permission.CheckRequest) ([]*permission.CheckResponse, error) {
	if len(reqs) == 0 {
		return []*permission.CheckResponse{}, nil
	}

	// 直接循环检查，不使用缓存
	results := make([]*permission.CheckResponse, len(reqs))
	for i, req := range reqs {
		result, err := c.Check(ctx, req)
		if err != nil {
			results[i] = &permission.CheckResponse{Allowed: false, Reason: err.Error()}
		} else {
			results[i] = result
		}
	}

	return results, nil
}

// CheckUserRole implements permission.Checker
func (c *CasbinChecker) CheckUserRole(ctx context.Context, userID int64, roleCode string) (bool, error) {
	// Use Casbin enforcer to check if user has role
	userSubject := fmt.Sprintf("user:%d", userID)

	// Check if user has the role in global domain
	hasRole, err := c.enforcer.HasRoleForUser(userSubject, roleCode)
	if err != nil {
		return false, fmt.Errorf("failed to check user role: %w", err)
	}

	return hasRole, nil
}

// checkPermissionLogic implements permission logic using Casbin enforcer
func (c *CasbinChecker) checkPermissionLogic(_ context.Context, req *permission.CheckRequest) *permission.CheckResponse {
	// Build Casbin request parameters
	subject := fmt.Sprintf("user:%d", req.UserID)
	object := req.Resource
	// 只有当 ResourceID 不为空且不为通配符 "*" 时，才拼接具体资源ID
	if req.ResourceID != "" && req.ResourceID != "*" {
		object = fmt.Sprintf("%s:%s", req.Resource, req.ResourceID)
	}

	// Super admin check first - allow everything
	if c.isSuperAdmin(req.UserID) {
		return &permission.CheckResponse{Allowed: true}
	}

	// Use Casbin enforcer to check permission
	allowed, err := c.enforcer.Enforce(subject, req.Domain, object, req.Action)
	if err != nil {
		return &permission.CheckResponse{
			Allowed: false,
			Reason:  fmt.Sprintf("permission enforcement error: %v", err),
		}
	}

	if !allowed {
		return &permission.CheckResponse{
			Allowed: false,
			Reason:  fmt.Sprintf("access denied: user %d lacks %s permission on %s in domain %s",
				req.UserID, req.Action, object, req.Domain),
		}
	}

	return &permission.CheckResponse{Allowed: true}
}

// isSuperAdmin checks if user has super admin role using Casbin enforcer
func (c *CasbinChecker) isSuperAdmin(userID int64) bool {
	userSubject := fmt.Sprintf("user:%d", userID)

	// Check if user has super_admin role
	hasRole, err := c.enforcer.HasRoleForUser(userSubject, "super_admin")
	if err != nil {
		return false // If query fails, deny super admin access
	}

	return hasRole
}

