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
	// 使用GORM的软删除机制，只需要调用Delete方法
	// deleted_at字段会自动设置为当前时间
	_, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.ID.Eq(id)).
		Delete()
	return err
}

// List lists employees with filter
func (dao *EmployeeDAO) List(ctx context.Context, filter *entity.EmployeeListFilter) ([]*entity.Employee, bool, int64, error) {
	var hasMore bool
	var total int64

	// Build base query with filters
	do := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.DeletedAt.IsNull())

	// Apply filters
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
		).Or(
			dao.query.CorporationEmployee.Mobile.Like(keyword),
		)
	}

	// Handle corp_id and dept_id filters - require join
	if filter.CorpID != nil || filter.DeptID != nil {
		// Join with employee-department relationship table
		empDeptTable := dao.query.CorporationEmployeeDepartment
		do = do.LeftJoin(empDeptTable,
			dao.query.CorporationEmployee.ID.EqCol(empDeptTable.EmployeeID))

		// Apply department relationship filters
		do = do.Where(empDeptTable.DeletedAt.IsNull())

		if filter.CorpID != nil {
			do = do.Where(empDeptTable.CorpID.Eq(*filter.CorpID))
		}
		if filter.DeptID != nil {
			do = do.Where(empDeptTable.DepartmentID.Eq(*filter.DeptID))
		}
	}

	// Count total records before applying pagination
	countQuery := do
	if filter.CorpID != nil || filter.DeptID != nil {
		countQuery = countQuery.Distinct()
	}
	var err error
	total, err = countQuery.Count()
	if err != nil {
		return nil, hasMore, 0, err
	}

	// Pagination
	do = do.Offset((filter.Page - 1) * filter.Limit)
	if filter.Limit > 0 {
		do = do.Limit(filter.Limit + 1)
	}

	// Order by creation time
	do = do.Order(dao.query.CorporationEmployee.CreatedAt.Desc())

	// Add DISTINCT to avoid duplicates when joining
	if filter.CorpID != nil || filter.DeptID != nil {
		do = do.Distinct()
	}

	poList, err := do.Find()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, hasMore, total, nil
	}
	if err != nil {
		return nil, hasMore, total, err
	}

	if len(poList) == 0 {
		return nil, hasMore, total, nil
	}

	// Convert to DO and load department information
	var employees []*entity.Employee
	if len(poList) > filter.Limit {
		hasMore = true
		employees = dao.employeeBatchPO2DO(ctx, poList[:len(poList)-1])
	} else {
		employees = dao.employeeBatchPO2DO(ctx, poList)
	}

	// Load department information for each employee
	for _, emp := range employees {
		deptRelations, err := dao.GetEmployeeDepartments(ctx, emp.ID)
		if err == nil {
			emp.Departments = deptRelations
		}
	}

	return employees, hasMore, total, nil
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
		Where(empDeptTable.Status.Eq(int32(entity.EmployeeDepartmentStatusActive))). // Only active relationships
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

// GetByPhone gets employee by phone
func (dao *EmployeeDAO) GetByPhone(ctx context.Context, phone string) (*entity.Employee, error) {
	poData, err := dao.query.CorporationEmployee.WithContext(ctx).
		Where(dao.query.CorporationEmployee.Mobile.Eq(phone)).
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

// GetEmployeeDepartmentByID gets employee department relationship by ID
func (dao *EmployeeDAO) GetEmployeeDepartmentByID(ctx context.Context, id int64) (*entity.EmployeeDepartmentRelation, error) {
	poData, err := dao.query.CorporationEmployeeDepartment.WithContext(ctx).
		Where(dao.query.CorporationEmployeeDepartment.ID.Eq(id)).
		Where(dao.query.CorporationEmployeeDepartment.DeletedAt.IsNull()).
		First()

	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}

	if err != nil {
		return nil, err
	}
	return dao.employeeDepartmentPO2DO(ctx, poData), nil
}

// UpdateEmployeeDepartment updates employee department relationship
func (dao *EmployeeDAO) UpdateEmployeeDepartment(ctx context.Context, relation *entity.EmployeeDepartmentRelation) error {
	updateData := make(map[string]interface{})
	table := dao.query.CorporationEmployeeDepartment

	if relation.JobTitle != nil {
		updateData[table.JobTitle.ColumnName().String()] = *relation.JobTitle
	}
	updateData[table.Status.ColumnName().String()] = int32(relation.Status)
	updateData[table.IsPrimary.ColumnName().String()] = boolToInt32(relation.IsPrimary)
	updateData[table.UpdatedAt.ColumnName().String()] = time.Now().UnixMilli()

	_, err := dao.query.CorporationEmployeeDepartment.WithContext(ctx).
		Where(dao.query.CorporationEmployeeDepartment.ID.Eq(relation.ID)).
		UpdateColumns(updateData)
	return err
}

