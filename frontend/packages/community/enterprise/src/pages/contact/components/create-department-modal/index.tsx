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

import { Modal, Form } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useDepartmentCreation } from './hooks/use-department-creation';

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
  const {
    formValues,
    setFormValues,
    treeSelectData,
    loading,
    handleClose,
    handleOk,
  } = useDepartmentCreation({
    visible,
    defaultCorpId,
    defaultParentId,
    onSuccess,
    onClose,
  });

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
        onValueChange={values => setFormValues(values)}
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
