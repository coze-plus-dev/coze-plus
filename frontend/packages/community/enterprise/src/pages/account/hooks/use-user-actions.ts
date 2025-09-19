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

import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import type { UserData } from '../types';

// Custom hook for handling user actions
export const useUserActions = (options: {
  updateUserStatus: (
    userId: string,
    isDisabled: number,
  ) => Promise<{ success: boolean; message: string }>;
  onAssignRole: (user: UserData) => void;
  onShowRoleDetail: (user: UserData) => void;
  onResetPassword: (user: UserData) => void;
}) => {
  const { updateUserStatus, onAssignRole, onShowRoleDetail, onResetPassword } = options;

  const handleUserStatusUpdate = async (action: string, record: UserData) => {
    const isDisable = action === 'disable';
    const newStatus = isDisable ? 1 : 0;
    console.log(
      'Updating user status - Action:',
      action,
      'User ID:',
      record.user_id,
      'New status:',
      newStatus,
    );

    try {
      const result = await updateUserStatus(String(record.user_id), newStatus);
      console.log('Update result:', result);

      if (result && result.success) {
        Toast.success(
          isDisable
            ? t(ENTERPRISE_I18N_KEYS.ACCOUNT_DISABLE_SUCCESS)
            : t(ENTERPRISE_I18N_KEYS.ACCOUNT_ENABLE_SUCCESS),
        );
      } else {
        const message =
          result?.message || t(ENTERPRISE_I18N_KEYS.ACCOUNT_OPERATION_FAILED);
        Toast.error(message);
      }
    } catch (error) {
      console.error('Error in handleUserStatusUpdate:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ACCOUNT_OPERATION_FAILED));
    }
  };

  const handleActionClick = async (action: string, record: UserData) => {
    switch (action) {
      case 'enable':
      case 'disable':
        await handleUserStatusUpdate(action, record);
        break;
      case 'assignRole':
        onAssignRole(record);
        break;
      case 'roleList':
        onShowRoleDetail(record);
        break;
      case 'resetPassword':
        onResetPassword(record);
        break;
      default:
        break;
    }
  };

  return { handleActionClick };
};