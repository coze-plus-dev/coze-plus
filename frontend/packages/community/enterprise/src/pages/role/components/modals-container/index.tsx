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

import type { FC } from 'react';

import type { RoleData } from '@/api/role-api';

import { EditRoleModal } from '../edit-role-modal';
import { AssignPermissionsModal } from '../assign-permissions-modal';
import { AddRoleModal } from '../add-role-modal';

interface ModalsContainerProps {
  // Add Role Modal
  isAddRoleModalVisible: boolean;
  setIsAddRoleModalVisible: (visible: boolean) => void;
  
  // Edit Role Modal
  isEditRoleModalVisible: boolean;
  setIsEditRoleModalVisible: (visible: boolean) => void;
  roleToEdit: RoleData | null;
  
  // Assign Permissions Modal
  isAssignPermissionsModalVisible: boolean;
  setIsAssignPermissionsModalVisible: (visible: boolean) => void;
  roleToAssign: RoleData | null;
  
  // Callbacks
  onRoleUpdated: () => void;
}

export const ModalsContainer: FC<ModalsContainerProps> = ({
  isAddRoleModalVisible,
  setIsAddRoleModalVisible,
  isEditRoleModalVisible,
  setIsEditRoleModalVisible,
  roleToEdit,
  isAssignPermissionsModalVisible,
  setIsAssignPermissionsModalVisible,
  roleToAssign,
  onRoleUpdated,
}) => {
  return (
    <>
      <AddRoleModal
        visible={isAddRoleModalVisible}
        onClose={() => setIsAddRoleModalVisible(false)}
        onSuccess={() => {
          setIsAddRoleModalVisible(false);
          onRoleUpdated();
        }}
      />

      <EditRoleModal
        visible={isEditRoleModalVisible}
        onClose={() => setIsEditRoleModalVisible(false)}
        role={roleToEdit}
        onSuccess={() => {
          setIsEditRoleModalVisible(false);
          onRoleUpdated();
        }}
      />

      <AssignPermissionsModal
        visible={isAssignPermissionsModalVisible}
        onClose={() => setIsAssignPermissionsModalVisible(false)}
        role={roleToAssign}
        onSuccess={() => {
          setIsAssignPermissionsModalVisible(false);
          onRoleUpdated();
        }}
      />
    </>
  );
};