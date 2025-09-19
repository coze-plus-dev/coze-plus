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

import { Form } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';

interface FormValues {
  name: string;
  parent_id: string;
  corp_type: number;
}

interface OrganizationOption {
  label: string;
  value: string;
}

interface OrganizationFormProps {
  formApiRef: React.MutableRefObject<{
    validate: () => Promise<unknown>;
    getValues: () => FormValues;
    setValues: (values: FormValues) => void;
    reset: () => void;
  } | null>;
  organizationId: string;
  formValues: FormValues;
  setFormValues: (values: React.SetStateAction<FormValues>) => void;
  organizationOptions: OrganizationOption[];
}

export const OrganizationForm: FC<OrganizationFormProps> = ({
  formApiRef,
  organizationId,
  formValues,
  setFormValues,
  organizationOptions,
}) => {
  const corpTypeOptions = [
    { label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CORP_TYPE_GROUP), value: 1 },
    { label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CORP_TYPE_COMPANY), value: 2 },
    { label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CORP_TYPE_BRANCH), value: 3 },
  ];

  return (
    <Form
      getFormApi={api => (formApiRef.current = api)}
      labelPosition="top"
      className={styles.form}
      key={organizationId}
    >
      <Form.Input
        field="name"
        label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_NAME)}
        rules={[
          {
            required: true,
            message: t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME,
            ),
          },
          {
            max: 50,
            message: t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_NAME_TOO_LONG,
            ),
          },
        ]}
        placeholder={t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME,
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

      <Form.Select
        field="corp_type"
        label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_TYPE)}
        rules={[
          {
            required: true,
            message: t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE,
            ),
          },
        ]}
        placeholder={t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE,
        )}
        optionList={corpTypeOptions}
        initValue={formValues.corp_type}
        onChange={value =>
          setFormValues(prev => ({ ...prev, corp_type: value as number }))
        }
        style={{ width: '100%' }}
      />

      <Form.Select
        field="parent_id"
        label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PARENT_ORGANIZATION)}
        placeholder={t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_PARENT_ORGANIZATION,
        )}
        optionList={organizationOptions}
        initValue={formValues.parent_id}
        showClear
        onChange={value =>
          setFormValues(prev => ({
            ...prev,
            parent_id: (value as string) || '',
          }))
        }
        style={{ width: '100%' }}
      />
    </Form>
  );
};
