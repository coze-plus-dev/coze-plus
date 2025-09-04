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

package service

import (
	"context"
	"fmt"
	"sort"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
)

// PermissionTemplateServiceImpl implements PermissionTemplateService interface
type PermissionTemplateServiceImpl struct {
	templateRepo repository.PermissionTemplateRepo
}

// NewPermissionTemplateService creates a new permission template service
func NewPermissionTemplateService(templateRepo repository.PermissionTemplateRepo) PermissionTemplateService {
	return &PermissionTemplateServiceImpl{
		templateRepo: templateRepo,
	}
}

// CreatePermissionTemplate creates a new permission template
func (p *PermissionTemplateServiceImpl) CreatePermissionTemplate(ctx context.Context, request *CreatePermissionTemplateRequest) (*CreatePermissionTemplateResponse, error) {
	// Check if template code already exists
	existing, err := p.templateRepo.GetByTemplateCode(ctx, request.TemplateCode)
	if err != nil {
		return nil, fmt.Errorf("failed to check template code existence: %w", err)
	}
	if existing != nil {
		return nil, fmt.Errorf("permission template with code '%s' already exists", request.TemplateCode)
	}

	template := &entity.PermissionTemplate{
		TemplateCode: request.TemplateCode,
		TemplateName: request.TemplateName,
		Domain:       request.Domain,
		Resource:     request.Resource,
		ResourceName: request.ResourceName,
		Action:       request.Action,
		ActionName:   request.ActionName,
		Description:  request.Description,
		IsDefault:    request.IsDefault,
		SortOrder:    request.SortOrder,
		IsActive:     entity.PermissionTemplateStatusActive,
	}

	createdTemplate, err := p.templateRepo.Create(ctx, template)
	if err != nil {
		return nil, fmt.Errorf("failed to create permission template: %w", err)
	}

	return &CreatePermissionTemplateResponse{
		Template: createdTemplate,
	}, nil
}

// UpdatePermissionTemplate updates an existing permission template
func (p *PermissionTemplateServiceImpl) UpdatePermissionTemplate(ctx context.Context, request *UpdatePermissionTemplateRequest) error {
	template, err := p.templateRepo.GetByID(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to get permission template: %w", err)
	}
	if template == nil {
		return fmt.Errorf("permission template with ID %d not found", request.ID)
	}

	// Update template fields
	if request.TemplateName != nil {
		template.TemplateName = *request.TemplateName
	}
	if request.ResourceName != nil {
		template.ResourceName = *request.ResourceName
	}
	if request.ActionName != nil {
		template.ActionName = *request.ActionName
	}
	if request.Description != nil {
		template.Description = *request.Description
	}
	if request.IsDefault != nil {
		template.IsDefault = *request.IsDefault
	}
	if request.SortOrder != nil {
		template.SortOrder = *request.SortOrder
	}
	if request.IsActive != nil {
		template.IsActive = *request.IsActive
	}

	if err := p.templateRepo.Update(ctx, template); err != nil {
		return fmt.Errorf("failed to update permission template: %w", err)
	}

	return nil
}

// DeletePermissionTemplate deletes a permission template
func (p *PermissionTemplateServiceImpl) DeletePermissionTemplate(ctx context.Context, request *DeletePermissionTemplateRequest) error {
	template, err := p.templateRepo.GetByID(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to get permission template: %w", err)
	}
	if template == nil {
		return fmt.Errorf("permission template with ID %d not found", request.ID)
	}

	if err := p.templateRepo.Delete(ctx, request.ID); err != nil {
		return fmt.Errorf("failed to delete permission template: %w", err)
	}

	return nil
}

// GetPermissionTemplateByID gets a permission template by ID
func (p *PermissionTemplateServiceImpl) GetPermissionTemplateByID(ctx context.Context, request *GetPermissionTemplateByIDRequest) (*GetPermissionTemplateByIDResponse, error) {
	template, err := p.templateRepo.GetByID(ctx, request.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get permission template: %w", err)
	}
	if template == nil {
		return nil, fmt.Errorf("permission template with ID %d not found", request.ID)
	}

	return &GetPermissionTemplateByIDResponse{
		Template: template,
	}, nil
}

// ListPermissionTemplates lists permission templates with pagination and filters
func (p *PermissionTemplateServiceImpl) ListPermissionTemplates(ctx context.Context, request *ListPermissionTemplatesRequest) (*ListPermissionTemplatesResponse, error) {
	filter := &entity.PermissionTemplateListFilter{
		Domain:    request.Domain,
		Resource:  request.Resource,
		IsActive:  request.IsActive,
		IsDefault: request.IsDefault,
		Keyword:   request.Keyword,
		Page:      request.Page,
		Limit:     request.Limit,
	}

	templates, total, err := p.templateRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to list permission templates: %w", err)
	}

	hasMore := int64(request.Page*request.Limit) < total

	return &ListPermissionTemplatesResponse{
		Templates: templates,
		Total:     total,
		HasMore:   hasMore,
	}, nil
}

// GetPermissionTemplatesByDomain gets permission templates by domain
func (p *PermissionTemplateServiceImpl) GetPermissionTemplatesByDomain(ctx context.Context, request *GetPermissionTemplatesByDomainRequest) (*GetPermissionTemplatesByDomainResponse, error) {
	templates, err := p.templateRepo.GetByDomain(ctx, request.Domain)
	if err != nil {
		return nil, fmt.Errorf("failed to get permission templates by domain: %w", err)
	}

	return &GetPermissionTemplatesByDomainResponse{
		Templates: templates,
	}, nil
}

