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

import { type FC, useState, useMemo, useCallback } from 'react';

import { IconCozRefresh } from '@coze-arch/coze-design/icons';
import {
  Button,
  Input,
  Select,
  Space,
  Pagination,
  Spin,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import type { UserData } from './types';
import { useAccountList } from './hooks/use-account-list';
import { useUserActions } from './hooks/use-user-actions';
import UserCard from './components/user-card';
import { AssignRoleModal } from './components/assign-role-modal';
import { UserRoleDetailPanel } from './components/user-role-detail-panel';
import { ResetPasswordModal } from './components/reset-password-modal';

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
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-form-type="other"
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
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

const UserListContent: FC<UserListContentProps> = ({
  users,
  loading,
  onActionClick,
  openDropdownId,
  setOpenDropdownId,
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
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
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


const AccountPage: FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<number | undefined>();
  const [assignRoleModalVisible, setAssignRoleModalVisible] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState<UserData | null>(null);
  const [userRoleDetailVisible, setUserRoleDetailVisible] = useState(false);
  const [selectedUserForRoleDetail, setSelectedUserForRoleDetail] = useState<UserData | null>(null);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [selectedUserForResetPassword, setSelectedUserForResetPassword] = useState<UserData | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // 使用 useMemo 来稳定 params 对象引用，避免不必要的重新渲染
  const accountListParams = useMemo(() => ({
    keyword: searchKeyword,
    is_disabled: statusFilter,
  }), [searchKeyword, statusFilter]);

  const {
    users,
    loading,
    pagination,
    refreshUsers,
    handlePageChange,
    handleSearch,
    updateUserStatus,
  } = useAccountList(accountListParams);

  const handleAssignRole = useCallback((user: UserData) => {
    setSelectedUserForRole(user);
    setAssignRoleModalVisible(true);
  }, []);

  const handleAssignRoleModalClose = useCallback(() => {
    setAssignRoleModalVisible(false);
    setSelectedUserForRole(null);
  }, []);

  const handleAssignRoleSuccess = useCallback(() => {
    // 重置密码成功后不需要刷新用户列表
    // 移除对 refreshUsers 的调用以避免循环依赖
  }, []);

  const handleShowUserRoleDetail = useCallback((user: UserData) => {
    setSelectedUserForRoleDetail(user);
    setUserRoleDetailVisible(true);
    // 关闭所有下拉菜单
    setOpenDropdownId(null);
  }, []);

  const handleCloseUserRoleDetail = useCallback(() => {
    setUserRoleDetailVisible(false);
    setSelectedUserForRoleDetail(null);
  }, []);

  const handleResetPassword = useCallback((user: UserData) => {
    setSelectedUserForResetPassword(user);
    setResetPasswordModalVisible(true);
    setOpenDropdownId(null);
  }, []);

  const handleCloseResetPasswordModal = () => {
    setResetPasswordModalVisible(false);
    setSelectedUserForResetPassword(null);
  };

  const handleResetPasswordSuccess = () => {
    // 重置密码成功后不需要刷新用户列表
    // 只需要关闭弹窗即可
  };

  const { handleActionClick } = useUserActions({
    updateUserStatus,
    onAssignRole: handleAssignRole,
    onShowRoleDetail: handleShowUserRoleDetail,
    onResetPassword: handleResetPassword,
  });

  const handleSearchChange = (value: string) => {
    if (typeof value !== 'string' || value === searchKeyword) {
      return;
    }
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
          openDropdownId={openDropdownId}
          setOpenDropdownId={setOpenDropdownId}
        />

        <PaginationSection
          pagination={pagination}
          onPageChange={handlePageChange}
        />
      </div>

      {/* 分配角色弹出框 */}
      <AssignRoleModal
        visible={assignRoleModalVisible}
        user={selectedUserForRole}
        onClose={handleAssignRoleModalClose}
        onSuccess={handleAssignRoleSuccess}
      />

      {/* 用户角色详情弹出框 */}
      <UserRoleDetailPanel
        visible={userRoleDetailVisible}
        user={selectedUserForRoleDetail}
        onClose={handleCloseUserRoleDetail}
      />

      {/* 重置密码弹出框 */}
      <ResetPasswordModal
        visible={resetPasswordModalVisible}
        user={selectedUserForResetPassword}
        onClose={handleCloseResetPasswordModal}
        onSuccess={handleResetPasswordSuccess}
      />
    </div>
  );
};

export default AccountPage;
export { AccountHeader, AccountToolbar, UserListContent, PaginationSection };
