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

import { useRequest } from 'ahooks';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { corporationApi } from '@/api/corporation-api';

interface FormValues {
  name: string;
  parent_id: string;
  corp_type: number;
}

interface FormApiRef {
  validate: () => Promise<unknown>;
  getValues: () => FormValues;
}

export const useOrganizationUpdate = (
  organizationId: string,
  formApiRef: React.RefObject<FormApiRef | null>,
  options?: {
    formValues?: FormValues;
    onSuccess?: () => void;
  },
) =>
  useRequest(
    async () => {
      // 验证表单
      try {
        await formApiRef.current?.validate();
      } catch (errors) {
        // Validation failed, stop execution
        console.warn('Form validation failed:', errors);
        return;
      }

      // 使用表单的值进行更新
      const values = formApiRef.current?.getValues() ||
        options?.formValues || {
          name: '',
          parent_id: '',
          corp_type: 1,
        };
      await corporationApi.updateCorporation({
        id: organizationId,
        name: values.name,
        parent_id: values.parent_id || undefined,
        corp_type: values.corp_type,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLUGIN_UPDATE_SUCCESS));
        options?.onSuccess?.();
      },
      onError: (error: Error | { message?: string }) => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED),
        );
      },
    },
  );