// GetActivePermissionTemplates gets all active permission templates
func (p *PermissionTemplateServiceImpl) GetActivePermissionTemplates(ctx context.Context, request *GetActivePermissionTemplatesRequest) (*GetActivePermissionTemplatesResponse, error) {
	templates, err := p.templateRepo.GetActiveTemplates(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to get active permission templates: %w", err)
	}

	return &GetActivePermissionTemplatesResponse{
		Templates: templates,
	}, nil
}

// GetDefaultPermissionTemplates gets default permission templates by domain
func (p *PermissionTemplateServiceImpl) GetDefaultPermissionTemplates(ctx context.Context, request *GetDefaultPermissionTemplatesRequest) (*GetDefaultPermissionTemplatesResponse, error) {
	templates, err := p.templateRepo.GetDefaultTemplates(ctx, request.Domain)
	if err != nil {
		return nil, fmt.Errorf("failed to get default permission templates: %w", err)
	}

	return &GetDefaultPermissionTemplatesResponse{
		Templates: templates,
	}, nil
}

// GroupPermissionTemplatesByResource groups permission templates by resource
func (p *PermissionTemplateServiceImpl) GroupPermissionTemplatesByResource(ctx context.Context, request *GroupPermissionTemplatesByResourceRequest) (*GroupPermissionTemplatesByResourceResponse, error) {
	filter := &entity.PermissionTemplateListFilter{
		Domain:   request.Domain,
		IsActive: request.IsActive,
		Page:     1,
		Limit:    1000, // Get all templates
	}

	templates, _, err := p.templateRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get permission templates: %w", err)
	}

	// Group templates by domain and resource
	domainMap := make(map[string]map[string][]*entity.PermissionTemplate)

	for _, template := range templates {
		if domainMap[template.Domain] == nil {
			domainMap[template.Domain] = make(map[string][]*entity.PermissionTemplate)
		}
		if domainMap[template.Domain][template.Resource] == nil {
			domainMap[template.Domain][template.Resource] = make([]*entity.PermissionTemplate, 0)
		}
		domainMap[template.Domain][template.Resource] = append(domainMap[template.Domain][template.Resource], template)
	}

	// Convert to response format
	groups := make([]*entity.PermissionTemplateGroup, 0)

	for domain, resourceMap := range domainMap {
		resources := make([]*entity.PermissionResourceGroup, 0)

		for resource, actions := range resourceMap {
			if len(actions) > 0 {
				// Sort actions by sort_order and then by id to ensure consistent ordering
				sort.Slice(actions, func(i, j int) bool {
					if actions[i].SortOrder != actions[j].SortOrder {
						return actions[i].SortOrder < actions[j].SortOrder
					}
					return actions[i].ID < actions[j].ID
				})

				resourceGroup := &entity.PermissionResourceGroup{
					Resource:     resource,
					ResourceName: actions[0].ResourceName, // Use first action's resource name
					Actions:      actions,
				}
				resources = append(resources, resourceGroup)
			}
		}

		if len(resources) > 0 {
			// Sort resources by the first action's sort_order and id to ensure consistent ordering
			sort.Slice(resources, func(i, j int) bool {
				if len(resources[i].Actions) > 0 && len(resources[j].Actions) > 0 {
					firstActionI := resources[i].Actions[0]
					firstActionJ := resources[j].Actions[0]
					if firstActionI.SortOrder != firstActionJ.SortOrder {
						return firstActionI.SortOrder < firstActionJ.SortOrder
					}
					return firstActionI.ID < firstActionJ.ID
				}
				return resources[i].Resource < resources[j].Resource
			})

			domainName := p.getDomainDisplayName(domain)
			group := &entity.PermissionTemplateGroup{
				Domain:     domain,
				DomainName: domainName,
				Resources:  resources,
			}
			groups = append(groups, group)
		}
	}

	// Sort groups by domain name to ensure consistent ordering
	sort.Slice(groups, func(i, j int) bool {
		return groups[i].Domain < groups[j].Domain
	})

	return &GroupPermissionTemplatesByResourceResponse{
		Groups: groups,
	}, nil
}

// UpdatePermissionTemplateStatus updates permission template status
func (p *PermissionTemplateServiceImpl) UpdatePermissionTemplateStatus(ctx context.Context, request *UpdatePermissionTemplateStatusRequest) error {
	template, err := p.templateRepo.GetByID(ctx, request.ID)
	if err != nil {
		return fmt.Errorf("failed to get permission template: %w", err)
	}
	if template == nil {
		return fmt.Errorf("permission template with ID %d not found", request.ID)
	}

	if err := p.templateRepo.UpdateStatus(ctx, request.ID, request.Status); err != nil {
		return fmt.Errorf("failed to update permission template status: %w", err)
	}

	return nil
}

// getDomainDisplayName returns human-readable domain name
func (p *PermissionTemplateServiceImpl) getDomainDisplayName(domain string) string {
	switch domain {
	case "global":
		return "全局权限"
	case "space":
		return "空间权限"
	default:
		return domain
	}
}
