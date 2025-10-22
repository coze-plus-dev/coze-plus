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

import type { FC } from 'react';

import { type employee } from '@coze-studio/api-schema';
import { IconCozMore, IconCozLoose } from '@coze-arch/coze-design/icons';
import { Avatar, Tag, Dropdown, Button, Input } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';

// 常量定义
const MAX_NAME_LENGTH = 50;
const MAX_MOBILE_LENGTH = 11;
const MAX_EMAIL_LENGTH = 100;

// 使用API schema中的EmployeeData类型
type EmployeeData = employee.employee.EmployeeData;

interface EditFormValues {
  name: string;
  mobile: string;
  email: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
}

interface MemberPanelContentProps {
  visible: boolean;
  employee: EmployeeData;
  isEditing: boolean;
  editFormValues: EditFormValues;
  dropdownVisible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChangeDepartment: () => void;
  onResign: () => void;
  onRestore: () => void;
  setEditFormValues: (values: EditFormValues) => void;
  setDropdownVisible: (visible: boolean) => void;
  updateLoading?: boolean;
  renderDepartments: () => React.ReactNode;
}

// 头部组件
const PanelHeader: FC<{
  employee: EmployeeData;
  dropdownVisible: boolean;
  onClose: () => void;
  onChangeDepartment: () => void;
  onResign: () => void;
  onRestore: () => void;
  setDropdownVisible: (visible: boolean) => void;
}> = ({
  employee,
  dropdownVisible,
  onClose,
  onChangeDepartment,
  onResign,
  onRestore,
  setDropdownVisible,
}) => (
  <div className={styles.header}>
    <div className={styles.headerLeft}>
      <Avatar size="large" className={styles.avatar}>
        {employee.name?.charAt(0) || 'U'}
      </Avatar>
      <div className={styles.basicInfo}>
        <div className={styles.employeeName}>
          {employee.name}
          {employee.status === 1 ? (
            <Tag color="green" size="small">
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_STATUS_EMPLOYED)}
            </Tag>
          ) : (
            <Tag color="red" size="small">
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_STATUS_QUIT)}
            </Tag>
          )}
        </div>
        {employee.id ? (
          <div className={styles.userId}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_USER_ID_PREFIX)}
            {employee.id}
          </div>
        ) : null}
      </div>
    </div>
    <div className={styles.headerActions}>
      <Dropdown
        trigger="click"
        position="bottomRight"
        spacing={4}
        visible={dropdownVisible}
        onVisibleChange={setDropdownVisible}
        render={
          <div className="min-w-[120px] py-[4px]">
            <Dropdown.Menu>
              {employee?.status === 2 ? (
                <Dropdown.Item onClick={onRestore}>
                  <span>
                    {t(
                      ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_TABLE_ACTION_RESTORE,
                    )}
                  </span>
                </Dropdown.Item>
              ) : (
                <>
                  <Dropdown.Item onClick={onChangeDepartment}>
                    <span>
                      {t(
                        ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_CHANGE_DEPARTMENT,
                      )}
                    </span>
                  </Dropdown.Item>
                  <Dropdown.Item onClick={onResign}>
                    <span>
                      {t(
                        ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_RESIGNATION,
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
          icon={<IconCozMore />}
          className={styles.editButton}
        >
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_MORE_ACTIONS)}
        </Button>
      </Dropdown>
      <Button
        theme="borderless"
        icon={<IconCozLoose />}
        onClick={onClose}
        className={styles.closeButton}
      />
    </div>
  </div>
);

// 基本信息表单项组件
const BasicInfoFields: FC<{
  employee: EmployeeData;
  isEditing: boolean;
  editFormValues: EditFormValues;
  setEditFormValues: (values: EditFormValues) => void;
}> = ({ employee, isEditing, editFormValues, setEditFormValues }) => (
  <div className={styles.infoGrid}>
    <div className={styles.infoItem}>
      <div className={styles.label}>
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_FIELD_NAME)}
        {isEditing ? (
          <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        ) : null}
      </div>
      {isEditing ? (
        <Input
          value={editFormValues.name}
          onChange={value =>
            setEditFormValues({ ...editFormValues, name: value })
          }
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_NAME_PLACEHOLDER,
          )}
          maxLength={MAX_NAME_LENGTH}
          showClear
          suffix={
            <span
              style={{
                color: 'var(--semi-color-text-2)',
                fontSize: 12,
              }}
            >
              {(editFormValues.name || '').length}/{MAX_NAME_LENGTH}
            </span>
          }
        />
      ) : (
        <div className={styles.value}>{employee.name || '-'}</div>
      )}
    </div>
    <div className={styles.infoItem}>
      <div className={styles.label}>
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_FIELD_MOBILE)}
        {isEditing ? (
          <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        ) : null}
      </div>
      {isEditing ? (
        <Input
          value={editFormValues.mobile}
          onChange={value =>
            setEditFormValues({ ...editFormValues, mobile: value })
          }
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_PLACEHOLDER,
          )}
          maxLength={MAX_MOBILE_LENGTH}
          showClear
          suffix={
            <span
              style={{
                color: 'var(--semi-color-text-2)',
                fontSize: 12,
              }}
            >
              {(editFormValues.mobile || '').length}/{MAX_MOBILE_LENGTH}
            </span>
          }
        />
      ) : (
        <div className={styles.value}>{employee.mobile || '-'}</div>
      )}
    </div>
    <div className={styles.infoItem}>
      <div className={styles.label}>
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_FIELD_EMAIL)}
      </div>
      {isEditing ? (
        <Input
          value={editFormValues.email}
          onChange={value =>
            setEditFormValues({ ...editFormValues, email: value })
          }
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_EMAIL_PLACEHOLDER,
          )}
          maxLength={MAX_EMAIL_LENGTH}
          showClear
          suffix={
            <span
              style={{
                color: 'var(--semi-color-text-2)',
                fontSize: 12,
              }}
            >
              {(editFormValues.email || '').length}/{MAX_EMAIL_LENGTH}
            </span>
          }
        />
      ) : (
        <div className={styles.value}>{employee.email || '-'}</div>
      )}
    </div>
  </div>
);

