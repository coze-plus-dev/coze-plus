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

package dao

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
)

type PermissionTemplateDAO struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
	Query *query.Query
}

// NewPermissionTemplateDAO creates a new permission template DAO
func NewPermissionTemplateDAO(db *gorm.DB, idGen idgen.IDGenerator) *PermissionTemplateDAO {
	return &PermissionTemplateDAO{
		DB:    db,
		IDGen: idGen,
		Query: query.Use(db),
	}
}

// Create creates a new permission template
func (p *PermissionTemplateDAO) Create(ctx context.Context, template *entity.PermissionTemplate) (*entity.PermissionTemplate, error) {
	if template.ID == 0 {
		id, err := p.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		template.ID = id
	}
	
	now := time.Now()
	dbTemplate := &model.PermissionTemplate{
		ID:           template.ID,
		TemplateCode: template.TemplateCode,
		TemplateName: template.TemplateName,
		Domain:       template.Domain,
		Resource:     template.Resource,
		ResourceName: template.ResourceName,
		Action:       template.Action,
		ActionName:   template.ActionName,
		Description:  template.Description,
		IsDefault:    template.IsDefault,
		SortOrder:    template.SortOrder,
		IsActive:     int32(template.IsActive),
		CreatedAt:    now.UnixMilli(),
		UpdatedAt:    now.UnixMilli(),
	}
	
	if err := p.Query.PermissionTemplate.WithContext(ctx).Create(dbTemplate); err != nil {
		return nil, err
	}
	
	return p.convertToEntity(dbTemplate), nil
}

// GetByID gets a permission template by ID
func (p *PermissionTemplateDAO) GetByID(ctx context.Context, id int64) (*entity.PermissionTemplate, error) {
	dbTemplate, err := p.Query.PermissionTemplate.WithContext(ctx).Where(p.Query.PermissionTemplate.ID.Eq(id)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	return p.convertToEntity(dbTemplate), nil
}

// Update updates a permission template
func (p *PermissionTemplateDAO) Update(ctx context.Context, template *entity.PermissionTemplate) error {
	updates := map[string]interface{}{
		"template_name": template.TemplateName,
		"domain":        template.Domain,
		"resource":      template.Resource,
		"resource_name": template.ResourceName,
		"action":        template.Action,
		"action_name":   template.ActionName,
		"description":   template.Description,
		"is_default":    template.IsDefault,
		"sort_order":    template.SortOrder,
		"is_active":     int32(template.IsActive),
		"updated_at":    time.Now().UnixMilli(),
	}
	
	_, err := p.Query.PermissionTemplate.WithContext(ctx).Where(p.Query.PermissionTemplate.ID.Eq(template.ID)).Updates(updates)
	return err
}

// Delete deletes a permission template
func (p *PermissionTemplateDAO) Delete(ctx context.Context, id int64) error {
	_, err := p.Query.PermissionTemplate.WithContext(ctx).Where(p.Query.PermissionTemplate.ID.Eq(id)).Delete()
	return err
}

// List lists permission templates with pagination and filters
func (p *PermissionTemplateDAO) List(ctx context.Context, filter *entity.PermissionTemplateListFilter) ([]*entity.PermissionTemplate, int64, error) {
	q := p.Query.PermissionTemplate.WithContext(ctx)
	
	// Apply filters
	if filter.Domain != nil {
		q = q.Where(p.Query.PermissionTemplate.Domain.Eq(*filter.Domain))
	}
	if filter.Resource != nil {
		q = q.Where(p.Query.PermissionTemplate.Resource.Eq(*filter.Resource))
	}
	if filter.IsActive != nil {
		q = q.Where(p.Query.PermissionTemplate.IsActive.Eq(int32(*filter.IsActive)))
	}
	if filter.IsDefault != nil {
		q = q.Where(p.Query.PermissionTemplate.IsDefault.Eq(*filter.IsDefault))
	}
	if filter.Keyword != nil && *filter.Keyword != "" {
		keyword := "%" + *filter.Keyword + "%"
		q = q.Where(p.Query.PermissionTemplate.TemplateName.Like(keyword)).
			Or(p.Query.PermissionTemplate.ResourceName.Like(keyword)).
			Or(p.Query.PermissionTemplate.ActionName.Like(keyword))
	}
	
	// Get total count
	total, err := q.Count()
	if err != nil {
		return nil, 0, err
	}
	
	// Apply pagination
	offset := (filter.Page - 1) * filter.Limit
	dbTemplates, err := q.Offset(offset).Limit(filter.Limit).
		Order(p.Query.PermissionTemplate.SortOrder.Asc()).
		Order(p.Query.PermissionTemplate.ID.Asc()).Find()
	if err != nil {
		return nil, 0, err
	}
	
	templates := make([]*entity.PermissionTemplate, len(dbTemplates))
	for i, dbTemplate := range dbTemplates {
		templates[i] = p.convertToEntity(dbTemplate)
	}
	
	return templates, total, nil
}

// GetByDomain gets permission templates by domain
func (p *PermissionTemplateDAO) GetByDomain(ctx context.Context, domain string) ([]*entity.PermissionTemplate, error) {
	dbTemplates, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.Domain.Eq(domain)).
		Order(p.Query.PermissionTemplate.SortOrder.Asc()).Find()
	if err != nil {
		return nil, err
	}
	
	templates := make([]*entity.PermissionTemplate, len(dbTemplates))
	for i, dbTemplate := range dbTemplates {
		templates[i] = p.convertToEntity(dbTemplate)
	}
	
	return templates, nil
}

