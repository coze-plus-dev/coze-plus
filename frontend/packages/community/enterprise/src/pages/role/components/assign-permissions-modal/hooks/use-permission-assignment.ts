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

import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import {
  roleApi,
  type RoleData,
  type PermissionTemplate,
} from '@/api/role-api';

interface UsePermissionAssignmentProps {
  visible: boolean;
  role: RoleData | null;
  onSuccess: () => void;
}

export const usePermissionAssignment = ({
  visible,
  role,
  onSuccess,
}: UsePermissionAssignmentProps): {
  permissionTemplates: Array<{
    domain?: string;
    domain_name?: string;
    resources?: Array<{
      resource?: string;
      resource_name?: string;
      actions?: Array<{
        id?: string;
        action?: string;
        action_name?: string;
        description?: string;
        is_default?: number;
      }>;
    }>;
  }>;
  selectedPermissions: string[];
  loading: boolean;
  submitting: boolean;
  handlePermissionChange: (permissionId: string, checked: boolean) => void;
  handleSubmit: () => void;
} => {
  const [permissionTemplates, setPermissionTemplates] = useState<
    PermissionTemplate[]
  >([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 加载权限模板和当前角色权限
  const loadData = useCallback(async () => {
    if (!role) {
      return;
    }

    setLoading(true);
    try {
      // 调用权限模板列表API，只获取全局权限
      const templates = await roleApi.listPermissionTemplates('global');

      // 获取角色当前权限（如果角色已有权限的话）
      const currentSelectedPermissions: string[] = [];
      if (
        role.permissions &&
        Array.isArray(role.permissions) &&
        role.permissions.length > 0
      ) {
        // 从角色现有权限中提取已选权限ID
        role.permissions.forEach(group => {
          group.resources?.forEach(resource => {
            resource.actions?.forEach(action => {
              if (action.is_default === 1) {
                currentSelectedPermissions.push(action.id?.toString() || '');
              }
            });
          });
        });
      }

      setPermissionTemplates(templates);
      setSelectedPermissions(currentSelectedPermissions);
    } catch (error) {
      console.error('Failed to load permission templates:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_DATA_LOAD_FAILED));
    } finally {
      setLoading(false);
    }
  }, [role]); // 移除 't' 依赖，因为它不会改变

  useEffect(() => {
    if (visible && role) {
      loadData();
    }
  }, [visible, role, loadData]);

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setSelectedPermissions(prev => {
      if (checked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  };

  const handleSubmit = async () => {
    if (!role) {
      return;
    }

    setSubmitting(true);
    try {
      // 构建完整的权限数据，包含所有权限模板中的action，根据selectedPermissions设置is_default
      const permissions = permissionTemplates.map(group => ({
        domain: group.domain || '',
        domain_name: group.domain_name || '',
        resources:
          group.resources?.map(resource => ({
            resource: resource.resource || '',
            resource_name: resource.resource_name || '',
            actions:
              resource.actions?.map(action => ({
                ...action,
                is_default: selectedPermissions.includes(
                  action.id?.toString() || '',
                )
                  ? 1
                  : 0,
              })) || [],
          })) || [],
      }));

      // 调用角色更新API
      if (!role.id) {
        throw new Error('Role ID is required');
      }
      await roleApi.updateRole({
        id: role.id,
        permissions,
      });

      Toast.success(t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_ASSIGN_SUCCESS));
      onSuccess();
    } catch (error) {
      console.error('Assign permissions failed:', error);
      const errorMessage =
        (error as { message?: string; msg?: string })?.message ||
        (error as { message?: string; msg?: string })?.msg ||
        t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_ASSIGN_FAILED);
      Toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    permissionTemplates,
    selectedPermissions,
    loading,
    submitting,
    handlePermissionChange,
    handleSubmit,
  };
};
