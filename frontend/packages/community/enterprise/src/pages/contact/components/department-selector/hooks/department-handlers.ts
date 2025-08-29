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

import { type TreeNode, ensurePrimaryDepartment } from './utils';

interface NodeSelectionParams {
  key: string;
  checked: boolean;
  node: TreeNode;
  selectedKeys: string[];
  selectedDepts: employee.employee.EmployeeDepartmentInfo[];
}

// 处理节点选择的业务逻辑
export const handleNodeSelection = ({
  key,
  checked,
  node,
  selectedKeys,
  selectedDepts,
}: NodeSelectionParams): {
  newKeys: string[];
  newDepts: employee.employee.EmployeeDepartmentInfo[];
} => {
  if (node.isOrg) {
    return { newKeys: selectedKeys, newDepts: selectedDepts };
  }

  let newKeys = [...selectedKeys];
  let newDepts = [...selectedDepts];

  if (checked) {
    if (!selectedKeys.includes(key)) {
      newKeys.push(key);
      if (node.deptId && node.corpId) {
        newDepts.push({
          department_id: node.deptId,
          department_name: node.deptName || '',
          corp_id: node.corpId,
          corp_name: node.corpName || '',
          is_primary: false,
        });
      }
    }
  } else {
    newKeys = selectedKeys.filter(k => k !== key);
    newDepts = selectedDepts.filter(d => `dept_${d.department_id}` !== key);
  }

  // 重新整理主部门状态
  newDepts = ensurePrimaryDepartment(newDepts);

  return { newKeys, newDepts };
};

interface DeptRemovalParams {
  deptId: string;
  selectedKeys: string[];
  selectedDepts: employee.employee.EmployeeDepartmentInfo[];
}

// 处理移除部门的业务逻辑
export const handleDeptRemoval = ({
  deptId,
  selectedKeys,
  selectedDepts,
}: DeptRemovalParams): {
  newKeys: string[];
  newDepts: employee.employee.EmployeeDepartmentInfo[];
} => {
  const key = `dept_${deptId}`;
  const newKeys = selectedKeys.filter(k => k !== key);
  let newDepts = selectedDepts.filter(d => d.department_id !== deptId);

  // 统一使用ensurePrimaryDepartment处理主部门逻辑
  newDepts = ensurePrimaryDepartment(newDepts);

  return { newKeys, newDepts };
};

// 处理设置主部门的业务逻辑
export const handlePrimaryDeptSetting = (
  deptId: string,
  selectedDepts: employee.employee.EmployeeDepartmentInfo[],
): employee.employee.EmployeeDepartmentInfo[] =>
  // 确保只有指定的部门是主部门，其他都不是主部门
  selectedDepts.map(dept => ({
    ...dept,
    is_primary: dept.department_id === deptId,
  }));
