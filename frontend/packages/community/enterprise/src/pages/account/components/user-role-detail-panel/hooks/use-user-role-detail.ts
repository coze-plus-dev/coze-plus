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

import { permission } from '@coze-studio/api-schema';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

type RoleData = permission.permission.RoleData;

interface UseUserRoleDetailResult {
  data: RoleData[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export const useUserRoleDetail = (
  visible: boolean,
  userId?: string | number,
): UseUserRoleDetailResult => {
  const [data, setData] = useState<RoleData[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = useCallback(async () => {
    if (!visible || !userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await permission.GetUserRoles({
        user_id: String(userId),
      });

      if (response.code === 0) {
        setData(response.data || []);
      } else {
        const errorMsg = response.msg || t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_LOAD_FAILED);
        setError(errorMsg);
        Toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Failed to fetch user roles:', err);
      const errorMsg = t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_LOAD_FAILED);
      setError(errorMsg);
      Toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [visible, userId]);

  const refresh = useCallback(() => {
    fetchUserRoles();
  }, [fetchUserRoles]);

  useEffect(() => {
    if (visible && userId) {
      fetchUserRoles();
    }
  }, [visible, userId, fetchUserRoles]);

  // 清理状态当面板关闭时
  useEffect(() => {
    if (!visible) {
      setData(null);
      setError(null);
    }
  }, [visible]);

  return {
    data,
    loading,
    error,
    refresh,
  };
};