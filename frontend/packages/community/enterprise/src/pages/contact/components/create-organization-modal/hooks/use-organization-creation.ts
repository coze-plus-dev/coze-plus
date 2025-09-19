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
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { corporationApi } from '@/api/corporation-api';

interface FormValues {
  name: string;
  corp_type?: number;
  parent_id?: string;
}

interface OrganizationOption {
  label: string;
  value: string;
}

interface UseOrganizationCreationProps {
  visible: boolean;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const useOrganizationCreation = ({
  visible,
  onSuccess,
  onClose,
}: UseOrganizationCreationProps) => {
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    corp_type: undefined,
    parent_id: undefined,
  });

  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);

  // 获取组织列表
  const { run: fetchOrganizations } = useRequest(
    async () => {
      const result = await corporationApi.listCorporations({
        page: 1,
        page_size: 1000,
      });
      return result.data || [];
    },
    {
      manual: true,
      onSuccess: (data: { name: string; id: string }[]) => {
        const options = data.map(org => ({
          label: org.name,
          value: org.id,
        }));
        setOrganizationOptions(options);
      },
    },
  );

  // 创建组织请求
  const { loading, run: createOrganization } = useRequest(
    async (values: FormValues) => {
      const result = await corporationApi.createCorporation({
        name: values.name,
        corp_type: values.corp_type,
        parent_id: values.parent_id,
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
    if (!formValues.name || !formValues.name.trim()) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME),
      );
      return;
    }

    if (formValues.name.length > 50) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_NAME_TOO_LONG),
      );
      return;
    }

    if (!formValues.corp_type || formValues.corp_type === 0) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE),
      );
      return;
    }

    createOrganization(formValues);
  }, [formValues, createOrganization]);

  const handleClose = useCallback(() => {
    setFormValues({
      name: '',
      corp_type: undefined,
      parent_id: undefined,
    });
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (visible) {
      fetchOrganizations();
    }
  }, [visible, fetchOrganizations]);

  return {
    formValues,
    setFormValues,
    organizationOptions,
    loading,
    handleSubmit,
    handleClose,
  };
};
