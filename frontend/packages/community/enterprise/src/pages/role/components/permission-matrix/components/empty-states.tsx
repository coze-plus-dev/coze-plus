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

import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { EmptyState, Spin } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';

export const NoRoleSelected: FC = () => (
  <div className={styles.permissionMatrix}>
    <div className={styles.emptyContainer}>
      <EmptyState
        icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
        title={t(
          ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_SELECT_ROLE_TITLE,
        )}
        description={t(
          ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_SELECT_ROLE_DESCRIPTION,
        )}
      />
    </div>
  </div>
);

export const LoadingState: FC = () => (
  <div className={styles.permissionMatrix}>
    <div className={styles.loadingContainer}>
      <Spin size="large" />
    </div>
  </div>
);

export const NoPermissions: FC = () => (
  <div className={styles.emptyContainer}>
    <EmptyState
      icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
      title={t(ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_NO_PERMISSIONS_TITLE)}
      description={t(
        ENTERPRISE_I18N_KEYS.ROLE_PERMISSION_MATRIX_NO_PERMISSIONS_DESCRIPTION,
      )}
    />
  </div>
);