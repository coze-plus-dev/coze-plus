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

import { useState, useCallback } from 'react';

import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { roleApi } from '@/api/role-api';
import type { UserData } from '../../../types';

interface UseUserRolesParams {
  user: UserData | null;
  visible: boolean;
}

export const useUserRoles = ({ user, visible }: UseUserRolesParams) => {
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // 获取用户当前角色
  const loadUserCurrentRoles = useCallback(async () => {
    if (!user?.user_id || !visible) {
      return;
    }
    
    try {
      const response = await roleApi.getUserRoles(user.user_id);
      if (response.data && Array.isArray(response.data)) {
        const currentRoleIds = new Set(
          response.data
            .map(role => role.id?.toString())
            .filter(Boolean) as string[],
        );
        setSelectedRoles(currentRoleIds);
      }
    } catch (error) {
      console.error('Failed to load user roles:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_FAILED_MESSAGE));
    }
  }, [user?.user_id, visible]);

  // 角色选择切换
  const toggleRoleSelection = useCallback((roleId: string, checked: boolean) => {
    setSelectedRoles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(roleId);
      } else {
        newSet.delete(roleId);
      }
      return newSet;
    });
  }, []);

  // 保存角色分配
  const saveRoleAssignment = useCallback(async (onSuccess?: () => void, onClose?: () => void) => {
    if (!user?.user_id) {
      return;
    }

    setLoading(true);
    try {
      const roleIds = Array.from(selectedRoles);
      await roleApi.assignUserMultipleRoles({
        user_id: user.user_id,
        role_ids: roleIds,
      });
      
      Toast.success(t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_SUCCESS_MESSAGE));
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Failed to assign roles:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_FAILED_MESSAGE));
    } finally {
      setLoading(false);
    }
  }, [user?.user_id, selectedRoles]);

  return {
    selectedRoles,
    loading,
    loadUserCurrentRoles,
    toggleRoleSelection,
    saveRoleAssignment,
    setSelectedRoles,
  };
};