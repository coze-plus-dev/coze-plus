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

import styles from '../index.module.less';

interface TreeNode {
  key: string;
  label?: string;
  title: string;
  value?: string;
  children?: TreeNode[];
  isOrg?: boolean;
  corpId?: string;
  corpName?: string;
  deptId?: string;
  deptName?: string;
  disabled?: boolean;
}

interface UseDepartmentSelectorRenderProps {
  value: employee.employee.EmployeeDepartmentInfo[];
  placeholder?: string;
  onChange?: (value: employee.employee.EmployeeDepartmentInfo[]) => void;
  ensurePrimaryDepartment: (
    depts: employee.employee.EmployeeDepartmentInfo[],
  ) => employee.employee.EmployeeDepartmentInfo[];
}

export const useDepartmentSelectorRender = ({
  value,
  placeholder,
  onChange,
  ensurePrimaryDepartment,
}: UseDepartmentSelectorRenderProps) => {
  const renderTrigger = () => {
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
                const finalValue = ensurePrimaryDepartment(newValue);
                onChange?.(finalValue);
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const filterTreeData = (
    data: TreeNode[],
    filterValue: string,
  ): TreeNode[] => {
    if (!filterValue) {
      return data;
    }

    const filterNode = (node: TreeNode): TreeNode | null => {
      const matches = node.title
        .toLowerCase()
        .includes(filterValue.toLowerCase());

      if (node.children) {
        const filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(Boolean) as TreeNode[];

        if (filteredChildren.length > 0 || matches) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
      }

      return matches ? node : null;
    };

    return data.map(node => filterNode(node)).filter(Boolean) as TreeNode[];
  };

  const renderTreeLabel = (label: React.ReactNode, node?: TreeNode) => {
    if (!node) {
      return label;
    }

    const isDisabled = node.isOrg;

    return (
      <span className={isDisabled ? styles.orgNode : styles.deptNode}>
        {label}
      </span>
    );
  };

  return {
    renderTrigger,
    filterTreeData,
    renderTreeLabel,
  };
};
