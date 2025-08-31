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

import { IconCozPlus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import { useRoleManagement } from './hooks/use-role-management';
import { useRoleDeletion } from './hooks/use-role-deletion';
import { usePermissionEditor } from './hooks/use-permission-editor';
import { RoleList } from './components/role-list';
import { PermissionMatrix } from './components/permission-matrix';
import { EditRoleModal } from './components/edit-role-modal';
import { AssignPermissionsModal } from './components/assign-permissions-modal';
import { AddRoleModal } from './components/add-role-modal';

import styles from './index.module.less';

const RolePage: FC = () => {
  const {
    roles,
    rolesLoading,
    refreshRoles,
    selectedRole,
    isAddRoleModalVisible,
    setIsAddRoleModalVisible,
    isEditRoleModalVisible,
    setIsEditRoleModalVisible,
    isAssignPermissionsModalVisible,
    setIsAssignPermissionsModalVisible,
    roleToEdit,
    roleToAssign,
    editableMatrix,
    handlePermissionChange,
    isEditing,
    handleEdit,
    handleSave,
    handleCancel,
    handleDeleteRole,
    handleRoleSelect,
    handleEditRole,
    handleAssignPermissions,
  } = useRolePageLogic();

  return (
    <div className={styles.rolePage}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {t(ENTERPRISE_I18N_KEYS.ROLE_MANAGEMENT_TITLE)}
        </h1>
        <Button
          theme="solid"
          icon={<IconCozPlus />}
          onClick={() => setIsAddRoleModalVisible(true)}
        >
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
        </Button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.leftPanel}>
          <RoleList
            roles={roles}
            selectedRole={selectedRole}
            loading={rolesLoading}
            onRoleSelect={handleRoleSelect}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onAssignPermissions={handleAssignPermissions}
          />
        </div>
        <div className={styles.rightPanel}>
          <PermissionMatrix
            selectedRole={selectedRole}
            permissionMatrix={editableMatrix}
            setPermissionMatrix={() => {
              /* Not used anymore */
            }}
            onPermissionChange={handlePermissionChange}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* 模态框 */}
      <AddRoleModal
        visible={isAddRoleModalVisible}
        onClose={() => setIsAddRoleModalVisible(false)}
        onSuccess={() => {
          setIsAddRoleModalVisible(false);
          refreshRoles();
        }}
      />

      <EditRoleModal
        visible={isEditRoleModalVisible}
        onClose={() => setIsEditRoleModalVisible(false)}
        role={roleToEdit}
        onSuccess={() => {
          setIsEditRoleModalVisible(false);
          refreshRoles();
        }}
      />

      <AssignPermissionsModal
        visible={isAssignPermissionsModalVisible}
        onClose={() => setIsAssignPermissionsModalVisible(false)}
        role={roleToAssign}
        onSuccess={() => {
          setIsAssignPermissionsModalVisible(false);
          refreshRoles();
        }}
      />
    </div>
  );
};

// 提取业务逻辑到自定义Hook
const useRolePageLogic = () => {
  const { roles, rolesLoading, refreshRoles } = useRoleManagement();
  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
  const [isEditRoleModalVisible, setIsEditRoleModalVisible] = useState(false);
  const [isAssignPermissionsModalVisible, setIsAssignPermissionsModalVisible] =
    useState(false);
  const [roleToEdit, setRoleToEdit] = useState<RoleData | null>(null);
  const [roleToAssign, setRoleToAssign] = useState<RoleData | null>(null);

  // 当角色列表加载完成且没有选中角色时，自动选择第一个角色
  useEffect(() => {
    if (!rolesLoading && roles.length > 0 && !selectedRole) {
      const firstRole = roles[0];
      setSelectedRole(firstRole);

      // 检查第一个角色是否未分配权限，如果未分配则打开分配权限弹出框
      const hasPermissions =
        firstRole.permissions &&
        Array.isArray(firstRole.permissions) &&
        firstRole.permissions.length > 0 &&
        firstRole.permissions.some(
          group =>
            group.resources &&
            Array.isArray(group.resources) &&
            group.resources.length > 0 &&
            group.resources.some(
              resource =>
                resource.actions &&
                Array.isArray(resource.actions) &&
                resource.actions.some(action => action.is_default === 1),
            ),
        );

      if (!hasPermissions) {
        setRoleToAssign(firstRole);
        setIsAssignPermissionsModalVisible(true);
      }
    }
  }, [rolesLoading, roles, selectedRole]);

  const {
    permissionMatrix: editableMatrix,
    handlePermissionChange,
    isEditing,
    handleEdit,
    handleSave,
    handleCancel,
  } = usePermissionEditor({
    selectedRole,
    refreshRoles,
  });

  const { handleDeleteRole } = useRoleDeletion({
    refreshRoles,
    selectedRole,
    setSelectedRole,
    setPermissionMatrix: () => {
      /* no-op */
    },
    setRolePermissions: () => {
      /* no-op */
    },
  });

  const handleRoleSelect = (role: RoleData) => {
    setSelectedRole(role);
  };

  const handleEditRole = (role: RoleData) => {
    setRoleToEdit(role);
    setIsEditRoleModalVisible(true);
  };

  const handleAssignPermissions = (role: RoleData) => {
    setRoleToAssign(role);
    setIsAssignPermissionsModalVisible(true);
  };

  return {
    roles,
    rolesLoading,
    refreshRoles,
    selectedRole,
    isAddRoleModalVisible,
    setIsAddRoleModalVisible,
    isEditRoleModalVisible,
    setIsEditRoleModalVisible,
    isAssignPermissionsModalVisible,
    setIsAssignPermissionsModalVisible,
    roleToEdit,
    roleToAssign,
    editableMatrix,
    handlePermissionChange,
    isEditing,
    handleEdit,
    handleSave,
    handleCancel,
    handleDeleteRole,
    handleRoleSelect,
    handleEditRole,
    handleAssignPermissions,
  };
};

export default RolePage;
