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

package dal

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type CorporationDAO struct {
	DB    *gorm.DB
	IDGen idgen.IDGenerator
	Query *query.Query
}

// Create creates a new corporation
func (dao *CorporationDAO) Create(ctx context.Context, corp *entity.Corporation) (*entity.Corporation, error) {
	poData := dao.corporationDO2PO(ctx, corp)

	id, err := dao.IDGen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	poData.ID = id

	err = dao.Query.Corporation.WithContext(ctx).Create(poData)
	if err != nil {
		return nil, err
	}
	return dao.corporationPO2DO(ctx, poData), nil
}

// GetByID retrieves corporation by ID
func (dao *CorporationDAO) GetByID(ctx context.Context, id int64) (*entity.Corporation, error) {
	poData, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.ID.Eq(id)).
		Where(dao.Query.Corporation.DeletedAt.IsNull()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return dao.corporationPO2DO(ctx, poData), nil
}

// Update updates corporation
func (dao *CorporationDAO) Update(ctx context.Context, corp *entity.Corporation) error {
	updateData := make(map[string]interface{})
	table := dao.Query.Corporation

	updateData[table.Name.ColumnName().String()] = corp.Name
	if corp.ParentID != nil {
		updateData[table.ParentID.ColumnName().String()] = *corp.ParentID
	}
	updateData[table.CorpType.ColumnName().String()] = string(corp.CorpType)
	updateData[table.Sort.ColumnName().String()] = corp.Sort
	if corp.OutCorpID != nil {
		updateData[table.OutCorpID.ColumnName().String()] = *corp.OutCorpID
	}
	updateData[table.CorpSource.ColumnName().String()] = int32(corp.CorpSource)
	updateData[table.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()

	_, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.ID.Eq(corp.ID)).
		UpdateColumns(updateData)
	return err
}

// Delete soft deletes corporation
func (dao *CorporationDAO) Delete(ctx context.Context, id int64) error {
	// 使用GORM的软删除机制，只需要调用Delete方法
	// deleted_at字段会自动设置为当前时间
	_, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.ID.Eq(id)).
		Delete()
	return err
}

// List lists corporations with filter
func (dao *CorporationDAO) List(ctx context.Context, filter *entity.CorporationListFilter) ([]*entity.Corporation, bool, error) {
	var hasMore bool

	do := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.DeletedAt.IsNull())

	// Apply filters
	if filter.ParentID != nil {
		do = do.Where(dao.Query.Corporation.ParentID.Eq(*filter.ParentID))
	}
	if filter.CorpType != nil {
		do = do.Where(dao.Query.Corporation.CorpType.Eq(string(*filter.CorpType)))
	}
	if filter.CorpSource != nil {
		do = do.Where(dao.Query.Corporation.CorpSource.Eq(int32(*filter.CorpSource)))
	}
	if filter.CreatorID != nil {
		do = do.Where(dao.Query.Corporation.CreatorID.Eq(*filter.CreatorID))
	}
	if filter.Keyword != nil && *filter.Keyword != "" {
		do = do.Where(dao.Query.Corporation.Name.Like("%" + *filter.Keyword + "%"))
	}

	// Pagination
	do = do.Offset((filter.Page - 1) * filter.Limit)
	if filter.Limit > 0 {
		do = do.Limit(filter.Limit + 1)
	}

	// Order by sort and creation time
	do = do.Order(dao.Query.Corporation.Sort.Asc()).
		Order(dao.Query.Corporation.CreatedAt.Desc())

	poList, err := do.Find()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, hasMore, nil
	}
	if err != nil {
		return nil, hasMore, err
	}

	if len(poList) == 0 {
		return nil, hasMore, nil
	}
	if len(poList) > filter.Limit {
		hasMore = true
		return dao.corporationBatchPO2DO(ctx, poList[:len(poList)-1]), hasMore, nil
	}
	return dao.corporationBatchPO2DO(ctx, poList), hasMore, nil
}

// GetByParentID gets corporations by parent ID
func (dao *CorporationDAO) GetByParentID(ctx context.Context, parentID int64) ([]*entity.Corporation, error) {
	poList, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.ParentID.Eq(parentID)).
		Where(dao.Query.Corporation.DeletedAt.IsNull()).
		Order(dao.Query.Corporation.Sort.Asc()).
		Order(dao.Query.Corporation.CreatedAt.Asc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.corporationBatchPO2DO(ctx, poList), nil
}

// GetRootCorporations gets root corporations (parent_id is NULL)
func (dao *CorporationDAO) GetRootCorporations(ctx context.Context) ([]*entity.Corporation, error) {
	poList, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.ParentID.IsNull()).
		Where(dao.Query.Corporation.DeletedAt.IsNull()).
		Order(dao.Query.Corporation.Sort.Asc()).
		Order(dao.Query.Corporation.CreatedAt.Asc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.corporationBatchPO2DO(ctx, poList), nil
}

