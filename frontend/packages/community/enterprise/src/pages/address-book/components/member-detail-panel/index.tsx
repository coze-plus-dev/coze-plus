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
import {
  Spin,
  Toast,
  Modal,
  Tag,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import { employeeApi } from '@/api/corporation-api';

import { MemberPanelContent } from './components/member-panel-content';
import { ChangeDepartmentModal } from '../change-department-modal';

// 为ChangeDepartmentModal定义兼容的类型
interface ChangeDepartmentEmployeeData {
  id: string;
  name: string;
  departments?: Array<{
    department_id: string;
    department_name: string;
    department_path: string;
    is_primary: boolean;
    corp_id: string;
    corp_name: string;
    job_title?: string;
  }>;
}

import styles from './index.module.less';

// 常量定义
const MAX_NAME_LENGTH = 50;

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

// 表单验证函数
const validateEditForm = (editFormValues: EditFormValues) => {
  if (!editFormValues.name || !editFormValues.name.trim()) {
    Toast.error(
      t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_NAME_REQUIRED),
    );
    return false;
  }
  if (editFormValues.name.length > MAX_NAME_LENGTH) {
    Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_VALIDATION_NAME_TOO_LONG));
    return false;
  }
  if (!editFormValues.mobile || !editFormValues.mobile.trim()) {
    Toast.error(
      t(
        ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_REQUIRED,
      ),
    );
    return false;
  }
  const mobileRegex = /^1[3-9]\d{9}$/;
  if (!mobileRegex.test(editFormValues.mobile)) {
    Toast.error(
      t(
        ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_INVALID,
      ),
    );
    return false;
  }
  if (editFormValues.email && editFormValues.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormValues.email)) {
      Toast.error(
        t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_EMAIL_INVALID,
        ),
      );
      return false;
    }
  }
  return true;
};

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

  // Dropdown可见性状态
  const [dropdownVisible, setDropdownVisible] = useState(false);

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
      refreshDeps: [employeeId],
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

  // 当面板关闭时，重置编辑状态和其他状态
  useEffect(() => {
    if (!visible) {
      setIsEditing(false);
      setDropdownVisible(false);
      setChangeDepartmentVisible(false);
      setResignConfirmVisible(false);
      setRestoreVisible(false);
    }
  }, [visible]);

  // 当面板打开且有员工ID时，刷新员工数据
  useEffect(() => {
    if (visible && employeeId) {
      refresh();
    }
  }, [visible, employeeId, refresh]);

  // 如果面板不可见或没有员工ID，不渲染
  if (!visible || !employeeId) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!validateEditForm(editFormValues)) {
      return;
    }
    updateEmployee(editFormValues);
  };

  const handleCancelEdit = () => {
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
    setDropdownVisible(false);
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

  const handleConfirmResign = () => {
    resignEmployee();
  };

  const handleRestoreSuccess = () => {
    refresh();
    onRefresh?.();
    setRestoreVisible(false);
  };

  const handleChangeDepartmentSuccess = () => {
    refresh();
    onRefresh?.();
  };

  const renderDepartments = () => {
    if (!employee?.departments?.length) {
      return (
        <span className={styles.emptyValue}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_UNASSIGNED)}
        </span>
      );
    }

    const primary = employee.departments.find(d => d.is_primary);
    const others = employee.departments.filter(d => !d.is_primary);

    return (
      <div className={styles.departmentList}>
        {primary && (
          <div className={styles.departmentItem}>
            <Tag color="blue" size="small">
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_PRIMARY)}
            </Tag>
            <span>{primary.department_name}</span>
            {primary.department_path && (
              <span className={styles.departmentPath}>
                ({primary.department_path})
              </span>
            )}
          </div>
        )}
        {others.map((dept, index) => (
          <div key={index} className={styles.departmentItem}>
            <Tag size="small">{dept.department_name}</Tag>
            {dept.department_path && (
              <span className={styles.departmentPath}>
                ({dept.department_path})
              </span>
            )}
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
    <>
      <MemberPanelContent
        visible={visible}
        employee={employee}
        isEditing={isEditing}
        editFormValues={editFormValues}
        dropdownVisible={dropdownVisible}
        onClose={onClose}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        onChangeDepartment={() => handleAction('changeDepartment')}
        onResign={() => handleAction('resignation')}
        onRestore={() => handleAction('restore')}
        setEditFormValues={setEditFormValues}
        setDropdownVisible={setDropdownVisible}
        updateLoading={updateLoading}
        renderDepartments={renderDepartments}
      />

      {/* 变更部门弹窗 */}
      <ChangeDepartmentModal
        visible={changeDepartmentVisible}
        employee={employee as ChangeDepartmentEmployeeData}
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
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_CONTENT, { name: employee?.name })}
        </p>
        <p style={{ color: 'var(--semi-color-text-2)', fontSize: '14px' }}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESIGNATION_CONFIRM_DESCRIPTION)}
        </p>
      </Modal>

      {/* 恢复在职弹窗 */}
      <ChangeDepartmentModal
        visible={restoreVisible}
        employee={employee as ChangeDepartmentEmployeeData}
        onClose={() => setRestoreVisible(false)}
        onSuccess={handleRestoreSuccess}
        isRestore={true}
      />
    </>
  );
};
