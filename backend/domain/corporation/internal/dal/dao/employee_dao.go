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

type EmployeeDAO struct {
	idgen idgen.IDGenerator
	db    *gorm.DB
	query *query.Query
}

func NewEmployeeDAO(db *gorm.DB, generator idgen.IDGenerator) *EmployeeDAO {
	return &EmployeeDAO{
		idgen: generator,
		db:    db,
		query: query.Use(db),
	}
}

// Create creates a new employee
func (dao *EmployeeDAO) Create(ctx context.Context, emp *entity.Employee) (*entity.Employee, error) {
	poData := dao.employeeDO2PO(ctx, emp)

	id, err := dao.idgen.GenID(ctx)
	if err != nil {
		return nil, err
	}
	poData.ID = id

	err = dao.query.CorporationEmployee.WithContext(ctx).Create(poData)
	if err != nil {
		return nil, err
	}
	return dao.employeePO2DO(ctx, poData), nil
}

// GetByID retrieves employee by ID
func (dao *EmployeeDAO) GetByID(ctx context.Context, id int64) (*entity.Employee, error) {
	poData, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.ID.Eq(id)).
		Where(dao.query.CorporationEmployee.DeletedAt.IsNull()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return dao.employeePO2DO(ctx, poData), nil
}

// Update updates employee
func (dao *EmployeeDAO) Update(ctx context.Context, emp *entity.Employee) error {
	updateData := make(map[string]interface{})
	table := dao.query.CorporationEmployee

	updateData[table.Name.ColumnName().String()] = emp.Name
	if emp.Email != nil {
		updateData[table.Email.ColumnName().String()] = *emp.Email
	}
	if emp.Phone != nil {
		updateData[table.Mobile.ColumnName().String()] = *emp.Phone
	}
	if emp.EmployeeID != nil {
		updateData[table.EmployeeNo.ColumnName().String()] = *emp.EmployeeID
	}
	// Position field not available in generated model
	// if emp.Position != nil {
	//	updateData[table.Position.ColumnName().String()] = *emp.Position
	// }
	updateData[table.Status.ColumnName().String()] = int32(emp.Status)
	if emp.OutEmpID != nil {
		updateData[table.OutEmployeeID.ColumnName().String()] = *emp.OutEmpID
	}
	updateData[table.EmployeeSource.ColumnName().String()] = int32(emp.EmpSource)
	updateData[table.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()

	_, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.ID.Eq(emp.ID)).
		UpdateColumns(updateData)
	return err
}

// Delete soft deletes employee
func (dao *EmployeeDAO) Delete(ctx context.Context, id int64) error {
	updateData := map[string]interface{}{
		dao.query.CorporationEmployee.DeletedAt.ColumnName().String(): time.Now().UnixMilli(),
		dao.query.CorporationEmployee.UpdatedAt.ColumnName().String(): time.Now().UnixMilli(),
	}

	_, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.ID.Eq(id)).
		UpdateColumns(updateData)
	return err
}

