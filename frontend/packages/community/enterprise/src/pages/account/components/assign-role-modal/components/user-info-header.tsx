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

import { Avatar, Tag } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { UserData } from '../../../types';

import styles from '../index.module.less';

interface UserInfoHeaderProps {
  user: UserData;
}

export const UserInfoHeader: FC<UserInfoHeaderProps> = ({ user }) => (
    <div className={styles.userInfoHeader}>
      <Avatar 
        src={user.icon_url} 
        size="small"
      >
        {user.name?.charAt(0) || '?'}
      </Avatar>
      <div className={styles.userInfo}>
        <div className={styles.userName}>{user.name}</div>
        <div className={styles.userEmail}>{user.email}</div>
      </div>
      <Tag 
        color={user.is_disabled === 1 ? 'magenta' : 'green'}
      >
        {user.is_disabled === 1 
          ? t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_DISABLED)
          : t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_ENABLED)
        }
      </Tag>
    </div>
);