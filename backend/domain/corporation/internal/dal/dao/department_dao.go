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

package dal

import (
	"context"
	"errors"
	"time"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/dal/model"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/internal/dal/query"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/slices"
)

type DepartmentDAO struct {
	idgen idgen.IDGenerator
	db    *gorm.DB
	query *query.Query
}

func NewDepartmentDAO(db *gorm.DB, generator idgen.IDGenerator) *DepartmentDAO {
	return &DepartmentDAO{
		idgen: generator,
		db:    db,
		query: query.Use(db),
	}
}

// Create creates a new department
func (dao *DepartmentDAO) Create(ctx context.Context, dept *entity.Department) (*entity.Department, error) {
	poData := dao.departmentDO2PO(ctx, dept)

	id, err := dao.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	poData.ID = id

	err = dao.query.CorporationDepartment.WithContext(ctx).Create(poData)
	if err != nil {
		return nil, err
	}
	return dao.departmentPO2DO(ctx, poData), nil
}

// GetByID retrieves department by ID
func (dao *DepartmentDAO) GetByID(ctx context.Context, id int64) (*entity.Department, error) {
	poData, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.ID.Eq(id)).
		Where(dao.query.CorporationDepartment.DeletedAt.IsNull()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return dao.departmentPO2DO(ctx, poData), nil
}

// Update updates department
func (dao *DepartmentDAO) Update(ctx context.Context, dept *entity.Department) error {
	updateData := make(map[string]interface{})
	table := dao.query.CorporationDepartment

	updateData[table.Name.ColumnName().String()] = dept.Name
	if dept.ParentDeptID != nil {
		updateData[table.ParentID.ColumnName().String()] = *dept.ParentDeptID
	}
	updateData[table.Sort.ColumnName().String()] = dept.Sort
	if dept.OutDeptID != nil {
		updateData[table.OutDepartmentID.ColumnName().String()] = *dept.OutDeptID
	}
	updateData[table.DepartmentSource.ColumnName().String()] = int32(dept.DeptSource)
	updateData[table.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()

	_, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.ID.Eq(dept.ID)).
		UpdateColumns(updateData)
	return err
}

// Delete soft deletes department
func (dao *DepartmentDAO) Delete(ctx context.Context, id int64) error {
	updateData := map[string]interface{}{
		dao.query.CorporationDepartment.DeletedAt.ColumnName().String(): time.Now().UnixMilli(),
		dao.query.CorporationDepartment.UpdatedAt.ColumnName().String(): time.Now().UnixMilli(),
	}

	_, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.ID.Eq(id)).
		UpdateColumns(updateData)
	return err
}

// List lists departments with filter
func (dao *DepartmentDAO) List(ctx context.Context, filter *entity.DepartmentListFilter) ([]*entity.Department, bool, error) {
	var hasMore bool

	do := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.DeletedAt.IsNull())

	// Apply filters
	if filter.CorpID != nil {
		do = do.Where(dao.query.CorporationDepartment.CorpID.Eq(*filter.CorpID))
	}
	if filter.ParentDeptID != nil {
		do = do.Where(dao.query.CorporationDepartment.ParentID.Eq(*filter.ParentDeptID))
	}
	if filter.DeptSource != nil {
		do = do.Where(dao.query.CorporationDepartment.DepartmentSource.Eq(int32(*filter.DeptSource)))
	}
	if filter.CreatorID != nil {
		do = do.Where(dao.query.CorporationDepartment.CreatorID.Eq(*filter.CreatorID))
	}
	if filter.Keyword != nil && *filter.Keyword != "" {
		do = do.Where(dao.query.CorporationDepartment.Name.Like("%" + *filter.Keyword + "%"))
	}

	// Pagination
	do = do.Offset((filter.Page - 1) * filter.Limit)
	if filter.Limit > 0 {
		do = do.Limit(filter.Limit + 1)
	}

	// Order by sort and creation time
	do = do.Order(dao.query.CorporationDepartment.Sort.Asc()).
		Order(dao.query.CorporationDepartment.CreatedAt.Desc())

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
		return dao.departmentBatchPO2DO(ctx, poList[:len(poList)-1]), hasMore, nil
	}
	return dao.departmentBatchPO2DO(ctx, poList), hasMore, nil
}

// GetByCorpID gets departments by corporation ID
func (dao *DepartmentDAO) GetByCorpID(ctx context.Context, corpID int64) ([]*entity.Department, error) {
	poList, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.CorpID.Eq(corpID)).
		Where(dao.query.CorporationDepartment.DeletedAt.IsNull()).
		Order(dao.query.CorporationDepartment.Sort.Asc()).
		Order(dao.query.CorporationDepartment.CreatedAt.Asc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.departmentBatchPO2DO(ctx, poList), nil
}

