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

package middleware

import (
	"context"
	"fmt"
	"regexp"

	"github.com/cloudwego/hertz/pkg/app"

	"github.com/coze-dev/coze-studio/backend/api/internal/httputil"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/infra/permission"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

// GlobalPermissionMiddleware provides global permission checking
type GlobalPermissionMiddleware struct {
	checker      permission.Checker
	routePatterns []*RoutePattern
}

// Global checker instance for route-level permissions
var globalChecker permission.Checker

// RoutePattern defines a route pattern for permission matching
type RoutePattern struct {
	Pattern       *regexp.Regexp
	Resource      string
	ActionMap     map[string]string
	RequireOwner  bool
	RequireParams bool // Whether resource ID extraction is required
}

// NewGlobalPermissionMiddleware creates a new global permission middleware
func NewGlobalPermissionMiddleware(checker permission.Checker) *GlobalPermissionMiddleware {
	// Set global checker for route-level permissions
	globalChecker = checker

	return &GlobalPermissionMiddleware{
		checker:       checker,
		routePatterns: buildRoutePatterns(),
	}
}

// GlobalPermissionMW returns the global permission middleware handler
func (m *GlobalPermissionMiddleware) GlobalPermissionMW() app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		// 1. Skip paths that don't need permission check
		path := string(c.URI().Path())
		if m.shouldSkipPath(path) {
			c.Next(ctx)
			return
		}

		// 2. Extract user ID from context
		userID := m.extractUserID(ctx)
		if userID == 0 {
			logs.CtxWarnf(ctx, "[GlobalPermissionMW] No user ID found in context for path: %s", path)
			c.Next(ctx) // Let authentication middleware handle this
			return
		}

		// 3. Match route pattern and extract permission requirements
		permReq := m.matchRouteAndExtractPermission(ctx, c, userID)
		if permReq == nil {
			// No permission rule matched, allow by default for backward compatibility
			logs.CtxDebugf(ctx, "[GlobalPermissionMW] No permission rule matched for path: %s", path)
			c.Next(ctx)
			return
		}

		// 4. Perform permission check
		response, err := m.checker.Check(ctx, permReq)
		if err != nil {
			logs.CtxErrorf(ctx, "[GlobalPermissionMW] Permission check failed: %v", err)
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrPermissionCheckFailedCode, errorx.KV("reason", err.Error())))
			return
		}

		if !response.Allowed {
			// 记录详细的权限检查失败信息到日志，用于调试
			logs.CtxWarnf(ctx, "[GlobalPermissionMW] Permission denied for user %d on %s:%s action %s: %s",
				permReq.UserID, permReq.Resource, permReq.ResourceID, permReq.Action, response.Reason)

			// 向前端返回简化的错误信息，不暴露内部实现细节
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrPermissionDeniedCode, errorx.KV("reason", "insufficient permissions")))
			return
		}

		logs.CtxDebugf(ctx, "[GlobalPermissionMW] Permission granted for user %d on %s:%s action %s",
			permReq.UserID, permReq.Resource, permReq.ResourceID, permReq.Action)
		c.Next(ctx)
	}
}

// shouldSkipPath checks if the path should skip permission check
func (m *GlobalPermissionMiddleware) shouldSkipPath(path string) bool {
	return permission.SkipPermissionPaths[path]
}

// extractUserID extracts user ID from context for frontend page authentication only
func (m *GlobalPermissionMiddleware) extractUserID(ctx context.Context) int64 {
	// Only get user ID from session data (web frontend sessions)
	if userID := ctxutil.GetUIDFromCtx(ctx); userID != nil {
		return *userID
	}

	// No session user found in context
	return 0
}

// matchRouteAndExtractPermission matches route pattern and extracts permission request
func (m *GlobalPermissionMiddleware) matchRouteAndExtractPermission(
	ctx context.Context, c *app.RequestContext, userID int64) *permission.CheckRequest {

	path := string(c.URI().Path())
	method := string(c.Method())

	for _, pattern := range m.routePatterns {
		if matches := pattern.Pattern.FindStringSubmatch(path); matches != nil {
			action, exists := pattern.ActionMap[method]
			if !exists {
				continue // Method not supported for this pattern
			}

			// Extract resource ID if required
			resourceID := "*"
			if pattern.RequireParams && len(matches) > 1 {
				resourceID = matches[1] // First capture group
			}

			// Extract domain (workspace/space context)
			domain := m.extractDomain(ctx, c)

			return &permission.CheckRequest{
				UserID:     userID,
				Resource:   pattern.Resource,
				ResourceID: resourceID,
				Action:     action,
				Domain:     domain,
			}
		}
	}

	return nil
}

