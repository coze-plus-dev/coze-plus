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

import { type FC } from 'react';

import { type employee } from '@coze-studio/api-schema';
import { IconCozLoose, IconCozMore } from '@coze-arch/coze-design/icons';
import { Button, Avatar, Dropdown, Spin, Input } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { MemberPanelContent } from './member-panel-content';
import styles from '../index.module.less';

interface SimpleMemberPanelProps {
  loading: boolean;
  employeeData?: employee.employee.EmployeeData;
  isEditing: boolean;
  editFormValues: Record<string, string>;
  setEditFormValues: (values: Record<string, string>) => void;
  handleEdit: () => void;
  handleSave: () => void;
  handleCancelEdit: () => void;
  handleAction: (key: string) => void;
}

export const SimpleMemberPanel: FC<SimpleMemberPanelProps> = ({
  loading,
  employeeData,
  isEditing,
  editFormValues,
  setEditFormValues,
  handleEdit,
  handleSave,
  handleCancelEdit,
  handleAction,
}) => {
  if (loading) {
    return (
      <div className={styles.memberDetailPanel}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className={styles.memberDetailPanel}>
        <div className={styles.emptyContainer}>
          <IconCozLoose className="text-6xl text-gray-400" />
          <div className={styles.emptyText}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PARENT_NOT_FOUND)}
          </div>
        </div>
      </div>
    );
  }

  const renderField = (field: string, placeholder: string) => {
    const value =
      editFormValues[field] ??
      (employeeData as unknown as Record<string, unknown>)?.[field] ??
      '';

    if (isEditing) {
      return (
        <Input
          value={String(value)}
          placeholder={placeholder}
          onChange={(val: string) => {
            setEditFormValues({ ...editFormValues, [field]: val });
          }}
          size="small"
          showClear
        />
      );
    }

    return <span className={styles.fieldValue}>{String(value) || '-'}</span>;
  };

  const menuItems = [
    {
      node: 'item' as const,
      name: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CHANGE_DEPARTMENT_TIP_1),
      onClick: () => handleAction('changeDepartment'),
    },
  ];

  return (
    <div className={styles.memberDetailPanel}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Avatar size="large" className={styles.avatar}>
            {employeeData.name?.charAt(0) || 'U'}
          </Avatar>
          <div className={styles.headerInfo}>
            <div className={styles.employeeName}>{employeeData.name}</div>
            <div className={styles.employeeId}>ID: {employeeData.id}</div>
          </div>
        </div>
        <div className={styles.headerActions}>
          {isEditing ? (
            <>
              <Button size="small" onClick={handleCancelEdit}>
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
              </Button>
              <Button
                theme="solid"
                size="small"
                onClick={handleSave}
                style={{ marginLeft: 8 }}
              >
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SAVE)}
              </Button>
            </>
          ) : (
            <>
              <Button size="small" onClick={handleEdit}>
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT)}
              </Button>
              <Dropdown trigger="click" menu={menuItems}>
                <Button
                  theme="borderless"
                  size="small"
                  icon={<IconCozMore />}
                  style={{ marginLeft: 8 }}
                />
              </Dropdown>
            </>
          )}
        </div>
      </div>

      <MemberPanelContent
        employeeData={employeeData}
        renderField={renderField}
      />
    </div>
  );
};
