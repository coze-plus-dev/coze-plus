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

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { departmentApi } from '@/api/corporation-api';

import styles from './index.module.less';

interface EditDepartmentModalProps {
  visible: boolean;
  departmentId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onModalOpen?: () => void;
}

export const EditDepartmentModal: FC<EditDepartmentModalProps> = ({
  visible,
  departmentId,
  onClose,
  onSuccess,
  onModalOpen,
}) => {
  const formApiRef = useRef<{
    validate: () => Promise<unknown>;
    getValues: () => { name: string };
    setValues: (values: { name: string }) => void;
    reset: () => void;
  } | null>(null);
  const [formValues, setFormValues] = useState({
    name: '',
  });

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
          const name = data.name || '';
          setFormValues({ name });
          // 设置表单字段值
          if (formApiRef.current) {
            formApiRef.current.setValues({ name });
          }
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
        // Validation failed, stop execution
        console.warn('Form validation failed:', errors);
        return;
      }

      const { name } = formApiRef.current?.getValues() || formValues;

      await departmentApi.updateDepartment({
        id: departmentId,
        name,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_SUCCESS));
        handleClose();
        onSuccess?.();
      },
      onError: (error: Error | { message?: string }) => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED),
        );
      },
    },
  );

  const handleClose = () => {
    setFormValues({ name: '' });
    // 重置表单
    if (formApiRef.current) {
      formApiRef.current.reset();
    }
    onClose();
  };

  const handleOk = () => {
    updateDepartment();
  };

  useEffect(() => {
    if (visible && departmentId) {
      fetchDepartmentDetail();
      // 通知父组件关闭下拉菜单
      onModalOpen?.();
    }
  }, [visible, departmentId, fetchDepartmentDetail, onModalOpen]);

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
        key={departmentId}
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
          onChange={value => setFormValues(prev => ({ ...prev, name: value }))}
          suffix={
            <span style={{ color: '#666', fontSize: 12 }}>
              {(formValues.name || '').length}/50
            </span>
          }
        />
      </Form>
    </Modal>
  );
};
