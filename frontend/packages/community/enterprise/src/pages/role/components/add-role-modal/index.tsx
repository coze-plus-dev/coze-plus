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

import { type FC, useEffect, useRef } from 'react';

import { Modal, Form, FormInput, FormTextArea } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useRoleForm } from './use-role-form';

import styles from './index.module.less';

interface AddRoleModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddRoleModal: FC<AddRoleModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  console.log('AddRoleModal渲染，visible:', visible);
  const {
    setFormValues,
    loading,
    handleSubmit,
    MAX_NAME_LENGTH,
    MAX_DESCRIPTION_LENGTH,
  } = useRoleForm({ visible, onSuccess });

  const formRef = useRef<{ formApi?: { setValue: (field: string, value: string) => void } }>(null);

  useEffect(() => {
    if (!visible && formRef.current?.formApi) {
      // 弹窗关闭时，重置表单DOM状态
      formRef.current.formApi.setValue('role_name', '');
      formRef.current.formApi.setValue('role_code', '');
      formRef.current.formApi.setValue('description', '');
    }
  }, [visible]); // 只依赖 visible，避免循环依赖

  const handleFormSubmit = () => {
    formRef.current?.formApi
      ?.validate()
      .then(() => {
        handleSubmit();
      })
      .catch(() => {
        // 验证失败，不执行提交
      });
  };

  return (
    <Modal
      visible={visible}
      title={t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_MODAL_TITLE)}
      onCancel={onClose}
      onOk={handleFormSubmit}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      okButtonProps={{ loading }}
      width={600}
      className={styles.addRoleModal}
    >
      <Form
        ref={formRef}
        layout="vertical"
        onValueChange={values =>
          setFormValues(prev => ({ ...prev, ...values }))
        }
      >
        <FormInput
          field="role_name"
          label={t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_NAME_LABEL)}
          rules={[
            {
              required: true,
              message: t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_NAME_REQUIRED),
            },
          ]}
          placeholder={t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_NAME_PLACEHOLDER)}
          maxLength={MAX_NAME_LENGTH}
          showClear
        />

        <FormInput
          field="role_code"
          label={t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_CODE_LABEL)}
          rules={[
            {
              required: true,
              message: t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_CODE_REQUIRED),
            },
            {
              pattern: /^[A-Za-z_][A-Za-z0-9_]*$/,
              message: t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_CODE_INVALID),
            },
          ]}
          placeholder={t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_CODE_PLACEHOLDER)}
          showClear
        />

        <FormTextArea
          field="description"
          label={t(ENTERPRISE_I18N_KEYS.ROLE_CREATE_DESCRIPTION_LABEL)}
          rules={[
            {
              max: MAX_DESCRIPTION_LENGTH,
              message: t(
                ENTERPRISE_I18N_KEYS.ROLE_CREATE_DESCRIPTION_TOO_LONG,
                { maxLength: MAX_DESCRIPTION_LENGTH },
              ),
            },
          ]}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ROLE_CREATE_DESCRIPTION_PLACEHOLDER,
          )}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={3}
          showClear
        />
      </Form>
    </Modal>
  );
};