// GetCorporationTree gets corporation tree with all descendants
func (dao *CorporationDAO) GetCorporationTree(ctx context.Context, rootID int64) ([]*entity.Corporation, error) {
	// Get root corporation
	root, err := dao.GetByID(ctx, rootID)
	if err != nil {
		return nil, err
	}
	if root == nil {
		return nil, nil
	}

	// Collect all corporations in tree
	allCorps := []*entity.Corporation{root}

	// Recursively get all descendants
	descendants, err := dao.getDescendants(ctx, rootID)
	if err != nil {
		return nil, err
	}

	allCorps = append(allCorps, descendants...)
	return allCorps, nil
}

// getDescendants recursively gets all descendant corporations
func (dao *CorporationDAO) getDescendants(ctx context.Context, parentID int64) ([]*entity.Corporation, error) {
	// Get direct children
	children, err := dao.GetByParentID(ctx, parentID)
	if err != nil {
		return nil, err
	}

	allDescendants := make([]*entity.Corporation, 0)
	allDescendants = append(allDescendants, children...)

	// Recursively get descendants of each child
	for _, child := range children {
		descendants, err := dao.getDescendants(ctx, child.ID)
		if err != nil {
			return nil, err
		}
		allDescendants = append(allDescendants, descendants...)
	}

	return allDescendants, nil
}

// UpdateSort updates corporation sort order
func (dao *CorporationDAO) UpdateSort(ctx context.Context, id int64, sort int32) error {
	updateData := map[string]interface{}{
		dao.Query.Corporation.Sort.ColumnName().String():      sort,
		dao.Query.Corporation.UpdatedAt.ColumnName().String(): time.Now().UnixMilli(),
	}

	_, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.ID.Eq(id)).
		UpdateColumns(updateData)
	return err
}

// GetByCreatorID gets corporations by creator ID
func (dao *CorporationDAO) GetByCreatorID(ctx context.Context, creatorID int64) ([]*entity.Corporation, error) {
	poList, err := dao.Query.Corporation.WithContext(ctx).
		Where(dao.Query.Corporation.CreatorID.Eq(creatorID)).
		Where(dao.Query.Corporation.DeletedAt.IsNull()).
		Order(dao.Query.Corporation.CreatedAt.Desc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.corporationBatchPO2DO(ctx, poList), nil
}

// Data conversion methods

func (dao *CorporationDAO) corporationDO2PO(ctx context.Context, corp *entity.Corporation) *model.Corporation {
	po := &model.Corporation{
		ID:        corp.ID,
		Name:      corp.Name,
		CorpType:  string(corp.CorpType),
		Sort:      corp.Sort,
		CreatorID: corp.CreatorID,
		CreatedAt: time.Now().UnixMilli(),
		UpdatedAt: time.Now().UnixMilli(),
	}

	if corp.ParentID != nil {
		po.ParentID = corp.ParentID
	}
	if corp.OutCorpID != nil {
		po.OutCorpID = corp.OutCorpID
	}
	if corp.CorpSource != 0 {
		source := int32(corp.CorpSource)
		po.CorpSource = &source
	}
	if corp.DeletedAt != nil {
		deletedAt := gorm.DeletedAt{
			Time:  time.UnixMilli(*corp.DeletedAt),
			Valid: true,
		}
		po.DeletedAt = deletedAt
	}

	return po
}

func (dao *CorporationDAO) corporationPO2DO(ctx context.Context, po *model.Corporation) *entity.Corporation {
	corp := &entity.Corporation{
		ID:        po.ID,
		Name:      po.Name,
		CorpType:  entity.CorporationType(po.CorpType),
		Sort:      po.Sort,
		CreatorID: po.CreatorID,
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
	}

	if po.ParentID != nil && *po.ParentID != 0 {
		corp.ParentID = po.ParentID
	}
	if po.OutCorpID != nil && *po.OutCorpID != "" {
		corp.OutCorpID = po.OutCorpID
	}
	if po.CorpSource != nil && *po.CorpSource != 0 {
		corpSource := entity.CorporationSource(*po.CorpSource)
		corp.CorpSource = corpSource
	}
	if po.DeletedAt.Valid {
		deletedAt := po.DeletedAt.Time.UnixMilli()
		corp.DeletedAt = &deletedAt
	}

	return corp
}

func (dao *CorporationDAO) corporationBatchPO2DO(ctx context.Context, poList []*model.Corporation) []*entity.Corporation {
	return slices.Transform(poList, func(po *model.Corporation) *entity.Corporation {
		return dao.corporationPO2DO(ctx, po)
	})
}
