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
	"time"
	"gorm.io/gorm"
)

// CasbinRule represents casbin_rule table structure
type CasbinRule struct {
	ID        int64  `gorm:"primaryKey;autoIncrement"`
	PType     string `gorm:"column:ptype;not null"`       // Policy type: p(policy), g(user role)
	V0        string `gorm:"column:v0;not null"`          // User ID/Role
	V1        string `gorm:"column:v1;not null"`          // Resource domain
	V2        string `gorm:"column:v2;not null"`          // Resource type
	V3        string `gorm:"column:v3"`                   // Action
	V4        string `gorm:"column:v4"`                   // Effect
	V5        string `gorm:"column:v5"`                   // Extension field
	CreatedAt int64  `gorm:"column:created_at;not null;default:0"`
	UpdatedAt int64  `gorm:"column:updated_at;not null;default:0"`
}

// TableName sets the table name
func (CasbinRule) TableName() string { return "casbin_rule" }

// CasbinRuleChecker provides permission checking based on casbin_rule table
type CasbinRuleChecker struct {
	db *gorm.DB
}

// NewCasbinRuleChecker creates a new casbin rule checker
func NewCasbinRuleChecker(db *gorm.DB) *CasbinRuleChecker {
	return &CasbinRuleChecker{db: db}
}

// CheckPermission checks permission using casbin_rule table
func (c *CasbinRuleChecker) CheckPermission(ctx context.Context, userID int64, domain, resource, action string) (bool, error) {
	// Get user roles through group policies (g policies)
	// Note: Group policies should be created from user_role table or when roles are assigned
	userRoles, err := c.getUserRoles(ctx, userID, domain)
	if err != nil {
		return false, fmt.Errorf("failed to get user roles: %w", err)
	}
	
	// Check direct user permissions first (p policies with user:123 format)
	userSubject := fmt.Sprintf("user:%d", userID)
	if allowed, err := c.checkPolicyPermission(ctx, userSubject, domain, resource, action); err != nil {
		return false, err
	} else if allowed {
		return true, nil
	}
	
	// Check role-based permissions (p policies with role names like 'super_admin')
	for _, role := range userRoles {
		if allowed, err := c.checkPolicyPermission(ctx, role, domain, resource, action); err != nil {
			return false, err
		} else if allowed {
			return true, nil
		}
	}
	
	return false, nil
}

// getUserRoles gets all roles for a user from group policies (g policies)
func (c *CasbinRuleChecker) getUserRoles(ctx context.Context, userID int64, domain string) ([]string, error) {
	var rules []CasbinRule
	userSubject := fmt.Sprintf("user:%d", userID)
	
	// Query group policies: g, user:123, role_name, domain
	query := c.db.WithContext(ctx).
		Where("ptype = ? AND v0 = ?", "g", userSubject)
	
	// Add domain filter if specified
	if domain != "" {
		query = query.Where("v2 = ?", domain)
	}
	
	err := query.Find(&rules).Error
	if err != nil {
		return nil, fmt.Errorf("failed to query user roles: %w", err)
	}
	
	roles := make([]string, len(rules))
	for i, rule := range rules {
		roles[i] = rule.V1 // Role name is in v1
	}
	
	return roles, nil
}

// checkPolicyPermission checks if a subject has permission through policy rules (p policies)
func (c *CasbinRuleChecker) checkPolicyPermission(ctx context.Context, subject, domain, resource, action string) (bool, error) {
	var count int64
	
	// Query policy rules: p, subject, domain, resource, action, effect
	query := c.db.WithContext(ctx).
		Model(&CasbinRule{}).
		Where("ptype = ? AND v0 = ? AND v1 = ? AND v2 = ? AND v3 = ?", "p", subject, domain, resource, action)
	
	// First check for explicit deny
	denyCount := int64(0)
	err := query.Where("v4 = ?", "deny").Count(&denyCount).Error
	if err != nil {
		return false, fmt.Errorf("failed to check deny policies: %w", err)
	}
	if denyCount > 0 {
		return false, nil // Explicit deny takes precedence
	}
	
	// Then check for allow
	err = query.Where("v4 = ?", "allow").Count(&count).Error
	if err != nil {
		return false, fmt.Errorf("failed to check allow policies: %w", err)
	}
	
	return count > 0, nil
}

// AddUserRole adds a user to a role (creates g policy)
func (c *CasbinRuleChecker) AddUserRole(ctx context.Context, userID int64, role, domain string) error {
	userSubject := fmt.Sprintf("user:%d", userID)
	
	rule := CasbinRule{
		PType:     "g",
		V0:        userSubject,
		V1:        role,
		V2:        domain,
		CreatedAt: getCurrentTimestampMs(),
		UpdatedAt: getCurrentTimestampMs(),
	}
	
	return c.db.WithContext(ctx).Create(&rule).Error
}

// RemoveUserRole removes a user from a role (deletes g policy)
func (c *CasbinRuleChecker) RemoveUserRole(ctx context.Context, userID int64, role, domain string) error {
	userSubject := fmt.Sprintf("user:%d", userID)
	
	return c.db.WithContext(ctx).
		Where("ptype = ? AND v0 = ? AND v1 = ? AND v2 = ?", "g", userSubject, role, domain).
		Delete(&CasbinRule{}).Error
}

// getCurrentTimestampMs returns current Unix timestamp in milliseconds
func getCurrentTimestampMs() int64 {
	return time.Now().UnixMilli()
}