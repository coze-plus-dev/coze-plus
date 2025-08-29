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
import { employee } from '@coze-studio/api-schema';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { employeeApi } from '@/api/corporation-api';

interface FormValues {
  name: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
  mobile: string;
  email: string;
  create_account: employee.employee.common.CreateAccountType;
  loginPassword: string;
}

const initialFormValues: FormValues = {
  name: '',
  departments: [],
  mobile: '',
  email: '',
  create_account: employee.employee.common.CreateAccountType.NO_CREATE,
  loginPassword: '',
};

interface UseEmployeeCreationProps {
  visible: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

// 生成随机密码函数
const usePasswordGeneration = () =>
  useCallback(() => {
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const allChars = upperCase + lowerCase + numbers;

    let password = '';

    // 确保至少包含一个大写字母、一个小写字母和一个数字
    password += upperCase[Math.floor(Math.random() * upperCase.length)];
    password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];

    // 填充剩余5位
    for (let i = 0; i < 5; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // 打乱字符顺序
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }, []);

// 表单验证函数
const useFormValidation = () =>
  useCallback((formValues: FormValues) => {
    // 员工姓名验证
    if (!formValues.name || !formValues.name.trim()) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME),
      );
      return false;
    }

    if (formValues.name.length > 50) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMPLOYEE_NAME_TOO_LONG));
      return false;
    }

    // 部门验证
    if (!formValues.departments || formValues.departments.length === 0) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT));
      return false;
    }

    // 手机号验证
    if (!formValues.mobile || !formValues.mobile.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE));
      return false;
    }

    const mobileRegex = /^1[3-9]\d{9}$/;
    if (!mobileRegex.test(formValues.mobile)) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE_FORMAT_ERROR));
      return false;
    }

    // 工作邮箱验证
    if (formValues.email && formValues.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_WORK_EMAIL_FORMAT_ERROR));
        return false;
      }
    }

    // 如果选择用工作邮箱创建登录账号，工作邮箱必填
    if (
      formValues.create_account ===
      employee.employee.common.CreateAccountType.CREATE_BY_EMAIL
    ) {
      if (!formValues.email || !formValues.email.trim()) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_WORK_EMAIL));
        return false;
      }

      // 登录密码必填且至少6位
      if (!formValues.loginPassword || !formValues.loginPassword.trim()) {
        Toast.error(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_LOGIN_PASSWORD),
        );
        return false;
      }

      if (formValues.loginPassword.length < 6) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PASSWORD_TOO_SHORT));
        return false;
      }
    }

    return true;
  }, []);

// 密码复制功能
const usePasswordCopy = (password: string) =>
  useCallback(async () => {
    if (!password) {
      Toast.warning(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PASSWORD_COPY_EMPTY_WARNING),
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(password);
      Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PASSWORD_COPY_SUCCESS));
    } catch (error) {
      // 降级方案：创建临时输入框进行复制
      const textArea = document.createElement('textarea');
      textArea.value = password;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PASSWORD_COPY_SUCCESS));
      } catch (fallbackError) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PASSWORD_COPY_FAILED));
      }

      document.body.removeChild(textArea);
    }
  }, [password]);

export const useEmployeeCreation = ({
  visible,
  onSuccess,
  onClose,
}: UseEmployeeCreationProps) => {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const generateRandomPassword = usePasswordGeneration();
  const validateForm = useFormValidation();
  const handleCopyPassword = usePasswordCopy(formValues.loginPassword);

  // 当弹窗打开时重置表单
  useEffect(() => {
    if (visible) {
      setFormValues(initialFormValues);
      setPasswordVisible(false);
    }
  }, [visible]);

  const handleFormChange = useCallback(
    (field: keyof FormValues, value: unknown) => {
      setFormValues(prev => {
        const newValues = {
          ...prev,
          [field]: value,
        };

        // 当切换创建账号类型时，如果切换到"暂不创建"，清空密码字段
        if (
          field === 'create_account' &&
          value === employee.employee.common.CreateAccountType.NO_CREATE
        ) {
          newValues.loginPassword = '';
        }

        return newValues;
      });
    },
    [],
  );

  // 生成随机密码并设置到表单
  const handleGeneratePassword = useCallback(() => {
    const newPassword = generateRandomPassword();
    handleFormChange('loginPassword', newPassword);
  }, [generateRandomPassword, handleFormChange]);

  // 切换密码显示状态
  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(prev => !prev);
  }, []);

  // 创建员工请求
  const { loading, run: createEmployee } = useRequest(
    async (values: FormValues) => {
      const result = await employeeApi.createEmployee({
        name: values.name,
        department_ids: values.departments,
        mobile: values.mobile,
        email: values.email || undefined,
        create_account: values.create_account,
        password:
          values.create_account ===
          employee.employee.common.CreateAccountType.CREATE_BY_EMAIL
            ? values.loginPassword
            : undefined,
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

  const handleSubmit = useCallback(() => {
    if (validateForm(formValues)) {
      createEmployee(formValues);
    }
  }, [formValues, createEmployee, validateForm]);

  return {
    formValues,
    loading,
    passwordVisible,
    handleFormChange,
    handleSubmit,
    handleGeneratePassword,
    handleCopyPassword,
    togglePasswordVisibility,
  };
};
