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

import { type FC, useState } from 'react';

import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import {
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Toast,
  Spin,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import type { UserData } from './types';
import { useAccountList } from './hooks/use-account-list';
import UserCard from './components/user-card';

import styles from './index.module.less';

const { Option } = Select;

interface AccountHeaderProps {
  title: string;
  description: string;
}

const AccountHeader: FC<AccountHeaderProps> = ({ title, description }) => (
  <div className={styles.header}>
    <div className={styles.title}>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  </div>
);

interface AccountToolbarProps {
  searchKeyword: string;
  statusFilter: number | undefined;
  loading: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: unknown) => void;
  onRefresh: () => void;
}

const AccountToolbar: FC<AccountToolbarProps> = ({
  searchKeyword,
  statusFilter,
  loading,
  onSearchChange,
  onStatusChange,
  onRefresh,
}) => (
  <div className={styles.toolbar}>
    <Space>
      <Input
        placeholder={t(ENTERPRISE_I18N_KEYS.ACCOUNT_SEARCH_PLACEHOLDER)}
        value={searchKeyword}
        onChange={onSearchChange}
        style={{ width: 240 }}
      />
      <Select
        placeholder={t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_FILTER_PLACEHOLDER)}
        value={statusFilter}
        onChange={onStatusChange}
        style={{ width: 120 }}
      >
        <Option value={0}>
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_ENABLED)}
        </Option>
        <Option value={1}>
          {t(ENTERPRISE_I18N_KEYS.ACCOUNT_STATUS_DISABLED)}
        </Option>
      </Select>
      <Button icon={<IconCozRefresh />} onClick={onRefresh} loading={loading}>
        {t(ENTERPRISE_I18N_KEYS.ACCOUNT_REFRESH)}
      </Button>
    </Space>
  </div>
);

interface UserListContentProps {
  users: UserData[];
  loading: boolean;
  onActionClick: (action: string, record: UserData) => void;
}

const UserListContent: FC<UserListContentProps> = ({
  users,
  loading,
  onActionClick,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className={styles.empty}>
        {t(ENTERPRISE_I18N_KEYS.ACCOUNT_EMPTY_DATA)}
      </div>
    );
  }

  return (
    <div className={styles.userList}>
      {users.map(item => (
        <UserCard
          key={item.user_id}
          item={item}
          onActionClick={onActionClick}
        />
      ))}
    </div>
  );
};

interface PaginationSectionProps {
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPageChange: (page: number, pageSize?: number) => void;
}

const PaginationSection: FC<PaginationSectionProps> = ({
  pagination,
  onPageChange,
}) => {
  if (pagination.total <= 0) {
    return null;
  }

  return (
    <div className={styles.paginationWrapper}>
      <Pagination
        currentPage={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        showSizeChanger={true}
        showQuickJumper={true}
        onChange={(page, pageSize) => onPageChange(page, pageSize)}
      />
    </div>
  );
};

// Custom hook for handling user actions
const useUserActions = (
  updateUserStatus: (
    userId: string,
    isDisabled: number,
  ) => Promise<{ success: boolean; message: string }>,
) => {
  const handleUserStatusUpdate = async (action: string, record: UserData) => {
    const isDisable = action === 'disable';
    const newStatus = isDisable ? 1 : 0;
    console.log(
      'Updating user status - Action:',
      action,
      'User ID:',
      record.user_id,
      'New status:',
      newStatus,
    );

    try {
      const result = await updateUserStatus(String(record.user_id), newStatus);
      console.log('Update result:', result);

      if (result && result.success) {
        Toast.success(
          isDisable
            ? t(ENTERPRISE_I18N_KEYS.ACCOUNT_DISABLE_SUCCESS)
            : t(ENTERPRISE_I18N_KEYS.ACCOUNT_ENABLE_SUCCESS),
        );
      } else {
        const message =
          result?.message || t(ENTERPRISE_I18N_KEYS.ACCOUNT_OPERATION_FAILED);
        Toast.error(message);
      }
    } catch (error) {
      console.error('Error in handleUserStatusUpdate:', error);
      Toast.error(t(ENTERPRISE_I18N_KEYS.ACCOUNT_OPERATION_FAILED));
    }
  };

  const handleActionClick = async (action: string, record: UserData) => {
    console.log('handleActionClick called - Action:', action, 'User:', record);

    switch (action) {
      case 'enable':
      case 'disable':
        await handleUserStatusUpdate(action, record);
        break;
      case 'assignRole':
        // TODO: 实现分配角色
        Toast.info(t(ENTERPRISE_I18N_KEYS.ACCOUNT_FEATURE_COMING_SOON));
        break;
      case 'roleList':
        // TODO: 实现查看角色列表
        Toast.info(t(ENTERPRISE_I18N_KEYS.ACCOUNT_FEATURE_COMING_SOON));
        break;
      case 'resetPassword':
        // TODO: 实现重置密码
        Toast.info(t(ENTERPRISE_I18N_KEYS.ACCOUNT_FEATURE_COMING_SOON));
        break;
      default:
        break;
    }
  };

  return { handleActionClick };
};

const AccountPage: FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();

  const {
    users,
    loading,
    pagination,
    refreshUsers,
    handlePageChange,
    handleSearch,
    updateUserStatus,
  } = useAccountList({
    keyword: searchKeyword,
    is_disabled: statusFilter,
  });

  const { handleActionClick } = useUserActions(updateUserStatus);

  const handleSearchChange = (value: string) => {
    setSearchKeyword(value);
    handleSearch(value);
  };

  const handleStatusChange = (value: unknown) => {
    setStatusFilter(value as number | undefined);
  };

  return (
    <div className={styles.accountPage}>
      <AccountHeader
        title={t(ENTERPRISE_I18N_KEYS.ACCOUNT_MANAGEMENT_TITLE)}
        description={t(ENTERPRISE_I18N_KEYS.ACCOUNT_MANAGEMENT_DESCRIPTION)}
      />

      <AccountToolbar
        searchKeyword={searchKeyword}
        statusFilter={statusFilter}
        loading={loading}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onRefresh={refreshUsers}
      />

      <div className={styles.listContainer}>
        <UserListContent
          users={users}
          loading={loading}
          onActionClick={handleActionClick}
        />

        <PaginationSection
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AccountPage;
export { AccountHeader, AccountToolbar, UserListContent, PaginationSection };
