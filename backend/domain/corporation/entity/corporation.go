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

import (
	"errors"
	"strings"

	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/consts"
)

// Corporation entity represents a corporation in the domain
type Corporation struct {
	ID         int64               `json:"id"`
	ParentID   *int64              `json:"parent_id"`
	Name       string              `json:"name"`
	CorpType   CorporationType     `json:"corp_type"`
	Sort       int32               `json:"sort"`
	OutCorpID  *string             `json:"out_corp_id"`
	CorpSource CorporationSource   `json:"corp_source"`
	CreatorID  int64               `json:"creator_id"`
	CreatedAt  int64               `json:"created_at"`
	UpdatedAt  int64               `json:"updated_at"`
	DeletedAt  *int64              `json:"deleted_at"`
	
	// Aggregated fields (not stored in DB)
	Children    []*Corporation     `json:"children,omitempty"`
	Departments []*Department      `json:"departments,omitempty"`
}

// CorporationType defines corporation type enum
type CorporationType string

const (
	CorporationTypeGroup   CorporationType = consts.CorporationTypeGroup
	CorporationTypeCompany CorporationType = consts.CorporationTypeCompany
	CorporationTypeBranch  CorporationType = consts.CorporationTypeBranch
)

// CorporationSource defines data source enum
type CorporationSource int32

const (
	CorporationSourceUnknown        CorporationSource = 0
	CorporationSourceManual         CorporationSource = consts.CorporationSourceManual
	CorporationSourceEnterpriseWX   CorporationSource = consts.CorporationSourceEnterpriseWX
	CorporationSourceDingTalk       CorporationSource = consts.CorporationSourceDingTalk
	CorporationSourceFeishu         CorporationSource = consts.CorporationSourceFeishu
)

// CreateCorporationMeta contains metadata for creating corporation
type CreateCorporationMeta struct {
	Name       string            `json:"name"`
	ParentID   *int64            `json:"parent_id"`
	CorpType   CorporationType   `json:"corp_type"`
	Sort       int32             `json:"sort"`
	OutCorpID  *string           `json:"out_corp_id"`
	CorpSource CorporationSource `json:"corp_source"`
	CreatorID  int64             `json:"creator_id"`
}

// UpdateCorporationMeta contains metadata for updating corporation
type UpdateCorporationMeta struct {
	Name       *string           `json:"name"`
	ParentID   *int64            `json:"parent_id"`
	CorpType   *CorporationType  `json:"corp_type"`
	Sort       *int32            `json:"sort"`
	OutCorpID  *string           `json:"out_corp_id"`
	CorpSource *CorporationSource `json:"corp_source"`
}

// CorporationListFilter contains filter criteria for listing corporations
type CorporationListFilter struct {
	ParentID   *int64            `json:"parent_id"`
	CorpType   *CorporationType  `json:"corp_type"`
	CorpSource *CorporationSource `json:"corp_source"`
	CreatorID  *int64            `json:"creator_id"`
	Keyword    *string           `json:"keyword"` // Search in name
	Limit      int               `json:"limit"`
	Page       int               `json:"page"`
}

// Business methods

// ValidateName validates corporation name
func (c *Corporation) ValidateName(name string) error {
	name = strings.TrimSpace(name)
	if len(name) == 0 {
		return errors.New("corporation name cannot be empty")
	}
	if len(name) > consts.MaxCorporationNameLength {
		return errors.New("corporation name cannot exceed maximum length")
	}
	return nil
}

// CanDelete checks if corporation can be deleted
func (c *Corporation) CanDelete() bool {
	// Cannot delete if has children or departments
	return len(c.Children) == 0 && len(c.Departments) == 0
}

// IsRootCorporation checks if this is a root corporation
func (c *Corporation) IsRootCorporation() bool {
	return c.ParentID == nil
}

// ValidateCorpType validates corporation type
func (c *Corporation) ValidateCorpType(corpType CorporationType) error {
	switch corpType {
	case CorporationTypeGroup, CorporationTypeCompany, CorporationTypeBranch:
		return nil
	default:
		return errors.New("invalid corporation type")
	}
}

// AddChild adds a child corporation (for tree building)
func (c *Corporation) AddChild(child *Corporation) {
	if c.Children == nil {
		c.Children = make([]*Corporation, 0)
	}
	c.Children = append(c.Children, child)
}

// AddDepartment adds a department (for aggregation)
func (c *Corporation) AddDepartment(dept *Department) {
	if c.Departments == nil {
		c.Departments = make([]*Department, 0)
	}
	c.Departments = append(c.Departments, dept)
}