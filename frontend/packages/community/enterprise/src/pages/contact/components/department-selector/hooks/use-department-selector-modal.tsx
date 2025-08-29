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

import { type employee } from '@coze-studio/api-schema';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';

interface UseDepartmentSelectorModalProps {
  selectedDepts: employee.employee.EmployeeDepartmentInfo[];
  handleRemoveDept: (deptId: string) => void;
  handleSetPrimary: (deptId: string) => void;
  handleClear: () => void;
  handleConfirm: () => void;
}

export const useDepartmentSelectorModal = ({
  selectedDepts,
  handleRemoveDept,
  handleSetPrimary,
  handleClear,
  handleConfirm,
}: UseDepartmentSelectorModalProps) => {
  const renderSelectedList = () => {
    if (selectedDepts.length === 0) {
      return null;
    }

    return selectedDepts.map(dept => (
      <div key={dept.department_id} className={styles.selectedItem}>
        <div className={styles.deptInfo}>
          <div className={styles.deptNameWithTag}>
            <div className={styles.corpName}>{dept.corp_name}</div>
            <div className={styles.deptName}>
              {dept.department_name}
              {dept.is_primary ? (
                <span className={styles.primaryTag}>
                  {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PRIMARY_DEPARTMENT_TAG)}
                </span>
              ) : null}
            </div>
          </div>
          {!dept.is_primary && selectedDepts.length > 1 && (
            <Button
              size="small"
              theme="borderless"
              className={styles.setPrimaryBtn}
              onClick={() => handleSetPrimary(dept.department_id)}
            >
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SET_PRIMARY_DEPARTMENT)}
            </Button>
          )}
        </div>
        <IconCozTrashCan
          className={styles.removeBtn}
          onClick={() => handleRemoveDept(dept.department_id)}
        />
      </div>
    ));
  };

  const renderModalFooter = (onCancel: () => void) => (
    <div className={styles.modalFooter}>
      <Button onClick={onCancel}>
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      </Button>
      <Button
        theme="solid"
        onClick={handleConfirm}
        disabled={selectedDepts.length === 0}
      >
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CONFIRM)}
      </Button>
    </div>
  );

  const renderSelectedHeader = () => (
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
        onClick={handleClear}
        disabled={selectedDepts.length === 0}
      >
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ANALYTIC_QUERY_CLEAR)}
      </Button>
    </div>
  );

  return {
    renderSelectedList,
    renderModalFooter,
    renderSelectedHeader,
  };
};
