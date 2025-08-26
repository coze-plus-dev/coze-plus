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

import { useState, useEffect } from 'react';

import { useRequest } from 'ahooks';

import { employeeApi } from '@/api/corporation-api';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string;
  name?: string;
}

interface EmployeeData {
  id: string;
  name: string;
  email?: string;
  mobile?: string;
  status: number;
  departments: Array<{
    department_id: string;
    department_name: string;
    is_primary: boolean;
    corp_id: string;
    corp_name: string;
  }>;
}

interface UseMemberTableDataProps {
  selectedNode: SelectedNodeInfo | null;
  searchValue: string;
}

export const useMemberTableData = ({
  selectedNode,
  searchValue,
}: UseMemberTableDataProps) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [employeeList, setEmployeeList] = useState<EmployeeData[]>([]);

  const { loading, run: fetchEmployees } = useRequest(
    async (params?: {
      page?: number;
      pageSize?: number;
      searchValue?: string;
      nodeInfo?: SelectedNodeInfo | null;
    }) => {
      const {
        page = 1,
        pageSize = 20,
        searchValue: search = '',
        nodeInfo,
      } = params || {};

      if (!nodeInfo?.id) {
        return { list: [], total: 0 };
      }

      const requestParams: Record<string, unknown> = {
        page,
        page_size: pageSize,
      };

      if (search && search.trim()) {
        requestParams.keyword = search.trim();
      }

      if (nodeInfo.type === 'corp') {
        requestParams.corp_id = nodeInfo.id;
      } else if (nodeInfo.type === 'dept') {
        requestParams.department_id = nodeInfo.id;
        if (nodeInfo.corpId) {
          requestParams.corp_id = nodeInfo.corpId;
        }
      }

      const response = await employeeApi.listEmployees(requestParams);

      return {
        list: response.data || [],
        total: response.total || 0,
      };
    },
    {
      manual: true,
      onSuccess: ({ list, total }) => {
        setEmployeeList(list);
        setPagination(prev => ({
          ...prev,
          total,
        }));
      },
    },
  );

  // 当selectedNode或searchValue变化时重新加载数据
  useEffect(() => {
    if (selectedNode?.id) {
      fetchEmployees({
        page: 1,
        pageSize: pagination.pageSize,
        searchValue,
        nodeInfo: selectedNode,
      });
      setPagination(prev => ({ ...prev, current: 1 }));
    } else {
      setEmployeeList([]);
      setPagination(prev => ({ ...prev, total: 0, current: 1 }));
    }
  }, [selectedNode?.id, searchValue, pagination.pageSize, fetchEmployees]);

  // 分页变化
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current: page }));
    fetchEmployees({
      page,
      pageSize: pagination.pageSize,
      searchValue,
      nodeInfo: selectedNode,
    });
  };

  const refreshData = () => {
    if (selectedNode?.id) {
      fetchEmployees({
        page: pagination.current,
        pageSize: pagination.pageSize,
        searchValue,
        nodeInfo: selectedNode,
      });
    }
  };

  return {
    employeeList,
    pagination,
    loading,
    handlePageChange,
    refreshData,
  };
};
