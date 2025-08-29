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

import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { corporationApi } from '../../../../api/corporation-api';

import styles from './index.module.less';

interface EditOrganizationModalProps {
  visible: boolean;
  organizationId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

interface OrganizationOption {
  label: string;
  value: string;
}

export const EditOrganizationModal: FC<EditOrganizationModalProps> = ({
  visible,
  organizationId,
  onClose,
  onSuccess,
}) => {
  const formApiRef = useRef<any>(null);
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);
  const [formValues, setFormValues] = useState({
    name: '',
    corp_type: 0,
    parent_id: undefined as string | undefined,
  });

  // 获取组织详情
  const { run: fetchOrganizationDetail } = useRequest(
    async () => {
      if (!organizationId) {
        return null;
      }
      const result = await corporationApi.getCorporation(organizationId);
      return result;
    },
    {
      manual: true,
      onSuccess: data => {
        if (data) {
          // 只通过state管理表单值
          setFormValues({
            name: data.name || '',
            corp_type: data.corp_type || 0,
            parent_id: data.parent_id,
          });
        }
      },
      onError: error => {
        console.error('Failed to fetch organization detail:', error);
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOAD_FAILED),
        );
      },
    },
  );

  // 获取组织列表（用于父组织选择）
  const { run: fetchOrganizations } = useRequest(
    async () => {
      const result = await corporationApi.listCorporations({
        page: 1,
        page_size: 1000,
      });
      return result.data || [];
    },
    {
      manual: true,
      onSuccess: data => {
        // 过滤掉当前组织，避免设置自己为父组织
        const options = data
          .filter((org: any) => org.id !== organizationId)
          .map((org: any) => ({
            label: org.name,
            value: org.id,
          }));
        setOrganizationOptions(options);
      },
    },
  );

  // 当弹窗打开时获取数据
  useEffect(() => {
    if (visible && organizationId) {
      fetchOrganizationDetail();
      fetchOrganizations();
    }
  }, [visible, organizationId, fetchOrganizationDetail, fetchOrganizations]);

  // 更新组织请求
  const { loading, run: updateOrganization } = useRequest(
    async () => {
      // 验证表单
      try {
        await formApiRef.current?.validate();
      } catch (errors) {
        return;
      }

      // 使用表单的值进行更新
      const values = formApiRef.current?.getValues() || formValues;
      await corporationApi.updateCorporation({
        id: organizationId,
        name: values.name,
        corp_type: values.corp_type,
        parent_id: values.parent_id,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLUGIN_UPDATE_SUCCESS));
        handleClose();
        onSuccess?.();
      },
      onError: error => {
        Toast.error(
          error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_UPDATE_FAILED),
        );
      },
    },
  );

  // 处理提交
  const handleSubmit = () => {
    updateOrganization();
  };

  // 处理关闭
  const handleClose = () => {
    // 重置表单值
    setFormValues({
      name: '',
      corp_type: 0,
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
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION)}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SAVE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CANCEL)}
      confirmLoading={loading}
      width={480}
      centered
      className={styles.editOrgModal}
      maskClosable={false}
    >
      <Form
        getFormApi={api => (formApiRef.current = api)}
        layout="vertical"
        className={styles.form}
        key={`${organizationId}-${JSON.stringify(formValues)}`}
      >
        <Form.Input
          field="name"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_NAME)}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME,
          )}
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
          maxLength={50}
          showClear
          initValue={formValues.name}
        />

        <Form.Select
          field="corp_type"
          label={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION_TYPE)}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE,
          )}
          rules={[
            {
              required: true,
              message: t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE,
              ),
            },
          ]}
          optionList={corpTypeOptions}
          style={{ width: '100%' }}
          initValue={formValues.corp_type}
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
          initValue={formValues.parent_id}
        />
      </Form>
    </Modal>
  );
};
