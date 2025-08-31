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

import { useRequest } from 'ahooks';
import { Toast } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { employeeApi } from '@/api/corporation-api';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string;
  name?: string;
}

export interface EmployeeData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: number;
  departments?: Array<{
    department_id: string;
    department_name: string;
    department_path: string;
    is_primary: boolean;
    corp_id: string;
    corp_name: string;
    job_title?: string;
  }>;
  user_id?: string;
}

interface UseMemberTableProps {
  selectedNode?: SelectedNodeInfo;
  searchKeyword?: string;
  onShowDetail?: (employee: EmployeeData) => void;
}

export const useMemberTable = ({
  selectedNode,
  searchKeyword,
  onShowDetail,
}: UseMemberTableProps) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  // Modal states
  const [changeDepartmentVisible, setChangeDepartmentVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeData | null>(
    null,
  );
  const [resignConfirmVisible, setResignConfirmVisible] = useState(false);
  const [resignEmployee, setResignEmployee] = useState<EmployeeData | null>(
    null,
  );
  const [restoreVisible, setRestoreVisible] = useState(false);
  const [restoreEmployee, setRestoreEmployee] = useState<EmployeeData | null>(
    null,
  );

  // Fetch employees
  const {
    data: employeeData,
    loading,
    run: fetchEmployees,
    refresh,
  } = useRequest(
    async (page = 1, pageSize = 20) => {
      if (!selectedNode) {
        return { list: [], total: 0 };
      }

      const params: Record<string, unknown> = {
        page,
        page_size: pageSize,
      };

      if (searchKeyword && searchKeyword.trim()) {
        params.keyword = searchKeyword.trim();
      }

      if (selectedNode.type === 'corp') {
        params.corp_id = selectedNode.id;
      } else if (selectedNode.type === 'dept') {
        params.department_id = selectedNode.id;
        // 部门选择时也需要传递corp_id
        if (selectedNode.corpId) {
          params.corp_id = selectedNode.corpId;
        }
      }

      // 确保corp_id存在，如果不存在则抛出错误或返回空结果
      if (!params.corp_id) {
        console.warn('Missing corp_id for employee list request', selectedNode);
        return { list: [], total: 0 };
      }

      const result = await employeeApi.listEmployees(params as Parameters<typeof employeeApi.listEmployees>[0]);
      return {
        list: result.data || [],
        total: result.total || 0,
      };
    },
    {
      manual: true,
      onSuccess: data => {
        setPagination(prev => ({
          ...prev,
          total: data.total,
        }));
      },
      refreshDeps: [selectedNode, searchKeyword],
    },
  );

  // Event handlers
  const handleResignEmployee = useCallback((employee: EmployeeData) => {
    setResignEmployee(employee);
    setResignConfirmVisible(true);
  }, []);

  const handleRestoreEmployee = useCallback((employee: EmployeeData) => {
    setRestoreEmployee(employee);
    setRestoreVisible(true);
  }, []);

  const handleAction = useCallback(
    (action: string, record: EmployeeData) => {
      switch (action) {
        case 'changeDepartment':
          setSelectedEmployee(record);
          setChangeDepartmentVisible(true);
          break;
        case 'resignation':
          handleResignEmployee(record);
          break;
        case 'restore':
          handleRestoreEmployee(record);
          break;
        default:
          break;
      }
    },
    [handleResignEmployee, handleRestoreEmployee],
  );

  const handlePaginationChange = useCallback(
    (page: number, pageSize: number) => {
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
      }));
      setTimeout(() => {
        fetchEmployees(page, pageSize);
      }, 0);
    },
    [fetchEmployees],
  );

  const handleShowDetail = useCallback(
    (record: EmployeeData) => {
      if (onShowDetail) {
        onShowDetail(record);
      }
    },
    [onShowDetail],
  );

  // Employee resignation
  const { loading: resignLoading, run: runResignEmployee } = useRequest(
    async (employeeId: string, reason?: string) => {
      const empId = String(employeeId);
      return employeeApi.resignEmployee({
        id: empId,
        reason,
      });
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(
          t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_SUCCESS_MESSAGE),
        );
        setResignConfirmVisible(false);
        setResignEmployee(null);
        fetchEmployees(pagination.current, pagination.pageSize);
      },
      onError: error => {
        Toast.error(
          error.message ||
            t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_FAILED_MESSAGE),
        );
      },
    },
  );

  // Confirm handlers
  const handleConfirmResign = useCallback(() => {
    if (resignEmployee && resignEmployee.id) {
      runResignEmployee(resignEmployee.id);
    }
  }, [resignEmployee, runResignEmployee]);

  // 恢复在职成功处理
  const handleRestoreSuccess = useCallback(() => {
    setRestoreVisible(false);
    setRestoreEmployee(null);
    fetchEmployees(pagination.current, pagination.pageSize);
  }, [fetchEmployees, pagination.current, pagination.pageSize]);

  // Effects
  useEffect(() => {
    if (selectedNode) {
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchEmployees(1, pagination.pageSize);
    }
  }, [selectedNode, searchKeyword, fetchEmployees, pagination.pageSize]);

  const dataSource = employeeData?.list || [];

  return {
    // Data
    dataSource,
    pagination,
    loading,
    selectedNode,

    // Modal states
    changeDepartmentVisible,
    setChangeDepartmentVisible,
    selectedEmployee,
    resignConfirmVisible,
    setResignConfirmVisible,
    resignEmployee,
    restoreVisible,
    setRestoreVisible,
    restoreEmployee,
    resignLoading,

    // Event handlers
    handleAction,
    handlePaginationChange,
    handleShowDetail,
    handleConfirmResign,
    handleRestoreSuccess,
    refresh,
  };
};
