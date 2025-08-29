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
import {
  IconCozArrowDown,
  IconCozTrashCan,
} from '@coze-arch/coze-design/icons';

import styles from '../index.module.less';
import { ensurePrimaryDepartment } from '../hooks/utils';

interface SelectorTriggerProps {
  value: employee.employee.EmployeeDepartmentInfo[];
  placeholder?: string;
  onChange?: (value: employee.employee.EmployeeDepartmentInfo[]) => void;
  onClick: () => void;
}

export const SelectorTrigger: FC<SelectorTriggerProps> = ({
  value,
  placeholder,
  onChange,
  onClick,
}) => {
  const renderContent = () => {
    if (value.length === 0) {
      return (
        <span style={{ color: 'var(--semi-color-text-2)' }}>{placeholder}</span>
      );
    }

    return (
      <div className={styles.selectedTags}>
        {value.map(dept => (
          <div key={dept.department_id} className={styles.tagItem}>
            <span>
              {dept.corp_name} - {dept.department_name}
            </span>
            <IconCozTrashCan
              className={styles.removeIcon}
              onClick={e => {
                e.stopPropagation();
                const newValue = value.filter(
                  item => item.department_id !== dept.department_id,
                );

                // 重新整理主部门状态：确保有主部门且只有一个主部门
                const finalValue = ensurePrimaryDepartment(newValue);
                onChange?.(finalValue);
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.selectorTrigger} onClick={onClick}>
      <div className={styles.valueContainer}>{renderContent()}</div>
      <IconCozArrowDown className={styles.arrow} />
    </div>
  );
};
