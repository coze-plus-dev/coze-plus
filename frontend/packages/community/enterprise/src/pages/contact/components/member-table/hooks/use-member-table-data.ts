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
import { type employee } from '@coze-studio/api-schema';

import { employeeApi } from '@/api/corporation-api';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string;
  name?: string;
}

// 使用API schema中的EmployeeData类型
type EmployeeData = employee.employee.EmployeeData;

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

      // 构建请求参数，确保corp_id始终存在
      let corpId: string;
      let departmentId: string | undefined;

      if (nodeInfo.type === 'corp') {
        corpId = nodeInfo.id;
      } else if (nodeInfo.type === 'dept') {
        departmentId = nodeInfo.id;
        corpId = nodeInfo.corpId || nodeInfo.id; // 如果没有corpId，使用部门id作为备选
      } else {
        // 不应该到这里，但为了类型安全
        corpId = nodeInfo.id;
      }

      const requestParams: {
        corp_id: string;
        department_id?: string;
        keyword?: string;
        status?: employee.employee.common.EmployeeStatus;
        page?: number;
        page_size?: number;
      } = {
        corp_id: corpId,
        page,
        page_size: pageSize,
      };

      if (departmentId) {
        requestParams.department_id = departmentId;
      }

      if (search && search.trim()) {
        requestParams.keyword = search.trim();
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