// GetByResource gets permission templates by domain and resource
func (p *PermissionTemplateDAO) GetByResource(ctx context.Context, domain, resource string) ([]*entity.PermissionTemplate, error) {
	dbTemplates, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.Domain.Eq(domain)).
		Where(p.Query.PermissionTemplate.Resource.Eq(resource)).
		Order(p.Query.PermissionTemplate.SortOrder.Asc()).Find()
	if err != nil {
		return nil, err
	}
	
	templates := make([]*entity.PermissionTemplate, len(dbTemplates))
	for i, dbTemplate := range dbTemplates {
		templates[i] = p.convertToEntity(dbTemplate)
	}
	
	return templates, nil
}

// GetActiveTemplates gets all active permission templates
func (p *PermissionTemplateDAO) GetActiveTemplates(ctx context.Context) ([]*entity.PermissionTemplate, error) {
	dbTemplates, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.IsActive.Eq(int32(entity.PermissionTemplateStatusActive))).
		Order(p.Query.PermissionTemplate.SortOrder.Asc()).Find()
	if err != nil {
		return nil, err
	}
	
	templates := make([]*entity.PermissionTemplate, len(dbTemplates))
	for i, dbTemplate := range dbTemplates {
		templates[i] = p.convertToEntity(dbTemplate)
	}
	
	return templates, nil
}

// GetDefaultTemplates gets default permission templates by domain
func (p *PermissionTemplateDAO) GetDefaultTemplates(ctx context.Context, domain string) ([]*entity.PermissionTemplate, error) {
	dbTemplates, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.Domain.Eq(domain)).
		Where(p.Query.PermissionTemplate.IsDefault.Eq(1)).
		Where(p.Query.PermissionTemplate.IsActive.Eq(int32(entity.PermissionTemplateStatusActive))).
		Order(p.Query.PermissionTemplate.SortOrder.Asc()).Find()
	if err != nil {
		return nil, err
	}
	
	templates := make([]*entity.PermissionTemplate, len(dbTemplates))
	for i, dbTemplate := range dbTemplates {
		templates[i] = p.convertToEntity(dbTemplate)
	}
	
	return templates, nil
}

// GetByTemplateCode gets a permission template by template code
func (p *PermissionTemplateDAO) GetByTemplateCode(ctx context.Context, templateCode string) (*entity.PermissionTemplate, error) {
	dbTemplate, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.TemplateCode.Eq(templateCode)).First()
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	return p.convertToEntity(dbTemplate), nil
}

// UpdateStatus updates permission template status
func (p *PermissionTemplateDAO) UpdateStatus(ctx context.Context, id int64, status entity.PermissionTemplateStatus) error {
	_, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.ID.Eq(id)).
		Update(p.Query.PermissionTemplate.IsActive, int32(status))
	return err
}

// BatchUpdateStatus updates permission template status in batch
func (p *PermissionTemplateDAO) BatchUpdateStatus(ctx context.Context, ids []int64, status entity.PermissionTemplateStatus) error {
	_, err := p.Query.PermissionTemplate.WithContext(ctx).
		Where(p.Query.PermissionTemplate.ID.In(ids...)).
		Update(p.Query.PermissionTemplate.IsActive, int32(status))
	return err
}

// convertToEntity converts model to entity
func (p *PermissionTemplateDAO) convertToEntity(dbTemplate *model.PermissionTemplate) *entity.PermissionTemplate {
	return &entity.PermissionTemplate{
		ID:           dbTemplate.ID,
		TemplateCode: dbTemplate.TemplateCode,
		TemplateName: dbTemplate.TemplateName,
		Domain:       dbTemplate.Domain,
		Resource:     dbTemplate.Resource,
		ResourceName: dbTemplate.ResourceName,
		Action:       dbTemplate.Action,
		ActionName:   dbTemplate.ActionName,
		Description:  dbTemplate.Description,
		IsDefault:    dbTemplate.IsDefault,
		SortOrder:    dbTemplate.SortOrder,
		IsActive:     entity.PermissionTemplateStatus(dbTemplate.IsActive),
		CreatedAt:    time.UnixMilli(dbTemplate.CreatedAt),
		UpdatedAt:    time.UnixMilli(dbTemplate.UpdatedAt),
	}
}