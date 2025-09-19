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

import { useMemo } from 'react';

import type { RoleData } from '@/api/role-api';

export interface PermissionRow {
  resourceName: string;
  actionName: string;
  actionDescription: string;
  isChecked: boolean;
  permissionId: string;
  isFirstInGroup: boolean;
  groupRowSpan: number;
}

export const usePermissionData = (
  selectedRole: RoleData | null,
  permissionMatrix: Record<string, boolean>,
) => {
  const permissionData = useMemo((): PermissionRow[] => {
    const permissionTemplates = selectedRole?.permissions || [];

    if (!permissionTemplates || permissionTemplates.length === 0) {
      return [];
    }

    // 将权限模板转换为矩阵显示格式 - 按resource_name分组，每个action独立一行
    const permissionRows: PermissionRow[] = [];

    // 先按resource_name分组收集数据
    const resourceGroups: Record<
      string,
      Array<{
        actionName: string;
        actionDescription: string;
        isChecked: boolean;
        permissionId: string;
      }>
    > = {};

    permissionTemplates.forEach(group => {
      // 检查group是否有resources
      if (!group.resources || group.resources.length === 0) {
        return;
      }

      group.resources.forEach(resource => {
        // 检查resource是否有actions
        if (!resource.actions || resource.actions.length === 0) {
          return;
        }

        const resourceName = resource.resource_name || resource.resource || '';
        if (!resourceGroups[resourceName]) {
          resourceGroups[resourceName] = [];
        }

        resource.actions.forEach(action => {
          const permissionId = `${group.domain}_${resource.resource}_${action.action}`;
          resourceGroups[resourceName].push({
            actionName: action.action_name || action.action || '',
            actionDescription: action.description || '',
            isChecked: permissionMatrix[permissionId] || false,
            permissionId,
          });
        });
      });
    });

    // 转换为行数据，标记每个资源组的第一行和rowspan
    Object.entries(resourceGroups).forEach(([resourceName, actions]) => {
      actions.forEach((action, index) => {
        permissionRows.push({
          resourceName,
          actionName: action.actionName,
          actionDescription: action.actionDescription,
          isChecked: action.isChecked,
          permissionId: action.permissionId,
          isFirstInGroup: index === 0,
          groupRowSpan: actions.length,
        });
      });
    });

    return permissionRows;
  }, [selectedRole?.permissions, permissionMatrix]);

  return permissionData;
};