// List lists employees with filter
func (dao *EmployeeDAO) List(ctx context.Context, filter *entity.EmployeeListFilter) ([]*entity.Employee, bool, error) {
	var hasMore bool

	do := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.DeletedAt.IsNull())

	// Apply filters
	if filter.CorpID != nil {
		do = do.Where(dao.query.CorporationEmployee.CorpID.Eq(*filter.CorpID))
	}
	if filter.Status != nil {
		do = do.Where(dao.query.CorporationEmployee.Status.Eq(int32(*filter.Status)))
	}
	if filter.EmpSource != nil {
		do = do.Where(dao.query.CorporationEmployee.EmployeeSource.Eq(int32(*filter.EmpSource)))
	}
	if filter.CreatorID != nil {
		do = do.Where(dao.query.CorporationEmployee.CreatorID.Eq(*filter.CreatorID))
	}
	if filter.Keyword != nil && *filter.Keyword != "" {
		keyword := "%" + *filter.Keyword + "%"
		do = do.Where(
			dao.query.CorporationEmployee.Name.Like(keyword),
		).Or(
			dao.query.CorporationEmployee.Email.Like(keyword),
		)
	}

	// Special handling for department filter - requires join
	if filter.DeptID != nil {
		// Join with employee-department relationship table
		empDeptTable := dao.query.CorporationEmployeeDepartment
		do = do.LeftJoin(empDeptTable, 
			dao.query.CorporationEmployee.ID.EqCol(empDeptTable.EmployeeID)).
			Where(empDeptTable.DepartmentID.Eq(*filter.DeptID)).
			Where(empDeptTable.Status.Eq(1)). // Only active relationships
			Where(empDeptTable.DeletedAt.IsNull())
	}

	// Pagination
	do = do.Offset((filter.Page - 1) * filter.Limit)
	if filter.Limit > 0 {
		do = do.Limit(filter.Limit + 1)
	}

	// Order by creation time
	do = do.Order(dao.query.CorporationEmployee.CreatedAt.Desc())

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
		return dao.employeeBatchPO2DO(ctx, poList[:len(poList)-1]), hasMore, nil
	}
	return dao.employeeBatchPO2DO(ctx, poList), hasMore, nil
}

// GetByCorpID gets employees by corporation ID
func (dao *EmployeeDAO) GetByCorpID(ctx context.Context, corpID int64) ([]*entity.Employee, error) {
	poList, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.CorpID.Eq(corpID)).
		Where(dao.query.CorporationEmployee.DeletedAt.IsNull()).
		Order(dao.query.CorporationEmployee.CreatedAt.Desc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.employeeBatchPO2DO(ctx, poList), nil
}

// GetByDeptID gets employees by department ID
func (dao *EmployeeDAO) GetByDeptID(ctx context.Context, deptID int64) ([]*entity.Employee, error) {
	// Join employee table with employee-department relationship table
	empTable := dao.query.CorporationEmployee
	empDeptTable := dao.query.CorporationEmployeeDepartment

	poList, err := empTable.WithContext(ctx).
		LeftJoin(empDeptTable, empTable.ID.EqCol(empDeptTable.EmployeeID)).
		Where(empTable.DeletedAt.IsNull()).
		Where(empDeptTable.DepartmentID.Eq(deptID)).
		Where(empDeptTable.Status.Eq(1)). // Only active relationships
		Where(empDeptTable.DeletedAt.IsNull()).
		Order(empTable.CreatedAt.Desc()).
		Find()

	if err != nil {
		return nil, err
	}
	return dao.employeeBatchPO2DO(ctx, poList), nil
}

// GetByEmail gets employee by email
func (dao *EmployeeDAO) GetByEmail(ctx context.Context, email string) (*entity.Employee, error) {
	poData, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.Email.Eq(email)).
		Where(dao.query.CorporationEmployee.DeletedAt.IsNull()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return dao.employeePO2DO(ctx, poData), nil
}

// GetByEmployeeID gets employee by employee ID
func (dao *EmployeeDAO) GetByEmployeeID(ctx context.Context, employeeID string) (*entity.Employee, error) {
	poData, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.EmployeeNo.Eq(employeeID)).
		Where(dao.query.CorporationEmployee.DeletedAt.IsNull()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return dao.employeePO2DO(ctx, poData), nil
}

// UpdateStatus updates employee status
func (dao *EmployeeDAO) UpdateStatus(ctx context.Context, id int64, status int32) error {
	updateData := map[string]interface{}{
		dao.query.CorporationEmployee.Status.ColumnName().String():    status,
		dao.query.CorporationEmployee.UpdatedAt.ColumnName().String(): time.Now().UnixMilli(),
	}

	_, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.ID.Eq(id)).
		UpdateColumns(updateData)
	return err
}

// BatchUpdateDepartments updates employee department relationships (simplified implementation)
func (dao *EmployeeDAO) BatchUpdateDepartments(ctx context.Context, empID int64, deptIDs []int64, isLeader []bool) error {
	// This would typically be implemented in a dedicated EmployeeDepartmentDAO
	// For now, return a placeholder implementation
	return errors.New("not implemented - should be handled by EmployeeDepartmentDAO")
}

