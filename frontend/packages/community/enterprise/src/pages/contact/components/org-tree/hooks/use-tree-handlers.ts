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

import { useState, useCallback } from 'react';

import { Toast, Modal } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { corporationApi, departmentApi } from '@/api/corporation-api';

interface NodeInfo {
  name: string;
  corpId?: string;
  deptId?: string;
  nodeData?: unknown;
}

interface UseTreeHandlersProps {
  onSelectNode?: (
    id: string,
    nodeType: 'corp' | 'dept',
    nodeInfo?: NodeInfo,
  ) => void;
  onRefresh?: () => void;
  refetch: () => void;
}

const createDeleteHandler =
  (
    node: { key: string; title: string; nodeType: 'corp' | 'dept' },
    refetch: () => void,
    onRefresh?: () => void,
  ) =>
  async () => {
    try {
      if (node.nodeType === 'corp') {
        await corporationApi.deleteCorporation(node.key);
      } else {
        await departmentApi.deleteDepartment(node.key);
      }
      Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_SUCCESS));
      refetch();
      onRefresh?.();
    } catch (deleteError: unknown) {
      const errorObj = deleteError as { message?: string };
      Toast.error(
        errorObj.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_FAILED),
      );
    }
  };

export const useTreeHandlers = ({
  onSelectNode,
  onRefresh,
  refetch,
}: UseTreeHandlersProps) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [editOrgVisible, setEditOrgVisible] = useState(false);
  const [editDeptVisible, setEditDeptVisible] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);

  const handleSelect = useCallback(
    (selectedKey: string, selected: boolean, selectedNode: unknown) => {
      const node = selectedNode as {
        nodeType: 'corp' | 'dept';
        title: string;
        corpId?: string;
        deptId?: string;
      };
      if (selected) {
        setSelectedKeys([selectedKey]);
        onSelectNode?.(selectedKey, node.nodeType, {
          name: node.title,
          corpId: node.corpId,
          deptId: node.deptId,
        });
      } else {
        setSelectedKeys([]);
        onSelectNode?.('', node.nodeType);
      }
    },
    [onSelectNode],
  );

  const handleExpand = useCallback((newExpandedKeys: string[]) => {
    setExpandedKeys(newExpandedKeys);
  }, []);

  const handleMenuClick = useCallback(
    (
      action: string,
      node: { key: string; title: string; nodeType: 'corp' | 'dept' },
    ) => {
      switch (action) {
        case 'edit':
          setEditingNodeId(node.key);
          if (node.nodeType === 'corp') {
            setEditOrgVisible(true);
          } else {
            setEditDeptVisible(true);
          }
          break;
        case 'delete':
          Modal.confirm({
            title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_TITLE),
            content: `${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_TITLE)} "${node.title}"?`,
            okText: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
            cancelText: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL),
            okButtonColor: 'red',
            centered: true,
            maskClosable: false,
            onOk: createDeleteHandler(node, refetch, onRefresh),
          });
          break;
        default:
          break;
      }
    },
    [refetch, onRefresh],
  );

  const handleEditOrgSuccess = useCallback(() => {
    setEditOrgVisible(false);
    setEditingNodeId('');
    refetch();
    onRefresh?.();
  }, [refetch, onRefresh]);

  const handleEditDeptSuccess = useCallback(() => {
    setEditDeptVisible(false);
    setEditingNodeId('');
    refetch();
    onRefresh?.();
  }, [refetch, onRefresh]);

  return {
    selectedKeys,
    expandedKeys,
    editOrgVisible,
    editDeptVisible,
    editingNodeId,
    dropdownVisible,
    setExpandedKeys,
    setDropdownVisible,
    setEditOrgVisible,
    setEditDeptVisible,
    setEditingNodeId,
    handleSelect,
    handleExpand,
    handleMenuClick,
    handleEditOrgSuccess,
    handleEditDeptSuccess,
  };
};
