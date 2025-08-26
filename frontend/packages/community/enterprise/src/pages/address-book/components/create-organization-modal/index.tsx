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

import { useRequest } from 'ahooks';
import { Modal, Form, Toast } from '@coze-arch/coze-design';

import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { corporationApi } from '../../../../api/corporationApi';

import styles from './index.module.less';

interface CreateOrganizationModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormValues {
  name: string;
  corp_type?: number;
  parent_id?: string;
}

interface OrganizationOption {
  label: string;
  value: string;
}

export const CreateOrganizationModal: FC<CreateOrganizationModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    corp_type: undefined as any, // 不设置默认值，用户必须选择
    parent_id: undefined,
  });
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);

  // 获取组织列表
  const { run: fetchOrganizations } = useRequest(
    async () => {
      const result = await corporationApi.listCorporations({
        page: 1,
        page_size: 1000, // 获取所有组织
      });
      return result.data || [];
    },
    {
      manual: true,
      onSuccess: data => {
        const options = data.map((org: any) => ({
          label: org.name,
          value: org.id,
        }));
        setOrganizationOptions(options);
      },
    },
  );

  // 当弹窗打开时获取组织列表
  useEffect(() => {
    if (visible) {
      fetchOrganizations();
    }
  }, [visible, fetchOrganizations]);

  // 创建组织请求
  const { loading, run: createOrganization } = useRequest(
    async (values: FormValues) => {
      const result = await corporationApi.createCorporation({
        name: values.name,
        corp_type: values.corp_type,
        parent_id: values.parent_id,
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
      onError: error => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_FAILED),
        );
      },
    },
  );

  // 处理提交
  const handleSubmit = () => {
    // 简单验证
    if (!formValues.name || !formValues.name.trim()) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME),
      );
      return;
    }
    if (formValues.name.length > 50) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_NAME_TOO_LONG),
      );
      return;
    }
    if (!formValues.corp_type || formValues.corp_type === 0) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE),
      );
      return;
    }
    createOrganization(formValues);
  };

  // 处理关闭
  const handleClose = () => {
    setFormValues({
      name: '',
      corp_type: undefined as any,
      parent_id: undefined,
    });
    onClose();
  };

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
