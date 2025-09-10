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

// PermissionTemplateStatus represents the status of permission template
type PermissionTemplateStatus int32

const (
	PermissionTemplateStatusInactive PermissionTemplateStatus = 0 // 非激活
	PermissionTemplateStatusActive   PermissionTemplateStatus = 1 // 激活
)

// PermissionTemplate represents a permission template entity
type PermissionTemplate struct {
	ID           int64                     `json:"id"`
	TemplateCode string                    `json:"template_code"`
	TemplateName string                    `json:"template_name"`
	Domain       string                    `json:"domain"`       // global, space
	Resource     string                    `json:"resource"`     // agent, workflow, knowledge, etc.
	ResourceName string                    `json:"resource_name"`
	Action       string                    `json:"action"`       // create, read, update, delete, etc.
	ActionName   string                    `json:"action_name"`
	Description  string                    `json:"description"`
	IsDefault    int32                     `json:"is_default"`   // 0: 非默认, 1: 默认选中
	SortOrder    int32                     `json:"sort_order"`
	IsActive     PermissionTemplateStatus  `json:"is_active"`
	CreatedAt    time.Time                 `json:"created_at"`
	UpdatedAt    time.Time                 `json:"updated_at"`
}

// PermissionTemplateListFilter represents filter conditions for listing permission templates
type PermissionTemplateListFilter struct {
	Domain     *string                   `json:"domain,omitempty"`
	Resource   *string                   `json:"resource,omitempty"`
	IsActive   *PermissionTemplateStatus `json:"is_active,omitempty"`
	IsDefault  *int32                    `json:"is_default,omitempty"`
	Keyword    *string                   `json:"keyword,omitempty"`
	Page       int                       `json:"page"`
	Limit      int                       `json:"limit"`
}

// PermissionTemplateGroup represents grouped permission templates for API response
type PermissionTemplateGroup struct {
	Domain     string                    `json:"domain"`
	DomainName string                    `json:"domain_name"`
	Resources  []*PermissionResourceGroup `json:"resources"`
}

// PermissionResourceGroup represents permission templates grouped by resource
type PermissionResourceGroup struct {
	Resource     string               `json:"resource"`
	ResourceName string               `json:"resource_name"`
	Actions      []*PermissionTemplate `json:"actions"`
}