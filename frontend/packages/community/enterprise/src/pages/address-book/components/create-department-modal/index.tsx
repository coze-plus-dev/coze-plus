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

/*
 * Copyright 2025 coze-dev Authors
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

import { type FC, useState, useEffect } from 'react';
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { Modal, Form, Toast } from '@coze-arch/coze-design';
import { useRequest } from 'ahooks';
import { departmentApi } from '../../../../api/corporationApi';
import { useOrganizationTree } from '../../../../hooks/useOrganizationTree';
import type { TreeNode } from '../../../../hooks/useOrganizationTree';

import styles from './index.module.less';

interface CreateDepartmentModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultCorpId?: string;
  defaultParentId?: string;
}

export const CreateDepartmentModal: FC<CreateDepartmentModalProps> = ({
  visible,
  onClose,
  onSuccess,
  defaultCorpId,
  defaultParentId,
}) => {
  const [formValues, setFormValues] = useState({
    name: '',
    parentId: defaultParentId || defaultCorpId || '',
  });

  const { treeData, refetch: refetchTreeData } = useOrganizationTree({
    includeDepartments: true,
    includeEmployeeCount: false,
  });

  // Convert tree data for TreeSelect component
  const convertTreeDataForSelect = (nodes: TreeNode[]): any[] => {
    return nodes.map(node => ({
      label: node.title,
      value: node.key,
      key: node.key,
      children: node.children ? convertTreeDataForSelect(node.children) : undefined,
    }));
  };

  const treeSelectData = convertTreeDataForSelect(treeData);

  // Find node helper
  const findNode = (nodes: TreeNode[], targetKey: string): TreeNode | null => {
    for (const node of nodes) {
      if (node.key === targetKey) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, targetKey);
        if (found) return found;
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

  // Create department request
  const { loading, run: createDepartment } = useRequest(
    async () => {
      const { name, parentId } = formValues;
      
      // Manual validation since Form validation API might not be available
      if (!name || !name.trim()) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME));
        return;
      }
      
      if (name.length > 50) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_NAME_TOO_LONG));
        return;
      }
      
      if (!parentId) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT));
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
        // Use the optimized corpId field directly from the node
        corpId = getCorpIdFromNode(parentNode);
        // Use deptId field if available, otherwise fall back to key
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
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_CREATED_SUCCESS));
        handleClose();
        onSuccess?.();
      },
      onError: (error: any) => {
        Toast.error(error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CREATE_FAIL));
      },
    }
  );

  const handleClose = () => {
    setFormValues({ name: '', parentId: '' });
    onClose();
  };

  const handleOk = () => {
    createDepartment();
  };

  useEffect(() => {
    if (visible) {
      // 每次弹出框打开时，重新获取最新的组织树数据
      refetchTreeData();
      
      if (defaultParentId) {
        setFormValues(prev => ({ ...prev, parentId: defaultParentId }));
      }
    }
  }, [visible, defaultParentId, refetchTreeData]);

  return (
    <Modal
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_DEPARTMENT)}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CREATE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CANCEL)}
      width={480}
      confirmLoading={loading}
    >
      <Form
        labelPosition="top"
        className={styles.form}
        initValues={formValues}
        onValueChange={(values) => setFormValues(values)}
      >
        <Form.Input
          field="name"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_NAME)}
          rules={[
            { required: true, message: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME) },
            { max: 50, message: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_NAME_TOO_LONG) },
          ]}
          placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME)}
          maxLength={50}
          suffix={<span style={{ color: '#666', fontSize: 12 }}>{(formValues.name || '').length}/50</span>}
        />
        
        <Form.TreeSelect
          field="parentId"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PARENT_DEPARTMENT)}
          treeData={treeSelectData}
          placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT)}
          dropdownStyle={{ maxHeight: 300 }}
          style={{ width: '100%' }}
          filterTreeNode
          showClear
          rules={[
            { required: true, message: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT) },
          ]}
        />
      </Form>
    </Modal>
  );
};