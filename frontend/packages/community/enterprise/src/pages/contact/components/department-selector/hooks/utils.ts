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

export interface TreeNode {
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

// 确保主部门逻辑：确保只有一个主部门，如果没有主部门则将第一个设为主部门
export const ensurePrimaryDepartment = (
  depts: employee.employee.EmployeeDepartmentInfo[],
) => {
  if (depts.length === 0) {
    return depts;
  }

  // 找到所有主部门
  const primaryDepts = depts.filter(d => d.is_primary);

  if (primaryDepts.length === 0) {
    // 如果没有主部门，将第一个设为主部门
    return depts.map((dept, index) => ({
      ...dept,
      is_primary: index === 0,
    }));
  } else if (primaryDepts.length === 1) {
    // 如果只有一个主部门，保持现有状态
    return depts;
  } else {
    // 如果有多个主部门，只保留第一个主部门，其他的设为非主部门
    let firstPrimaryIndex = -1;

    // 找到第一个主部门的索引
    for (let i = 0; i < depts.length; i++) {
      if (depts[i].is_primary) {
        firstPrimaryIndex = i;
        break;
      }
    }

    return depts.map((dept, index) => ({
      ...dept,
      is_primary: index === firstPrimaryIndex,
    }));
  }
};

// 过滤树节点
export const filterTreeData = (
  data: TreeNode[],
  searchValue: string,
): TreeNode[] => {
  if (!searchValue) {
    return data;
  }

  const filterNode = (node: TreeNode): TreeNode | null => {
    const matches = node.title
      .toLowerCase()
      .includes(searchValue.toLowerCase());

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
