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

import { forwardRef, useImperativeHandle } from 'react';

import { IconCozEmpty } from '@coze-arch/coze-design/icons';
import { Table, EmptyState, Spin } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';
import { useMemberTableData } from '../hooks/use-member-table-data';
import type { EmployeeData } from '../hooks/use-member-table';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string;
  name?: string;
}

export interface MemberTableRef {
  refresh: () => void;
  getSelectedEmployees: () => string[];
}

interface MemberTableProps {
  selectedNode: SelectedNodeInfo | null;
  searchValue: string;
  onSelectEmployee?: (employeeId: string) => void;
}

export const MemberTableSimple = forwardRef<MemberTableRef, MemberTableProps>(
  ({ selectedNode, searchValue, onSelectEmployee }, ref) => {
    const { employeeList, pagination, loading, handlePageChange, refreshData } =
      useMemberTableData({ selectedNode, searchValue });

    useImperativeHandle(ref, () => ({
      refresh: refreshData,
      getSelectedEmployees: () => [],
    }));

    const columns = [
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NAME),
        dataIndex: 'name',
        key: 'name',
        width: 120,
        render: (text: string) => text || '-',
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMAIL),
        dataIndex: 'email',
        key: 'email',
        width: 200,
        render: (text: string) => text || '-',
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE),
        dataIndex: 'mobile',
        key: 'mobile',
        width: 130,
        render: (text: string) => text || '-',
      },
    ];

    if (loading) {
      return (
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      );
    }

    if (!selectedNode) {
      return (
        <EmptyState
          icon={<IconCozEmpty />}
          title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NO_NODE_SELECTED)}
          description={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SELECT_NODE_TO_VIEW)}
        />
      );
    }

    return (
      <Table
        className={styles.memberTable}
        dataSource={employeeList}
        columns={columns}
        loading={loading}
        pagination={{
          currentPage: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onPageChange: handlePageChange,
          showSizeChanger: false,
        }}
        rowKey="id"
        onRow={(record: EmployeeData) => ({
          onClick: () => onSelectEmployee?.(record.id),
        })}
        empty={
          <EmptyState
            icon={<IconCozEmpty />}
            title={t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_EMPTY_NO_EMPLOYEES_TITLE,
            )}
            description={t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_EMPTY_NO_EMPLOYEES_DESCRIPTION,
            )}
          />
        }
      />
    );
  },
);
