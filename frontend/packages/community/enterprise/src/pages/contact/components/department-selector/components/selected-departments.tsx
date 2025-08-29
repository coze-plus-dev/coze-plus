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
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Button, Empty } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';

interface SelectedDepartmentsProps {
  selectedDepts: employee.employee.EmployeeDepartmentInfo[];
  onClear: () => void;
  onRemoveDept: (deptId: string) => void;
  onSetPrimary: (deptId: string) => void;
}

export const SelectedDepartments: FC<SelectedDepartmentsProps> = ({
  selectedDepts,
  onClear,
  onRemoveDept,
  onSetPrimary,
}) => (
  <div className={styles.rightPanel}>
    <div className={styles.selectedHeader}>
      <span>
        {t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_PUBLISH_PERMISSION_CONTROL_PAGE_REMOVE_CHOSEN,
        )}
        ：{selectedDepts.length} {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}
      </span>
      <Button
        size="small"
        theme="borderless"
        onClick={onClear}
        disabled={selectedDepts.length === 0}
      >
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ANALYTIC_QUERY_CLEAR)}
      </Button>
    </div>
    <div className={styles.selectedList}>
      {selectedDepts.length === 0 ? (
        <Empty
          description={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_QUERY_DATA_EMPTY)}
        />
      ) : (
        selectedDepts.map(dept => (
          <div key={dept.department_id} className={styles.selectedItem}>
            <div className={styles.deptInfo}>
              <div className={styles.deptNameWithTag}>
                <div className={styles.corpName}>{dept.corp_name}</div>
                <div className={styles.deptName}>
                  {dept.department_name}
                  {dept.is_primary ? (
                    <span className={styles.primaryTag}>
                      {t(
                        ENTERPRISE_I18N_KEYS.ENTERPRISE_PRIMARY_DEPARTMENT_TAG,
                      )}
                    </span>
                  ) : null}
                </div>
              </div>
              {!dept.is_primary && selectedDepts.length > 1 && (
                <Button
                  size="small"
                  theme="borderless"
                  className={styles.setPrimaryBtn}
                  onClick={() => onSetPrimary(dept.department_id)}
                >
                  {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SET_PRIMARY_DEPARTMENT)}
                </Button>
              )}
            </div>
            <IconCozTrashCan
              className={styles.removeBtn}
              onClick={() => onRemoveDept(dept.department_id)}
            />
          </div>
        ))
      )}
    </div>
  </div>
);
