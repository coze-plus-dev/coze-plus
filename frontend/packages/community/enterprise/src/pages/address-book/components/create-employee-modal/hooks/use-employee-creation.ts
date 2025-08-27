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

import { useState, useEffect, useCallback } from 'react';

import { useRequest } from 'ahooks';
import { type employee } from '@coze-studio/api-schema';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { employeeApi } from '@/api/corporation-api';

interface FormValues {
  name: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
  mobile: string;
  email: string;
}

const initialFormValues: FormValues = {
  name: '',
  departments: [],
  mobile: '',
  email: '',
};

interface UseEmployeeCreationProps {
  visible: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const useEmployeeCreation = ({
  visible,
  onSuccess,
  onClose,
}: UseEmployeeCreationProps) => {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

  // 当弹窗打开时重置表单
  useEffect(() => {
    if (visible) {
      setFormValues(initialFormValues);
    }
  }, [visible]);

  // 创建员工请求
  const { loading, run: createEmployee } = useRequest(
    async (values: FormValues) => {
      const result = await employeeApi.createEmployee({
        name: values.name,
        department_ids: values.departments,
        mobile: values.mobile,
        email: values.email || undefined,
      });
      return result;
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_SUCCESS));
        onClose?.();
        onSuccess?.();
      },
      onError: (error: Error) => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_FAILED),
        );
      },
    },
  );

  const handleFormChange = useCallback(
    (field: keyof FormValues, value: unknown) => {
      setFormValues(prev => ({
        ...prev,
        [field]: value,
      }));
    },
    [],
  );

  const handleSubmit = useCallback(() => {
    // 表单验证
    if (!formValues.name || !formValues.name.trim()) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME),
      );
      return;
    }

    if (formValues.name.length > 50) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMPLOYEE_NAME_TOO_LONG));
      return;
    }

    if (!formValues.departments || formValues.departments.length === 0) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT));
      return;
    }

    if (!formValues.mobile || !formValues.mobile.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE));
      return;
    }

    // 简单的手机号验证
    const mobileRegex = /^1[3-9]\d{9}$/;
    if (!mobileRegex.test(formValues.mobile)) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE_FORMAT_ERROR));
      return;
    }

    // 邮箱验证（可选）
    if (formValues.email && formValues.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL_FORMAT_ERROR));
        return;
      }
    }

    createEmployee(formValues);
  }, [formValues, createEmployee]);

  return {
    formValues,
    loading,
    handleFormChange,
    handleSubmit,
  };
};
