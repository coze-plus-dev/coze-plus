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

import {
  IconCozEmpty,
  IconCozPencilPaper,
  IconCozCheckMarkCircleFillPalette,
  IconCozCrossCircleFillPalette,
} from '@coze-arch/coze-design/icons';
import {
  Button,
  EmptyState,
  Checkbox,
  Spin,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';


import styles from './index.module.less';

interface PermissionMatrixProps {
  selectedRole: RoleData | null;
  permissionMatrix: Record<string, boolean>;
  setPermissionMatrix: (matrix: Record<string, boolean>) => void;
  onPermissionChange: (permissionId: string, checked: boolean) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PermissionMatrix: FC<PermissionMatrixProps> = ({
  selectedRole,
  permissionMatrix,
  onPermissionChange,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => {
  // 直接使用角色的权限数据，不再额外请求
  const permissionTemplates = selectedRole?.permissions || [];
  const loading = false;

  // 根据权限模板构建权限矩阵显示数据
  const permissionData = useMemo(() => {
    if (!permissionTemplates || permissionTemplates.length === 0) {
      return [];
    }

    // 将权限模板转换为矩阵显示格式 - 按resource_name分组，每个action独立一行
    const permissionRows: Array<{
      resourceName: string;
      actionName: string;
      actionDescription: string;
      isChecked: boolean;
      permissionId: string;
      isFirstInGroup: boolean;
      groupRowSpan: number;
    }> = [];

    // 先按resource_name分组收集数据
    const resourceGroups: Record<string, Array<{
      actionName: string;
      actionDescription: string;
      isChecked: boolean;
      permissionId: string;
    }>> = {};

    permissionTemplates.forEach(group => {
      group.resources?.forEach(resource => {
        const resourceName = resource.resource_name || resource.resource || '';
        if (!resourceGroups[resourceName]) {
          resourceGroups[resourceName] = [];
        }
        
        resource.actions?.forEach(action => {
          const permissionId = `${group.domain}_${resource.resource}_${action.action}`;
          resourceGroups[resourceName].push({
            actionName: action.action_name || action.action || '',
            actionDescription: action.description || '',
            isChecked: permissionMatrix[permissionId] || false,
            permissionId: permissionId
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
          groupRowSpan: actions.length
        });
      });
    });

    return permissionRows;
  }, [permissionTemplates, permissionMatrix]);


  if (!selectedRole) {
    return (
      <div className={styles.permissionMatrix}>
        <div className={styles.emptyContainer}>
          <EmptyState
            icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_SELECT_ROLE_TITLE)}
            description={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_SELECT_ROLE_DESCRIPTION)}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.permissionMatrix}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }


  return (
    <div className={styles.permissionMatrix}>
      <div className={styles.content}>
        {permissionData.length === 0 ? (
          <div className={styles.emptyContainer}>
            <EmptyState
              icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
              title={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_NO_DATA_TITLE)}
              description={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_NO_DATA_DESCRIPTION)}
            />
          </div>
        ) : (
          <div className={styles.permissionTable}>
            <div className={styles.tableHeader}>
              <div className={styles.permissionColumn}>{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TABLE_PERMISSION_COLUMN)}</div>
              <div className={styles.actionColumn}>
                <div className={styles.actionColumnContent}>
                  <span>{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TABLE_ACTION_COLUMN)}</span>
                  <div className={styles.headerActions}>
                    {/* 内置角色不支持编辑权限矩阵 */}
                    {selectedRole?.is_builtin !== 1 && (
                      <>
                        {!isEditing ? (
                          <Button theme="solid" size="small" icon={<IconCozPencilPaper />} onClick={onEdit}>
{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_EDIT_BUTTON)}
                          </Button>
                        ) : (
                          <div className={styles.editActions}>
                            <Button
                              theme="borderless"
                              size="small"
                              icon={<IconCozCrossCircleFillPalette />}
                              onClick={onCancel}
                            >
{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_CANCEL_BUTTON)}
                            </Button>
                            <Button theme="solid" size="small" icon={<IconCozCheckMarkCircleFillPalette />} onClick={onSave}>
{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_SAVE_BUTTON)}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                    {selectedRole?.is_builtin === 1 && (
                      <div className={styles.builtinNotice}>
{t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_BUILTIN_NOTICE)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className={styles.tableBody}>
              {permissionData.map((permissionRow, index) => {
                const isLastInGroup = index === permissionData.length - 1 || 
                  (index < permissionData.length - 1 && permissionData[index + 1].isFirstInGroup);
                
                return (
                  <div key={index} className={styles.tableRow}>
                    {/* 只在每个资源组的第一行显示resource_name */}
                    {permissionRow.isFirstInGroup && (
                      <div 
                        className={styles.permissionCell} 
                        style={{ 
                          gridRowEnd: `span ${permissionRow.groupRowSpan}`,
                        }}
                      >
                        <div className={styles.permissionName}>{permissionRow.resourceName}</div>
                      </div>
                    )}
                    <div 
                      className={styles.actionCell}
                      style={{
                        borderBottom: isLastInGroup 
                          ? '2px solid var(--semi-color-border)' 
                          : '1px solid var(--semi-color-fill-1)'
                      }}
                    >
                      <div className={styles.actionItem}>
                        <div className={styles.actionContent}>
                          <div className={styles.actionName}>{permissionRow.actionName}</div>
                          <div className={styles.actionDesc}>{permissionRow.actionDescription}</div>
                        </div>
                        <Checkbox
                          disabled={!isEditing || selectedRole?.is_builtin === 1}
                          checked={permissionRow.isChecked}
                          onChange={(e) => onPermissionChange(permissionRow.permissionId, e.target.checked || false)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