// DeleteEmployeeDepartment soft deletes employee department relationship
func (dao *EmployeeDAO) DeleteEmployeeDepartment(ctx context.Context, id int64) error {
	// 使用GORM的软删除机制，只需要调用Delete方法
	// deleted_at字段会自动设置为当前时间
	_, err := dao.query.CorporationEmployeeDepartment.WithContext(ctx).
		Where(dao.query.CorporationEmployeeDepartment.ID.Eq(id)).
		Delete()
	return err
}

// Data conversion methods

func (dao *EmployeeDAO) employeeDO2PO(ctx context.Context, emp *entity.Employee) *model.CorporationEmployee {
	po := &model.CorporationEmployee{
		ID:        emp.ID,
		Name:      emp.Name,
		Status:    int32(emp.Status),
		CreatorID: emp.CreatorID,
		CreatedAt: time.Now().UnixMilli(),
		UpdatedAt: time.Now().UnixMilli(),
	}

	if emp.Email != nil {
		po.Email = emp.Email
	}
	if emp.Phone != nil {
		po.Mobile = *emp.Phone
	}
	if emp.EmployeeID != nil && *emp.EmployeeID != "" {
		po.EmployeeNo = emp.EmployeeID
	}
	// Position field not available in generated model
	// if emp.Position != nil {
	//	po.Position = *emp.Position
	// }
	if emp.OutEmpID != nil {
		po.OutEmployeeID = emp.OutEmpID
	}
	if emp.EmpSource != 0 {
		source := int32(emp.EmpSource)
		po.EmployeeSource = &source
	}
	if emp.UserID != nil {
		po.UserID = emp.UserID
	}
	if emp.DeletedAt != nil {
		deletedAt := gorm.DeletedAt{
			Time:  time.UnixMilli(*emp.DeletedAt),
			Valid: true,
		}
		po.DeletedAt = deletedAt
	}

	return po
}

func (dao *EmployeeDAO) employeePO2DO(ctx context.Context, po *model.CorporationEmployee) *entity.Employee {
	emp := &entity.Employee{
		ID:        po.ID,
		Name:      po.Name,
		Status:    entity.EmployeeStatus(po.Status),
		CreatorID: po.CreatorID,
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
	}

	if po.Email != nil && *po.Email != "" {
		emp.Email = po.Email
	}
	if po.Mobile != "" {
		emp.Phone = &po.Mobile
	}
	if po.EmployeeNo != nil && *po.EmployeeNo != "" {
		emp.EmployeeID = po.EmployeeNo
	}
	// Position field not available in generated model
	// if po.Position != "" {
	//	emp.Position = &po.Position
	// }
	if po.OutEmployeeID != nil && *po.OutEmployeeID != "" {
		emp.OutEmpID = po.OutEmployeeID
	}
	if po.EmployeeSource != nil && *po.EmployeeSource != 0 {
		empSource := entity.EmployeeSource(*po.EmployeeSource)
		emp.EmpSource = empSource
	}
	if po.UserID != nil && *po.UserID != 0 {
		emp.UserID = po.UserID
	}
	if po.DeletedAt.Valid {
		deletedAt := po.DeletedAt.Time.UnixMilli()
		emp.DeletedAt = &deletedAt
	}

	return emp
}

func (dao *EmployeeDAO) employeeBatchPO2DO(ctx context.Context, poList []*model.CorporationEmployee) []*entity.Employee {
	return slices.Transform(poList, func(po *model.CorporationEmployee) *entity.Employee {
		return dao.employeePO2DO(ctx, po)
	})
}

