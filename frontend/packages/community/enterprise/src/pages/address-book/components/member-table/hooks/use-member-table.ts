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
import { type employee } from '@coze-studio/api-schema';
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

// 使用API schema中的EmployeeData类型
export type EmployeeData = employee.employee.EmployeeData;

interface UseMemberTableProps {
  selectedNode?: SelectedNodeInfo;
  searchKeyword?: string;
  onShowDetail?: (employee: EmployeeData) => void;
}

// useMemberTable hook 的返回类型
interface UseMemberTableReturn {
  // Data
  dataSource: EmployeeData[];
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  loading: boolean;
  selectedNode: SelectedNodeInfo | undefined;

  // Modal states
  changeDepartmentVisible: boolean;
  setChangeDepartmentVisible: (visible: boolean) => void;
  selectedEmployee: EmployeeData | null;
  setSelectedEmployee: (employee: EmployeeData | null) => void;
  resignConfirmVisible: boolean;
  setResignConfirmVisible: (visible: boolean) => void;
  resignEmployee: EmployeeData | null;
  setResignEmployee: (employee: EmployeeData | null) => void;
  restoreVisible: boolean;
  setRestoreVisible: (visible: boolean) => void;
  restoreEmployee: EmployeeData | null;
  setRestoreEmployee: (employee: EmployeeData | null) => void;

  // Loading states
  resignLoading: boolean;

  // Event handlers
  handleAction: (action: string, record: EmployeeData) => void;
  handlePaginationChange: (page: number, pageSize: number) => void;
  handleShowDetail: (record: EmployeeData) => void;
  handleConfirmResign: () => void;
  handleRestoreSuccess: () => void;

  // Refresh function
  refresh: () => void;
}

// Helper function to build API params
const buildEmployeeParams = (options: {
  selectedNode: SelectedNodeInfo | undefined;
  searchKeyword: string | undefined;
  page: number;
  pageSize: number;
}) => {
  const { selectedNode, searchKeyword, page, pageSize } = options;

  if (!selectedNode) {
    return null;
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
    if (selectedNode.corpId) {
      params.corp_id = selectedNode.corpId;
    }
  }

  if (!params.corp_id) {
    console.warn('Missing corp_id for employee list request', selectedNode);
    return null;
  }

  return params as Parameters<typeof employeeApi.listEmployees>[0];
};

// Hook for modal states management
const useModalStates = () => {
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

  return {
    changeDepartmentVisible,
    setChangeDepartmentVisible,
    selectedEmployee,
    setSelectedEmployee,
    resignConfirmVisible,
    setResignConfirmVisible,
    resignEmployee,
    setResignEmployee,
    restoreVisible,
    setRestoreVisible,
    restoreEmployee,
    setRestoreEmployee,
  };
};

// Hook for employee data fetching
const useEmployeeData = (
  selectedNode: SelectedNodeInfo | undefined,
  searchKeyword: string | undefined,
) => {
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const {
    data: employeeData,
    loading,
    run: fetchEmployees,
    refresh,
  } = useRequest(
    async (page = 1, pageSize = 20) => {
      const params = buildEmployeeParams({
        selectedNode,
        searchKeyword,
        page,
        pageSize,
      });
      if (!params) {
        return { list: [], total: 0 };
      }

      const result = await employeeApi.listEmployees(params);
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

  return {
    employeeData,
    loading,
    fetchEmployees,
    refresh,
    pagination,
    setPagination,
  };
};

// Hook for resignation operations
const useResignation = (
  fetchEmployees: (page: number, pageSize: number) => void,
  pagination: { current: number; pageSize: number },
) => {
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

  return {
    resignLoading,
    runResignEmployee,
  };
};

// Hook for event handlers
const useEventHandlers = (options: {
  modalStates: ReturnType<typeof useModalStates>;
  fetchEmployees: (page: number, pageSize: number) => void;
  pagination: { current: number; pageSize: number };
  setPagination: React.Dispatch<
    React.SetStateAction<{ current: number; pageSize: number; total: number }>
  >;
  runResignEmployee: (employeeId: string) => void;
  onShowDetail?: (employee: EmployeeData) => void;
}) => {
  const {
    modalStates,
    fetchEmployees,
    pagination,
    setPagination,
    runResignEmployee,
    onShowDetail,
  } = options;
  const handleResignEmployee = useCallback(
    (employee: EmployeeData) => {
      modalStates.setResignEmployee(employee);
      modalStates.setResignConfirmVisible(true);
    },
    [modalStates],
  );

  const handleRestoreEmployee = useCallback(
    (employee: EmployeeData) => {
      modalStates.setRestoreEmployee(employee);
      modalStates.setRestoreVisible(true);
    },
    [modalStates],
  );

  const handleAction = useCallback(
    (action: string, record: EmployeeData) => {
      switch (action) {
        case 'changeDepartment':
          modalStates.setSelectedEmployee(record);
          modalStates.setChangeDepartmentVisible(true);
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
    [modalStates, handleResignEmployee, handleRestoreEmployee],
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
    [fetchEmployees, setPagination],
  );

  const handleShowDetail = useCallback(
    (record: EmployeeData) => {
      if (onShowDetail) {
        onShowDetail(record);
      }
    },
    [onShowDetail],
  );

  const handleConfirmResign = useCallback(() => {
    if (modalStates.resignEmployee && modalStates.resignEmployee.id) {
      runResignEmployee(modalStates.resignEmployee.id);
      modalStates.setResignConfirmVisible(false);
      modalStates.setResignEmployee(null);
    }
  }, [modalStates, runResignEmployee]);

  const handleRestoreSuccess = useCallback(() => {
    modalStates.setRestoreVisible(false);
    modalStates.setRestoreEmployee(null);
    fetchEmployees(pagination.current, pagination.pageSize);
  }, [modalStates, fetchEmployees, pagination]);

  return {
    handleAction,
    handlePaginationChange,
    handleShowDetail,
    handleConfirmResign,
    handleRestoreSuccess,
  };
};

export const useMemberTable = ({
  selectedNode,
  searchKeyword,
  onShowDetail,
}: UseMemberTableProps): UseMemberTableReturn => {
  const modalStates = useModalStates();
  const {
    employeeData,
    loading,
    fetchEmployees,
    refresh,
    pagination,
    setPagination,
  } = useEmployeeData(selectedNode, searchKeyword);

  const { resignLoading, runResignEmployee } = useResignation(
    fetchEmployees,
    pagination,
  );

  const eventHandlers = useEventHandlers({
    modalStates,
    fetchEmployees,
    pagination,
    setPagination,
    runResignEmployee,
    onShowDetail,
  });

  // Effects
  useEffect(() => {
    if (selectedNode) {
      setPagination(prev => ({ ...prev, current: 1 }));
      fetchEmployees(1, pagination.pageSize);
    }
  }, [
    selectedNode,
    searchKeyword,
    fetchEmployees,
    setPagination,
    pagination.pageSize,
  ]);

  const dataSource = employeeData?.list || [];

  return {
    // Data
    dataSource,
    pagination,
    loading,
    selectedNode,

    // Modal states
    ...modalStates,
    resignLoading,

    // Event handlers
    ...eventHandlers,
    refresh,
  };
};
