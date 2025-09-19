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

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/repository"
	"github.com/coze-dev/coze-studio/backend/pkg/logs"
)

// CasbinRuleServiceImpl implements CasbinRuleService interface
type CasbinRuleServiceImpl struct {
	casbinRuleRepo repository.CasbinRuleRepo
}

// NewCasbinRuleService creates a new casbin rule service
func NewCasbinRuleService(casbinRuleRepo repository.CasbinRuleRepo) CasbinRuleService {
	return &CasbinRuleServiceImpl{
		casbinRuleRepo: casbinRuleRepo,
	}
}

// CreateGroupRule creates a group rule (user-role relationship)
func (c *CasbinRuleServiceImpl) CreateGroupRule(ctx context.Context, request *CreateGroupRuleRequest) error {
	// Check if group rule already exists
	filter := &entity.CasbinRuleListFilter{
		Ptype: strPtr("g"),
		V0:    &request.UserID,
		V1:    &request.RoleCode,
		Page:  1,
		Limit: 1,
	}
	
	existingRules, _, err := c.casbinRuleRepo.List(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to check existing group rule: %w", err)
	}
	
	if len(existingRules) > 0 {
		// Rule already exists, no need to create
		return nil
	}

	// Create new group rule
	groupRule := entity.NewGroupRule(request.UserID, request.RoleCode)
	_, err = c.casbinRuleRepo.Create(ctx, groupRule)
	if err != nil {
		return fmt.Errorf("failed to create group rule: %w", err)
	}

	return nil
}

// DeleteGroupRule deletes a group rule (user-role relationship)
func (c *CasbinRuleServiceImpl) DeleteGroupRule(ctx context.Context, request *DeleteGroupRuleRequest) error {
	// Find the rule to delete
	filter := &entity.CasbinRuleListFilter{
		Ptype: strPtr("g"),
		V0:    &request.UserID,
		V1:    &request.RoleCode,
		Page:  1,
		Limit: 1,
	}
	
	existingRules, _, err := c.casbinRuleRepo.List(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find group rule to delete: %w", err)
	}
	
	if len(existingRules) == 0 {
		// Rule doesn't exist, nothing to delete
		return nil
	}

	// Delete the rule
	err = c.casbinRuleRepo.Delete(ctx, existingRules[0].ID)
	if err != nil {
		return fmt.Errorf("failed to delete group rule: %w", err)
	}

	return nil
}

// CreateGroupRuleWithDomain creates a group rule with domain (user-role-domain relationship)
func (c *CasbinRuleServiceImpl) CreateGroupRuleWithDomain(ctx context.Context, request *CreateGroupRuleWithDomainRequest) error {
	logs.CtxInfof(ctx, "[CASBIN DEBUG] Starting to create group rule: user=%s, role=%s, domain=%s", request.UserID, request.RoleCode, request.Domain)
	
	// Check if group rule already exists
	filter := &entity.CasbinRuleListFilter{
		Ptype: strPtr("g"),
		V0:    &request.UserID,
		V1:    &request.RoleCode,
		V2:    &request.Domain,
		Page:  1,
		Limit: 1,
	}
	
	logs.CtxInfof(ctx, "[CASBIN DEBUG] Checking for existing rule with filter: ptype=g, v0=%s, v1=%s, v2=%s", request.UserID, request.RoleCode, request.Domain)
	
	existingRules, _, err := c.casbinRuleRepo.List(ctx, filter)
	if err != nil {
		logs.CtxErrorf(ctx, "[CASBIN DEBUG] Failed to check existing rule: %v", err)
		return fmt.Errorf("failed to check existing group rule with domain: %w", err)
	}
	
	logs.CtxInfof(ctx, "[CASBIN DEBUG] Found %d existing rules", len(existingRules))
	
	if len(existingRules) > 0 {
		logs.CtxInfof(ctx, "[CASBIN DEBUG] Rule already exists, skipping creation for user=%s, role=%s, domain=%s", request.UserID, request.RoleCode, request.Domain)
		// Rule already exists, no need to create
		return nil
	}

	logs.CtxInfof(ctx, "[CASBIN DEBUG] Creating new group rule with domain")
	// Create new group rule with domain
	groupRule := entity.NewGroupRuleWithDomain(request.UserID, request.RoleCode, request.Domain)
	createdRule, err := c.casbinRuleRepo.Create(ctx, groupRule)
	if err != nil {
		logs.CtxErrorf(ctx, "[CASBIN DEBUG] Failed to create group rule: %v", err)
		return fmt.Errorf("failed to create group rule with domain: %w", err)
	}

	logs.CtxInfof(ctx, "[CASBIN DEBUG] Successfully created group rule with ID=%d for user=%s, role=%s, domain=%s", createdRule.ID, request.UserID, request.RoleCode, request.Domain)
	return nil
}

