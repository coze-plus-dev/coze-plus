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

import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from './index.module.less';

interface RolePageHeaderProps {
  onCreateRole: () => void;
}

export const RolePageHeader: FC<RolePageHeaderProps> = ({ onCreateRole }) => {
  return (
    <div className={styles.header}>
      <h1 className={styles.title}>
        {t(ENTERPRISE_I18N_KEYS.ROLE_MANAGEMENT_TITLE)}
      </h1>
      <Button
        theme="solid"
        icon={<IconCozPlus />}
        onClick={onCreateRole}
      >
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
      </Button>
    </div>
  );
};