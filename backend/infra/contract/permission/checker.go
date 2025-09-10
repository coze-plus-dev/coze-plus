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

import "context"

// Checker defines the permission checking interface
type Checker interface {
	// Check performs a single permission check
	Check(ctx context.Context, req *CheckRequest) (*CheckResponse, error)
	// BatchCheck performs multiple permission checks
	BatchCheck(ctx context.Context, reqs []*CheckRequest) ([]*CheckResponse, error)
	// CheckUserRole checks if user has specific role
	CheckUserRole(ctx context.Context, userID int64, roleCode string) (bool, error)
}

// CheckRequest represents a permission check request
type CheckRequest struct {
	UserID     int64  `json:"user_id"`     // User ID to check
	Resource   string `json:"resource"`    // Resource type: agent, workflow, knowledge, plugin
	ResourceID string `json:"resource_id"` // Specific resource ID, "*" for all resources
	Action     string `json:"action"`      // Action: read, write, delete, create, execute, publish
	Domain     string `json:"domain"`      // Domain: workspace:123, global, or space:456
}

// CheckResponse represents a permission check response
type CheckResponse struct {
	Allowed bool   `json:"allowed"` // Whether the action is allowed
	Reason  string `json:"reason"`  // Reason for denial (empty if allowed)
}

