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

import type { corporation } from '@coze-studio/api-schema';

import { corporationApi } from '../api/corporation-api';

export interface TreeNode {
  key: string;
  title: string;
  children?: TreeNode[];
  isLeaf?: boolean;
  nodeType: 'corp' | 'dept';
  employeeCount?: number;
  icon?: React.ReactNode;
  selectable?: boolean;
  // 新增优化字段
  parentId?: string;
  businessParentId?: string;
  corpId?: string;
  deptId?: string;
  level?: number;
}

type ApiNodeData = corporation.corporation.CorporationTreeNode;

interface UseOrganizationTreeOptions {
  corpId?: string;
  includeDepartments?: boolean;
  includeEmployeeCount?: boolean;
  depth?: number;
}

export const useOrganizationTree = (
  options: UseOrganizationTreeOptions = {},
) => {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const {
    corpId,
    includeDepartments = true,
    includeEmployeeCount = true,
    depth = 0,
  } = options;

  const transformToTreeNode = useCallback(
    (node: ApiNodeData): TreeNode => {
      const treeNode: TreeNode = {
        key: node.id,
        title: node.name,
        nodeType: node.node_type as 'corp' | 'dept',
        isLeaf: !node.has_children,
        selectable: node.node_type === 'dept',
        // 映射优化后的字段
        parentId: node.parent_id,
        businessParentId: node.business_parent_id,
        corpId: node.corp_id,
        deptId: node.dept_id,
      };

      // 保存员工数量但不在标题中显示
      if (includeEmployeeCount && node.employee_count !== undefined) {
        treeNode.employeeCount = node.employee_count;
      }

      if (node.children && node.children.length > 0) {
        treeNode.children = node.children.map((child: ApiNodeData) =>
          transformToTreeNode(child),
        );
      }

      return treeNode;
    },
    [includeEmployeeCount],
  );

  const fetchOrganizationTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await corporationApi.getOrganizationTree({
        corp_id: corpId,
        include_departments: includeDepartments,
        include_employee_count: includeEmployeeCount,
        depth,
      });

      const transformedData = data.map((node: ApiNodeData) =>
        transformToTreeNode(node),
      );
      setTreeData(transformedData);
    } catch (err) {
      setError(err as Error);
      console.error('Failed to fetch organization tree:', err);
    } finally {
      setLoading(false);
    }
  }, [
    corpId,
    includeDepartments,
    includeEmployeeCount,
    depth,
    transformToTreeNode,
  ]);

  useEffect(() => {
    fetchOrganizationTree();
  }, [fetchOrganizationTree]);

  return {
    treeData,
    loading,
    error,
    refetch: fetchOrganizationTree,
  };
};
