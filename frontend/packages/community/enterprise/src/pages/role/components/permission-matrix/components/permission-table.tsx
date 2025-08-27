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

import {
  IconCozPencilPaper,
  IconCozCheckMarkCircleFillPalette,
  IconCozCrossCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import { Checkbox, Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import type { PermissionRow } from '../hooks/use-permission-data';
import styles from '../index.module.less';

interface PermissionTableProps {
  permissionData: PermissionRow[];
  isEditing: boolean;
  onPermissionChange: (permissionId: string, checked: boolean) => void;
  selectedRole?: RoleData | null;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}

export const PermissionTable: FC<PermissionTableProps> = ({
  permissionData,
  isEditing,
  onPermissionChange,
  selectedRole,
  onEdit,
  onSave,
  onCancel,
}) => {
  // 按resource_name分组，参考权限分配弹出框的显示方式
  const groupedByResource: Record<string, PermissionRow[]> = permissionData.reduce(
    (acc, permission) => {
      const resourceName = permission.resourceName;
      if (!acc[resourceName]) {
        acc[resourceName] = [];
      }
      acc[resourceName].push(permission);
      return acc;
    },
    {},
  );

  return (
    <div className={styles.permissionTable}>
      <div className={styles.tableHeader}>
        <div className={styles.permissionColumn}>
          {t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TABLE_PERMISSION_COLUMN)}
        </div>
        <div className={styles.actionColumn}>
          <div className={styles.actionColumnContent}>
            <span>{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TABLE_ACTION_COLUMN)}</span>
            <div className={styles.headerActions}>
              {selectedRole?.is_builtin === 1 ? (
                <span className={styles.builtinNotice}>
                  内置角色不支持编辑权限
                </span>
              ) : (
                <>
                  {!isEditing ? (
                    <Button
                      theme="solid"
                      icon={<IconCozPencilPaper />}
                      onClick={onEdit}
                      size="small"
                    >
                      {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT)}
                    </Button>
                  ) : (
                    <div className={styles.editActions}>
                      <Button
                        icon={<IconCozCheckMarkCircleFillPalette />}
                        onClick={onSave}
                        theme="solid"
                        size="small"
                      >
                        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SAVE)}
                      </Button>
                      <Button
                        icon={<IconCozCrossCircleFillPalette />}
                        onClick={onCancel}
                        theme="borderless"
                        size="small"
                      >
                        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tableBody}>
        {Object.entries(groupedByResource).map(
          ([resourceName, actions], groupIndex) =>
            actions.map((action, index) => {
              const isLastInGroup = index === actions.length - 1;
              const isLastGroup =
                groupIndex === Object.entries(groupedByResource).length - 1;

              return (
                <div key={action.permissionId} className={styles.tableRow}>
                  {/* 只在每个资源组的第一行显示resource_name */}
                  {index === 0 && (
                    <div
                      className={styles.permissionCell}
                      style={{
                        gridRowEnd: `span ${actions.length}`,
                      }}
                    >
                      <div className={styles.permissionName}>
                        {resourceName}
                      </div>
                    </div>
                  )}
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
                          {action.actionName}
                        </div>
                        <div className={styles.actionDesc}>
                          {action.actionDescription}
                        </div>
                      </div>
                      <Checkbox
                        disabled={!isEditing}
                        checked={action.isChecked}
                        onChange={e =>
                          onPermissionChange(action.permissionId, e.target.checked || false)
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            }),
        )}
      </div>
    </div>
  );
};