// GetEmployeesWithDepartmentInfo gets employees with their department information
func (dao *EmployeeDAO) GetEmployeesWithDepartmentInfo(ctx context.Context, corpID int64) ([]*entity.Employee, error) {
	// Complex query joining employee, employee-department, and department tables
	empTable := dao.query.CorporationEmployee
	empDeptTable := dao.query.CorporationEmployeeDepartment
	deptTable := dao.query.CorporationDepartment

	var results []*model.CorporationEmployee
	err := dao.db.WithContext(ctx).
		Table(empTable.TableName()).
		Select(empTable.ALL).
		Joins("LEFT JOIN "+empDeptTable.TableName()+" ON "+
			empTable.TableName()+".id = "+empDeptTable.TableName()+".employee_id").
		Joins("LEFT JOIN "+deptTable.TableName()+" ON "+
			empDeptTable.TableName()+".department_id = "+deptTable.TableName()+".id").
		Where(empTable.TableName()+".corp_id = ? AND "+empTable.TableName()+".deleted_at IS NULL", corpID).
		Where(empDeptTable.TableName()+".status = ? AND "+empDeptTable.TableName()+".deleted_at IS NULL", 1).
		Where(deptTable.TableName()+".deleted_at IS NULL").
		Order(empTable.TableName() + ".created_at DESC").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	return dao.employeeBatchPO2DO(ctx, results), nil
}

// Data conversion methods

func (dao *EmployeeDAO) employeeDO2PO(ctx context.Context, emp *entity.Employee) *model.CorporationEmployee {
	po := &model.CorporationEmployee{
		ID:        emp.ID,
		CorpID:    emp.CorpID,
		Name:      emp.Name,
		Status:    int32(emp.Status),
		EmployeeSource: int32(emp.EmpSource),
		CreatorID: emp.CreatorID,
		CreatedAt: time.Now().UnixMilli(),
		UpdatedAt: time.Now().UnixMilli(),
	}
	
	if emp.Email != nil {
		po.Email = *emp.Email
	}
	if emp.Phone != nil {
		po.Mobile = *emp.Phone
	}
	if emp.EmployeeID != nil {
		po.EmployeeNo = *emp.EmployeeID
	}
	// Position field not available in generated model
	// if emp.Position != nil {
	//	po.Position = *emp.Position
	// }
	if emp.OutEmpID != nil {
		po.OutEmployeeID = *emp.OutEmpID
	}
	if emp.DeletedAt != nil {
		po.DeletedAt = *emp.DeletedAt
	}
	
	return po
}

func (dao *EmployeeDAO) employeePO2DO(ctx context.Context, po *model.CorporationEmployee) *entity.Employee {
	emp := &entity.Employee{
		ID:        po.ID,
		CorpID:    po.CorpID,
		Name:      po.Name,
		Status:    entity.EmployeeStatus(po.Status),
		EmpSource: entity.EmployeeSource(po.EmployeeSource),
		CreatorID: po.CreatorID,
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
	}
	
	if po.Email != "" {
		emp.Email = &po.Email
	}
	if po.Mobile != "" {
		emp.Phone = &po.Mobile
	}
	if po.EmployeeNo != "" {
		emp.EmployeeID = &po.EmployeeNo
	}
	// Position field not available in generated model
	// if po.Position != "" {
	//	emp.Position = &po.Position
	// }
	if po.OutEmployeeID != "" {
		emp.OutEmpID = &po.OutEmployeeID
	}
	if po.DeletedAt != 0 {
		emp.DeletedAt = &po.DeletedAt
	}
	
	return emp
}

func (dao *EmployeeDAO) employeeBatchPO2DO(ctx context.Context, poList []*model.CorporationEmployee) []*entity.Employee {
	return slices.Transform(poList, func(po *model.CorporationEmployee) *entity.Employee {
		return dao.employeePO2DO(ctx, po)
	})
}