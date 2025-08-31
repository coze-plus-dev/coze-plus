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

import { useState, useCallback, useEffect } from 'react';

import { useRequest } from 'ahooks';
import { type employee } from '@coze-studio/api-schema';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { employeeApi } from '@/api/corporation-api';

interface EmployeeInfo {
  id?: string;
  departments?: employee.employee.EmployeeDepartmentInfo[];
}

interface UseDepartmentChangeProps {
  employee?: EmployeeInfo;
  isRestore?: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
  visible?: boolean;
}

// 确保主部门逻辑：确保只有一个主部门，如果没有主部门则将第一个设为主部门
const ensurePrimaryDepartment = (
  depts: employee.employee.EmployeeDepartmentInfo[],
): employee.employee.EmployeeDepartmentInfo[] => {
  if (depts.length === 0) {
    return depts;
  }

  let primaryCount = 0;
  let primaryIndex = -1;

  // 统计主部门数量
  depts.forEach((dept, index) => {
    if (dept.is_primary) {
      primaryCount++;
      primaryIndex = index;
    }
  });

  // 如果没有主部门，将第一个设为主部门
  if (primaryCount === 0) {
    return depts.map((dept, index) => ({
      ...dept,
      is_primary: index === 0,
    }));
  }

  // 如果有多个主部门，只保留第一个
  if (primaryCount > 1) {
    return depts.map((dept, index) => ({
      ...dept,
      is_primary: index === primaryIndex,
    }));
  }

  return depts;
};

export const useDepartmentChange = ({
  employee,
  isRestore = false,
  onSuccess,
  onClose,
  visible,
}: UseDepartmentChangeProps) => {
  const [departments, setDepartments] = useState<
    employee.employee.EmployeeDepartmentInfo[]
  >([]);

  // 变更部门或恢复在职请求
  const { loading: changeLoading, run: changeDepartment } = useRequest(
    async (depts: employee.employee.EmployeeDepartmentInfo[]) => {
      if (!employee?.id) {
        return;
      }

      if (isRestore) {
        // 恢复在职API
        const result = await employeeApi.restoreEmployee({
          id: employee.id,
          departments: depts,
        });
        return result;
      } else {
        // 变更部门API
        const result = await employeeApi.changeEmployeeDepartment({
          id: employee.id,
          departments: depts,
        });
        return result;
      }
    },
    {
      manual: true,
      onSuccess: () => {
        const successMessage = isRestore
          ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_SUCCESS_MESSAGE)
          : t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_SUCCESS,
            );
        Toast.success(successMessage);
        onSuccess?.();
        onClose?.();
      },
      onError: (error: Error) => {
        const errorMessage = isRestore
          ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_FAILED_MESSAGE)
          : t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_FAILED,
            );
        Toast.error(error.message || errorMessage);
      },
    },
  );

  // 当弹窗打开时，初始化部门数据
  useEffect(() => {
    if (visible) {
      if (isRestore) {
        // 恢复在职模式：初始部门数据为空，让用户重新选择
        setDepartments([]);
      } else if (employee?.departments) {
        // 变更部门模式：使用现有部门数据
        const initialDepartments: employee.employee.EmployeeDepartmentInfo[] =
          employee.departments.map(
            (dept: employee.employee.EmployeeDepartmentInfo) => ({
              department_id: dept.department_id,
              department_name: dept.department_name,
              corp_id: dept.corp_id,
              corp_name: dept.corp_name,
              job_title: dept.job_title,
              is_primary: dept.is_primary,
              department_path: dept.department_path,
            }),
          );

        // 确保主部门逻辑正确
        const correctedDepartments =
          ensurePrimaryDepartment(initialDepartments);
        setDepartments(correctedDepartments);
      } else {
        setDepartments([]);
      }
    }
  }, [visible, employee, isRestore]);

  const handleDepartmentChange = useCallback(
    (selectedDepartments: employee.employee.EmployeeDepartmentInfo[]) => {
      const correctedDepartments = ensurePrimaryDepartment(selectedDepartments);
      setDepartments(correctedDepartments);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (departments.length === 0) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT));
      return;
    }

    // 确保主部门逻辑：确保只有一个主部门，如果没有主部门则将第一个设为主部门
    const hasMainDept = departments.some(dept => dept.is_primary);
    const finalDepartments = [...departments];

    if (!hasMainDept && finalDepartments.length > 0) {
      // 如果没有主部门，将第一个设为主部门
      finalDepartments[0] = { ...finalDepartments[0], is_primary: true };
    }

    changeDepartment(finalDepartments);
  }, [departments, changeDepartment]);

  return {
    departments,
    changeLoading,
    handleDepartmentChange,
    handleConfirm,
  };
};
