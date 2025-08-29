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
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { useOrganizationTree } from '@/hooks/use-organization-tree';
import type { TreeNode } from '@/hooks/use-organization-tree';
import { departmentApi } from '@/api/corporation-api';

interface FormValues {
  name: string;
  parentId: string;
}

interface UseDepartmentCreationProps {
  visible: boolean;
  defaultCorpId?: string;
  defaultParentId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface SelectTreeNode {
  label: string;
  value: string;
  key: string;
  children?: SelectTreeNode[];
}

// Convert tree data for TreeSelect component
const convertTreeDataForSelect = (nodes: TreeNode[]): SelectTreeNode[] =>
  nodes.map(node => ({
    label: node.title,
    value: node.key,
    key: node.key,
    children: node.children
      ? convertTreeDataForSelect(node.children)
      : undefined,
  }));

// Find node helper
const findNode = (nodes: TreeNode[], targetKey: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.key === targetKey) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, targetKey);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// Get corp ID from node directly using the optimized field
const getCorpIdFromNode = (node: TreeNode): string => {
  if (node.nodeType === 'corp') {
    return node.key;
  }
  // For department nodes, use the corpId field directly
  return node.corpId || '';
};

export const useDepartmentCreation = ({
  visible,
  defaultCorpId,
  defaultParentId,
  onSuccess,
  onClose,
}: UseDepartmentCreationProps) => {
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    parentId: defaultParentId || defaultCorpId || '',
  });

  const { treeData, refetch: refetchTreeData } = useOrganizationTree({
    includeDepartments: true,
    includeEmployeeCount: false,
  });

  const treeSelectData = convertTreeDataForSelect(treeData);

  // Create department request
  const { loading, run: createDepartment } = useRequest(
    async () => {
      const { name, parentId } = formValues;

      // Manual validation
      if (!name || !name.trim()) {
        Toast.error(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME),
        );
        return;
      }

      if (name.length > 50) {
        Toast.error(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_NAME_TOO_LONG),
        );
        return;
      }

      if (!parentId) {
        Toast.error(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT),
        );
        return;
      }

      // Parse parent ID to determine if it's a corp or dept
      const parentNode = findNode(treeData, parentId);
      if (!parentNode) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PARENT_NOT_FOUND));
        return;
      }

      let corpId: string;
      let parentDeptId: string | undefined;

      if (parentNode.nodeType === 'corp') {
        corpId = parentId;
        parentDeptId = undefined;
      } else {
        corpId = getCorpIdFromNode(parentNode);
        parentDeptId = parentNode.deptId || parentId;
      }

      const result = await departmentApi.createDepartment({
        name,
        corp_id: corpId,
        parent_id: parentDeptId,
      });

      return result;
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_CREATED_SUCCESS),
        );
        onClose?.();
        onSuccess?.();
      },
      onError: (error: Error) => {
        Toast.error(
          error.message ||
            t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CREATE_FAIL),
        );
      },
    },
  );

  const handleClose = useCallback(() => {
    setFormValues({ name: '', parentId: '' });
    onClose?.();
  }, [onClose]);

  const handleOk = useCallback(() => {
    createDepartment();
  }, [createDepartment]);

  useEffect(() => {
    if (visible) {
      refetchTreeData();
      if (defaultParentId) {
        setFormValues(prev => ({ ...prev, parentId: defaultParentId }));
      }
    }
  }, [visible, defaultParentId, refetchTreeData]);

  return {
    formValues,
    setFormValues,
    treeSelectData,
    loading,
    handleClose,
    handleOk,
  };
};