// GetByParentDeptID gets departments by parent department ID
func (dao *DepartmentDAO) GetByParentDeptID(ctx context.Context, parentDeptID int64) ([]*entity.Department, error) {
	poList, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.ParentID.Eq(parentDeptID)).
		Where(dao.query.CorporationDepartment.DeletedAt.IsNull()).
		Order(dao.query.CorporationDepartment.Sort.Asc()).
		Order(dao.query.CorporationDepartment.CreatedAt.Asc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.departmentBatchPO2DO(ctx, poList), nil
}

// GetDepartmentTree gets department tree (simplified implementation)
func (dao *DepartmentDAO) GetDepartmentTree(ctx context.Context, corpID int64, rootDeptID *int64) ([]*entity.Department, error) {
	do := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.CorpID.Eq(corpID)).
		Where(dao.query.CorporationDepartment.DeletedAt.IsNull())

	if rootDeptID != nil {
		do = do.Where(dao.query.CorporationDepartment.ParentID.Eq(*rootDeptID))
	} else {
		do = do.Where(dao.query.CorporationDepartment.ParentID.IsNull())
	}

	poList, err := do.Order(dao.query.CorporationDepartment.Sort.Asc()).Find()
	if err != nil {
		return nil, err
	}
	return dao.departmentBatchPO2DO(ctx, poList), nil
}

// UpdateSort updates department sort order
func (dao *DepartmentDAO) UpdateSort(ctx context.Context, id int64, sort int32) error {
	updateData := map[string]interface{}{
		dao.query.CorporationDepartment.Sort.ColumnName().String():     sort,
		dao.query.CorporationDepartment.UpdatedAt.ColumnName().String(): time.Now().UnixMilli(),
	}

	_, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.ID.Eq(id)).
		UpdateColumns(updateData)
	return err
}

// MoveDepartment moves department to new parent
func (dao *DepartmentDAO) MoveDepartment(ctx context.Context, deptID, newParentID int64) error {
	updateData := map[string]interface{}{
		dao.query.CorporationDepartment.ParentID.ColumnName().String(): newParentID,
		dao.query.CorporationDepartment.UpdatedAt.ColumnName().String():   time.Now().UnixMilli(),
	}

	_, err := dao.query.CorporationDepartment.WithContext(ctx).
		Where(dao.query.CorporationDepartment.ID.Eq(deptID)).
		UpdateColumns(updateData)
	return err
}

// Data conversion methods

func (dao *DepartmentDAO) departmentDO2PO(ctx context.Context, dept *entity.Department) *model.CorporationDepartment {
	po := &model.CorporationDepartment{
		ID:         dept.ID,
		CorpID:     dept.CorpID,
		Name:       dept.Name,
		Sort:       dept.Sort,
		DepartmentSource: int32(dept.DeptSource),
		CreatorID:  dept.CreatorID,
		CreatedAt:  time.Now().UnixMilli(),
		UpdatedAt:  time.Now().UnixMilli(),
	}
	
	if dept.ParentDeptID != nil {
		po.ParentID = *dept.ParentDeptID
	}
	if dept.OutDeptID != nil {
		po.OutDepartmentID = *dept.OutDeptID
	}
	if dept.DeletedAt != nil {
		po.DeletedAt = *dept.DeletedAt
	}
	
	return po
}

func (dao *DepartmentDAO) departmentPO2DO(ctx context.Context, po *model.CorporationDepartment) *entity.Department {
	dept := &entity.Department{
		ID:         po.ID,
		CorpID:     po.CorpID,
		Name:       po.Name,
		Sort:       po.Sort,
		DeptSource: entity.DepartmentSource(po.DepartmentSource),
		CreatorID:  po.CreatorID,
		CreatedAt:  po.CreatedAt,
		UpdatedAt:  po.UpdatedAt,
	}
	
	if po.ParentID != 0 {
		dept.ParentDeptID = &po.ParentID
	}
	if po.OutDepartmentID != "" {
		dept.OutDeptID = &po.OutDepartmentID
	}
	if po.DeletedAt != 0 {
		dept.DeletedAt = &po.DeletedAt
	}
	
	return dept
}

func (dao *DepartmentDAO) departmentBatchPO2DO(ctx context.Context, poList []*model.CorporationDepartment) []*entity.Department {
	return slices.Transform(poList, func(po *model.CorporationDepartment) *entity.Department {
		return dao.departmentPO2DO(ctx, po)
	})
}