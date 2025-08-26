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

import { useCallback } from 'react';
import { type RoleData, roleApi } from '@/api/role-api';

interface UseRoleSelectionProps {
  setSelectedRole: (role: RoleData | null) => void;
  setRolePermissions: (permissions: unknown[]) => void;
  setPermissionMatrix: (matrix: Record<string, boolean>) => void;
  setRoleToAssign: (role: RoleData | null) => void;
  setIsAssignPermissionsModalVisible: (visible: boolean) => void;
  setRoleDetailsLoading: (loading: boolean) => void;
}

export const useRoleSelection = ({
  setSelectedRole,
  setRolePermissions,
  setPermissionMatrix,
  setRoleToAssign,
  setIsAssignPermissionsModalVisible,
  setRoleDetailsLoading,
}: UseRoleSelectionProps) => {
  const handleRoleSelect = useCallback(async (role: RoleData) => {
    try {
      setRoleDetailsLoading(true);
      
      // 请求获取角色详情，包含完整的权限信息
      const roleDetail = await roleApi.getRole(role.id?.toString() || '');
      
      if (roleDetail) {
        // 基于角色详情的权限配置构建权限矩阵
        const matrix: Record<string, boolean> = {};
        
        // 解析角色的permissions字段（如果存在）
        if (roleDetail.permissions && Array.isArray(roleDetail.permissions)) {
          roleDetail.permissions.forEach(group => {
            group.resources?.forEach(resource => {
              resource.actions?.forEach(action => {
                const permissionId = `${group.domain}_${resource.resource}_${action.action}`;
                matrix[permissionId] = action.is_default === 1;
              });
            });
          });
        }

        // 批量更新所有状态，避免多次setState调用
        setSelectedRole(roleDetail);
        setPermissionMatrix(matrix);
        setRolePermissions(roleDetail.permissions || []);
      } else {
        // 如果没有获取到详情，使用基础角色数据
        setSelectedRole(role);
        setPermissionMatrix({});
        setRolePermissions([]);
      }
    } catch (error) {
      console.error('Load role details failed:', error);
      // 发生错误时，设置基础的角色选中状态
      setSelectedRole(role);
      setPermissionMatrix({});
      setRolePermissions([]);
    } finally {
      setRoleDetailsLoading(false);
    }
  }, [setSelectedRole, setPermissionMatrix, setRolePermissions, setRoleDetailsLoading]);

  return {
    handleRoleSelect,
  };
};