// AssignEmployeeToDepartment assigns employee to department
func (dao *EmployeeDAO) AssignEmployeeToDepartment(ctx context.Context, relation *entity.EmployeeDepartmentRelation) error {

	// Check if any relationship exists (active or soft-deleted)
	var existingRelation struct {
		ID        int64
		DeletedAt gorm.DeletedAt
	}

	err := dao.db.WithContext(ctx).Table("corporation_employee_department").
		Select("id, deleted_at").
		Where("employee_id = ? AND department_id = ?", relation.EmpID, relation.DeptID).
		Order("created_at DESC"). // Get the most recent one
		Scan(&existingRelation).Error

	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return err
	}

	// If relationship exists
	if existingRelation.ID > 0 {
		updateData := map[string]interface{}{
			"status":     int32(entity.EmployeeDepartmentStatusActive),
			"is_primary": boolToInt32(relation.IsPrimary),
			"updated_at": time.Now().UnixMilli(),
		}

		if relation.JobTitle != nil {
			updateData["job_title"] = *relation.JobTitle
		}

		// If it's soft-deleted, restore it
		if existingRelation.DeletedAt.Valid {
			updateData["deleted_at"] = nil
		}

		err = dao.db.WithContext(ctx).Table("corporation_employee_department").
			Where("id = ?", existingRelation.ID).
			Updates(updateData).Error

		return err
	}

	// If it's set as primary, update other departments to non-primary
	if relation.IsPrimary {
		_, err := dao.query.CorporationEmployeeDepartment.WithContext(ctx).
			Where(dao.query.CorporationEmployeeDepartment.EmployeeID.Eq(relation.EmpID)).
			Where(dao.query.CorporationEmployeeDepartment.CorpID.Eq(relation.CorpID)).
			Where(dao.query.CorporationEmployeeDepartment.DeletedAt.IsNull()).
			UpdateColumn(dao.query.CorporationEmployeeDepartment.IsPrimary, boolToInt32(false))
		if err != nil {
			return err
		}
	}

	// Create new relationship
	id, err := dao.idgen.GenID(ctx)
	if err != nil {
		return err
	}

	po := &model.CorporationEmployeeDepartment{
		ID:           id,
		EmployeeID:   relation.EmpID,
		DepartmentID: relation.DeptID,
		CorpID:       relation.CorpID,
		Status:       int32(relation.Status),
		IsPrimary:    boolToInt32(relation.IsPrimary),
		CreatorID:    relation.CreatorID,
		CreatedAt:    time.Now().UnixMilli(),
		UpdatedAt:    time.Now().UnixMilli(),
	}

	if relation.JobTitle != nil {
		po.JobTitle = relation.JobTitle
	}

	return dao.query.CorporationEmployeeDepartment.WithContext(ctx).Create(po)
}

// GetEmployeeDepartments gets all department relationships for an employee
func (dao *EmployeeDAO) GetEmployeeDepartments(ctx context.Context, empID int64) ([]*entity.EmployeeDepartmentRelation, error) {
	poList, err := dao.query.CorporationEmployeeDepartment.WithContext(ctx).
		Where(dao.query.CorporationEmployeeDepartment.EmployeeID.Eq(empID)).
		Where(dao.query.CorporationEmployeeDepartment.DeletedAt.IsNull()).
		Order(dao.query.CorporationEmployeeDepartment.IsPrimary.Desc()). // Primary departments first
		Order(dao.query.CorporationEmployeeDepartment.CreatedAt.Desc()).
		Find()

	if err != nil {
		return nil, err
	}

	result := make([]*entity.EmployeeDepartmentRelation, 0, len(poList))
	for _, po := range poList {
		relation := dao.employeeDepartmentPO2DO(ctx, po)

		// Load department information
		dept, err := dao.query.CorporationDepartment.WithContext(ctx).
			Where(dao.query.CorporationDepartment.ID.Eq(po.DepartmentID)).
			Where(dao.query.CorporationDepartment.DeletedAt.IsNull()).
			First()

		if err == nil && dept != nil {
			fullPath := ""
			if dept.FullPath != nil && *dept.FullPath != "" {
				fullPath = *dept.FullPath
			}
			relation.Department = &entity.Department{
				ID:       dept.ID,
				Name:     dept.Name,
				CorpID:   dept.CorpID,
				FullPath: fullPath,
			}
		}

		// Load corporation information for the relation
		corp, err := dao.query.Corporation.WithContext(ctx).
			Where(dao.query.Corporation.ID.Eq(po.CorpID)).
			Where(dao.query.Corporation.DeletedAt.IsNull()).
			First()

		if err == nil && corp != nil {
			relation.Corporation = &entity.Corporation{
				ID:   corp.ID,
				Name: corp.Name,
			}
		}

		result = append(result, relation)
	}

	return result, nil
}

// employeeDepartmentPO2DO converts employee department PO to DO
func (dao *EmployeeDAO) employeeDepartmentPO2DO(ctx context.Context, po *model.CorporationEmployeeDepartment) *entity.EmployeeDepartmentRelation {
	if po == nil {
		return nil
	}

	relation := &entity.EmployeeDepartmentRelation{
		ID:        po.ID,
		CorpID:    po.CorpID,
		EmpID:     po.EmployeeID,
		DeptID:    po.DepartmentID,
		Status:    entity.EmployeeDepartmentStatus(po.Status),
		IsPrimary: int32ToBool(po.IsPrimary),
		CreatorID: po.CreatorID,
		CreatedAt: po.CreatedAt,
		UpdatedAt: po.UpdatedAt,
	}

	if po.JobTitle != nil && *po.JobTitle != "" {
		relation.JobTitle = po.JobTitle
	}
	if po.DeletedAt.Valid {
		deletedAt := po.DeletedAt.Time.UnixMilli()
		relation.DeletedAt = &deletedAt
	}

	return relation
}

// Helper functions
func boolToInt32(b bool) int32 {
	if b {
		return 1
	}
	return 0
}

func int32ToBool(i int32) bool {
	return i != 0
}
