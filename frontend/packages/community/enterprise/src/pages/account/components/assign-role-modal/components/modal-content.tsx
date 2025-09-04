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

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import { RoleListPanel } from './role-list-panel';
import { PermissionMatrixPanel } from './permission-matrix-panel';

import styles from '../index.module.less';

interface ModalContentProps {
  roles: RoleData[];
  rolesLoading: boolean;
  selectedRoles: Set<string>;
  selectedRoleForPreview: RoleData | null;
  roleDetailLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  onRoleSelect: (role: RoleData) => void;
  onRoleToggle: (role: RoleData, checked: boolean) => void;
}

export const ModalContent: FC<ModalContentProps> = ({
  roles,
  rolesLoading,
  selectedRoles,
  selectedRoleForPreview,
  roleDetailLoading,
  hasMore,
  loadMore,
  onRoleSelect,
  onRoleToggle,
}) => (
  <div className={styles.content}>
      {/* 左侧角色列表 */}
      <div className={styles.leftPanel}>
        <div className={styles.panelHeader}>
          <h3>{t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_ROLE_LIST_TITLE)}</h3>
        </div>
        <div className={styles.panelContent}>
          <RoleListPanel
            roles={roles}
            loading={rolesLoading}
            selectedRoles={selectedRoles}
            selectedRoleForPreview={selectedRoleForPreview}
            hasMore={hasMore}
            loadMore={loadMore}
            onRoleSelect={onRoleSelect}
            onRoleToggle={onRoleToggle}
          />
        </div>
      </div>

      {/* 右侧权限矩阵 */}
      <div className={styles.rightPanel}>
        <div className={styles.panelHeader}>
          <h3>{t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_PERMISSION_MATRIX_TITLE)}</h3>
        </div>
        <div className={styles.panelContent}>
          <PermissionMatrixPanel
            selectedRole={selectedRoleForPreview}
            loading={roleDetailLoading}
          />
        </div>
      </div>
    </div>
);