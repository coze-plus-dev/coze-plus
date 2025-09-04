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
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import type { PermissionRow } from '@/pages/role/components/permission-matrix/hooks/use-permission-data';

import styles from './permission-table-readonly.module.less';

interface PermissionTableReadonlyProps {
  permissionData: PermissionRow[];
  selectedRole?: RoleData | null;
}

export const PermissionTableReadonly: FC<PermissionTableReadonlyProps> = ({
  permissionData,
  selectedRole,
}) => {
  // 按resource_name分组
  const groupedByResource: Record<string, PermissionRow[]> =
    permissionData.reduce((acc, permission) => {
      const { resourceName } = permission;
      if (!acc[resourceName]) {
        acc[resourceName] = [];
      }
      acc[resourceName].push(permission);
      return acc;
    }, {});

  return (
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
        {Object.entries(groupedByResource).map(([resourceName, permissions]) =>
          permissions.map((permission) => (
            <div key={permission.permissionId} className={styles.tableRow}>
              <div className={styles.permissionCell}>
                <div className={styles.permissionName}>
                  {permission.resourceName}
                </div>
              </div>
              <div className={styles.actionCell}>
                <div className={styles.actionItem}>
                  <div className={styles.actionContent}>
                    <div className={styles.actionName}>
                      {permission.actionName}
                    </div>
                    {permission.actionDescription && (
                      <div className={styles.actionDesc}>
                        {permission.actionDescription}
                      </div>
                    )}
                  </div>
                  <Checkbox
                    checked={permission.isChecked}
                    disabled={true} // 只读模式，不可修改
                  />
                </div>
              </div>
            </div>
          )),
        )}
      </div>
    </div>
  );
};