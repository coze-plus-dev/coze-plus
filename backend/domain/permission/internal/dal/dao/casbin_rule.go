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

package dao

import (
	"context"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/permission/entity"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/permission/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
)

// CasbinRuleDAO implements casbin rule data access operations
type CasbinRuleDAO struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
	Query *query.Query
}

// NewCasbinRuleDAO creates a new CasbinRuleDAO instance
func NewCasbinRuleDAO(db *gorm.DB, idGen idgen.IDGenerator) *CasbinRuleDAO {
	return &CasbinRuleDAO{
		DB:    db,
		IDGen: idGen,
		Query: query.Use(db),
	}
}

// Create creates a new casbin rule
func (dao *CasbinRuleDAO) Create(ctx context.Context, rule *entity.CasbinRule) (*entity.CasbinRule, error) {
	now := time.Now().UnixMilli()

	// Generate ID if not provided
	if rule.ID == 0 {
		id, err := dao.IDGen.GenID(ctx)
		if err != nil {
			return nil, err
		}
		rule.ID = id
	}

	rule.CreatedAt = now
	rule.UpdatedAt = now

	// Convert entity to model
	modelRule := dao.entityToModel(rule)

	// Create in database
	if err := dao.Query.CasbinRule.WithContext(ctx).Create(modelRule); err != nil {
		return nil, err
	}

	// Convert back to entity
	return dao.modelToEntity(modelRule), nil
}

// GetByID gets a casbin rule by ID
func (dao *CasbinRuleDAO) GetByID(ctx context.Context, id int64) (*entity.CasbinRule, error) {
	modelRule, err := dao.Query.CasbinRule.WithContext(ctx).Where(dao.Query.CasbinRule.ID.Eq(id)).First()
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}

	return dao.modelToEntity(modelRule), nil
}

// Update updates a casbin rule
func (dao *CasbinRuleDAO) Update(ctx context.Context, rule *entity.CasbinRule) error {
	rule.UpdatedAt = time.Now().UnixMilli()

	// Convert entity to model
	modelRule := dao.entityToModel(rule)

	// Update in database
	_, err := dao.Query.CasbinRule.WithContext(ctx).Where(dao.Query.CasbinRule.ID.Eq(rule.ID)).Updates(modelRule)
	return err
}

// Delete deletes a casbin rule by ID
func (dao *CasbinRuleDAO) Delete(ctx context.Context, id int64) error {
	_, err := dao.Query.CasbinRule.WithContext(ctx).Where(dao.Query.CasbinRule.ID.Eq(id)).Delete()
	return err
}

// List lists casbin rules with pagination and filters
func (dao *CasbinRuleDAO) List(ctx context.Context, filter *entity.CasbinRuleListFilter) ([]*entity.CasbinRule, int64, error) {
	query := dao.Query.CasbinRule.WithContext(ctx)

	// Apply filters
	if filter.Ptype != nil {
		query = query.Where(dao.Query.CasbinRule.Ptype.Eq(*filter.Ptype))
	}
	if filter.V0 != nil {
		query = query.Where(dao.Query.CasbinRule.V0.Eq(*filter.V0))
	}
	if filter.V1 != nil {
		query = query.Where(dao.Query.CasbinRule.V1.Eq(*filter.V1))
	}
	if filter.V2 != nil {
		query = query.Where(dao.Query.CasbinRule.V2.Eq(*filter.V2))
	}
	if filter.V3 != nil {
		query = query.Where(dao.Query.CasbinRule.V3.Eq(*filter.V3))
	}
	if filter.V4 != nil {
		query = query.Where(dao.Query.CasbinRule.V4.Eq(*filter.V4))
	}

	// Count total
	total, err := query.Count()
	if err != nil {
		return nil, 0, err
	}

	// Apply pagination
	if filter.Limit > 0 {
		offset := (filter.Page - 1) * filter.Limit
		if offset > 0 {
			query = query.Offset(offset)
		}
		query = query.Limit(filter.Limit)
	}

	// Order by ID desc
	query = query.Order(dao.Query.CasbinRule.ID.Desc())

	// Find results
	modelRules, err := query.Find()
	if err != nil {
		return nil, 0, err
	}

	// Convert models to entities
	rules := make([]*entity.CasbinRule, len(modelRules))
	for i, modelRule := range modelRules {
		rules[i] = dao.modelToEntity(modelRule)
	}

	return rules, total, nil
}

