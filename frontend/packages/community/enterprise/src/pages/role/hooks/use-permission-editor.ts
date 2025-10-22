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
  type PermissionTemplateGroup,
} from '@/api/role-api';

interface UsePermissionEditorProps {
  selectedRole: RoleData | null;
  refreshRoles: () => void;
}

/**
 * 构建权限矩阵的辅助函数
 */
const buildPermissionMatrix = (
  permissions: PermissionTemplateGroup[],
): Record<string, boolean> => {
  const matrix: Record<string, boolean> = {};

  permissions.forEach(group => {
    group.resources?.forEach(resource => {
      resource.actions?.forEach(action => {
        // 使用 domain_resource_action 作为唯一标识
        const permissionId = `${group.domain}_${resource.resource}_${action.action}`;
        matrix[permissionId] = action.is_default === 1;
      });
    });
  });

  return matrix;
};

/**
 * 构建完整权限数据结构的辅助函数
 */
const buildPermissionData = (
  permissionTemplates: PermissionTemplateGroup[],
  permissionMatrix: Record<string, boolean>,
): PermissionTemplateGroup[] =>
  permissionTemplates.map(group => ({
    domain: group.domain,
    domain_name: group.domain_name,
    resources:
      group.resources?.map(resource => ({
        resource: resource.resource,
        resource_name: resource.resource_name,
        actions:
          resource.actions?.map(action => {
            const permissionId = `${group.domain}_${resource.resource}_${action.action}`;
            return {
              ...action,
              is_default: permissionMatrix[permissionId] ? 1 : 0,
            };
          }) || [],
      })) || [],
  }));

export const usePermissionEditor = ({
  selectedRole,
  refreshRoles,
}: UsePermissionEditorProps) => {
  // 权限模板数据
  const [permissionTemplates, setPermissionTemplates] = useState<
    PermissionTemplateGroup[]
  >([]);
  // 权限矩阵状态：记录每个权限action的选中状态
  const [permissionMatrix, setPermissionMatrix] = useState<
    Record<string, boolean>
  >({});
  // 原始权限矩阵（用于取消编辑）
  const [originalMatrix, setOriginalMatrix] = useState<Record<string, boolean>>(
    {},
  );
  // 编辑状态
  const [isEditing, setIsEditing] = useState(false);

  const loadRolePermissionData = useCallback(async () => {
    if (!selectedRole?.id) {
      return;
    }

    try {
      // 获取角色详情
      const roleDetail = await roleApi.getRole(selectedRole.id);

      if (roleDetail?.permissions) {
        setPermissionTemplates(roleDetail.permissions);

        // 从角色权限数据构建权限矩阵
        const matrix = buildPermissionMatrix(roleDetail.permissions);

        setPermissionMatrix(matrix);
        setOriginalMatrix({ ...matrix });
      } else {
        setPermissionTemplates([]);
        setPermissionMatrix({});
        setOriginalMatrix({});
      }
    } catch (error) {
      console.error('Load role permission data failed:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_DATA_LOAD_FAILED));
    }
  }, [selectedRole?.id]);

  // 当选中角色变化时，加载角色详情和初始化权限矩阵
  useEffect(() => {
    if (selectedRole?.id) {
      loadRolePermissionData();
    } else {
      setPermissionTemplates([]);
      setPermissionMatrix({});
      setOriginalMatrix({});
    }
  }, [selectedRole?.id, loadRolePermissionData]);

  const handleEdit = () => {
    setOriginalMatrix({ ...permissionMatrix });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setPermissionMatrix({ ...originalMatrix });
    setIsEditing(false);
  };

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [permissionId]: checked,
    }));
  };

  const handleSave = async () => {
    if (!selectedRole?.id) {
      return;
    }

    try {
      // 构建完整的权限数据结构，基于当前加载的角色权限模板
      const permissions = buildPermissionData(
        permissionTemplates,
        permissionMatrix,
      );

      // 调用角色更新API
      await roleApi.updateRole({
        id: selectedRole.id,
        permissions,
      });

      Toast.success(t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_SAVE_SUCCESS));
      setIsEditing(false);
      setOriginalMatrix({ ...permissionMatrix });

      // 刷新角色列表
      refreshRoles();
    } catch (error) {
      console.error('Save permissions failed:', error);
      const errorMessage =
        (error as { message?: string; msg?: string })?.message ||
        (error as { message?: string; msg?: string })?.msg ||
        t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_SAVE_FAILED);
      Toast.error(errorMessage);
    }
  };

  return {
    permissionMatrix,
    setPermissionMatrix,
    handlePermissionChange,
    isEditing,
    handleEdit,
    handleSave,
    handleCancel,
  };
};
