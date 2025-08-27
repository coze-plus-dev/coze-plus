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

import { type FC } from 'react';

import { Modal, Form, Input } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useEmployeeCreation } from './hooks/use-employee-creation';
import { DepartmentSelector } from '../department-selector';

import styles from './index.module.less';

interface CreateEmployeeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateEmployeeModal: FC<CreateEmployeeModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { formValues, loading, handleFormChange, handleSubmit } =
    useEmployeeCreation({
      visible,
      onSuccess,
      onClose,
    });

  return (
    <Modal
      visible={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE)}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      confirmLoading={loading}
      width={480}
      centered
      className={styles.createEmployeeModal}
      maskClosable={false}
    >
      <Form layout="vertical" className={styles.form}>
        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label
            className="semi-form-field-label"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMPLOYEE_NAME)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          </label>
          <Input
            placeholder={t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME,
            )}
            value={formValues.name}
            onChange={value => handleFormChange('name', value)}
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
          <label
            className="semi-form-field-label"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          </label>
          <DepartmentSelector
            value={formValues.departments}
            onChange={departments =>
              handleFormChange('departments', departments)
            }
            placeholder={t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT,
            )}
            multiple={true}
          />
        </div>

        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label
            className="semi-form-field-label"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          </label>
          <Input
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE)}
            value={formValues.mobile}
            onChange={value => handleFormChange('mobile', value)}
            maxLength={11}
            showClear
          />
        </div>

        <div className="semi-form-field" style={{ marginBottom: 20 }}>
          <label
            className="semi-form-field-label"
            style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
          >
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL)}
          </label>
          <Input
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMAIL)}
            value={formValues.email}
            onChange={value => handleFormChange('email', value)}
            maxLength={100}
            showClear
          />
        </div>
      </Form>
    </Modal>
  );
};
