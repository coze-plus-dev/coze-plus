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

import { useState, useEffect, useCallback } from 'react';

import { useRequest } from 'ahooks';
import { type employee } from '@coze-studio/api-schema';

import { corporationApi } from '@/api/corporation-api';

import { type TreeNode, ensurePrimaryDepartment } from './utils';
import { processOrgTreeData } from './tree-data-converter';
import {
  handleNodeSelection,
  handleDeptRemoval,
  handlePrimaryDeptSetting,
} from './department-handlers';

interface UseDepartmentSelectorProps {
  value?: employee.employee.EmployeeDepartmentInfo[];
  onChange?: (value: employee.employee.EmployeeDepartmentInfo[]) => void;
  multiple?: boolean;
}

export const useDepartmentSelector = ({
  value = [],
  onChange,
}: UseDepartmentSelectorProps) => {
  const [visible, setVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<
    employee.employee.EmployeeDepartmentInfo[]
  >([]);

  // 获取组织架构树
  const { loading, run: fetchOrgTree } = useRequest(
    async () => {
      const result = await corporationApi.getOrganizationTree({
        include_departments: true,
        depth: 10,
      });
      return result;
    },
    {
      manual: true,
      onSuccess: data => {
        const {
          treeData: processedTreeData,
          expandedKeys: processedExpandedKeys,
        } = processOrgTreeData(data);
        setTreeData(processedTreeData);
        setExpandedKeys(processedExpandedKeys);
      },
    },
  );

  // 打开选择器时加载数据
  useEffect(() => {
    if (visible && treeData.length === 0) {
      fetchOrgTree();
    }
  }, [visible, treeData.length, fetchOrgTree]);

  // 从value初始化选中的部门
  useEffect(() => {
    const initDepts = ensurePrimaryDepartment([...value]);
    setSelectedDepts(initDepts);
    const keys = initDepts.map(item => `dept_${item.department_id}`);
    setSelectedKeys(keys);
  }, [value]);

  // 当弹窗关闭时清理状态
  useEffect(() => {
    if (!visible) {
      setSearchValue('');
    }
  }, [visible]);

  // 处理确认
  const handleConfirm = useCallback(() => {
    onChange?.(selectedDepts);
    setVisible(false);
  }, [onChange, selectedDepts]);

  // 处理清空
  const handleClear = useCallback(() => {
    setSelectedKeys([]);
    setSelectedDepts([]);
  }, []);

  // 处理节点选择
  const handleNodeSelect = useCallback(
    (key: string, checked: boolean, node: TreeNode) => {
      const { newKeys, newDepts } = handleNodeSelection({
        key,
        checked,
        node,
        selectedKeys,
        selectedDepts,
      });
      setSelectedKeys(newKeys);
      setSelectedDepts(newDepts);
    },
    [selectedKeys, selectedDepts],
  );

  // 移除已选部门
  const handleRemoveDept = useCallback(
    (deptId: string) => {
      const { newKeys, newDepts } = handleDeptRemoval({
        deptId,
        selectedKeys,
        selectedDepts,
      });
      setSelectedKeys(newKeys);
      setSelectedDepts(newDepts);
    },
    [selectedKeys, selectedDepts],
  );

  // 设置主部门
  const handleSetPrimary = useCallback(
    (deptId: string) => {
      const newDepts = handlePrimaryDeptSetting(deptId, selectedDepts);
      setSelectedDepts(newDepts);
    },
    [selectedDepts],
  );

  return {
    visible,
    setVisible,
    searchValue,
    setSearchValue,
    selectedKeys,
    expandedKeys,
    setExpandedKeys,
    treeData,
    selectedDepts,
    loading,
    handleConfirm,
    handleClear,
    handleNodeSelect,
    handleRemoveDept,
    handleSetPrimary,
  };
};
