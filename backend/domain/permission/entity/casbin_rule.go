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

package entity

import "time"

// CasbinRule represents a casbin permission policy rule
type CasbinRule struct {
	ID        int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Ptype     string `json:"ptype" gorm:"column:ptype;not null;comment:Policy type: p(policy), g(user role)"`
	V0        string `json:"v0" gorm:"column:v0;not null;comment:User ID/Role"`
	V1        string `json:"v1" gorm:"column:v1;not null;comment:Resource domain"`
	V2        string `json:"v2" gorm:"column:v2;not null;comment:Resource type"`
	V3        string `json:"v3" gorm:"column:v3;comment:Action"`
	V4        string `json:"v4" gorm:"column:v4;comment:Effect"`
	V5        string `json:"v5" gorm:"column:v5;comment:Extension field"`
	CreatedAt int64  `json:"created_at" gorm:"column:created_at;not null"`
	UpdatedAt int64  `json:"updated_at" gorm:"column:updated_at;not null"`
}

// TableName returns the table name for CasbinRule
func (CasbinRule) TableName() string {
	return "casbin_rule"
}

// CasbinRuleListFilter defines filters for querying casbin rules
type CasbinRuleListFilter struct {
	Ptype    *string `json:"ptype,omitempty"`
	V0       *string `json:"v0,omitempty"`  // User ID/Role
	V1       *string `json:"v1,omitempty"`  // Resource domain
	V2       *string `json:"v2,omitempty"`  // Resource type
	V3       *string `json:"v3,omitempty"`  // Action
	V4       *string `json:"v4,omitempty"`  // Effect
	Page     int     `json:"page"`
	Limit    int     `json:"limit"`
}

// NewCasbinRule creates a new casbin rule for policy type
func NewCasbinRule(roleCode, domain, resource, action, effect string) *CasbinRule {
	now := time.Now().UnixMilli()
	return &CasbinRule{
		Ptype:     "p",
		V0:        roleCode,
		V1:        domain,
		V2:        resource,
		V3:        action,
		V4:        effect,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// NewGroupRule creates a new casbin rule for group type (user-role relationship)
func NewGroupRule(userID, roleCode string) *CasbinRule {
	now := time.Now().UnixMilli()
	return &CasbinRule{
		Ptype:     "g",
		V0:        userID,
		V1:        roleCode,
		CreatedAt: now,
		UpdatedAt: now,
	}
}

// IsPolicy returns true if this rule is a policy rule (ptype="p")
func (c *CasbinRule) IsPolicy() bool {
	return c.Ptype == "p"
}

// IsGroup returns true if this rule is a group rule (ptype="g")
func (c *CasbinRule) IsGroup() bool {
	return c.Ptype == "g"
}

// GetRoleCode returns the role code from V0 for policy rules, or V1 for group rules
func (c *CasbinRule) GetRoleCode() string {
	if c.IsPolicy() {
		return c.V0
	}
	if c.IsGroup() {
		return c.V1
	}
	return ""
}

// MatchesPolicy checks if this rule matches the given policy parameters
func (c *CasbinRule) MatchesPolicy(roleCode, domain, resource, action string) bool {
	return c.Ptype == "p" &&
		c.V0 == roleCode &&
		c.V1 == domain &&
		c.V2 == resource &&
		c.V3 == action
}