// 底部操作按钮组件
const PanelFooter: FC<{
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  updateLoading?: boolean;
}> = ({ isEditing, onEdit, onSave, onCancel, updateLoading }) => (
  <div className={styles.footer}>
    {isEditing ? (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          theme="borderless"
          block
          onClick={onCancel}
          loading={updateLoading}
        >
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_CANCEL)}
        </Button>
        <Button theme="solid" block onClick={onSave} loading={updateLoading}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_SAVE)}
        </Button>
      </div>
    ) : (
      <Button theme="solid" block onClick={onEdit}>
        {t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_EDIT_BASIC_INFO,
        )}
      </Button>
    )}
  </div>
);

export const MemberPanelContent: FC<MemberPanelContentProps> = props => {
  const {
    visible,
    employee,
    isEditing,
    editFormValues,
    dropdownVisible,
    onClose,
    onEdit,
    onSave,
    onCancel,
    onChangeDepartment,
    onResign,
    onRestore,
    setEditFormValues,
    setDropdownVisible,
    updateLoading,
    renderDepartments,
  } = props;

  return (
    <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
      <PanelHeader
        employee={employee}
        dropdownVisible={dropdownVisible}
        onClose={onClose}
        onChangeDepartment={onChangeDepartment}
        onResign={onResign}
        onRestore={onRestore}
        setDropdownVisible={setDropdownVisible}
      />

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            {t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_SECTION_BASIC_INFO,
            )}
          </div>
          <BasicInfoFields
            employee={employee}
            isEditing={isEditing}
            editFormValues={editFormValues}
            setEditFormValues={setEditFormValues}
          />
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            {t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_SECTION_DEPARTMENT,
            )}
          </div>
          <div className={styles.departmentSection}>{renderDepartments()}</div>
        </div>
      </div>

      <PanelFooter
        isEditing={isEditing}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        updateLoading={updateLoading}
      />
    </div>
  );
};
