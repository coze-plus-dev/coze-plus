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

import { Tree, Input, Empty } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import styles from '../index.module.less';
import { type TreeNode, filterTreeData } from '../hooks/utils';

interface TreePanelProps {
  loading: boolean;
  treeData: TreeNode[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  selectedKeys: string[];
  expandedKeys: string[];
  onExpand: (expandedKeys: string[]) => void;
  onNodeSelect: (
    selectedKey: string,
    selected: boolean,
    selectedNode: TreeNode,
  ) => void;
}

export const TreePanel: FC<TreePanelProps> = ({
  loading,
  treeData,
  searchValue,
  onSearchChange,
  selectedKeys,
  expandedKeys,
  onExpand,
  onNodeSelect,
}) => {
  const filteredTreeData = filterTreeData(treeData, searchValue);

  return (
    <div className={styles.leftPanel}>
      <div className={styles.searchWrapper}>
        <Input
          placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SEARCH)}
          value={searchValue}
          onChange={onSearchChange}
          showClear
        />
      </div>
      <div className={styles.treeWrapper}>
        {loading ? (
          <div className={styles.loading}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOADING)}
          </div>
        ) : filteredTreeData.length === 0 ? (
          <Empty description={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NO_DATA)} />
        ) : (
          <Tree
            treeData={filteredTreeData}
            multiple
            value={selectedKeys}
            expandedKeys={expandedKeys}
            onExpand={onExpand}
            onSelect={(
              selectedKey: string,
              selected: boolean,
              selectedNode: unknown,
            ) => {
              onNodeSelect(selectedKey, selected, selectedNode as TreeNode);
            }}
            renderLabel={(label: React.ReactNode, node?: unknown) => {
              if (!node) {
                return label;
              }

              const treeNode = node as TreeNode;
              const isDisabled = treeNode.isOrg;

              return (
                <span className={isDisabled ? styles.orgNode : styles.deptNode}>
                  {label}
                </span>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};
