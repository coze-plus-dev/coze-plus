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

import { type FC, useMemo } from 'react';

import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { EmptyState, Spin } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import { usePermissionData } from '@/pages/role/components/permission-matrix/hooks/use-permission-data';
import { PermissionTableReadonly } from './permission-table-readonly';

import styles from './permission-matrix-panel.module.less';

interface PermissionMatrixPanelProps {
  selectedRole: RoleData | null;
  loading?: boolean;
}

export const PermissionMatrixPanel: FC<PermissionMatrixPanelProps> = ({
  selectedRole,
  loading = false,
}) => {
  // 根据角色权限数据构建权限矩阵
  const permissionMatrix = useMemo(() => {
    if (!selectedRole?.permissions) {
      return {};
    }

    const matrix: Record<string, boolean> = {};

    selectedRole.permissions.forEach(group => {
      if (!group.resources) {
        return;
      }

      group.resources.forEach(resource => {
        if (!resource.actions) {
          return;
        }

        resource.actions.forEach(action => {
          const permissionId = `${group.domain}_${resource.resource}_${action.action}`;
          // 使用 is_default 字段来判断权限是否被勾选
          matrix[permissionId] = action.is_default === 1;
        });
      });
    });

    return matrix;
  }, [selectedRole]);
  
  const permissionData = usePermissionData(selectedRole, permissionMatrix);

  // 显示加载状态
  if (loading) {
    return (
      <div className={styles.permissionMatrixPanel}>
        <div className={styles.emptyContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!selectedRole) {
    return (
      <div className={styles.permissionMatrixPanel}>
        <div className={styles.emptyContainer}>
          <EmptyState
            icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_NO_ROLE_SELECTED)}
            description={t(
              ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_NO_ROLE_SELECTED_DESC,
            )}
          />
        </div>
      </div>
    );
  }

  if (permissionData.length === 0) {
    return (
      <div className={styles.permissionMatrixPanel}>
        <div className={styles.emptyContainer}>
          <EmptyState
            icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_NO_DATA_TITLE)}
            description={t(
              ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_NO_DATA_DESCRIPTION,
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.permissionMatrixPanel}>
      <div className={styles.permissionContent}>
        <PermissionTableReadonly
          permissionData={permissionData}
          selectedRole={selectedRole}
        />
      </div>
    </div>
  );
};