// GetRolePolicies gets all policy rules for a specific role
func (dao *CasbinRuleDAO) GetRolePolicies(ctx context.Context, roleCode string) ([]*entity.CasbinRule, error) {
	modelRules, err := dao.Query.CasbinRule.WithContext(ctx).
		Where(dao.Query.CasbinRule.Ptype.Eq("p")).
		Where(dao.Query.CasbinRule.V0.Eq(roleCode)).
		Find()
	if err != nil {
		return nil, err
	}

	// Convert models to entities
	rules := make([]*entity.CasbinRule, len(modelRules))
	for i, modelRule := range modelRules {
		rules[i] = dao.modelToEntity(modelRule)
	}

	return rules, nil
}

// DeleteRolePolicies deletes all policy rules for a specific role
func (dao *CasbinRuleDAO) DeleteRolePolicies(ctx context.Context, roleCode string) error {
	_, err := dao.Query.CasbinRule.WithContext(ctx).
		Where(dao.Query.CasbinRule.Ptype.Eq("p")).
		Where(dao.Query.CasbinRule.V0.Eq(roleCode)).
		Delete()
	return err
}

// BatchCreate creates multiple casbin rules in a transaction
func (dao *CasbinRuleDAO) BatchCreate(ctx context.Context, rules []*entity.CasbinRule) error {
	if len(rules) == 0 {
		return nil
	}

	return dao.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txQuery := query.Use(tx)

		// Convert entities to models and generate IDs
		modelRules := make([]*model.CasbinRule, len(rules))
		for i, rule := range rules {
			if rule.ID == 0 {
				id, err := dao.IDGen.GenID(ctx)
				if err != nil {
					return err
				}
				rule.ID = id
			}

			now := time.Now().UnixMilli()
			rule.CreatedAt = now
			rule.UpdatedAt = now

			modelRules[i] = dao.entityToModel(rule)
		}

		// Batch create
		return txQuery.CasbinRule.WithContext(ctx).CreateInBatches(modelRules, 100)
	})
}

// SyncRolePolicies synchronizes all policy rules for a role (delete existing + create new)
func (dao *CasbinRuleDAO) SyncRolePolicies(ctx context.Context, roleCode string, policies []*entity.CasbinRule) error {
	return dao.DB.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txQuery := query.Use(tx)

		// Delete existing policies for this role
		_, err := txQuery.CasbinRule.WithContext(ctx).
			Where(txQuery.CasbinRule.Ptype.Eq("p")).
			Where(txQuery.CasbinRule.V0.Eq(roleCode)).
			Delete()
		if err != nil {
			return err
		}

		// Create new policies if any
		if len(policies) > 0 {
			// Generate IDs and set timestamps
			modelRules := make([]*model.CasbinRule, len(policies))
			for i, policy := range policies {
				if policy.ID == 0 {
					id, err := dao.IDGen.GenID(ctx)
					if err != nil {
						return err
					}
					policy.ID = id
				}

				now := time.Now().UnixMilli()
				policy.CreatedAt = now
				policy.UpdatedAt = now

				modelRules[i] = dao.entityToModel(policy)
			}

			// Batch create
			err = txQuery.CasbinRule.WithContext(ctx).CreateInBatches(modelRules, 100)
			if err != nil {
				return err
			}
		}

		return nil
	})
}

// entityToModel converts entity.CasbinRule to model.CasbinRule
func (dao *CasbinRuleDAO) entityToModel(rule *entity.CasbinRule) *model.CasbinRule {
	return &model.CasbinRule{
		ID:        rule.ID,
		Ptype:     rule.Ptype,
		V0:        rule.V0,
		V1:        rule.V1,
		V2:        rule.V2,
		V3:        rule.V3,
		V4:        rule.V4,
		V5:        rule.V5,
		CreatedAt: rule.CreatedAt,
		UpdatedAt: rule.UpdatedAt,
	}
}

// modelToEntity converts model.CasbinRule to entity.CasbinRule
func (dao *CasbinRuleDAO) modelToEntity(modelRule *model.CasbinRule) *entity.CasbinRule {
	return &entity.CasbinRule{
		ID:        modelRule.ID,
		Ptype:     modelRule.Ptype,
		V0:        modelRule.V0,
		V1:        modelRule.V1,
		V2:        modelRule.V2,
		V3:        modelRule.V3,
		V4:        modelRule.V4,
		V5:        modelRule.V5,
		CreatedAt: modelRule.CreatedAt,
		UpdatedAt: modelRule.UpdatedAt,
	}
}
