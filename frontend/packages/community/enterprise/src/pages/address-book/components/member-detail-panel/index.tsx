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

import { type FC, useCallback } from 'react';

import { Spin, Modal } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import {
  useMemberDetailPanelState,
  useEmployeeData,
  useEmployeeOperations,
  type EmployeeData,
} from './hooks/use-member-detail-panel-state';
import {
  useMemberDetailPanelHandlers,
  useMemberDetailPanelEffects,
} from './hooks/use-member-detail-panel-handlers';
import { MemberPanelContent } from './components/member-panel-content';
import { ChangeDepartmentModal } from '../change-department-modal';

import styles from './index.module.less';

interface MemberDetailPanelProps {
  visible: boolean;
  employeeId?: string;
  onClose: () => void;
  onEdit?: (employee: EmployeeData) => void;
  onRefresh?: () => void;
}

// 部门渲染逻辑
const useDepartmentsRenderer = (employee: EmployeeData | null | undefined) =>
  useCallback(() => {
    if (!employee?.departments?.length) {
      return (
        <span className={styles.emptyValue}>
          {t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_UNASSIGNED,
          )}
        </span>
      );
    }

    const primary = employee.departments.find(d => d.is_primary);
    const others = employee.departments.filter(d => !d.is_primary);

    return (
      <div className={styles.departmentList}>
        {primary ? (
          <div className={styles.departmentItem}>
            <span>{primary.department_name}</span>
            {primary.department_path ? (
              <span className={styles.departmentPath}>
                ({primary.department_path})
              </span>
            ) : null}
          </div>
        ) : null}
        {others.map((dept, index) => (
          <div key={index} className={styles.departmentItem}>
            <span>{dept.department_name}</span>
            {dept.department_path ? (
              <span className={styles.departmentPath}>
                ({dept.department_path})
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  }, [employee]);

const ResignModal: FC<{
  isVisible: boolean;
  employee: EmployeeData | null | undefined;
  resignLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}> = ({ isVisible, employee, resignLoading, onClose, onConfirm }) => (
  <Modal
    visible={isVisible}
    title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_TITLE)}
    onCancel={onClose}
    onOk={onConfirm}
    okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_OK_TEXT)}
    cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
    okButtonProps={{ loading: resignLoading, type: 'danger' }}
    width={400}
  >
    <p>
      {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_CONTENT, {
        name: employee?.name,
      })}
    </p>
    <p style={{ color: 'var(--semi-color-text-2)', fontSize: '14px' }}>
      {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_DESCRIPTION)}
    </p>
  </Modal>
);

export const MemberDetailPanel: FC<MemberDetailPanelProps> = ({
  visible,
  employeeId,
  onClose,
  onRefresh,
}) => {
  // 状态管理
  const state = useMemberDetailPanelState();

  // 数据获取
  const {
    data: employee,
    loading,
    refresh,
  } = useEmployeeData(visible, employeeId);

  // 操作
  const { resignLoading, resignEmployee, updateLoading, updateEmployee } =
    useEmployeeOperations({ employee, employeeId, onRefresh, refresh });

  // 部门渲染
  const renderDepartments = useDepartmentsRenderer(employee);

  // 事件处理
  const handlers = useMemberDetailPanelHandlers({
    state,
    employee,
    updateEmployee,
    resignEmployee,
    refresh,
    onRefresh,
  });

  // 效果
  useMemberDetailPanelEffects({
    state,
    visible,
    employee,
    employeeId,
    refresh,
  });

  // 早期返回
  if (!visible || !employeeId) {
    return null;
  }

  if (loading) {
    return (
      <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <>
      <MemberPanelContent
        visible={visible}
        employee={employee as never}
        isEditing={state.isEditing}
        editFormValues={state.editFormValues}
        dropdownVisible={state.dropdownVisible}
        onClose={onClose}
        onEdit={handlers.handleEdit}
        onSave={handlers.handleSave}
        onCancel={handlers.handleCancelEdit}
        onChangeDepartment={() => handlers.handleAction('changeDepartment')}
        onResign={() => handlers.handleAction('resignation')}
        onRestore={() => handlers.handleAction('restore')}
        setEditFormValues={state.setEditFormValues}
        setDropdownVisible={handlers.handleDropdownVisibleChange}
        updateLoading={updateLoading}
        renderDepartments={renderDepartments}
      />

      <ChangeDepartmentModal
        visible={state.changeDepartmentModalVisible}
        employee={
          employee
            ? ({
                id: employee.id,
                name: employee.name,
                departments: employee.departments || [],
              } as const)
            : {
                id: '',
                name: '',
                departments: [],
              }
        }
        onClose={() => state.setChangeDepartmentModalVisible(false)}
        onSuccess={() => {
          handlers.handleModalSuccess();
          state.setChangeDepartmentModalVisible(false);
        }}
      />

      <ResignModal
        isVisible={state.resignConfirmModalVisible}
        employee={employee}
        resignLoading={resignLoading}
        onClose={() => state.setResignConfirmModalVisible(false)}
        onConfirm={handlers.handleConfirmResign}
      />

      <ChangeDepartmentModal
        visible={state.restoreModalVisible}
        employee={
          employee
            ? ({
                id: employee.id,
                name: employee.name,
                departments: employee.departments || [],
              } as const)
            : {
                id: '',
                name: '',
                departments: [],
              }
        }
        onClose={() => state.setRestoreModalVisible(false)}
        onSuccess={() => {
          handlers.handleModalSuccess();
          state.setRestoreModalVisible(false);
        }}
        isRestore={true}
      />
    </>
  );
};
