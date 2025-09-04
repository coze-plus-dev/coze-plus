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

import { useState, useEffect, useRef } from 'react';

import { useRequest } from 'ahooks';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { departmentApi } from '@/api/corporation-api';
import { findNode } from '../utils/tree-helpers';
import type { TreeNode } from '@/hooks/use-organization-tree';

interface FormValues {
  name: string;
  parentId: string;
}

interface UseDepartmentFormParams {
  visible: boolean;
  departmentId?: string;
  treeData: TreeNode[];
  onSuccess?: () => void;
  onClose: () => void;
}

export const useDepartmentForm = ({ 
  visible, 
  departmentId, 
  treeData,
  onSuccess, 
  onClose,
}: UseDepartmentFormParams) => {
  const formApiRef = useRef<{ validate: () => Promise<unknown>; getValues: () => FormValues; setValues: (values: FormValues) => void } | null>(null);
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    parentId: '',
  });

  // 获取部门详情
  const { run: fetchDepartmentDetail, loading: loadingDetail } = useRequest(
    async (id: string) => {
      const response = await departmentApi.getDepartment(id);
      return response;
    },
    {
      manual: true,
      onSuccess: (data) => {
        if (data) {
          // 如果有parent_id说明上级是部门，否则上级是企业(corp_id)
          const parentId = data.parent_id ? data.parent_id.toString() : data.corp_id?.toString() || '';
          
          const newValues = {
            name: data.name || '',
            parentId,
          };
          setFormValues(newValues);
          
          // 延迟设置表单值，确保TreeSelect组件已经渲染完成
          setTimeout(() => {
            if (formApiRef.current) {
              formApiRef.current.setValues(newValues);
            }
          }, 100); // 增加延迟时间确保TreeSelect完全渲染
        }
      },
    },
  );

  // 创建部门
  const { run: createDepartment, loading: creatingDepartment } = useRequest(
    async (data: { name: string; corp_id: string; parent_id?: string }) => {
      await departmentApi.createDepartment(data);
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT_CREATED_SUCCESS));
        onSuccess?.();
        onClose();
      },
      onError: () => {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_FAILED));
      },
    },
  );

  // 更新部门
  const { run: updateDepartment, loading: updatingDepartment } = useRequest(
    async (data: { id: string; name?: string; parent_id?: string }) => {
      await departmentApi.updateDepartment(data);
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_SUCCESS));
        onSuccess?.();
        onClose();
      },
      onError: () => {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED));
      },
    },
  );

  // 提交表单
  const handleSubmit = async () => {
    if (!formApiRef.current) {
      return;
    }

    try {
      await formApiRef.current.validate();
      const values = formApiRef.current.getValues();
      
      // 获取选中的节点信息
      const selectedNode = values.parentId ? findNode(treeData, values.parentId) : null;
      
      if (departmentId) {
        // 更新部门
        const parentId = selectedNode?.nodeType === 'dept' ? selectedNode.key : undefined;
        updateDepartment({
          id: departmentId,
          name: values.name,
          parent_id: parentId,
        });
      } else {
        // 创建部门
        if (selectedNode?.nodeType === 'corp') {
          // 上级是企业，只传corp_id
          createDepartment({
            name: values.name,
            corp_id: selectedNode.key,
          });
        } else if (selectedNode?.nodeType === 'dept') {
          // 上级是部门，传corp_id和parent_id
          if (!selectedNode.corpId) {
            Toast.error('无法获取部门所属企业信息');
            return;
          }
          createDepartment({
            name: values.name,
            corp_id: selectedNode.corpId,
            parent_id: selectedNode.key,
          });
        } else {
          // 未选择上级，必须选择一个上级部门或企业
          Toast.error('请选择上级部门或企业');
          return;
        }
      }
    } catch (errors) {
      console.error('Form validation failed:', errors);
    }
  };

  const handleFormChange = (formState: unknown) => {
    const values = formState as FormValues;
    setFormValues(values);
  };

  useEffect(() => {
    if (visible && departmentId && treeData.length > 0) {
      fetchDepartmentDetail(departmentId);
    } else if (visible && !departmentId) {
      // 新建模式，重置表单
      const defaultValues = { name: '', parentId: '' };
      setFormValues(defaultValues);
      setTimeout(() => {
        if (formApiRef.current) {
          formApiRef.current.setValues(defaultValues);
        }
      }, 0);
    }
  }, [visible, departmentId, treeData.length, fetchDepartmentDetail]);

  const loading = loadingDetail || creatingDepartment || updatingDepartment;

  return {
    formApiRef,
    formValues,
    loading,
    handleSubmit,
    handleFormChange,
  };
};