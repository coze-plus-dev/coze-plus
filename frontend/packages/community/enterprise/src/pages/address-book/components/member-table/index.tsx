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

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import { useRequest } from 'ahooks';
import { IconCozEmpty, IconCozMore } from '@coze-arch/coze-design/icons';
import {
  Table,
  EmptyState,
  Spin,
  Tag,
  Tooltip,
  Dropdown,
  Button,
  Modal,
  Toast,
} from '@coze-arch/coze-design';

import { ChangeDepartmentModal } from '../change-department-modal';
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { employeeApi } from '../../../../api/corporation-api';

import styles from './index.module.less';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string;
  name?: string;
}

interface EmployeeData {
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
  }>;
  user_id?: string;
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
    const [pagination, setPagination] = useState({
      current: 1,
      pageSize: 20,
      total: 0,
    });

    // 变更部门弹窗状态
    const [changeDepartmentVisible, setChangeDepartmentVisible] =
      useState(false);
    const [selectedEmployee, setSelectedEmployee] =
      useState<EmployeeData | null>(null);

    // 离职确认弹窗状态
    const [resignConfirmVisible, setResignConfirmVisible] = useState(false);
    const [resignEmployee, setResignEmployee] = useState<EmployeeData | null>(
      null,
    );

    // 恢复在职弹窗状态
    const [restoreVisible, setRestoreVisible] = useState(false);
    const [restoreEmployee, setRestoreEmployee] = useState<EmployeeData | null>(
      null,
    );

    // 获取员工列表
    const {
      data: employeeData,
      loading,
      run: fetchEmployees,
    } = useRequest(
      async (page = 1, pageSize = 20) => {
        if (!selectedNode || !selectedNode.corpId) {
          return { data: [], total: 0 };
        }

        const params: {
          corp_id: string;
          department_id?: string;
          page: number;
          page_size: number;
          keyword?: string;
        } = {
          corp_id: selectedNode.corpId,
          page,
          page_size: pageSize,
        };

        // 如果有搜索关键词，添加到参数中
        if (searchKeyword && searchKeyword.trim() !== '') {
          params.keyword = searchKeyword.trim();
        }

        // 如果选中的是部门，设置 department_id
        if (selectedNode.type === 'dept') {
          params.department_id = selectedNode.id;
        }

        return employeeApi.listEmployees(params);
      },
      {
        manual: true,
        onSuccess: result => {
          // 只更新total，current和pageSize已经在onChange中立即更新了
          setPagination(prev => ({
            ...prev,
            total:
              typeof result.total === 'string'
                ? parseInt(result.total, 10)
                : result.total,
          }));
        },
      },
    );

    const dataSource = employeeData?.data || [];

    // 当选中节点改变时，重新获取员工列表
    useEffect(() => {
      if (selectedNode) {
        fetchEmployees(1, pagination.pageSize);
        setPagination(prev => ({ ...prev, current: 1 }));
      }
    }, [selectedNode, fetchEmployees]);

    // 当搜索关键词改变时，重新获取员工列表
    useEffect(() => {
      if (selectedNode) {
        fetchEmployees(1, pagination.pageSize);
        setPagination(prev => ({ ...prev, current: 1 }));
      }
    }, [searchKeyword, selectedNode, fetchEmployees]);

    // 暴露refresh方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        refresh: () => {
          if (selectedNode) {
            fetchEmployees(pagination.current, pagination.pageSize);
          }
        },
      }),
      [fetchEmployees, selectedNode, pagination.current, pagination.pageSize],
    );

    // 操作处理函数
    const handleAction = (action: string, record: any) => {
      switch (action) {
        case 'changeDepartment':
          setSelectedEmployee(record);
          setChangeDepartmentVisible(true);
          break;
        case 'resignation':
          // 处理离职操作
          handleResignEmployee(record);
          break;
        case 'restore':
          // 处理恢复在职操作
          handleRestoreEmployee(record);
          break;
        default:
          break;
      }
    };

    // 员工离职请求
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

    // 员工离职处理
    const handleResignEmployee = (employee: any) => {
      setResignEmployee(employee);
      setResignConfirmVisible(true);
    };

    // 员工恢复在职处理
    const handleRestoreEmployee = (employee: any) => {
      setRestoreEmployee(employee);
      setRestoreVisible(true);
    };

    // 确认离职
    const handleConfirmResign = () => {
      if (resignEmployee && resignEmployee.id) {
        const empId = String(resignEmployee.id);
        runResignEmployee(empId);
      }
    };

    // 恢复在职成功处理
    const handleRestoreSuccess = () => {
      fetchEmployees(pagination.current, pagination.pageSize);
      setRestoreVisible(false);
      setRestoreEmployee(null);
    };

    const handleChangeDepartmentSuccess = () => {
      // 变更部门成功后刷新列表
      fetchEmployees(pagination.current, pagination.pageSize);
    };

    // 显示员工详情
    const handleShowDetail = (record: any) => {
      if (onShowDetail) {
        onShowDetail(record);
      }
    };

    // 渲染多部门信息
    const renderDepartments = (departments: any[] = []) => {
      if (!departments || departments.length === 0) {
        return '-';
      }

      // 统一使用Tag显示，区分主部门和兼职部门
      const primary = departments.find(d => d.is_primary);
      const others = departments.filter(d => !d.is_primary);

      return (
        <div className={styles.departmentContainer}>
          {primary ? (
            <Tooltip
              content={`${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_PRIMARY)}: ${primary.department_path || primary.department_name}`}
              position="top"
            >
              <Tag size="small" color="blue">
                {primary.department_name}
              </Tag>
            </Tooltip>
          ) : null}
          {others.slice(0, 2).map((dept, index) => (
            <Tooltip
              key={index}
              content={dept.department_path || dept.department_name}
              position="top"
            >
              <Tag size="small" color="grey">
                {dept.department_name}
              </Tag>
            </Tooltip>
          ))}
          {others.length > 2 && (
            <Tooltip
              content={
                <div>
                  {others.slice(2).map((dept, index) => (
                    <div key={index}>
                      {dept.department_path || dept.department_name}
                    </div>
                  ))}
                </div>
              }
              position="top"
            >
              <Tag size="small" color="grey">
                +{others.length - 2}
              </Tag>
            </Tooltip>
          )}
        </div>
      );
    };

    // 修复列定义，确保字段匹配API响应
    const columns = [
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_NAME),
        dataIndex: 'name',
        key: 'name',
        align: 'center' as const,
        render: (text: string) => text || '-',
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_STATUS),
        dataIndex: 'status',
        key: 'status',
        align: 'center' as const,
        render: (status: any) => {
          // EmployeeStatus.EMPLOYED = 1, EmployeeStatus.QUIT = 2
          const statusValue =
            typeof status === 'object' ? status : Number(status);
          if (statusValue === 1) {
            return (
              <Tag color="green" size="small">
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_STATUS_EMPLOYED)}
              </Tag>
            );
          } else {
            return (
              <Tag color="red" size="small">
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_STATUS_QUIT)}
              </Tag>
            );
          }
        },
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_MOBILE),
        dataIndex: 'mobile',
        key: 'mobile',
        align: 'center' as const,
        render: (text: string) => text || '-',
      },
      {
        title: t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_DEPARTMENT,
        ),
        dataIndex: 'departments',
        key: 'departments',
        align: 'left' as const,
        render: (departments: any[]) => renderDepartments(departments),
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_EMAIL),
        dataIndex: 'email',
        key: 'email',
        align: 'center' as const,
        render: (text: string) => text || '-',
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_ACTIONS),
        key: 'actions',
        align: 'center' as const,
        width: 120, // 设置固定宽度确保居中效果
        render: (_, record: any) => (
          <div className={styles.actionColumn}>
            <span
              className={styles.actionLink}
              onClick={() => handleShowDetail(record)}
            >
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_DETAIL)}
            </span>
            <Dropdown
              trigger="click"
              position="bottomRight"
              spacing={4}
              render={
                <div className="min-w-[120px] py-[4px]">
                  <Dropdown.Menu>
                    {/* 根据员工状态动态渲染操作项 */}
                    {record.status === 2 ? (
                      // 离职状态，只显示恢复在职
                      <Dropdown.Item
                        onClick={() => handleAction('restore', record)}
                      >
                        <span>
                          {t(
                            ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_RESTORE,
                          )}
                        </span>
                      </Dropdown.Item>
                    ) : (
                      // 在职状态，显示完整操作菜单
                      <>
                        <Dropdown.Item
                          onClick={() =>
                            handleAction('changeDepartment', record)
                          }
                        >
                          <span>
                            {t(
                              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_CHANGE_DEPARTMENT,
                            )}
                          </span>
                        </Dropdown.Item>
                        <Dropdown.Item
                          onClick={() => handleAction('resignation', record)}
                        >
                          <span>
                            {t(
                              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_RESIGNATION,
                            )}
                          </span>
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </div>
              }
            >
              <Button
                theme="borderless"
                icon={
                  <IconCozMore style={{ color: 'var(--semi-color-text-2)' }} />
                }
                size="small"
                className={styles.moreButton}
              />
            </Dropdown>
          </div>
        ),
      },
    ];

    // 暂时移除复杂的交互逻辑
    // const rowSelection = {
    //   selectedRowKeys,
    //   onChange: (keys: string[]) => {
    //     setSelectedRowKeys(keys);
    //   },
    // };

    // 没有选中节点时的状态
    if (!selectedNode) {
      return (
        <div className={styles.tableContainer}>
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
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

    // 加载状态
    if (loading) {
      return (
        <div className={styles.tableContainer}>
          <div className={styles.emptyWrapper}>
            <Spin size="large" />
          </div>
        </div>
      );
    }

    // 无数据状态
    if (!loading && dataSource.length === 0) {
      return (
        <div className={styles.tableContainer}>
          <div className={styles.emptyWrapper}>
            <EmptyState
              icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
              title={t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_EMPTY_NO_EMPLOYEES_TITLE,
              )}
              description={t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_EMPTY_NO_EMPLOYEES_DESCRIPTION,
              )}
            />
          </div>
        </div>
      );
    }

    return (
      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <div className={styles.nodeInfo}>
            <span className={styles.nodeName}>{selectedNode?.name}</span>
            <span className={styles.memberCount}>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_TOTAL_MEMBERS)}{' '}
              {pagination.total}
            </span>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <Table
            tableProps={{
              rowKey: (record: any) => record.id || String(Math.random()),
              dataSource,
              columns,
              pagination: {
                currentPage: pagination.current, // Semi Design使用currentPage而不是current
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                onChange: (page: number, pageSize: number) => {
                  // 立即更新UI状态，给用户即时反馈
                  setPagination(prev => ({
                    ...prev,
                    current: page,
                    pageSize,
                  }));
                  fetchEmployees(page, pageSize);
                },
              },
              size: 'middle',
              scroll: { y: 'calc(100vh - 250px)' }, // 固定表格高度，超出滚动
            }}
          />
        </div>

        {/* 变更部门弹窗 */}
        <ChangeDepartmentModal
          visible={changeDepartmentVisible}
          employee={selectedEmployee || undefined}
          onClose={() => {
            setChangeDepartmentVisible(false);
            setSelectedEmployee(null);
          }}
          onSuccess={handleChangeDepartmentSuccess}
        />

        {/* 离职确认对话框 */}
        <Modal
          visible={resignConfirmVisible}
          title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_TITLE)}
          onCancel={() => {
            setResignConfirmVisible(false);
            setResignEmployee(null);
          }}
          onOk={handleConfirmResign}
          okText={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_OK_TEXT,
          )}
          cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
          okButtonProps={{ loading: resignLoading, type: 'danger' }}
          width={400}
        >
          <p>
            {t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_CONTENT,
            ).replace('{name}', resignEmployee?.name || '')}
          </p>
          <p style={{ color: 'var(--semi-color-text-2)', fontSize: '14px' }}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_DESCRIPTION)}
          </p>
        </Modal>

        {/* 恢复在职弹窗 - 重用变更部门弹窗 */}
        <ChangeDepartmentModal
          visible={restoreVisible}
          employee={restoreEmployee || undefined}
          onClose={() => {
            setRestoreVisible(false);
            setRestoreEmployee(null);
          }}
          onSuccess={handleRestoreSuccess}
          isRestore={true}
        />
      </div>
    );
  },
);

MemberTable.displayName = 'MemberTable';
