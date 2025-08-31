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

import { Modal, Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { roleApi, type RoleData, type RolePermission } from '@/api/role-api';

interface UseRoleDeletionProps {
  refreshRoles: () => void;
  selectedRole: RoleData | null;
  setSelectedRole: (role: RoleData | null) => void;
  setPermissionMatrix: (matrix: Record<string, boolean>) => void;
  setRolePermissions: (permissions: RolePermission[]) => void;
}

export const useRoleDeletion = ({
  refreshRoles,
  selectedRole,
  setSelectedRole,
  setPermissionMatrix,
  setRolePermissions,
}: UseRoleDeletionProps) => {
  const handleDeleteRole = (role: RoleData) => {
    Modal.confirm({
      title: t(ENTERPRISE_I18N_KEYS.ROLE_DELETE_CONFIRM_TITLE),
      content: t(ENTERPRISE_I18N_KEYS.ROLE_DELETE_CONFIRM_CONTENT, {
        roleName: role.role_name,
      }),
      okText: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
      cancelText: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL),
      okType: 'danger',
      onOk: async () => {
        try {
          await roleApi.deleteRole(role.id);
          Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_SUCCESS));

          // 如果删除的是当前选中的角色，清空选中状态
          if (selectedRole && selectedRole.id === role.id) {
            setSelectedRole(null);
            setPermissionMatrix({});
            setRolePermissions([]);
          }

          refreshRoles();
        } catch (error) {
          console.error('Delete role failed:', error);
          const errorMessage =
            (error as { message?: string; msg?: string })?.message ||
            (error as { message?: string; msg?: string })?.msg ||
            t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_FAILED);
          Toast.error(errorMessage);
        }
      },
    });
  };

  return {
    handleDeleteRole,
  };
};
