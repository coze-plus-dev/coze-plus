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

import { Modal } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useOrganizationUpdate } from './hooks/use-organization-update';
import { useOrganizationData } from './hooks/use-organization-data';
import { OrganizationForm } from './components/organization-form';

interface EditOrganizationModalProps {
  visible: boolean;
  organizationId: string;
  onClose: () => void;
  onSuccess?: () => void;
  onModalOpen?: () => void;
}

export const EditOrganizationModal: FC<EditOrganizationModalProps> = ({
  visible,
  organizationId,
  onClose,
  onSuccess,
  onModalOpen,
}) => {
  const formApiRef = useRef<{
    validate: () => Promise<unknown>;
    getValues: () => { name: string; parent_id: string; corp_type: number };
    setValues: (values: {
      name: string;
      parent_id: string;
      corp_type: number;
    }) => void;
    reset: () => void;
  } | null>(null);

  const {
    organizationOptions,
    formValues,
    setFormValues,
    fetchOrganizationDetail,
    fetchOrganizations,
    detailLoading,
  } = useOrganizationData(organizationId);

  const handleClose = () => {
    setFormValues({
      name: '',
      parent_id: '',
      corp_type: 1,
    });
    if (formApiRef.current) {
      formApiRef.current.reset();
    }
    onClose();
  };

  const { loading, run: updateOrganization } = useOrganizationUpdate(
    organizationId,
    formApiRef,
    {
      formValues,
      onSuccess: () => {
        handleClose();
        onSuccess?.();
      },
    },
  );

  useEffect(() => {
    if (visible && organizationId) {
      fetchOrganizationDetail();
      fetchOrganizations();
      // 通知父组件关闭下拉菜单
      onModalOpen?.();
    }
  }, [
    visible,
    organizationId,
    fetchOrganizationDetail,
    fetchOrganizations,
    onModalOpen,
  ]);

  // 当formValues变化且模态框可见时，设置表单值确保正确显示
  useEffect(() => {
    if (visible && formApiRef.current && formValues.name && !detailLoading) {
      formApiRef.current.setValues({
        name: formValues.name,
        parent_id: formValues.parent_id,
        corp_type: formValues.corp_type,
      });
    }
  }, [visible, formValues, detailLoading]);

  return (
    <Modal
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION)}
      visible={visible}
      onCancel={handleClose}
      onOk={updateOrganization}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_SAVE)}
      cancelText={t(
        ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_CANCEL,
      )}
      width={480}
      confirmLoading={loading}
    >
      <OrganizationForm
        formApiRef={formApiRef}
        organizationId={organizationId}
        formValues={formValues}
        setFormValues={setFormValues}
        organizationOptions={organizationOptions}
      />
    </Modal>
  );
};
