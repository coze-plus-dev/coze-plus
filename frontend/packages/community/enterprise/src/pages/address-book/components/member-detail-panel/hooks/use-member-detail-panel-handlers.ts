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

import { useCallback, useEffect } from 'react';

import {
  type EditFormValues,
  type EmployeeData,
  type useMemberDetailPanelState,
  validateEditForm,
} from './use-member-detail-panel-state';

interface MemberDetailPanelHandlersProps {
  state: ReturnType<typeof useMemberDetailPanelState>;
  employee: EmployeeData | null | undefined;
  updateEmployee: (values: EditFormValues) => void;
  resignEmployee: () => void;
  refresh: () => void;
  onRefresh?: () => void;
}

// 事件处理函数集合
export const useMemberDetailPanelHandlers = (
  props: MemberDetailPanelHandlersProps,
) => {
  const {
    state,
    employee,
    updateEmployee,
    resignEmployee,
    refresh,
    onRefresh,
  } = props;
  const {
    setIsEditing,
    setEditFormValues,
    setChangeDepartmentModalVisible,
    setResignConfirmModalVisible,
    setRestoreModalVisible,
    setDropdownVisible,
    editFormValues,
  } = state;

  const handleDropdownVisibleChange = useCallback(
    (isVisible: boolean) => {
      setDropdownVisible(isVisible);
    },
    [setDropdownVisible],
  );

  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, [setIsEditing]);

  const handleSave = useCallback(() => {
    if (!validateEditForm(editFormValues)) {
      return;
    }
    updateEmployee(editFormValues);
    setIsEditing(false);
  }, [editFormValues, updateEmployee, setIsEditing]);

  const handleCancelEdit = useCallback(() => {
    if (employee) {
      setEditFormValues({
        name: employee.name || '',
        mobile: employee.mobile || '',
        email: employee.email || '',
        departments: employee.departments || [],
      });
    }
    setIsEditing(false);
  }, [employee, setEditFormValues, setIsEditing]);

  const handleAction = useCallback(
    (action: string) => {
      setDropdownVisible(false);
      switch (action) {
        case 'changeDepartment':
          setChangeDepartmentModalVisible(true);
          break;
        case 'resignation':
          setResignConfirmModalVisible(true);
          break;
        case 'restore':
          setRestoreModalVisible(true);
          break;
        default:
          break;
      }
    },
    [
      setDropdownVisible,
      setChangeDepartmentModalVisible,
      setResignConfirmModalVisible,
      setRestoreModalVisible,
    ],
  );

  const handleConfirmResign = useCallback(() => {
    resignEmployee();
    setResignConfirmModalVisible(false);
  }, [resignEmployee, setResignConfirmModalVisible]);

  const handleModalSuccess = useCallback(() => {
    refresh();
    onRefresh?.();
  }, [refresh, onRefresh]);

  return {
    handleDropdownVisibleChange,
    handleEdit,
    handleSave,
    handleCancelEdit,
    handleAction,
    handleConfirmResign,
    handleModalSuccess,
  };
};

interface MemberDetailPanelEffectsProps {
  state: ReturnType<typeof useMemberDetailPanelState>;
  visible: boolean;
  employee: EmployeeData | null | undefined;
  employeeId?: string;
  refresh?: () => void;
}

// 效果管理hook
export const useMemberDetailPanelEffects = (
  props: MemberDetailPanelEffectsProps,
) => {
  const { state, visible, employee, employeeId, refresh } = props;
  const {
    setIsEditing,
    setEditFormValues,
    setDropdownVisible,
    setChangeDepartmentModalVisible,
    setResignConfirmModalVisible,
    setRestoreModalVisible,
  } = state;

  useEffect(() => {
    if (employee) {
      setEditFormValues({
        name: employee.name || '',
        mobile: employee.mobile || '',
        email: employee.email || '',
        departments: employee.departments || [],
      });
    }
  }, [employee, setEditFormValues]);

  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
      setDropdownVisible(false);
      setChangeDepartmentModalVisible(false);
      setResignConfirmModalVisible(false);
      setRestoreModalVisible(false);
    }
  }, [
    visible,
    setIsEditing,
    setDropdownVisible,
    setChangeDepartmentModalVisible,
    setResignConfirmModalVisible,
    setRestoreModalVisible,
  ]);

  useEffect(() => {
    if (visible && employeeId) {
      refresh?.();
    }
  }, [visible, employeeId, refresh]);
};
