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

import { type FC, useState, useEffect } from 'react';
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { Modal, Form, Input, Toast } from '@coze-arch/coze-design';
import { useRequest } from 'ahooks';
import { employee } from '@coze-studio/api-schema';
import { employeeApi } from '../../../../api/corporationApi';
import { DepartmentSelector } from '../department-selector';

import styles from './index.module.less';

interface CreateEmployeeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
  mobile: string;
  email?: string;
}

const initialFormValues: FormValues = {
  name: '',
  departments: [],
  mobile: '',
  email: '',
};

export const CreateEmployeeModal: FC<CreateEmployeeModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [formValues, setFormValues] = useState<FormValues>(initialFormValues);

  // 当弹窗打开时重置表单
  useEffect(() => {
    if (visible) {
      setFormValues(initialFormValues);
    }
  }, [visible]);

  // 创建员工请求
  const { loading, run: createEmployee } = useRequest(
    async (values: FormValues) => {
      const result = await employeeApi.createEmployee({
        name: values.name,
        department_ids: values.departments,
        mobile: values.mobile,
        email: values.email || undefined,
      });
      return result;
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_SUCCESS));
        handleClose();
        onSuccess?.();
      },
      onError: (error) => {
        Toast.error(error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_FAILED));
      },
    }
  );

  // 处理提交
  const handleSubmit = () => {
    // 表单验证
    if (!formValues.name || !formValues.name.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME));
      return;
    }
    if (formValues.name.length > 50) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMPLOYEE_NAME_TOO_LONG));
      return;
    }
    if (!formValues.departments || formValues.departments.length === 0) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT));
      return;
    }
    if (!formValues.mobile || !formValues.mobile.trim()) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE));
      return;
    }
    // 简单的手机号验证
    const mobileRegex = /^1[3-9]\d{9}$/;
    if (!mobileRegex.test(formValues.mobile)) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE_FORMAT_ERROR));
      return;
    }
    // 邮箱验证（可选）
    if (formValues.email && formValues.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formValues.email)) {
        Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL_FORMAT_ERROR));
        return;
      }
    }
    
    createEmployee(formValues);
  };

  // 处理关闭
  const handleClose = () => {
    setFormValues(initialFormValues);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE)}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      confirmLoading={loading}
      width={480}
      centered
      className={styles.createEmployeeModal}
      maskClosable={false}
    >
      <Form
        layout="vertical"
        className={styles.form}
      >
        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label className="semi-form-field-label" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMPLOYEE_NAME)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          </label>
          <Input
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME)}
            value={formValues.name}
            onChange={(value) => setFormValues({ ...formValues, name: value })}
            maxLength={50}
            showClear
            suffix={
              <span style={{ color: 'var(--semi-color-text-2)', fontSize: 12 }}>
                {(formValues.name || '').length}/50
              </span>
            }
          />
        </div>

        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label className="semi-form-field-label" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          </label>
          <DepartmentSelector
            value={formValues.departments}
            onChange={(departments) => setFormValues({ ...formValues, departments })}
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT)}
            multiple={true}
          />
        </div>

        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label className="semi-form-field-label" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          </label>
          <Input
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE)}
            value={formValues.mobile}
            onChange={(value) => setFormValues({ ...formValues, mobile: value })}
            maxLength={11}
            showClear
          />
        </div>

        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label className="semi-form-field-label" style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL)}
          </label>
          <Input
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMAIL)}
            value={formValues.email}
            onChange={(value) => setFormValues({ ...formValues, email: value })}
            maxLength={100}
            showClear
          />
        </div>
      </Form>
    </Modal>
  );
};