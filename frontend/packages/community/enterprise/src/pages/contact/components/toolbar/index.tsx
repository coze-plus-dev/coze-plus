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

import { type FC, useState, useCallback } from 'react';

import {
  IconCozPlus,
  IconCozTeamFill,
  IconCozFolder,
  IconCozPeople,
  IconCozArrowRight,
} from '@coze-arch/coze-design/icons';
import { Button, Input, Dropdown } from '@coze-arch/coze-design';

import { CreateOrganizationModal } from '../create-organization-modal';
import { CreateEmployeeModal } from '../create-employee-modal';
import { CreateDepartmentModal } from '../create-department-modal';
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';

import styles from './index.module.less';

interface ToolbarProps {
  selectedNode?: { id: string; type: 'corp' | 'dept' };
  onRefresh?: () => void;
  showExpandButton?: boolean;
  onExpand?: () => void;
  onSearch?: (keyword: string) => void;
}

export const Toolbar: FC<ToolbarProps> = ({
  selectedNode,
  onRefresh,
  showExpandButton,
  onExpand,
  onSearch,
}) => {
  const [createOrgModalVisible, setCreateOrgModalVisible] = useState(false);
  const [createDeptModalVisible, setCreateDeptModalVisible] = useState(false);
  const [createEmployeeModalVisible, setCreateEmployeeModalVisible] =
    useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleCreateClick = useCallback(
    (type: 'organization' | 'department' | 'member') => {
      // 使用 setTimeout 确保状态更新不在渲染期间触发
      setTimeout(() => {
        if (type === 'organization') {
          setCreateOrgModalVisible(true);
        } else if (type === 'department') {
          setCreateDeptModalVisible(true);
        } else {
          setCreateEmployeeModalVisible(true);
        }
      }, 0);
    },
    [],
  );

  const handleSearch = useCallback(
    (value: string) => {
      setSearchKeyword(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  return (
    <div className={styles.toolbar}>
      <div className={styles.left}>
        {showExpandButton ? (
          <Button
            size="small"
            color="secondary"
            icon={<IconCozArrowRight className="text-[14px]" />}
            onClick={onExpand}
            className={styles.expandButton}
          />
        ) : null}
        <Input
          showClear
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_SEARCH_EMPLOYEES_PLACEHOLDER,
          )}
          style={{ width: 240 }}
          value={searchKeyword}
          onChange={setSearchKeyword}
          onEnterPress={() => handleSearch(searchKeyword)}
          onClear={() => handleSearch('')}
        />
      </div>
      <div className={styles.right}>
        <Dropdown
          trigger="hover"
          position="bottomRight"
          spacing={4}
          render={
            <div className="min-w-[160px] py-[4px]">
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => handleCreateClick('organization')}
                >
                  <div className="flex items-center gap-[8px]">
                    <IconCozTeamFill className="text-[16px]" />
                    <span>
                      {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORGANIZATION)}
                    </span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleCreateClick('department')}>
                  <div className="flex items-center gap-[8px]">
                    <IconCozFolder className="text-[16px]" />
                    <span>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}</span>
                  </div>
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleCreateClick('member')}>
                  <div className="flex items-center gap-[8px]">
                    <IconCozPeople className="text-[16px]" />
                    <span>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER)}</span>
                  </div>
                </Dropdown.Item>
              </Dropdown.Menu>
            </div>
          }
        >
          <Button theme="solid" icon={<IconCozPlus className="text-[16px]" />}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_COMMON_CREATE)}
          </Button>
        </Dropdown>
      </div>

      <CreateOrganizationModal
        visible={createOrgModalVisible}
        onClose={() => setCreateOrgModalVisible(false)}
        onSuccess={() => {
          onRefresh?.();
        }}
      />

      <CreateDepartmentModal
        visible={createDeptModalVisible}
        onClose={() => setCreateDeptModalVisible(false)}
        onSuccess={() => {
          onRefresh?.();
        }}
        defaultParentId={selectedNode?.id}
      />

      <CreateEmployeeModal
        visible={createEmployeeModalVisible}
        onClose={() => setCreateEmployeeModalVisible(false)}
        onSuccess={() => {
          onRefresh?.();
        }}
      />
    </div>
  );
};
