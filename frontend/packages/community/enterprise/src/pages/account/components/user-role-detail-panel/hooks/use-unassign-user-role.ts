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

import { permission } from '@coze-studio/api-schema';
import { Toast, Modal } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

type RoleData = permission.permission.RoleData;

interface UseUnassignUserRoleResult {
  unassignRole: (userId: string | number, role: RoleData) => Promise<void>;
  loading: boolean;
}

export const useUnassignUserRole = (
  onSuccess?: () => void,
): UseUnassignUserRoleResult => {
  const [loading, setLoading] = useState(false);

  const unassignRole = useCallback(async (
    userId: string | number,
    role: RoleData,
  ) => {
    // 显示确认对话框
    const confirmed = await new Promise<boolean>((resolve) => {
      Modal.confirm({
        title: t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_CONFIRM_TITLE),
        content: t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_CONFIRM_MESSAGE, {
          roleName: role.role_name || role.role_code || 'Unknown Role',
        }),
        okText: t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_CONFIRM_OK),
        cancelText: t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_CONFIRM_CANCEL),
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      });
    });

    if (!confirmed) {
      return;
    }

    if (!role.id) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_INVALID_ROLE));
      return;
    }

    setLoading(true);

    try {
      const response = await permission.UnassignUserRoles({
        user_id: String(userId),
        role_ids: [String(role.id)],
      });

      if (response.code === 0) {
        Toast.success(t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_SUCCESS));
        onSuccess?.();
      } else {
        const errorMsg = response.msg || t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_FAILED);
        Toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to unassign user role:', err);
      const errorMsg = t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_FAILED);
      Toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    unassignRole,
    loading,
  };
};