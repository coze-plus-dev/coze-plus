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

import { type FC, useState } from 'react';

import { IconCozMore, IconCozEmpty } from '@coze-arch/coze-design/icons';
import {
  Spin,
  EmptyState,
  Dropdown,
  Button,
  Tag,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import styles from './index.module.less';

interface RoleListProps {
  roles: RoleData[];
  loading: boolean;
  selectedRole: RoleData | null;
  onRoleSelect: (role: RoleData) => void;
  onEditRole: (role: RoleData) => void;
  onDeleteRole: (role: RoleData) => void;
  onAssignPermissions: (role: RoleData) => void;
}

export const RoleList: FC<RoleListProps> = ({
  roles,
  loading,
  selectedRole,
  onRoleSelect,
  onEditRole,
  onDeleteRole,
  onAssignPermissions,
}) => {
  const [_hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (roles.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <EmptyState
          icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
          title={t(ENTERPRISE_I18N_KEYS.ROLE_LIST_EMPTY_TITLE)}
          description={t(ENTERPRISE_I18N_KEYS.ROLE_LIST_EMPTY_DESCRIPTION)}
        />
      </div>
    );
  }

  return (
    <div className={styles.roleList}>
      {roles.map((role, index) => {
        const hasNoPermissions =
          !role.permissions ||
          !Array.isArray(role.permissions) ||
          role.permissions.length === 0 ||
          role.permissions.every(
            group =>
              !group.resources ||
              !Array.isArray(group.resources) ||
              group.resources.length === 0 ||
              group.resources.every(
                resource =>
                  !resource.actions ||
                  !Array.isArray(resource.actions) ||
                  resource.actions.length === 0,
              ),
          );

        return (
          <div
            key={role.id || `role-${index}`}
            className={`${styles.roleCard} ${
              selectedRole?.id === role.id ? styles.selected : ''
            }`}
            onClick={() => {
              if (hasNoPermissions) {
                onAssignPermissions(role);
              } else {
                onRoleSelect(role);
              }
            }}
            onMouseEnter={() => setHoveredRole(role.id || null)}
            onMouseLeave={() => setHoveredRole(null)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.headerLeft}>
                <h3 className={styles.roleName}>{role.role_name}</h3>
                <Tag
                  className={styles.roleTag}
                  color={role.is_builtin === 1 ? 'green' : 'grey'}
                >
                  {role.is_builtin === 1
                    ? t(ENTERPRISE_I18N_KEYS.ROLE_BUILTIN_TAG)
                    : t(ENTERPRISE_I18N_KEYS.ROLE_CUSTOM_TAG)}
                </Tag>
              </div>
              {role.is_builtin !== 1 && (
                <Dropdown
                  trigger="click"
                  position="bottomRight"
                  visible={openDropdownId === role.id?.toString()}
                  onVisibleChange={visible => {
                    setOpenDropdownId(
                      visible ? role.id?.toString() || '' : null,
                    );
                  }}
                  render={
                    <div className="min-w-[120px] py-[4px]">
                      <Dropdown.Menu>
                        <Dropdown.Item
                          onClick={(_value: string, event) => {
                            event?.stopPropagation?.();
                            setOpenDropdownId(null); // 关闭下拉菜单
                            onEditRole(role);
                          }}
                        >
                          <span>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT)}</span>
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={(_value: string, event) => {
                            event?.stopPropagation?.();
                            setOpenDropdownId(null); // 关闭下拉菜单
                            onDeleteRole(role);
                          }}
                        >
                          <span>
                            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE)}
                          </span>
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </div>
                  }
                >
                  <Button
                    theme="borderless"
                    icon={<IconCozMore />}
                    size="small"
                    className={styles.moreButton}
                    onClick={e => e?.stopPropagation?.()}
                  />
                </Dropdown>
              )}
            </div>

            <div className={styles.cardContent}>
              <p className={styles.roleDescription}>
                {role.description ||
                  t(ENTERPRISE_I18N_KEYS.ROLE_NO_DESCRIPTION)}
              </p>
              <div className={styles.roleCodeRow}>
                <div className={styles.roleCode}>{role.role_code}</div>
                {hasNoPermissions ? (
                  <div className={styles.noPermissionBadge}>
                    {t(ENTERPRISE_I18N_KEYS.ROLE_NO_PERMISSION_TAG)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
