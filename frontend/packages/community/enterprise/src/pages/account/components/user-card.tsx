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

import { IconCozMore } from '@coze-arch/coze-design/icons';
import { Button, Tag, Space, Avatar, Dropdown } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import type { UserData } from '../types';
import styles from '../index.module.less';

interface UserCardProps {
  item: UserData;
  onActionClick: (action: string, record: UserData) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

const UserCard: FC<UserCardProps> = ({ item, onActionClick, openDropdownId, setOpenDropdownId }) => {
  const renderStatus = (isDisabled?: number) => {
    if (isDisabled === 1) {
      return (
        <Tag color="magenta">
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_DISABLED)}
        </Tag>
      );
    }
    return (
      <Tag color="green">{t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_ENABLED)}</Tag>
    );
  };

  const renderAvatar = (record: UserData) => {
    if (record.icon_url) {
      return <Avatar src={record.icon_url} size="small" />;
    }
    return <Avatar size="small">{record.name?.charAt(0) || '?'}</Avatar>;
  };

  const handleMoreMenuClick = (action: string) => {
    // 如果用户被禁用，不允许操作
    if (item.is_disabled === 1) {
      return;
    }
    // 关闭下拉菜单
    setOpenDropdownId(null);
    onActionClick(action, item);
  };

  return (
    <div key={item.user_id} className={styles.userCard}>
      <div className={styles.userInfo}>
        <div className={styles.userHeader}>
          {renderAvatar(item)}
          <div className={styles.userTitle}>
            <Space>
              <span className={styles.userName}>{item.name || '-'}</span>
              {renderStatus(item.is_disabled)}
            </Space>
          </div>
        </div>
        <div className={styles.userDetails}>
          <div>
            {t(ENTERPRISE_I18N_KEYS.ACCOUNT_EMAIL)}: {item.email || '-'}
          </div>
          <div>
            {t(ENTERPRISE_I18N_KEYS.ACCOUNT_UNIQUE_NAME)}:{' '}
            {item.unique_name || '-'}
          </div>
          <div>
            {t(ENTERPRISE_I18N_KEYS.ACCOUNT_DESCRIPTION)}:{' '}
            {item.description || '-'}
          </div>
          <div>
            {t(ENTERPRISE_I18N_KEYS.ACCOUNT_CREATED_TIME)}:{' '}
            {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
          </div>
        </div>
      </div>
      <div className={styles.userActions}>
        <Button
          onClick={() => {
            const action = item.is_disabled === 1 ? 'enable' : 'disable';
            console.log(
              'User card button clicked - Action:',
              action,
              'User ID:',
              item.user_id,
            );
            onActionClick(action, item);
          }}
        >
          {item.is_disabled === 1
            ? t(ENTERPRISE_I18N_KEYS.ACCOUNT_ENABLE_ACTION)
            : t(ENTERPRISE_I18N_KEYS.ACCOUNT_DISABLE_ACTION)}
        </Button>
        <Dropdown
          trigger="click"
          position="bottomRight"
          spacing={4}
          visible={openDropdownId === item.user_id?.toString()}
          onVisibleChange={visible => {
            setOpenDropdownId(visible ? item.user_id?.toString() || '' : null);
          }}
          render={
            <div className="min-w-[120px] py-[4px]">
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => handleMoreMenuClick('assignRole')}
                >
                  {t(ENTERPRISE_I18N_KEYS.ACCOUNT_ASSIGN_ROLE)}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleMoreMenuClick('roleList')}>
                  {t(ENTERPRISE_I18N_KEYS.ACCOUNT_ROLE_LIST)}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => handleMoreMenuClick('resetPassword')}
                >
                  {t(ENTERPRISE_I18N_KEYS.ACCOUNT_RESET_PASSWORD)}
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>
          }
        >
          <Button icon={<IconCozMore />} disabled={item.is_disabled === 1} />
        </Dropdown>
      </div>
    </div>
  );
};

export default UserCard;
