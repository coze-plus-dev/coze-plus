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

import { useState, useCallback, useRef } from 'react';

import { roleApi, type RoleData } from '@/api/role-api';

interface UseRolesDataParams {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  setPagination: (pagination: any) => void;
}

interface UseRolesDataResult {
  roles: RoleData[];
  rolesLoading: boolean;
  loadRoles: () => Promise<void>;
  setRoles: (roles: RoleData[] | ((prev: RoleData[]) => RoleData[])) => void;
}

export const useRolesData = ({ pagination, setPagination }: UseRolesDataParams): UseRolesDataResult => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const isLoadingRolesRef = useRef(false);

  // 加载角色列表
  const loadRoles = useCallback(async () => {
    if (isLoadingRolesRef.current) {
      return;
    }

    isLoadingRolesRef.current = true;
    setRolesLoading(true);

    try {
      const response = await roleApi.listRoles({
        page: pagination.current,
        page_size: pagination.pageSize,
        role_domain: 'global',
      });

      if (response.data && response.data.roles && Array.isArray(response.data.roles)) {
        const newRoles = response.data.roles as RoleData[];
        
        setRoles(prevRoles => {
          const updatedRoles = pagination.current === 1 ? newRoles : [...prevRoles, ...newRoles];
          return updatedRoles;
        });

        // 更新分页的total值
        const total = typeof response.data.total === 'string' ? parseInt(response.data.total, 10) : response.data.total;
        setPagination((prev: any) => ({ ...prev, total }));
      }
    } catch (error) {
      console.error('Failed to load roles:', error);
    } finally {
      setRolesLoading(false);
      isLoadingRolesRef.current = false;
    }
  }, [pagination.current, pagination.pageSize]);

  // 移除这个useEffect，让主hook控制何时加载数据

  return {
    roles,
    rolesLoading,
    loadRoles,
    setRoles,
  };
};