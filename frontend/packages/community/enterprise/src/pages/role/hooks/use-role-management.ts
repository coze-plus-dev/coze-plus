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

export const useRoleManagement = () => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const loadRoles = async () => {
    setRolesLoading(true);
    try {
      const response = await roleApi.listRoles();
      setRoles(response.data?.roles || []);
    } catch (error) {
      console.error('Load roles failed:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ROLE_LIST_LOAD_FAILED));
    } finally {
      setRolesLoading(false);
    }
  };

  const refreshRoles = () => {
    loadRoles();
  };

  useEffect(() => {
    loadRoles();
  }, []);

  return {
    roles,
    rolesLoading,
    refreshRoles,
  };
};
