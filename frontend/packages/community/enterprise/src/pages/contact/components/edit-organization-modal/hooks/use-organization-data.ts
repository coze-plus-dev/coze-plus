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
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { corporationApi } from '@/api/corporation-api';

interface OrganizationOption {
  label: string;
  value: string;
}

interface OrganizationData {
  id: string;
  name: string;
  corp_type?: number;
  parent_id?: string;
}

interface FormValues {
  name: string;
  parent_id: string;
  corp_type: number;
}

export const useOrganizationData = (organizationId: string) => {
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    parent_id: '',
    corp_type: 1,
  });

  // 获取组织详情
  const { loading: detailLoading, run: fetchOrganizationDetail } = useRequest(
    async () => {
      if (!organizationId) {
        return null;
      }
      const result = await corporationApi.getCorporation(organizationId);
      return result;
    },
    {
      manual: true,
      onSuccess: data => {
        if (data) {
          const formData = {
            name: data.name || '',
            parent_id: data.parent_id || '',
            corp_type: data.corp_type || 1,
          };
          setFormValues(formData);
        }
      },
      onError: (error: Error | { message?: string }) => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOAD_FAILED),
        );
      },
    },
  );

  // 获取组织列表（用于父组织选择）
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
      onSuccess: data => {
        // 过滤掉当前组织，避免设置自己为父组织
        const options = data
          .filter((org: OrganizationData) => org.id !== organizationId)
          .map((org: OrganizationData) => ({
            label: org.name,
            value: org.id,
          }));
        setOrganizationOptions(options);
      },
    },
  );

  return {
    organizationOptions,
    formValues,
    setFormValues,
    fetchOrganizationDetail,
    fetchOrganizations,
    detailLoading,
  };
};
