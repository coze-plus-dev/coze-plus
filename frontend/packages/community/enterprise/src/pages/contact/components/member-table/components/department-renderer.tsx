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

import { Tag, Tooltip } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';
import type { EmployeeData } from '../hooks/use-member-table';

interface DepartmentRendererProps {
  departments: EmployeeData['departments'];
}

export const DepartmentRenderer: FC<DepartmentRendererProps> = ({
  departments = [],
}) => {
  if (!departments || departments.length === 0) {
    return <>-</>;
  }

  // 分离主部门和其他部门
  const primary = departments.find(dept => dept.is_primary);
  const others = departments.filter(dept => !dept.is_primary);

  return (
    <div className={styles.departmentContainer}>
      {primary ? (
        <Tooltip
          content={`${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_PRIMARY)}: ${primary.department_path || primary.department_name}`}
          position="top"
        >
          <Tag size="small" color="blue">
            {primary.department_name}
          </Tag>
        </Tooltip>
      ) : null}
      {others.slice(0, 2).map((dept, index) => (
        <Tooltip
          key={index}
          content={dept.department_path || dept.department_name}
          position="top"
        >
          <Tag size="small" color="grey">
            {dept.department_name}
          </Tag>
        </Tooltip>
      ))}
      {others.length > 2 && (
        <Tooltip
          content={
            <div>
              {others.slice(2).map((dept, index) => (
                <div key={index}>{dept.department_name}</div>
              ))}
            </div>
          }
          position="top"
        >
          <Tag size="small" color="grey">
            +{others.length - 2}
          </Tag>
        </Tooltip>
      )}
    </div>
  );
};
