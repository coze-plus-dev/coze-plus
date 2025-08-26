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

import { useRoleSelection } from './hooks/use-role-selection';
import { useRoleManagement } from './hooks/use-role-management';
import { useRoleDeletion } from './hooks/use-role-deletion';
import { usePermissionEditor } from './hooks/use-permission-editor';
import { RoleList } from './components/role-list';
import { PermissionMatrix } from './components/permission-matrix';
import { EditRoleModal } from './components/edit-role-modal';
import { AssignPermissionsModal } from './components/assign-permissions-modal';
import { AddRoleModal } from './components/add-role-modal';

import styles from './index.module.less';

/**
 * 检查角色是否有权限配置的辅助函数
 */
const hasRolePermissions = (role: RoleData): boolean => 
  role.permissions?.some(group => 
    group.resources?.some(resource => 
      resource.actions && resource.actions.length > 0
    )
  ) ?? false;

const RolePage: FC = () => {
  const [isAddRoleModalVisible, setIsAddRoleModalVisible] = useState(false);
  const [isEditRoleModalVisible, setIsEditRoleModalVisible] = useState(false);
  const [isAssignPermissionsModalVisible, setIsAssignPermissionsModalVisible] =
    useState(false);

  const { roles, rolesLoading, refreshRoles } = useRoleManagement();

  const [selectedRole, setSelectedRole] = useState<RoleData | null>(null);
  const [_rolePermissions, setRolePermissions] = useState<unknown[]>([]);
  const [, setCurrentPermissionMatrix] = useState<Record<string, boolean>>({});
  const [roleToEdit, setRoleToEdit] = useState<RoleData | null>(null);
  const [roleToAssign, setRoleToAssign] = useState<RoleData | null>(null);
  const [_roleDetailsLoading, setRoleDetailsLoading] = useState(false);

  const { handleRoleSelect } = useRoleSelection({
    setSelectedRole,
    setRolePermissions,
    setPermissionMatrix: setCurrentPermissionMatrix,
    setRoleToAssign,
    setIsAssignPermissionsModalVisible,
    setRoleDetailsLoading,
  });

  // 当角色列表加载完成且没有选中角色时，自动选择第一个角色
  useEffect(() => {
    if (!rolesLoading && roles.length > 0 && !selectedRole) {
      const firstRole = roles[0];

      // 判断第一个角色是否有权限配置
      const hasPermissions = hasRolePermissions(firstRole);

      if (!hasPermissions) {
        // 如果没有权限配置，弹出权限分配弹窗
        setRoleToAssign(firstRole);
        setIsAssignPermissionsModalVisible(true);
        setSelectedRole(firstRole); // 仍然需要设置为选中状态
      } else {
        // 有权限配置，正常选中
        handleRoleSelect(firstRole);
      }
    }
  }, [
    roles,
    rolesLoading,
    selectedRole,
    handleRoleSelect,
    setRoleToAssign,
    setIsAssignPermissionsModalVisible,
  ]);

  const {
    permissionMatrix: editableMatrix,
    setPermissionMatrix: setEditableMatrix,
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
    setPermissionMatrix: setCurrentPermissionMatrix,
    setRolePermissions,
  });

  const handleEditRole = (role: RoleData) => {
    setRoleToEdit(role);
    setIsEditRoleModalVisible(true);
  };

  const handleAssignPermissions = (role: RoleData) => {
    setRoleToAssign(role);
    setIsAssignPermissionsModalVisible(true);
  };

  const handleAddRoleSuccess = () => {
    setIsAddRoleModalVisible(false);
    refreshRoles();
  };

  const handleEditRoleSuccess = () => {
    setIsEditRoleModalVisible(false);
    setRoleToEdit(null);
    refreshRoles();
  };

  const handleAssignPermissionsSuccess = () => {
    setIsAssignPermissionsModalVisible(false);
    setRoleToAssign(null);
    refreshRoles();
    // 如果当前有选中的角色，重新获取其最新状态
    if (selectedRole && roleToAssign?.id === selectedRole.id) {
      handleRoleSelect(selectedRole);
    }
  };

  return (
    <div className={styles.rolePage}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {t(ENTERPRISE_I18N_KEYS.ROLE_MANAGEMENT_TITLE)}
        </h1>
        <Button
          theme="solid"
          icon={<IconCozPlus />}
          onClick={() => {
            console.log('创建按钮被点击了');
            setIsAddRoleModalVisible(true);
          }}
        >
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
        </Button>
      </div>

      <div className={styles.content}>
        <div className={styles.sider}>
          <div className={styles.siderHeader}>
            <h3 className={styles.siderTitle}>
              {t(ENTERPRISE_I18N_KEYS.ROLE_LIST_TITLE)}
            </h3>
          </div>
          <RoleList
            roles={roles}
            loading={rolesLoading}
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            onEditRole={handleEditRole}
            onDeleteRole={handleDeleteRole}
            onAssignPermissions={handleAssignPermissions}
          />
        </div>

        <div className={styles.main}>
          <PermissionMatrix
            selectedRole={selectedRole}
            permissionMatrix={editableMatrix}
            setPermissionMatrix={setEditableMatrix}
            onPermissionChange={handlePermissionChange}
            isEditing={isEditing}
            onEdit={handleEdit}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>

      <AddRoleModal
        visible={isAddRoleModalVisible}
        onClose={() => setIsAddRoleModalVisible(false)}
        onSuccess={handleAddRoleSuccess}
      />

      <EditRoleModal
        visible={isEditRoleModalVisible}
        role={roleToEdit}
        onClose={() => {
          setIsEditRoleModalVisible(false);
          setRoleToEdit(null);
        }}
        onSuccess={handleEditRoleSuccess}
      />

      <AssignPermissionsModal
        visible={isAssignPermissionsModalVisible}
        role={roleToAssign}
        onClose={() => {
          setIsAssignPermissionsModalVisible(false);
          setRoleToAssign(null);
        }}
        onSuccess={handleAssignPermissionsSuccess}
      />
    </div>
  );
};

export default RolePage;
