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

import { type FC, useState, useCallback, useEffect } from 'react';

import { Modal, Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';
import { roleApi } from '@/api/role-api';

import { UserInfoHeader } from './components/user-info-header';
import { ModalContent } from './components/modal-content';
import { useAssignRoleModal } from './hooks/use-assign-role-modal';
import type { UserData } from '../../types';

import styles from './index.module.less';

interface AssignRoleModalProps {
  visible: boolean;
  user: UserData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AssignRoleModal: FC<AssignRoleModalProps> = ({
  visible,
  user,
  onClose,
  onSuccess,
}) => {
  const [selectedRoleForPreview, setSelectedRoleForPreview] = useState<RoleData | null>(null);
  const [roleDetailLoading, setRoleDetailLoading] = useState(false);

  const {
    roles,
    rolesLoading,
    selectedRoles,
    loading,
    loadMore,
    hasMore,
    toggleRoleSelection,
    handleSave,
  } = useAssignRoleModal({
    user,
    visible,
    onSuccess,
    onClose,
  });

  const handleRoleClick = useCallback(async (role: RoleData) => {
    if (!role.id) {
      return;
    }
    
    // 每次都获取角色详情以确保数据是最新的
    setRoleDetailLoading(true);
    try {
      const roleDetail = await roleApi.getRole(role.id.toString());
      if (roleDetail) {
        setSelectedRoleForPreview(roleDetail);
      }
    } catch (error) {
      console.error('Failed to get role detail:', error);
      // 即使获取详情失败，也显示基本信息
      setSelectedRoleForPreview(role);
    } finally {
      setRoleDetailLoading(false);
    }
  }, []);

  const handleSaveClick = useCallback(() => {
    handleSave();
  }, [handleSave]);

  // 弹窗关闭时重置选中状态
  useEffect(() => {
    if (!visible) {
      setSelectedRoleForPreview(null);
      setRoleDetailLoading(false);
    }
  }, [visible]);

  // 管理body class来控制背景组件的显示
  useEffect(() => {
    if (visible) {
      document.body.classList.add('assign-role-modal-open');
    } else {
      document.body.classList.remove('assign-role-modal-open');
    }
    
    // 清理函数
    return () => {
      document.body.classList.remove('assign-role-modal-open');
    };
  }, [visible]);

  if (!user) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      title={t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_TITLE)}
      onCancel={onClose}
      width={1200}
      centered
      className={styles.assignRoleModalContainer}
      maskClosable={false}
      zIndex={1100}
      footer={
        <div className={styles.footer}>
          <Button onClick={onClose}>
            {t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_CANCEL_BUTTON)}
          </Button>
          <Button
            theme="solid"
            onClick={handleSaveClick}
            loading={loading}
            disabled={selectedRoles.size === 0}
          >
            {t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_SAVE_BUTTON)}
          </Button>
        </div>
      }
    >
      <div className={styles.assignRoleModal}>
        <UserInfoHeader user={user} />
        <ModalContent
          roles={roles}
          rolesLoading={rolesLoading}
          selectedRoles={selectedRoles}
          selectedRoleForPreview={selectedRoleForPreview}
          roleDetailLoading={roleDetailLoading}
          hasMore={hasMore}
          loadMore={loadMore}
          onRoleSelect={handleRoleClick}
          onRoleToggle={toggleRoleSelection}
        />
      </div>
    </Modal>
  );
};