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

import { type FC, useState, useEffect, useRef } from 'react';

import { useRequest } from 'ahooks';
import { Modal, Form, Toast } from '@coze-arch/coze-design';

import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { useOrganizationTree } from '../../../../hooks/useOrganizationTree';
import type { TreeNode } from '../../../../hooks/useOrganizationTree';
import { departmentApi } from '../../../../api/corporationApi';

import styles from './index.module.less';

interface EditDepartmentModalProps {
  visible: boolean;
  departmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditDepartmentModal: FC<EditDepartmentModalProps> = ({
  visible,
  departmentId,
  onClose,
  onSuccess,
}) => {
  const formApiRef = useRef<any>(null);
  const [formValues, setFormValues] = useState({
    name: '',
    parentId: '',
  });

  const { treeData } = useOrganizationTree({
    includeDepartments: true,
    includeEmployeeCount: false,
  });

  // Convert tree data for TreeSelect component, excluding current department and its children
  const convertTreeDataForSelect = (
    nodes: TreeNode[],
    excludeId?: string,
  ): any[] =>
    nodes
      .filter(node => node.key !== excludeId)
      .map(node => ({
        label: node.title,
        value: node.key,
        key: node.key,
        children: node.children
          ? convertTreeDataForSelect(node.children, excludeId)
          : undefined,
      }));

  const treeSelectData = convertTreeDataForSelect(treeData, departmentId);

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

  // Get department details
  const { run: fetchDepartmentDetail } = useRequest(
    async () => {
      if (!departmentId) {
        return null;
      }
      const result = await departmentApi.getDepartment(departmentId);
      return result;
    },
    {
      manual: true,
      onSuccess: data => {
        if (data) {
          // Set parent as either parent department or corporation
          const parentId = data.parent_id || data.corp_id;
          setFormValues({
            name: data.name || '',
            parentId: parentId || '',
          });
        }
      },
    },
  );

  // Update department request
  const { loading, run: updateDepartment } = useRequest(
    async () => {
      // Validate form
      try {
        await formApiRef.current?.validate();
      } catch (errors) {
        return;
      }

      const { name, parentId } = formApiRef.current?.getValues() || formValues;

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

      let parentDeptId: string | undefined;

      if (parentNode.nodeType === 'corp') {
        // If parent is corporation, parent_id should be undefined
        parentDeptId = undefined;
      } else {
        // If parent is department, use deptId field if available, otherwise fall back to key
        parentDeptId = parentNode.deptId || parentId;
      }

      await departmentApi.updateDepartment({
        id: departmentId,
        name,
        parent_id: parentDeptId,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_SUCCESS));
        handleClose();
        onSuccess?.();
      },
      onError: (error: any) => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED),
        );
      },
    },
  );

  const handleClose = () => {
    setFormValues({ name: '', parentId: '' });
    onClose();
  };

  const handleOk = () => {
    updateDepartment();
  };

  useEffect(() => {
    if (visible && departmentId) {
      fetchDepartmentDetail();
    }
  }, [visible, departmentId, fetchDepartmentDetail]);

  return (
    <Modal
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_DEPARTMENT)}
      visible={visible}
      onCancel={handleClose}
      onOk={handleOk}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SAVE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CANCEL)}
      width={480}
      confirmLoading={loading}
    >
      <Form
        getFormApi={api => (formApiRef.current = api)}
        labelPosition="top"
        className={styles.form}
        key={`${departmentId}-${JSON.stringify(formValues)}`}
      >
        <Form.Input
          field="name"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_NAME)}
          rules={[
            {
              required: true,
              message: t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME,
              ),
            },
            {
              max: 50,
              message: t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_NAME_TOO_LONG,
              ),
            },
          ]}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME,
          )}
          maxLength={50}
          initValue={formValues.name}
          onChange={value => setFormValues(prev => ({ ...prev, name: value }))}
          suffix={
            <span style={{ color: '#666', fontSize: 12 }}>
              {(formValues.name || '').length}/50
            </span>
          }
        />

        <Form.TreeSelect
          field="parentId"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PARENT_DEPARTMENT)}
          treeData={treeSelectData}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT,
          )}
          dropdownStyle={{ maxHeight: 300 }}
          style={{ width: '100%' }}
          filterTreeNode
          showClear
          initValue={formValues.parentId}
          rules={[
            {
              required: true,
              message: t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT,
              ),
            },
          ]}
        />
      </Form>
    </Modal>
  );
};
