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

import { useState } from 'react';

import { useRequest } from 'ahooks';
import { type employee } from '@coze-studio/api-schema';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { employeeApi } from '@/api/corporation-api';

// 使用API的EmployeeData类型
type EmployeeData = employee.employee.EmployeeData;

// 常量定义
const MAX_NAME_LENGTH = 50;

interface EditFormValues {
  name: string;
  mobile: string;
  email: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
}

// 表单验证函数
export const validateEditForm = (editFormValues: EditFormValues) => {
  if (!editFormValues.name || !editFormValues.name.trim()) {
    Toast.error(
      t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_NAME_REQUIRED),
    );
    return false;
  }
  if (editFormValues.name.length > MAX_NAME_LENGTH) {
    Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_VALIDATION_NAME_TOO_LONG));
    return false;
  }
  if (!editFormValues.mobile || !editFormValues.mobile.trim()) {
    Toast.error(
      t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_REQUIRED),
    );
    return false;
  }
  const mobileRegex = /^1[3-9]\d{9}$/;
  if (!mobileRegex.test(editFormValues.mobile)) {
    Toast.error(
      t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_INVALID),
    );
    return false;
  }
  if (editFormValues.email && editFormValues.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormValues.email)) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_EMAIL_INVALID),
      );
      return false;
    }
  }
  return true;
};

// 主要的MemberDetailPanel的状态管理hook
export const useMemberDetailPanelState = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editFormValues, setEditFormValues] = useState<EditFormValues>({
    name: '',
    mobile: '',
    email: '',
    departments: [],
  });
  const [changeDepartmentModalVisible, setChangeDepartmentModalVisible] =
    useState(false);
  const [resignConfirmModalVisible, setResignConfirmModalVisible] =
    useState(false);
  const [restoreModalVisible, setRestoreModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  return {
    isEditing,
    setIsEditing,
    editFormValues,
    setEditFormValues,
    changeDepartmentModalVisible,
    setChangeDepartmentModalVisible,
    resignConfirmModalVisible,
    setResignConfirmModalVisible,
    restoreModalVisible,
    setRestoreModalVisible,
    dropdownVisible,
    setDropdownVisible,
  };
};

// 数据获取hooks
export const useEmployeeData = (visible: boolean, employeeId?: string) =>
  useRequest(
    async () => {
      if (!employeeId) {
        return null;
      }
      return employeeApi.getEmployee(employeeId);
    },
    {
      ready: !!(visible && employeeId),
      refreshDeps: [employeeId],
    },
  );

interface EmployeeOperationsProps {
  employee: EmployeeData | null | undefined;
  employeeId?: string;
  onRefresh?: () => void;
  refresh?: () => void;
}

export const useEmployeeOperations = (props: EmployeeOperationsProps) => {
  const { employee, employeeId, onRefresh, refresh } = props;
  const { loading: resignLoading, run: resignEmployee } = useRequest(
    async (reason?: string) => {
      const empId = employee?.id ? String(employee.id) : employeeId;
      if (!empId) {
        console.error('employee id is undefined');
        return;
      }
      return employeeApi.resignEmployee({
        id: empId,
        reason,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_SUCCESS_MESSAGE),
        );
        refresh?.();
        onRefresh?.();
      },
      onError: error => {
        Toast.error(
          error.message ||
            t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_FAILED_MESSAGE),
        );
      },
    },
  );

  const { loading: updateLoading, run: updateEmployee } = useRequest(
    async (values: EditFormValues) => {
      if (!employeeId) {
        return;
      }

      const result = await employeeApi.updateEmployee({
        id: employeeId,
        name: values.name,
        mobile: values.mobile,
        email: values.email || undefined,
        departments: values.departments,
      });
      return result;
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(
          t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_SUCCESS,
          ),
        );
        refresh?.();
        onRefresh?.();
      },
      onError: error => {
        Toast.error(
          error.message ||
            t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_FAILED,
            ),
        );
      },
    },
  );

  return {
    resignLoading,
    resignEmployee,
    updateLoading,
    updateEmployee,
  };
};

export type { EditFormValues, EmployeeData };
