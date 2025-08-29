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
import { Modal, Button } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useDepartmentSelector } from './hooks/use-department-selector';
import { TreePanel } from './components/tree-panel';
import { SelectorTrigger } from './components/selector-trigger';
import { SelectedDepartments } from './components/selected-departments';

import styles from './index.module.less';

interface DepartmentSelectorProps {
  value?: employee.employee.EmployeeDepartmentInfo[];
  onChange?: (value: employee.employee.EmployeeDepartmentInfo[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

export const DepartmentSelector: FC<DepartmentSelectorProps> = ({
  value = [],
  onChange,
  placeholder,
  multiple = true,
}) => {
  const {
    visible,
    setVisible,
    searchValue,
    setSearchValue,
    selectedKeys,
    expandedKeys,
    setExpandedKeys,
    treeData,
    selectedDepts,
    loading,
    handleConfirm,
    handleClear,
    handleNodeSelect,
    handleRemoveDept,
    handleSetPrimary,
  } = useDepartmentSelector({
    value,
    onChange,
    multiple,
  });

  return (
    <>
      <SelectorTrigger
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onClick={() => setVisible(true)}
      />

      <Modal
        visible={visible}
        onCancel={() => setVisible(false)}
        footer={
          <div className={styles.modalFooter}>
            <Button onClick={() => setVisible(false)}>
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
            </Button>
            <Button
              theme="solid"
              onClick={handleConfirm}
              disabled={selectedDepts.length === 0}
            >
              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CONFIRM)}
            </Button>
          </div>
        }
        title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SELECT_DEPARTMENT)}
        width={800}
        centered
        className={styles.departmentModal}
        bodyStyle={{ padding: 0 }}
      >
        <div className={styles.modalContent}>
          <TreePanel
            loading={loading}
            treeData={treeData}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            selectedKeys={selectedKeys}
            expandedKeys={expandedKeys}
            onExpand={setExpandedKeys}
            onNodeSelect={handleNodeSelect}
          />

          <SelectedDepartments
            selectedDepts={selectedDepts}
            onClear={handleClear}
            onRemoveDept={handleRemoveDept}
            onSetPrimary={handleSetPrimary}
          />
        </div>
      </Modal>
    </>
  );
};
