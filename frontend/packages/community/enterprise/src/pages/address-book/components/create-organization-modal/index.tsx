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

import { useOrganizationCreation } from './hooks/use-organization-creation';

import styles from './index.module.less';

interface CreateOrganizationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CreateOrganizationModal: FC<CreateOrganizationModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const {
    formValues,
    setFormValues,
    organizationOptions,
    loading,
    handleSubmit,
    handleClose,
  } = useOrganizationCreation({
    visible,
    onSuccess,
    onClose,
  });

  // 组织类型选项
  const corpTypeOptions = [
    { label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CORP_TYPE_GROUP), value: 1 },
    { label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CORP_TYPE_COMPANY), value: 2 },
    { label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CORP_TYPE_BRANCH), value: 3 },
  ];

  return (
    <Modal
      visible={visible}
      onOk={handleSubmit}
      onCancel={handleClose}
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NEW_ORGANIZATION)}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CREATE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CANCEL)}
      confirmLoading={loading}
      width={480}
      centered
      className={styles.createOrgModal}
      maskClosable={false}
    >
      <Form
        layout="vertical"
        className={styles.form}
        initValues={formValues}
        onValueChange={values => setFormValues(values)}
      >
        <Form.Input
          field="name"
          label={
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_NAME)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          }
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME,
          )}
          maxLength={50}
          showClear
          suffix={
            <span style={{ color: 'var(--semi-color-text-2)', fontSize: 12 }}>
              {(formValues.name || '').length}/50
            </span>
          }
        />

        <Form.Select
          field="corp_type"
          label={
            <span>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_TYPE)}
              <span style={{ color: 'red', marginLeft: 4 }}>*</span>
            </span>
          }
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE,
          )}
          optionList={corpTypeOptions}
          style={{ width: '100%' }}
        />

        <Form.Select
          field="parent_id"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PARENT_ORGANIZATION)}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_ORGANIZATION,
          )}
          optionList={organizationOptions}
          style={{ width: '100%' }}
          showClear
        />
      </Form>
    </Modal>
  );
};
