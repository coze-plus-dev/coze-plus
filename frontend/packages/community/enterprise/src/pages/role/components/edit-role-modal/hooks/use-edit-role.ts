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
import { roleApi, type RoleData } from '@/api/role-api';

const MAX_NAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 500;

interface RoleFormData {
  role_name: string;
  role_code: string;
  description?: string;
}

interface UseEditRoleProps {
  visible: boolean;
  role: RoleData | null;
  onSuccess: () => void;
}

export const useEditRole = ({ visible, role, onSuccess }: UseEditRoleProps) => {
  const [formValues, setFormValues] = useState<RoleFormData>({
    role_name: '',
    role_code: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && role) {
      setFormValues({
        role_name: role.role_name || '',
        role_code: role.role_code || '',
        description: role.description || '',
      });
    }
  }, [visible, role]);

  const validateForm = () => {
    if (!formValues.role_name || !formValues.role_name.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ROLE_VALIDATION_NAME_REQUIRED));
      return false;
    }
    if (formValues.role_name.length > MAX_NAME_LENGTH) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_VALIDATION_NAME_TOO_LONG));
      return false;
    }
    if (
      formValues.description &&
      formValues.description.length > MAX_DESCRIPTION_LENGTH
    ) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_VALIDATION_NAME_TOO_LONG));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!role || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await roleApi.updateRole({
        id: role.id,
        role_name: formValues.role_name.trim(),
        description: formValues.description?.trim(),
      });

      Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_SUCCESS));
      onSuccess();
    } catch (error: unknown) {
      console.error('Update role failed:', error);
      let errorMessage =
        (error as { message?: string; msg?: string })?.message ||
        (error as { message?: string; msg?: string })?.msg ||
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED);

      if (errorMessage.includes('invalid parameter')) {
        errorMessage = t(ENTERPRISE_I18N_KEYS.ROLE_INVALID_PARAM_ERROR);
      }

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
