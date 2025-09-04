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

import { type permission } from '@coze-studio/api-schema';
import { IconCozLoose, IconCozRefresh, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Avatar, Tag, Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import type { UserData } from '../../../types';
import { useUnassignUserRole } from '../hooks/use-unassign-user-role';
import styles from '../index.module.less';

type RoleData = permission.permission.RoleData;

interface UserRolePanelContentProps {
  visible: boolean;
  user: UserData;
  userRoles: RoleData[];
  error: string | null;
  onClose: () => void;
  onRefresh: () => void;
}

// 头部组件
const PanelHeader: FC<{
  user: UserData;
  onClose: () => void;
  onRefresh: () => void;
}> = ({ user, onClose, onRefresh }) => (
  <div className={styles.header}>
    <div className={styles.headerLeft}>
      <Avatar size="large" className={styles.avatar} src={user.icon_url}>
        {user.name?.charAt(0) || 'U'}
      </Avatar>
      <div className={styles.basicInfo}>
        <div className={styles.userName}>
          {user.name}
          {user.is_disabled === 1 ? (
            <Tag color="red" size="small">
              {t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_DISABLED)}
            </Tag>
          ) : (
            <Tag color="green" size="small">
              {t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_ENABLED)}
            </Tag>
          )}
        </div>
        {user.user_id ? (
          <div className={styles.userId}>
            {t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_USER_ID)}: {user.user_id}
          </div>
        ) : null}
      </div>
    </div>
    <div className={styles.headerActions}>
      <Button
        theme="borderless"
        icon={<IconCozRefresh />}
        onClick={onRefresh}
        className={styles.closeButton}
        title={t(ENTERPRISE_I18N_KEYS.ACCOUNT_REFRESH)}
      />
      <Button
        theme="borderless"
        icon={<IconCozLoose />}
        onClick={onClose}
        className={styles.closeButton}
      />
    </div>
  </div>
);

// 基本信息组件
const BasicInfoSection: FC<{
  user: UserData;
}> = ({ user }) => (
  <div className={styles.section}>
    <div className={styles.sectionTitle}>
      {t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_BASIC_INFO)}
    </div>
    <div className={styles.infoGrid}>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_EMAIL)}
        </div>
        <div className={styles.value}>{user.email || '-'}</div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_UNIQUE_NAME)}
        </div>
        <div className={styles.value}>{user.unique_name || '-'}</div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_DESCRIPTION)}
        </div>
        <div className={styles.value}>{user.description || '-'}</div>
      </div>
      <div className={styles.infoItem}>
        <div className={styles.label}>
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_CREATED_TIME)}
        </div>
        <div className={styles.value}>
          {user.created_at ? new Date(user.created_at).toLocaleString() : '-'}
        </div>
      </div>
    </div>
  </div>
);

// 角色列表组件
const RoleListSection: FC<{
  user: UserData;
  userRoles: RoleData[];
  error: string | null;
  onRefresh: () => void;
}> = ({ user, userRoles, error, onRefresh }) => {
  const { unassignRole, loading: unassigning } = useUnassignUserRole(onRefresh);
  const renderRoleContent = () => {
    if (error) {
      return (
        <div className={styles.errorValue}>
          {error}
        </div>
      );
    }

    if (!userRoles || userRoles.length === 0) {
      return (
        <div className={styles.emptyValue}>
          {t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_ROLE_EMPTY)}
        </div>
      );
    }

    return (
      <div className={styles.roleList}>
        {userRoles.map((role, index) => (
          <div key={role.id || index} className={styles.roleItem}>
            <div className={styles.roleHeader}>
              <div className={styles.roleLeft}>
                <div className={styles.roleName}>
                  {role.role_name || t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_ROLE_NAME)}
                </div>
                {role.role_code && (
                  <div className={styles.roleCode}>
                    {role.role_code}
                  </div>
                )}
              </div>
              <div className={styles.roleActions}>
                <Button
                  theme="borderless"
                  type="danger"
                  icon={<IconCozTrashCan />}
                  size="small"
                  title={t(ENTERPRISE_I18N_KEYS.USER_ROLE_UNASSIGN_BUTTON)}
                  loading={unassigning}
                  onClick={() => user.user_id && unassignRole(user.user_id, role)}
                  className={styles.unassignButton}
                />
              </div>
            </div>
            {role.description && (
              <div className={styles.roleDescription}>
                {role.description}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        {t(ENTERPRISE_I18N_KEYS.USER_ROLE_DETAIL_ROLE_LIST)}
      </div>
      <div className={styles.roleSection}>
        {renderRoleContent()}
      </div>
    </div>
  );
};

export const UserRolePanelContent: FC<UserRolePanelContentProps> = props => {
  const {
    visible,
    user,
    userRoles,
    error,
    onClose,
    onRefresh,
  } = props;

  return (
    <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
      <PanelHeader
        user={user}
        onClose={onClose}
        onRefresh={onRefresh}
      />

      <div className={styles.content}>
        <BasicInfoSection user={user} />
        <RoleListSection 
          user={user} 
          userRoles={userRoles} 
          error={error} 
          onRefresh={onRefresh}
        />
      </div>
    </div>
  );
};