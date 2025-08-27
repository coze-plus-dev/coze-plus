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

import { type FC } from 'react';

import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { Modal, Checkbox, Spin, EmptyState } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import { usePermissionAssignment } from './use-permission-assignment';

import styles from './index.module.less';

interface AssignPermissionsModalProps {
  visible: boolean;
  role: RoleData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AssignPermissionsModal: FC<AssignPermissionsModalProps> = ({
  visible,
  role,
  onClose,
  onSuccess,
}) => {
  const {
    permissionTemplates,
    selectedPermissions,
    loading,
    submitting,
    handlePermissionChange,
    handleSubmit,
  } = usePermissionAssignment({ visible, role, onSuccess });

  // 按resource_name分组，参考权限矩阵的显示方式
  const groupedByResource: Record<
    string,
    Array<{
      id: string;
      actionName: string;
      actionDescription: string;
      resourceName: string;
    }>
  > = permissionTemplates.reduce(
    (acc, group) => {
      group.resources?.forEach(resource => {
        const resourceName = resource.resource_name || resource.resource || '';
        if (!acc[resourceName]) {
          acc[resourceName] = [];
        }

        resource.actions?.forEach(action => {
          acc[resourceName].push({
            id: action.id,
            actionName: action.action_name || action.action || '',
            actionDescription: action.description || '',
            resourceName,
          });
        });
      });
      return acc;
    },
    {},
  );

  return (
    <Modal
      visible={visible}
      title={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_ASSIGN_TITLE, {
        roleName: role?.role_name || '',
      })}
      onCancel={onClose}
      onOk={handleSubmit}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SAVE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      okButtonProps={{ loading: submitting }}
      width={800}
      className={styles.assignPermissionsModal}
    >
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      ) : Object.keys(groupedByResource).length === 0 ? (
        <div className={styles.emptyContainer}>
          <EmptyState
            icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TEMPLATE_EMPTY_TITLE)}
            description={t(
              ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_TEMPLATE_EMPTY_DESCRIPTION,
            )}
          />
        </div>
      ) : (
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
            {Object.entries(groupedByResource).map(
              ([resourceName, actions], groupIndex) =>
                actions.map((action, index) => {
                  const isLastInGroup = index === actions.length - 1;
                  const isLastGroup =
                    groupIndex === Object.entries(groupedByResource).length - 1;

                  return (
                    <div key={action.id} className={styles.tableRow}>
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
                            checked={selectedPermissions.includes(action.id)}
                            onChange={e =>
                              handlePermissionChange(
                                action.id,
                                e.target.checked || false,
                              )
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
      )}
    </Modal>
  );
};
