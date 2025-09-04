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

import { useState, useEffect, useRef } from 'react';

import { useRequest } from 'ahooks';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { corporationApi } from '@/api/corporation-api';

interface FormValues {
  name: string;
  corp_type: number;
  parent_id?: string;
}

interface UseOrganizationFormParams {
  visible: boolean;
  organizationId?: string;
  onSuccess?: () => void;
  onClose: () => void;
}

export const useOrganizationForm = ({
  visible,
  organizationId,
  onSuccess,
  onClose,
}: UseOrganizationFormParams) => {
  const formApiRef = useRef<{
    validate: () => Promise<unknown>;
    getValues: () => FormValues;
    setValues: (values: FormValues) => void;
  } | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    corp_type: 0,
    parent_id: undefined,
  });

  // 获取组织详情
  const { run: fetchOrganizationDetail, loading: loadingDetail } = useRequest(
    async (id: string) => {
      const response = await corporationApi.getCorporation(id);
      return response;
    },
    {
      manual: true,
      onSuccess: data => {
        if (data) {
          const newValues = {
            name: data.name || '',
            corp_type: data.corp_type || 0,
            parent_id: data.parent_id,
          };
          setFormValues(newValues);

          if (formApiRef.current) {
            formApiRef.current.setValues(newValues);
          }
        }
      },
    },
  );

  // 创建组织
  const { run: createOrganization, loading: creatingOrganization } = useRequest(
    async (data: { name: string; corp_type: number; parent_id?: string }) => {
      await corporationApi.createCorporation(data);
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_SUCCESS));
        onSuccess?.();
        onClose();
      },
      onError: () => {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_FAILED));
      },
    },
  );

  // 更新组织
  const { run: updateOrganization, loading: updatingOrganization } = useRequest(
    async (data: {
      id: string;
      name?: string;
      corp_type?: number;
      parent_id?: string;
    }) => {
      await corporationApi.updateCorporation(data);
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_SUCCESS));
        onSuccess?.();
        onClose();
      },
      onError: () => {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED));
      },
    },
  );

  // 提交表单
  const handleSubmit = async () => {
    if (!formApiRef.current) {
      return;
    }

    try {
      await formApiRef.current.validate();
      const values = formApiRef.current.getValues();

      if (organizationId) {
        // 更新
        updateOrganization({
          id: organizationId,
          name: values.name,
          corp_type: values.corp_type,
          parent_id: values.parent_id,
        });
      } else {
        // 创建
        createOrganization({
          name: values.name,
          corp_type: values.corp_type,
          parent_id: values.parent_id,
        });
      }
    } catch (errors) {
      console.error('Form validation failed:', errors);
    }
  };

  const handleFormChange = (values: FormValues) => {
    setFormValues(values);
  };

  useEffect(() => {
    if (visible && organizationId) {
      fetchOrganizationDetail(organizationId);
    } else if (visible && !organizationId) {
      // 新建模式，重置表单
      const defaultValues = { name: '', corp_type: 0, parent_id: undefined };
      setFormValues(defaultValues);
      if (formApiRef.current) {
        formApiRef.current.setValues(defaultValues);
      }
    }
  }, [visible, organizationId, fetchOrganizationDetail]);

  const loading = loadingDetail || creatingOrganization || updatingOrganization;

  return {
    formApiRef,
    formValues,
    loading,
    handleSubmit,
    handleFormChange,
  };
};