// extractDomain extracts domain from context or request
func (m *GlobalPermissionMiddleware) extractDomain(ctx context.Context, c *app.RequestContext) string {
	// Try to extract workspace ID from query params or headers
	if workspaceID := string(c.Query("workspace_id")); workspaceID != "" {
		return fmt.Sprintf("workspace:%s", workspaceID)
	}

	if workspaceID := string(c.GetHeader("X-Workspace-ID")); workspaceID != "" {
		return fmt.Sprintf("workspace:%s", workspaceID)
	}

	// Try to extract space ID
	if spaceID := string(c.Query("space_id")); spaceID != "" {
		return fmt.Sprintf("space:%s", spaceID)
	}

	if spaceID := string(c.GetHeader("X-Space-ID")); spaceID != "" {
		return fmt.Sprintf("space:%s", spaceID)
	}

	// Default to global domain
	return permission.DomainGlobal
}

// NewRoutePermissionMW creates a permission middleware for a specific route
func NewRoutePermissionMW(resource, action string, requireOwner bool) app.HandlerFunc {
	return func(ctx context.Context, c *app.RequestContext) {
		// Extract user ID from context
		userID := extractUserIDFromContext(ctx)
		if userID == 0 {
			logs.CtxWarnf(ctx, "[RoutePermissionMW] No user ID found in context")
			c.Next(ctx) // Let authentication middleware handle this
			return
		}

		// Create permission request based on route configuration
		permReq := &permission.CheckRequest{
			UserID:     userID,
			Resource:   resource,
			ResourceID: extractResourceID(c, requireOwner),
			Action:     action,
			Domain:     extractDomainFromRequest(ctx, c),
		}

		// Check if global permission checker is available
		if globalChecker == nil {
			logs.CtxErrorf(ctx, "[RoutePermissionMW] Permission system not initialized")
			c.Next(ctx) // Continue without permission check for backward compatibility
			return
		}

		checker := globalChecker

		response, err := checker.Check(ctx, permReq)
		if err != nil {
			logs.CtxErrorf(ctx, "[RoutePermissionMW] Permission check failed: %v", err)
			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrPermissionCheckFailedCode, errorx.KV("reason", "permission system error")))
			return
		}

		if !response.Allowed {
			logs.CtxWarnf(ctx, "[RoutePermissionMW] Permission denied for user %d on %s:%s action %s: %s",
				permReq.UserID, permReq.Resource, permReq.ResourceID, permReq.Action, response.Reason)

			httputil.InternalError(ctx, c,
				errorx.New(errno.ErrPermissionDeniedCode, errorx.KV("reason", "insufficient permissions")))
			return
		}

		logs.CtxDebugf(ctx, "[RoutePermissionMW] Permission granted for user %d on %s:%s action %s",
			permReq.UserID, permReq.Resource, permReq.ResourceID, permReq.Action)
		c.Next(ctx)
	}
}

// Helper functions for route-level permission middleware
func extractUserIDFromContext(ctx context.Context) int64 {
	if userID := ctxutil.GetUIDFromCtx(ctx); userID != nil {
		return *userID
	}
	return 0
}

func extractResourceID(c *app.RequestContext, requireOwner bool) string {
	if !requireOwner {
		return "*"
	}
	
	// Try to extract ID from URL path parameters
	if id := c.Param("id"); id != "" {
		return id
	}
	
	// Try to extract from query parameters
	if id := string(c.Query("id")); id != "" {
		return id
	}
	
	return "*"
}

