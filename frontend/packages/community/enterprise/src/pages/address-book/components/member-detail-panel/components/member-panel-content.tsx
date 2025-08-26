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

import { type employee } from '@coze-studio/api-schema';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { DepartmentList } from './department-list';
import styles from '../index.module.less';

interface MemberPanelContentProps {
  employeeData: employee.employee.EmployeeData;
  renderField: (field: string, placeholder: string) => React.ReactNode;
}

export const MemberPanelContent: FC<MemberPanelContentProps> = ({
  employeeData,
  renderField,
}) => (
  <>
    <div className={styles.content}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_BASIC_INFO)}
        </div>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NAME)}:
            </span>
            {renderField(
              'name',
              t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_NAME),
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL)}:
            </span>
            {renderField(
              'email',
              t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMAIL),
            )}
          </div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE)}:
            </span>
            {renderField(
              'mobile',
              t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE),
            )}
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}
        </div>
        <div className={styles.fieldGroup}>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}:
            </span>
            <DepartmentList departments={employeeData.departments || []} />
          </div>
        </div>
      </div>
    </div>
  </>
);
