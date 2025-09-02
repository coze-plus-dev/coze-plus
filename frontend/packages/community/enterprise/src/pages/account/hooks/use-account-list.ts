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

import { useState, useEffect, useCallback, useRef } from 'react';

import { permission } from '@coze-studio/api-schema';

import type { AccountListParams, AccountListState, UserData } from '../types';

interface ApiResponse {
  code: number;
  msg?: string;
  data?: {
    users?: UserData[];
    total?: string;
  };
}

interface UpdateUserStatusResponse {
  code: number;
  msg?: string;
}

const DEFAULT_PAGE_SIZE = 20;

interface UseAccountListProps extends AccountListParams {
  // Inherits all properties from AccountListParams
  onError?: (error: Error) => void;
}

// Helper function to handle API response
const handleApiResponse = (
  response: ApiResponse,
  setState: React.Dispatch<React.SetStateAction<AccountListState>>,
) => {
  if (response.code === 0 && response.data) {
    const { users = [], total = '0' } = response.data;

    setState(prevState => ({
      ...prevState,
      users: users as UserData[],
      pagination: {
        ...prevState.pagination,
        total: parseInt(total, 10) || 0,
      },
      loading: false,
    }));
  } else {
    console.error('Failed to fetch users:', response.msg || 'No data returned');
    setState(prevState => ({
      ...prevState,
      users: [],
      pagination: {
        ...prevState.pagination,
        total: 0,
      },
      loading: false,
    }));
  }
};

// Helper function to handle API errors
const handleApiError = (
  error: unknown,
  setState: React.Dispatch<React.SetStateAction<AccountListState>>,
) => {
  console.error('Failed to fetch users:', error);
  setState(prevState => ({ ...prevState, loading: false }));
};

// Helper function for fetching users
const fetchUsersImpl = (
  setState: React.Dispatch<React.SetStateAction<AccountListState>>,
  paramsRef: React.MutableRefObject<UseAccountListProps>,
  requestParams?: Partial<AccountListParams>,
) => {
  setState(prev => {
    const currentParams = paramsRef.current;
    const queryParams = {
      keyword: currentParams.keyword,
      is_disabled: currentParams.is_disabled,
      page: prev.pagination.current,
      limit: prev.pagination.pageSize,
      ...requestParams,
    };

    // Set loading to true and start the async request
    permission
      .ListUsers(queryParams)
      .then((response: ApiResponse) => {
        handleApiResponse(response, setState);
      })
      .catch((error: unknown) => {
        handleApiError(error, setState);
      });

    return { ...prev, loading: true };
  });
};

// Helper function for updating user status
const updateUserStatusImpl = async (
  userId: string,
  isDisabled: number,
): Promise<{ success: boolean; message: string }> => {
  try {
    // Convert isDisabled to UserStatus enum values
    // isDisabled: 0 = enabled, 1 = disabled
    // UserStatus.ENABLED = 0, UserStatus.DISABLED = 1
    const status = isDisabled === 1 ? 1 : 0; // 1 = DISABLED, 0 = ENABLED

    const requestParams = {
      user_id: userId,
      is_disabled: status,
    };
    console.log('Calling UpdateUserStatus API:', requestParams);

    let response: UpdateUserStatusResponse;
    try {
      response = await permission.UpdateUserStatus(requestParams);
      console.log('API Response received:', response);
    } catch (apiError) {
      console.error('API call failed:', apiError);
      throw apiError;
    }

    if (response && response.code === 0) {
      return { success: true, message: response.msg || 'Success' };
    } else {
      const message = response?.msg || 'Update failed';
      console.error('API returned error:', response);
      return { success: false, message };
    }
  } catch (error) {
    console.error('Failed to update user status:', error);
    // 确保错误对象有适当的消息
    const errorMessage =
      error instanceof Error ? error.message : 'Network error occurred';
    return { success: false, message: errorMessage };
  }
};

// Helper function for updating user status with state update
const updateUserStatusWithState = async (
  setState: React.Dispatch<React.SetStateAction<AccountListState>>,
  userId: string,
  isDisabled: number,
) => {
  const result = await updateUserStatusImpl(userId, isDisabled);

  if (result.success) {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      users: prev.users.map(user =>
        String(user.user_id) === userId
          ? { ...user, is_disabled: isDisabled }
          : user,
      ),
    }));
  }

  return result;
};

export const useAccountList = (params: UseAccountListProps) => {
  const [state, setState] = useState<AccountListState>({
    users: [],
    loading: false,
    pagination: {
      current: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      total: 0,
    },
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  // Fetch users list
  const fetchUsers = useCallback(
    (requestParams?: Partial<AccountListParams>) => {
      fetchUsersImpl(setState, paramsRef, requestParams);
    },
    [], // Remove state dependencies to prevent infinite loop
  );

  // Update user status
  const updateUserStatus = useCallback(
    async (userId: string, isDisabled: number) =>
      updateUserStatusWithState(setState, userId, isDisabled),
    [],
  );

  // Refresh users list
  const refreshUsers = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle pagination change
  const handlePageChange = useCallback(
    (page: number, pageSize?: number) => {
      setState(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          current: page,
          pageSize: pageSize || prev.pagination.pageSize,
        },
      }));
      // Fetch data with new pagination parameters
      fetchUsers({ page, limit: pageSize });
    },
    [fetchUsers],
  );

  // Handle search
  const handleSearch = useCallback(
    (keyword: string) => {
      setState(prev => ({
        ...prev,
        pagination: {
          ...prev.pagination,
          current: 1, // Reset to first page when searching
        },
      }));
      fetchUsers({ keyword, page: 1 });
    },
    [fetchUsers],
  );

  // Initial data fetch on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Include fetchUsers in dependency array

  return {
    users: state.users,
    loading: state.loading,
    pagination: state.pagination,
    refreshUsers,
    handlePageChange,
    handleSearch,
    fetchUsers,
    updateUserStatus,
  };
};
