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

import { useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';

import { useOrganizationTree } from '@/hooks/use-organization-tree';

import { useTreeHandlers } from './hooks/use-tree-handlers';
import { TreeContent } from './components/tree-content';
import { EditOrganizationModal } from '../edit-organization-modal';
import { EditDepartmentModal } from '../edit-department-modal';

interface NodeInfo {
  name: string;
  corpId?: string;
  deptId?: string;
  nodeData?: unknown;
}

interface OrgTreeProps {
  onSelectNode?: (
    id: string,
    nodeType: 'corp' | 'dept',
    nodeInfo?: NodeInfo,
  ) => void;
  onRefresh?: () => void;
  onCollapse?: () => void;
}

export interface OrgTreeRef {
  refresh: () => void;
}

const OrgTree = forwardRef<OrgTreeRef, OrgTreeProps>(
  ({ onSelectNode, onRefresh, onCollapse }, ref) => {
    const { treeData, loading, error, refetch } = useOrganizationTree({
      includeDepartments: true,
      includeEmployeeCount: true,
    });

    const {
      selectedKeys,
      expandedKeys,
      editOrgVisible,
      editDeptVisible,
      editingNodeId,
      dropdownVisible,
      setDropdownVisible,
      setEditOrgVisible,
      setEditDeptVisible,
      setEditingNodeId,
      handleSelect,
      handleExpand,
      handleMenuClick,
      handleEditOrgSuccess,
      handleEditDeptSuccess,
    } = useTreeHandlers({ onSelectNode, onRefresh, refetch });

    // 暴露refresh方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        refresh: refetch,
      }),
      [refetch],
    );

    // 自动展开所有企业节点
    const defaultExpandedKeys = useMemo(() => {
      const keys: string[] = [];
      const traverse = (nodes: typeof treeData) => {
        nodes.forEach(node => {
          if (node.nodeType === 'corp') {
            keys.push(node.key);
          }
          if (node.children) {
            traverse(node.children);
          }
        });
      };
      traverse(treeData);
      return keys;
    }, [treeData]);

    // 获取顶级企业节点
    const topLevelCorp = useMemo(
      () =>
        treeData.find(
          node =>
            node.nodeType === 'corp' &&
            (!node.businessParentId ||
              node.businessParentId === '' ||
              node.businessParentId === null ||
              node.level === 0 ||
              !node.parentId ||
              node.parentId === '' ||
              node.parentId === null),
        ),
      [treeData],
    );

    // 当树数据加载完成且没有选中节点时，自动选中顶级企业
    useEffect(() => {
      if (topLevelCorp && selectedKeys.length === 0 && treeData.length > 0) {
        handleSelect(topLevelCorp.key, true, topLevelCorp);
      }
    }, [topLevelCorp, selectedKeys.length, treeData.length, handleSelect]);

    return (
      <>
        <TreeContent
          loading={loading}
          error={error}
          treeData={treeData}
          selectedKeys={selectedKeys}
          expandedKeys={expandedKeys}
          defaultExpandedKeys={defaultExpandedKeys}
          dropdownVisible={dropdownVisible}
          onSelect={handleSelect}
          onExpand={handleExpand}
          onMenuClick={handleMenuClick}
          setDropdownVisible={setDropdownVisible}
          onCollapse={onCollapse}
        />

        <EditOrganizationModal
          visible={editOrgVisible}
          organizationId={editingNodeId}
          onClose={() => {
            setEditOrgVisible(false);
            setEditingNodeId('');
          }}
          onSuccess={handleEditOrgSuccess}
        />

        <EditDepartmentModal
          visible={editDeptVisible}
          departmentId={editingNodeId}
          onClose={() => {
            setEditDeptVisible(false);
            setEditingNodeId('');
          }}
          onSuccess={handleEditDeptSuccess}
        />
      </>
    );
  },
);

OrgTree.displayName = 'OrgTree';

export { OrgTree };
