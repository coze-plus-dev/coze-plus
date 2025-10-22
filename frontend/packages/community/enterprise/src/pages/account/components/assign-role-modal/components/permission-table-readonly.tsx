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

import type { FC } from 'react';

import { Checkbox } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import type { PermissionRow } from '@/pages/role/components/permission-matrix/hooks/use-permission-data';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import styles from './permission-table-readonly.module.less';

interface PermissionTableReadonlyProps {
  permissionData: PermissionRow[];
  selectedRole?: RoleData | null;
}

export const PermissionTableReadonly: FC<PermissionTableReadonlyProps> = ({
  permissionData,
  selectedRole,
}) => (
  <div className={styles.permissionTable}>
    <div className={styles.tableHeader}>
      <div className={styles.permissionColumn}>
        {t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TABLE_PERMISSION_COLUMN)}
      </div>
      <div className={styles.actionColumn}>
        {t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TABLE_ACTION_COLUMN)}
      </div>
    </div>
    <div className={styles.tableBody}>
      {permissionData.map(permission => {
        // 找到当前资源组的所有权限
        const currentGroupPermissions = permissionData.filter(
          p => p.resourceName === permission.resourceName,
        );
        const indexInGroup = currentGroupPermissions.findIndex(
          p => p.permissionId === permission.permissionId,
        );
        const isLastInGroup =
          indexInGroup === currentGroupPermissions.length - 1;

        // 判断是否是最后一个资源组
        const allResourceNames = [
          ...new Set(permissionData.map(p => p.resourceName)),
        ];
        const currentResourceIndex = allResourceNames.indexOf(
          permission.resourceName,
        );
        const isLastGroup =
          currentResourceIndex === allResourceNames.length - 1;

        return (
          <div key={permission.permissionId} className={styles.tableRow}>
            {/* 只在每个资源组的第一行显示资源名称，并设置rowspan */}
            {permission.isFirstInGroup ? (
              <div
                className={styles.permissionCell}
                style={{
                  gridRowEnd: `span ${permission.groupRowSpan}`,
                }}
              >
                <div className={styles.permissionName}>
                  {permission.resourceName}
                </div>
              </div>
            ) : null}
            <div
              className={styles.actionCell}
              style={{
                borderBottom:
                  isLastInGroup && !isLastGroup
                    ? '2px solid var(--semi-color-border)'
                    : '1px solid var(--semi-color-fill-1)',
              }}
            >
              <div className={styles.actionItem}>
                <div className={styles.actionContent}>
                  <div className={styles.actionName}>
                    {permission.actionName}
                  </div>
                  {permission.actionDescription ? (
                    <div className={styles.actionDesc}>
                      {permission.actionDescription}
                    </div>
                  ) : null}
                </div>
                <Checkbox
                  checked={permission.isChecked}
                  disabled={true} // 只读模式，不可修改
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