// DeleteGroupRuleWithDomain deletes a group rule with domain (user-role-domain relationship)
func (c *CasbinRuleServiceImpl) DeleteGroupRuleWithDomain(ctx context.Context, request *DeleteGroupRuleWithDomainRequest) error {
	// Find the rule to delete
	filter := &entity.CasbinRuleListFilter{
		Ptype: strPtr("g"),
		V0:    &request.UserID,
		V1:    &request.RoleCode,
		V2:    &request.Domain,
		Page:  1,
		Limit: 1,
	}
	
	existingRules, _, err := c.casbinRuleRepo.List(ctx, filter)
	if err != nil {
		return fmt.Errorf("failed to find group rule with domain to delete: %w", err)
	}
	
	if len(existingRules) == 0 {
		// Rule doesn't exist, nothing to delete
		return nil
	}

	// Delete the rule
	err = c.casbinRuleRepo.Delete(ctx, existingRules[0].ID)
	if err != nil {
		return fmt.Errorf("failed to delete group rule with domain: %w", err)
	}

	return nil
}

// GetUserRoles gets all roles assigned to a user via group rules
func (c *CasbinRuleServiceImpl) GetUserRoles(ctx context.Context, userID string) ([]string, error) {
	filter := &entity.CasbinRuleListFilter{
		Ptype: strPtr("g"),
		V0:    &userID,
		Page:  1,
		Limit: 1000, // Assume a user won't have more than 1000 roles
	}
	
	groupRules, _, err := c.casbinRuleRepo.List(ctx, filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}

	roleCodes := make([]string, len(groupRules))
	for i, rule := range groupRules {
		roleCodes[i] = rule.V1 // V1 contains role_code in group rules
	}

	return roleCodes, nil
}

// BatchCreateGroupRules creates multiple group rules in batch
func (c *CasbinRuleServiceImpl) BatchCreateGroupRules(ctx context.Context, request *BatchCreateGroupRulesRequest) error {
	var rulesToCreate []*entity.CasbinRule
	
	for _, roleCode := range request.RoleCodes {
		// Check if rule already exists
		filter := &entity.CasbinRuleListFilter{
			Ptype: strPtr("g"),
			V0:    &request.UserID,
			V1:    &roleCode,
			Page:  1,
			Limit: 1,
		}
		
		existingRules, _, err := c.casbinRuleRepo.List(ctx, filter)
		if err != nil {
			return fmt.Errorf("failed to check existing group rule for user %s role %s: %w", request.UserID, roleCode, err)
		}
		
		if len(existingRules) == 0 {
			// Rule doesn't exist, add to creation list
			groupRule := entity.NewGroupRule(request.UserID, roleCode)
			rulesToCreate = append(rulesToCreate, groupRule)
		}
	}

	if len(rulesToCreate) == 0 {
		// All rules already exist
		return nil
	}

	// Batch create new rules
	err := c.casbinRuleRepo.BatchCreate(ctx, rulesToCreate)
	if err != nil {
		return fmt.Errorf("failed to batch create group rules: %w", err)
	}

	return nil
}

// strPtr returns a string pointer
func strPtr(s string) *string {
	return &s
}