func extractDomainFromRequest(ctx context.Context, c *app.RequestContext) string {
	// Try workspace ID first
	if workspaceID := string(c.Query("workspace_id")); workspaceID != "" {
		return fmt.Sprintf("workspace:%s", workspaceID)
	}

	if workspaceID := string(c.GetHeader("X-Workspace-ID")); workspaceID != "" {
		return fmt.Sprintf("workspace:%s", workspaceID)
	}

	// Try space ID
	if spaceID := string(c.Query("space_id")); spaceID != "" {
		return fmt.Sprintf("space:%s", spaceID)
	}

	if spaceID := string(c.GetHeader("X-Space-ID")); spaceID != "" {
		return fmt.Sprintf("space:%s", spaceID)
	}

	return permission.DomainGlobal
}

// buildRoutePatterns builds the route patterns for permission matching
func buildRoutePatterns() []*RoutePattern {
	return []*RoutePattern{
		// Agent/Bot APIs
		// {
		// 	Pattern:       regexp.MustCompile(`^/api/.*/agents/(\d+)$`),
		// 	Resource:      permission.ResourceAgent,
		// 	ActionMap:     permission.HTTPMethodToAction,
		// 	RequireOwner:  true,
		// 	RequireParams: true,
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/agents$`),
		// 	Resource:  permission.ResourceAgent,
		// 	ActionMap: map[string]string{"POST": permission.ActionCreate, "GET": permission.ActionRead},
		// },
		// {
		// 	Pattern:       regexp.MustCompile(`^/api/.*/draftbot/(\d+)$`),
		// 	Resource:      permission.ResourceAgent,
		// 	ActionMap:     permission.HTTPMethodToAction,
		// 	RequireOwner:  true,
		// 	RequireParams: true,
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/draftbot$`),
		// 	Resource:  permission.ResourceAgent,
		// 	ActionMap: map[string]string{"POST": permission.ActionCreate, "GET": permission.ActionRead},
		// },

		// // Workflow APIs
		// {
		// 	Pattern:       regexp.MustCompile(`^/api/.*/workflows/(\d+)$`),
		// 	Resource:      permission.ResourceWorkflow,
		// 	ActionMap:     permission.HTTPMethodToAction,
		// 	RequireOwner:  true,
		// 	RequireParams: true,
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/workflows$`),
		// 	Resource:  permission.ResourceWorkflow,
		// 	ActionMap: map[string]string{"POST": permission.ActionCreate, "GET": permission.ActionRead},
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/workflow/run$`),
		// 	Resource:  permission.ResourceWorkflow,
		// 	ActionMap: map[string]string{"POST": permission.ActionExecute},
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/workflow/stream_run$`),
		// 	Resource:  permission.ResourceWorkflow,
		// 	ActionMap: map[string]string{"POST": permission.ActionExecute},
		// },

		// // Knowledge/Dataset APIs
		// {
		// 	Pattern:       regexp.MustCompile(`^/api/.*/knowledge/datasets/(\d+)$`),
		// 	Resource:      permission.ResourceKnowledge,
		// 	ActionMap:     permission.HTTPMethodToAction,
		// 	RequireOwner:  true,
		// 	RequireParams: true,
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/knowledge/datasets$`),
		// 	Resource:  permission.ResourceKnowledge,
		// 	ActionMap: map[string]string{"POST": permission.ActionCreate, "GET": permission.ActionRead},
		// },
		// {
		// 	Pattern:       regexp.MustCompile(`^/api/.*/knowledge/document/(\d+)$`),
		// 	Resource:      permission.ResourceKnowledge,
		// 	ActionMap:     permission.HTTPMethodToAction,
		// 	RequireOwner:  true,
		// 	RequireParams: true,
		// },

		// // Plugin APIs
		// {
		// 	Pattern:       regexp.MustCompile(`^/api/.*/plugin/(\d+)$`),
		// 	Resource:      permission.ResourcePlugin,
		// 	ActionMap:     permission.HTTPMethodToAction,
		// 	RequireOwner:  true,
		// 	RequireParams: true,
		// },
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/plugin/publish$`),
		// 	Resource:  permission.ResourcePlugin,
		// 	ActionMap: map[string]string{"POST": permission.ActionPublish},
		// },

		// // System/Admin APIs
		// {
		// 	Pattern:   regexp.MustCompile(`^/api/.*/user/.*$`),
		// 	Resource:  permission.ResourceSystem,
		// 	ActionMap: map[string]string{"GET": permission.ActionRead, "PUT": permission.ActionWrite, "POST": permission.ActionWrite},
		// },
	}
}
