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

import { useState, useEffect } from 'react';

import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { roleApi } from '@/api/role-api';

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

interface RoleFormData {
  role_name: string;
  role_code: string;
  description?: string;
}

interface UseRoleFormProps {
  visible: boolean;
  onSuccess: () => void;
}

export const useRoleForm = ({ visible, onSuccess }: UseRoleFormProps) => {
  const [formValues, setFormValues] = useState<RoleFormData>({
    role_name: '',
    role_code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  // 弹窗关闭时重置表单状态
  useEffect(() => {
    if (!visible) {
      setFormValues({
        role_name: '',
        role_code: '',
        description: '',
      });
    }
  }, [visible]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await roleApi.createRole({
        role_name: formValues.role_name.trim(),
        role_code: formValues.role_code.trim(),
        description: formValues.description?.trim(),
      });

      Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_SUCCESS));
      onSuccess();
    } catch (error: unknown) {
      console.error('Create role failed:', error);
      const errorMessage =
        (error as { message?: string; msg?: string })?.message ||
        (error as { message?: string; msg?: string })?.msg ||
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_FAILED);

      Toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    formValues,
    setFormValues,
    loading,
    handleSubmit,
    MAX_NAME_LENGTH,
    MAX_DESCRIPTION_LENGTH,
  };
};
