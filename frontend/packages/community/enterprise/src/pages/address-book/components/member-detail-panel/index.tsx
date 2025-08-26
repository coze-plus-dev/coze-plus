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

import { type FC, useEffect, useState } from 'react';

import { useRequest } from 'ahooks';
import { type employee } from '@coze-studio/api-schema';
import { IconCozLoose, IconCozMore } from '@coze-arch/coze-design/icons';
import {
  Button,
  Tag,
  Avatar,
  Dropdown,
  Spin,
  Input,
  Toast,
  Modal,
} from '@coze-arch/coze-design';

import { ChangeDepartmentModal } from '../change-department-modal';
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { employeeApi } from '../../../../api/corporationApi';

import styles from './index.module.less';

interface EmployeeData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  status: number;
  departments?: Array<{
    department_id: string;
    department_name: string;
    department_path?: string;
    is_primary: boolean;
    corp_id?: string;
    corp_name?: string;
    job_title?: string;
  }>;
  user_id?: string;
}

interface MemberDetailPanelProps {
  visible: boolean;
  employeeId?: string;
  onClose: () => void;
  onEdit?: (employee: EmployeeData) => void;
  onRefresh?: () => void;
}

interface EditFormValues {
  name: string;
  mobile: string;
  email: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
}

export const MemberDetailPanel: FC<MemberDetailPanelProps> = ({
  visible,
  employeeId,
  onClose,
  onEdit,
  onRefresh,
}) => {
  // 编辑模式状态
  const [isEditing, setIsEditing] = useState(false);
  const [editFormValues, setEditFormValues] = useState<EditFormValues>({
    name: '',
    mobile: '',
    email: '',
    departments: [],
  });

  // 变更部门弹窗状态
  const [changeDepartmentVisible, setChangeDepartmentVisible] = useState(false);

  // 离职确认弹窗状态
  const [resignConfirmVisible, setResignConfirmVisible] = useState(false);

  // 恢复在职弹窗状态
  const [restoreVisible, setRestoreVisible] = useState(false);
  // 获取员工详情
  const {
    data: employee,
    loading,
    refresh,
  } = useRequest(
    async () => {
      if (!employeeId) {
        return null;
      }
      return employeeApi.getEmployee(employeeId);
    },
    {
      ready: !!(visible && employeeId),
      refreshDeps: [employeeId, visible],
    },
  );

  // 员工离职请求
  const { loading: resignLoading, run: resignEmployee } = useRequest(
    async (reason?: string) => {
      const empId = employee?.id ? String(employee.id) : employeeId;
      if (!empId) {
        console.error('employee id is undefined');
        return;
      }
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
        refresh();
        onRefresh?.();
      },
      onError: error => {
        Toast.error(
          error.message ||
            t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_FAILED_MESSAGE),
        );
      },
    },
  );

  // 更新员工信息请求
  const { loading: updateLoading, run: updateEmployee } = useRequest(
    async (values: EditFormValues) => {
      if (!employeeId) {
        return;
      }

      const result = await employeeApi.updateEmployee({
        id: employeeId,
        name: values.name,
        mobile: values.mobile,
        email: values.email || undefined,
        departments: values.departments,
      });
      return result;
    },
    {
      manual: true,
      onSuccess: () => {
        Toast.success(
          t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_SUCCESS,
          ),
        );
        setIsEditing(false);
        refresh();
        onRefresh?.();
      },
      onError: error => {
        Toast.error(
          error.message ||
            t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_FAILED,
            ),
        );
      },
    },
  );

  // 当员工数据加载完成时，初始化编辑表单值
  useEffect(() => {
    if (employee) {
      setEditFormValues({
        name: employee.name || '',
        mobile: employee.mobile || '',
        email: employee.email || '',
        departments: employee.departments || [],
      });
    }
  }, [employee]);

  // 当面板关闭时，重置编辑状态
  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
    }
  }, [visible]);

  // 如果面板不可见或没有员工ID，不渲染
  if (!visible || !employeeId) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // 表单验证
    if (!editFormValues.name || !editFormValues.name.trim()) {
      Toast.error(
        t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_NAME_REQUIRED),
      );
      return;
    }
    if (editFormValues.name.length > 50) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_VALIDATION_NAME_TOO_LONG));
      return;
    }
    if (!editFormValues.mobile || !editFormValues.mobile.trim()) {
      Toast.error(
        t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_REQUIRED,
        ),
      );
      return;
    }
    // 简单的手机号验证
    const mobileRegex = /^1[3-9]\d{9}$/;
    if (!mobileRegex.test(editFormValues.mobile)) {
      Toast.error(
        t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_INVALID,
        ),
      );
      return;
    }
    // 邮箱验证（可选）
    if (editFormValues.email && editFormValues.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormValues.email)) {
        Toast.error(
          t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_EMAIL_INVALID,
          ),
        );
        return;
      }
    }

    updateEmployee(editFormValues);
  };

  const handleCancelEdit = () => {
    // 重置表单值为原始值
    if (employee) {
      setEditFormValues({
        name: employee.name || '',
        mobile: employee.mobile || '',
        email: employee.email || '',
        departments: employee.departments || [],
      });
    }
    setIsEditing(false);
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'changeDepartment':
        setChangeDepartmentVisible(true);
        break;
      case 'resignation':
        setResignConfirmVisible(true);
        break;
      case 'restore':
        setRestoreVisible(true);
        break;
      default:
        break;
    }
  };

  // 确认离职
  const handleConfirmResign = () => {
    resignEmployee();
  };

  // 恢复在职成功处理
  const handleRestoreSuccess = () => {
    refresh();
    onRefresh?.();
    setRestoreVisible(false);
  };

  const handleChangeDepartmentSuccess = () => {
    // 变更部门成功后刷新员工信息和通讯录列表
    refresh();
    onRefresh?.();
  };

  const renderDepartments = () => {
    if (
      !employee ||
      !employee.departments ||
      employee.departments.length === 0
    ) {
      return (
        <span className={styles.emptyValue}>
          {t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_UNASSIGNED,
          )}
        </span>
      );
    }

    const primary = employee.departments.find(d => d.is_primary);
    const others = employee.departments.filter(d => !d.is_primary);

    return (
      <div className={styles.departmentList}>
        {primary ? (
          <div className={styles.departmentItem}>
            <Tag color="blue" size="small">
              {t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_PRIMARY,
              )}
            </Tag>
            <span>{primary.department_name}</span>
            {primary.department_path ? (
              <span className={styles.departmentPath}>
                ({primary.department_path})
              </span>
            ) : null}
          </div>
        ) : null}
        {others.map((dept, index) => (
          <div key={index} className={styles.departmentItem}>
            <Tag size="small">{dept.department_name}</Tag>
            {dept.department_path ? (
              <span className={styles.departmentPath}>
                ({dept.department_path})
              </span>
            ) : null}
          </div>
        ))}
      </div>
    );
  };

  // 加载状态
  if (loading) {
    return (
      <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  // 如果没有员工数据，不渲染内容
  if (!employee) {
    return null;
  }

  return (
    <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
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
                {t(
                  ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_USER_ID_PREFIX,
                )}
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
            render={
              <div className="min-w-[120px] py-[4px]">
                <Dropdown.Menu>
                  {/* 根据员工状态动态渲染操作项 */}
                  {employee?.status === 2 ? (
                    // 离职状态，只显示恢复在职
                    <Dropdown.Item onClick={() => handleAction('restore')}>
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
                        onClick={() => handleAction('changeDepartment')}
                      >
                        <span>
                          {t(
                            ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_CHANGE_DEPARTMENT,
                          )}
                        </span>
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleAction('resignation')}
                      >
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
              {t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_MORE_ACTIONS,
              )}
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

      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>
            {t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_SECTION_BASIC_INFO,
            )}
          </div>
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
                  maxLength={50}
                  showClear
                  suffix={
                    <span
                      style={{
                        color: 'var(--semi-color-text-2)',
                        fontSize: 12,
                      }}
                    >
                      {(editFormValues.name || '').length}/50
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
                  maxLength={11}
                  showClear
                  suffix={
                    <span
                      style={{
                        color: 'var(--semi-color-text-2)',
                        fontSize: 12,
                      }}
                    >
                      {(editFormValues.mobile || '').length}/11
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
                  maxLength={100}
                  showClear
                  suffix={
                    <span
                      style={{
                        color: 'var(--semi-color-text-2)',
                        fontSize: 12,
                      }}
                    >
                      {(editFormValues.email || '').length}/100
                    </span>
                  }
                />
              ) : (
                <div className={styles.value}>{employee.email || '-'}</div>
              )}
            </div>
          </div>
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

      <div className={styles.footer}>
        {isEditing ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              theme="borderless"
              block
              onClick={handleCancelEdit}
              loading={updateLoading}
            >
              {t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_CANCEL,
              )}
            </Button>
            <Button
              theme="solid"
              block
              onClick={handleSave}
              loading={updateLoading}
            >
              {t(
                ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_SAVE,
              )}
            </Button>
          </div>
        ) : (
          <Button theme="solid" block onClick={handleEdit}>
            {t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_EDIT_BASIC_INFO,
            )}
          </Button>
        )}
      </div>

      {/* 变更部门弹窗 */}
      <ChangeDepartmentModal
        visible={changeDepartmentVisible}
        employee={employee as any}
        onClose={() => setChangeDepartmentVisible(false)}
        onSuccess={handleChangeDepartmentSuccess}
      />

      {/* 离职确认对话框 */}
      <Modal
        visible={resignConfirmVisible}
        title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_TITLE)}
        onCancel={() => setResignConfirmVisible(false)}
        onOk={handleConfirmResign}
        okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_OK_TEXT)}
        cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
        okButtonProps={{ loading: resignLoading, type: 'danger' }}
        width={400}
      >
        <p>
          确定要让 <strong>{employee?.name}</strong> 离职吗？
        </p>
        <p style={{ color: 'var(--semi-color-text-2)', fontSize: '14px' }}>
          离职后该员工将从所有部门中移除，状态变更为离职。
        </p>
      </Modal>

      {/* 恢复在职弹窗 */}
      <ChangeDepartmentModal
        visible={restoreVisible}
        employee={employee as any}
        onClose={() => setRestoreVisible(false)}
        onSuccess={handleRestoreSuccess}
        isRestore={true}
      />
    </div>
  );
};
