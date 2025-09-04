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
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

interface UseResetPasswordParams {
  onSuccess?: () => void;
}

interface UseResetPasswordResult {
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  loading: boolean;
}

export const useResetPassword = ({
  onSuccess,
}: UseResetPasswordParams = {}): UseResetPasswordResult => {
  const [loading, setLoading] = useState(false);

  const resetPassword = useCallback(async (email: string, newPassword: string) => {
    // 验证输入
    if (!email.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_INVALID_PASSWORD));
      return;
    }
    
    if (!newPassword.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_INVALID_PASSWORD));
      return;
    }

    setLoading(true);

    try {
      const response = await permission.ResetUserPassword({
        email: email.trim(),
        new_password: newPassword.trim(),
      });

      if (response.code === 0) {
        Toast.success(t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_SUCCESS));
        onSuccess?.();
      } else {
        const errorMsg = response.msg || t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_FAILED);
        Toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to reset password:', err);
      const errorMsg = t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_FAILED);
      Toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return {
    resetPassword,
    loading,
  };
};