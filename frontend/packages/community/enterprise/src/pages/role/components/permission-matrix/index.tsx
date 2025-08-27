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

import { usePermissionData } from './hooks/use-permission-data';
import { PermissionTable } from './components/permission-table';
import { NoRoleSelected, LoadingState, NoPermissions } from './components/empty-states';
import styles from './index.module.less';

interface PermissionMatrixProps {
  selectedRole: RoleData | null;
  permissionMatrix: Record<string, boolean>;
  setPermissionMatrix: (matrix: Record<string, boolean>) => void;
  onPermissionChange: (permissionId: string, checked: boolean) => void;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const PermissionMatrix: FC<PermissionMatrixProps> = ({
  selectedRole,
  permissionMatrix,
  onPermissionChange,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}) => {
  const loading = false;
  const permissionData = usePermissionData(selectedRole, permissionMatrix);

  if (!selectedRole) {
    return <NoRoleSelected />;
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className={styles.permissionMatrix}>
      <div className={styles.content}>
        {permissionData.length === 0 ? (
          <NoPermissions />
        ) : (
          <div className={styles.permissionList}>

            <PermissionTable
              permissionData={permissionData}
              isEditing={isEditing}
              onPermissionChange={onPermissionChange}
              selectedRole={selectedRole}
              onEdit={onEdit}
              onSave={onSave}
              onCancel={onCancel}
            />
          </div>
        )}
      </div>
    </div>
  );
};