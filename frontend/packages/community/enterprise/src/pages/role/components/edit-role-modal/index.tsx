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
import type { RoleData } from '@/api/role-api';

import { useEditRole } from './hooks/use-edit-role';

import styles from './index.module.less';

interface EditRoleModalProps {
  visible: boolean;
  role: RoleData | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditRoleModal: FC<EditRoleModalProps> = ({
  visible,
  role,
  onClose,
  onSuccess,
}) => {
  const {
    setFormValues,
    loading,
    handleSubmit,
    MAX_NAME_LENGTH,
    MAX_DESCRIPTION_LENGTH,
  } = useEditRole({ visible, role, onSuccess });

  const formRef = useRef<{ formApi?: { setValues: (values: Record<string, unknown>) => void } }>(null);

  useEffect(() => {
    if (visible && role && formRef.current?.formApi) {
      const initialValues = {
        role_name: role.role_name || '',
        role_code: role.role_code || '',
        description: role.description || '',
      };
      formRef.current.formApi.setValue('role_name', initialValues.role_name);
      formRef.current.formApi.setValue('role_code', initialValues.role_code);
      formRef.current.formApi.setValue(
        'description',
        initialValues.description,
      );
      setFormValues(initialValues);
    } else if (!visible && formRef.current?.formApi) {
      formRef.current.formApi.setValue('role_name', '');
      formRef.current.formApi.setValue('role_code', '');
      formRef.current.formApi.setValue('description', '');
    }
  }, [visible, role, setFormValues]);

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
      title={t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_MODAL_TITLE)}
      onCancel={onClose}
      onOk={handleFormSubmit}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SAVE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      okButtonProps={{ loading }}
      width={600}
      className={styles.editRoleModal}
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
          label={t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_NAME_LABEL)}
          rules={[
            {
              required: true,
              message: t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_NAME_REQUIRED),
            },
            {
              max: MAX_NAME_LENGTH,
              message: t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_NAME_TOO_LONG, {
                maxLength: MAX_NAME_LENGTH,
              }),
            },
          ]}
          placeholder={t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_NAME_PLACEHOLDER)}
          maxLength={MAX_NAME_LENGTH}
          showClear
        />

        <FormInput
          field="role_code"
          label={t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_CODE_LABEL)}
          disabled
          placeholder={t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_CODE_PLACEHOLDER)}
        />

        <FormTextArea
          field="description"
          label={t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_DESCRIPTION_LABEL)}
          rules={[
            {
              max: MAX_DESCRIPTION_LENGTH,
              message: t(ENTERPRISE_I18N_KEYS.ROLE_EDIT_DESCRIPTION_TOO_LONG, {
                maxLength: MAX_DESCRIPTION_LENGTH,
              }),
            },
          ]}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ROLE_EDIT_DESCRIPTION_PLACEHOLDER,
          )}
          maxLength={MAX_DESCRIPTION_LENGTH}
          rows={3}
          showClear
        />
      </Form>
    </Modal>
  );
};
