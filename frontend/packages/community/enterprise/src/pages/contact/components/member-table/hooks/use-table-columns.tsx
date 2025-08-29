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

import { useMemo } from 'react';

import { type employee } from '@coze-studio/api-schema';
import { IconCozMore } from '@coze-arch/coze-design/icons';
import { Tag, Dropdown, Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';
import { DepartmentRenderer } from '../components/department-renderer';

// 使用API schema中的EmployeeData类型
type EmployeeData = employee.employee.EmployeeData;

interface UseTableColumnsProps {
  handleShowDetail: (record: EmployeeData) => void;
  handleAction: (action: string, record: EmployeeData) => void;
}

export const useTableColumns = ({
  handleShowDetail,
  handleAction,
}: UseTableColumnsProps) => {
  const columns = useMemo(
    () => [
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_NAME),
        dataIndex: 'name',
        key: 'name',
        align: 'left' as const,
        render: (name: string) => name || '-',
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_STATUS),
        dataIndex: 'status',
        key: 'status',
        align: 'center' as const,
        render: (status: number) => {
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
        render: (mobile: string) => mobile || '-',
      },
      {
        title: t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_DEPARTMENT,
        ),
        dataIndex: 'departments',
        key: 'departments',
        align: 'left' as const,
        render: (departments: EmployeeData['departments']) => (
          <DepartmentRenderer departments={departments} />
        ),
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_EMAIL),
        dataIndex: 'email',
        key: 'email',
        align: 'center' as const,
        render: (email: string) => email || '-',
      },
      {
        title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_COLUMN_ACTIONS),
        key: 'actions',
        align: 'center' as const,
        width: 120,
        render: (_: unknown, record: EmployeeData) => (
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
              render={
                <Dropdown.Menu>
                  {record.status === 2 ? (
                    <Dropdown.Item
                      onClick={() => handleAction('restore', record)}
                    >
                      {t(
                        ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_RESTORE,
                      )}
                    </Dropdown.Item>
                  ) : (
                    <>
                      <Dropdown.Item
                        onClick={() => handleAction('changeDepartment', record)}
                      >
                        {t(
                          ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_CHANGE_DEPARTMENT,
                        )}
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleAction('resignation', record)}
                      >
                        {t(
                          ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_RESIGNATION,
                        )}
                      </Dropdown.Item>
                    </>
                  )}
                </Dropdown.Menu>
              }
            >
              <Button
                theme="borderless"
                icon={<IconCozMore />}
                size="small"
                className={styles.moreButton}
              />
            </Dropdown>
          </div>
        ),
      },
    ],
    [handleShowDetail, handleAction],
  );

  return columns;
};
