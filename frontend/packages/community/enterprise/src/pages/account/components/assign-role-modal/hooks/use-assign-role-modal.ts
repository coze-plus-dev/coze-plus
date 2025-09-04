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

import { useState, useEffect, useCallback } from 'react';

import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';
import type { UserData } from '../../../types';

import { useRolesData } from './use-roles-data';
import { useUserRoles } from './use-user-roles';

interface UseAssignRoleModalParams {
  user: UserData | null;
  visible: boolean;
  onSuccess?: () => void;
  onClose: () => void;
}

interface UseAssignRoleModalResult {
  roles: RoleData[];
  rolesLoading: boolean;
  selectedRoles: Set<string>;
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loadMore: () => void;
  hasMore: boolean;
  toggleRoleSelection: (role: RoleData, checked: boolean) => void;
  handleSave: () => Promise<void>;
}

export const useAssignRoleModal = ({
  user,
  visible,
  onSuccess,
  onClose,
}: UseAssignRoleModalParams): UseAssignRoleModalResult => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // 使用分离的hooks
  const {
    roles,
    rolesLoading,
    loadRoles,
  } = useRolesData({ pagination, setPagination });

  const {
    selectedRoles,
    loading,
    loadUserCurrentRoles,
    toggleRoleSelection: baseToggleRoleSelection,
    saveRoleAssignment,
    setSelectedRoles,
  } = useUserRoles({ user, visible });

  // 增强的角色选择逻辑
  const toggleRoleSelection = useCallback((role: RoleData, checked: boolean) => {
    const roleId = role.id?.toString();
    if (!roleId) {
      return;
    }

    const hasPermissions = !!(role.permissions && role.permissions.length > 0);
    if (!hasPermissions && checked) {
      Toast.warning(t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_NO_PERMISSIONS_WARNING));
      return;
    }

    baseToggleRoleSelection(roleId, checked);
  }, [baseToggleRoleSelection]);

  // 加载更多数据
  const loadMore = useCallback(() => {
    if (roles.length < pagination.total) {
      setPagination(prev => ({ ...prev, current: prev.current + 1 }));
    }
  }, [roles.length, pagination.total]);

  const hasMore = roles.length < pagination.total;

  // 保存角色分配
  const handleSave = useCallback(async () => {
    await saveRoleAssignment(onSuccess, onClose);
  }, [saveRoleAssignment, onSuccess, onClose]);

  // 当弹窗打开时加载数据
  useEffect(() => {
    if (visible) {
      console.log('Modal opened, loading roles and user roles...');
      loadRoles();
      loadUserCurrentRoles();
    }
  }, [visible, loadRoles, loadUserCurrentRoles]);

  // 添加调试日志
  useEffect(() => {
    console.log('Main hook state:', { 
      visible, 
      roles: roles.length, 
      rolesLoading, 
      selectedRoles: selectedRoles.size, 
      pagination 
    });
  }, [visible, roles, rolesLoading, selectedRoles, pagination]);

  // 单独处理重置逻辑  
  useEffect(() => {
    if (!visible) {
      setSelectedRoles(new Set());
      // 延迟重置分页，给数据加载留时间
      setTimeout(() => {
        setPagination({
          current: 1,
          pageSize: 20,
          total: 0,
        });
      }, 100);
    }
  }, [visible]);

  return {
    roles,
    rolesLoading,
    selectedRoles,
    loading,
    pagination,
    loadMore,
    hasMore,
    toggleRoleSelection,
    handleSave,
  };
};