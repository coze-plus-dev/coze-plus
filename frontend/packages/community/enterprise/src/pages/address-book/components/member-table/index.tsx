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
import { Table, Modal, EmptyState } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useTableColumns } from './hooks/use-table-columns';
import { useMemberTable, type EmployeeData } from './hooks/use-member-table';
import { ChangeDepartmentModal } from '../change-department-modal';

import styles from './index.module.less';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string;
  name?: string;
}

interface MemberTableProps {
  selectedNode?: SelectedNodeInfo;
  searchKeyword?: string;
  onShowDetail?: (employee: EmployeeData) => void;
}

export interface MemberTableRef {
  refresh: () => void;
}

export const MemberTable = forwardRef<MemberTableRef, MemberTableProps>(
  ({ selectedNode, searchKeyword, onShowDetail }, ref) => {
    const {
      dataSource,
      pagination,
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
      handleAction,
      handlePaginationChange,
      handleShowDetail,
      handleConfirmResign,
      handleRestoreSuccess,
      refresh,
      selectedNode: currentNode,
    } = useMemberTable({ selectedNode, searchKeyword, onShowDetail });

    const columns = useTableColumns({ handleShowDetail, handleAction });

    useImperativeHandle(ref, () => ({ refresh }));

    // 未选择节点时显示空状态
    if (!currentNode || !currentNode.id) {
      return (
        <div className={styles.tableContainer}>
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={<IconCozEmpty />}
              title={t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_EMPTY_SELECT_NODE_TITLE,
              )}
              description={t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_EMPTY_SELECT_NODE_DESCRIPTION,
              )}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.tableContainer}>
        {/* 表格头部：显示组织/部门名称和人数 */}
        {currentNode && currentNode.id ? (
          <div className={styles.tableHeader}>
            <div className={styles.nodeInfo}>
              <span className={styles.nodeName}>
                {currentNode.name ||
                  (currentNode.type === 'corp'
                    ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION)
                    : t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT))}
              </span>
              <span className={styles.memberCount}>
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_TOTAL_MEMBERS)}:{' '}
                {pagination.total}
              </span>
            </div>
          </div>
        ) : null}

        <div className={styles.tableWrapper}>
          <Table
            tableProps={{
              rowKey: (record: EmployeeData) =>
                record.id || String(Math.random()),
              dataSource,
              columns,
              pagination: {
                currentPage: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: handlePaginationChange,
              },
              size: 'middle',
              scroll: { y: 'calc(100vh - 250px)' },
            }}
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
        </div>

        {/* 变更部门弹窗 */}
        <ChangeDepartmentModal
          visible={changeDepartmentVisible}
          employee={selectedEmployee || undefined}
          onClose={() => setChangeDepartmentVisible(false)}
          onSuccess={() => {
            setChangeDepartmentVisible(false);
            refresh();
          }}
        />

        {/* 离职确认弹窗 */}
        <Modal
          visible={resignConfirmVisible}
          onCancel={() => setResignConfirmVisible(false)}
          onOk={handleConfirmResign}
          title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_TITLE)}
          okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CONFIRM)}
          cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
          okButtonProps={{ loading: resignLoading }}
        >
          <p>
            {t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_CONTENT,
            ).replace('{name}', resignEmployee?.name || '')}
          </p>
        </Modal>

        {/* 恢复在职弹窗 - 重用变更部门弹窗 */}
        <ChangeDepartmentModal
          visible={restoreVisible}
          employee={restoreEmployee || undefined}
          onClose={() => {
            setRestoreVisible(false);
          }}
          onSuccess={handleRestoreSuccess}
          isRestore={true}
        />
      </div>
    );
  },
);

MemberTable.displayName = 'MemberTable';

export { type EmployeeData } from './hooks/use-member-table';
