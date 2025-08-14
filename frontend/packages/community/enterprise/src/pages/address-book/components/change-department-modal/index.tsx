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

/*
 * Copyright 2025 coze-dev Authors
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

import { type FC, useState, useEffect } from 'react';
import { Modal, Toast } from '@coze-arch/coze-design';
import { t } from '../../../../utils/i18n';
import { useRequest } from 'ahooks';
import { employee } from '@coze-studio/api-schema';

import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { employeeApi } from '../../../../api/corporationApi';
import { DepartmentSelector } from '../department-selector';

import styles from './index.module.less';

// 确保主部门逻辑：确保只有一个主部门，如果没有主部门则将第一个设为主部门
const ensurePrimaryDepartment = (depts: employee.employee.EmployeeDepartmentInfo[]) => {
  if (depts.length === 0) return depts;
  
  // 找到所有主部门
  const primaryDepts = depts.filter(d => d.is_primary);
  
  if (primaryDepts.length === 0) {
    // 如果没有主部门，将第一个设为主部门
    return depts.map((dept, index) => ({
      ...dept,
      is_primary: index === 0
    }));
  } else if (primaryDepts.length === 1) {
    // 如果只有一个主部门，保持现有状态
    return depts;
  } else {
    // 如果有多个主部门，只保留第一个主部门，其他的设为非主部门
    let firstPrimaryIndex = -1;
    
    // 找到第一个主部门的索引
    for (let i = 0; i < depts.length; i++) {
      if (depts[i].is_primary) {
        firstPrimaryIndex = i;
        break;
      }
    }
    
    return depts.map((dept, index) => ({
      ...dept,
      is_primary: index === firstPrimaryIndex
    }));
  }
};

interface EmployeeData {
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

interface ChangeDepartmentModalProps {
  visible: boolean;
  employee?: EmployeeData;
  onClose: () => void;
  onSuccess: () => void;
  isRestore?: boolean; // 是否为恢复在职模式
}

export const ChangeDepartmentModal: FC<ChangeDepartmentModalProps> = ({
  visible,
  employee,
  onClose,
  onSuccess,
  isRestore = false,
}) => {
  const [departments, setDepartments] = useState<employee.employee.EmployeeDepartmentInfo[]>([]);

  // 变更部门或恢复在职请求
  const { loading: changeLoading, run: changeDepartment } = useRequest(
    async (depts: employee.employee.EmployeeDepartmentInfo[]) => {
      if (!employee?.id) return;
      
      if (isRestore) {
        // 恢复在职API
        const result = await employeeApi.restoreEmployee({
          id: employee.id,
          departments: depts,
        });
        return result;
      } else {
        // 变更部门API
        const result = await employeeApi.changeEmployeeDepartment({
          id: employee.id,
          departments: depts,
        });
        return result;
      }
    },
    {
      manual: true,
      onSuccess: () => {
        const message = isRestore ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_SUCCESS_MESSAGE) : t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_SUCCESS);
        Toast.success(message);
        onSuccess();
        onClose();
      },
      onError: (error) => {
        const message = isRestore ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_FAILED_MESSAGE) : t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_FAILED);
        Toast.error(error.message || message);
      },
    }
  );

  // 当弹窗打开时，初始化部门数据
  useEffect(() => {
    if (visible) {
      if (isRestore) {
        // 恢复在职模式：初始部门数据为空，让用户重新选择
        setDepartments([]);
      } else if (employee?.departments) {
        // 变更部门模式：使用现有部门数据
        const initialDepartments: employee.employee.EmployeeDepartmentInfo[] = employee.departments.map(dept => ({
          department_id: dept.department_id,
          department_name: dept.department_name,
          corp_id: dept.corp_id,
          corp_name: dept.corp_name,
          job_title: dept.job_title,
          is_primary: dept.is_primary,
          department_path: dept.department_path,
        }));
        
        // 确保主部门逻辑正确
        const correctedDepartments = ensurePrimaryDepartment(initialDepartments);
        setDepartments(correctedDepartments);
      } else {
        setDepartments([]);
      }
    }
  }, [visible, employee, isRestore]);

  const handleSave = () => {
    // 表单验证
    if (!departments || departments.length === 0) {
      Toast.error(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_DEPARTMENT_REQUIRED));
      return;
    }

    // 确保主部门逻辑正确：只有一个主部门
    const finalDepartments = ensurePrimaryDepartment(departments);

    changeDepartment(finalDepartments);
  };

  const handleCancel = () => {
    onClose();
  };

  // 处理部门选择器数据变更，确保主部门逻辑正确
  const handleDepartmentChange = (newDepartments: employee.employee.EmployeeDepartmentInfo[]) => {
    const correctedDepartments = ensurePrimaryDepartment(newDepartments);
    setDepartments(correctedDepartments);
  };

  const modalTitle = isRestore 
    ? `${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_EMPLOYEE_TITLE)} - ${employee?.name || ''}` 
    : `${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_CHANGE_DEPARTMENT)} - ${employee?.name || ''}`;
  
  const okButtonText = isRestore 
    ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_CONFIRM_OK_TEXT)
    : t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_SAVE);

  return (
    <Modal
      visible={visible}
      title={modalTitle}
      onCancel={handleCancel}
      onOk={handleSave}
      okText={okButtonText}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_CANCEL)}
      okButtonProps={{ loading: changeLoading }}
      width={600}
      className={styles.changeDepartmentModal}
    >
      <div className={styles.content}>
        <div className={styles.formItem}>
          <div className={styles.label}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_SECTION_DEPARTMENT)}
            <span style={{ color: 'red', marginLeft: 4 }}>*</span>
          </div>
          <DepartmentSelector
            value={departments}
            onChange={handleDepartmentChange}
            placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_DEPARTMENT_PLACEHOLDER)}
            multiple
          />
        </div>
        
        <div className={styles.tips}>
          <div className={styles.tipItem}>
            • {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CHANGE_DEPARTMENT_TIP_1)}
          </div>
          <div className={styles.tipItem}>
            • {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CHANGE_DEPARTMENT_TIP_2)}
          </div>
        </div>
      </div>
    </Modal>
  );
};