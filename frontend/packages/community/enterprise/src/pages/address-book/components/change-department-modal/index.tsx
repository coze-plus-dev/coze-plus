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

import { Modal } from '@coze-arch/coze-design';

import { DepartmentSelector } from '../department-selector';
import { useDepartmentChange } from './use-department-change';
import { getModalConfig } from './modal-config';

import styles from './index.module.less';

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
  isRestore?: boolean;
}

export const ChangeDepartmentModal: FC<ChangeDepartmentModalProps> = ({
  visible,
  employee,
  onClose,
  onSuccess,
  isRestore = false,
}) => {
  const { departments, changeLoading, handleDepartmentChange, handleConfirm } =
    useDepartmentChange({
      employee,
      isRestore,
      onSuccess,
      onClose,
      visible,
    });

  const config = getModalConfig(isRestore, employee?.name);

  return (
    <Modal
      visible={visible}
      title={config.title}
      onCancel={onClose}
      onOk={handleConfirm}
      okText={config.okText}
      cancelText={config.cancelText}
      okButtonProps={{ loading: changeLoading }}
      width={600}
      className={styles.changeDepartmentModal}
    >
      <div className={styles.content}>
        <div className={styles.formItem}>
          <div className={styles.label}>
            {config.departmentLabel}
            <span style={{ color: 'red', marginLeft: 4 }}>*</span>
          </div>
          <DepartmentSelector
            value={departments}
            onChange={handleDepartmentChange}
            placeholder={config.departmentPlaceholder}
            multiple
          />
        </div>

        <div className={styles.tips}>
          <div className={styles.tipItem}>• {config.tip1}</div>
          <div className={styles.tipItem}>• {config.tip2}</div>
        </div>
      </div>
    </Modal>
  );
};
