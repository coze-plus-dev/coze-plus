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

import React from 'react';

import { IconCozEmpty, IconCozArrowLeft } from '@coze-arch/coze-design/icons';
import { Tree, EmptyState, Spin } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { TreeNode } from '@/hooks/use-organization-tree';

import { TreeNodeRenderer } from './tree-node-renderer';
import styles from '../index.module.less';

interface TreeContentProps {
  loading: boolean;
  error: Error | null;
  treeData: TreeNode[];
  selectedKeys: string[];
  expandedKeys: string[];
  defaultExpandedKeys: string[];
  dropdownVisible: string | null;
  onSelect: (
    selectedKey: string,
    selected: boolean,
    selectedNode: unknown,
  ) => void;
  onExpand: (expandedKeys: string[]) => void;
  onMenuClick: (
    action: string,
    node: { key: string; title: string; nodeType: 'corp' | 'dept' },
  ) => void;
  setDropdownVisible: (visible: string | null) => void;
  onCollapse?: () => void;
}

export const TreeContent: React.FC<TreeContentProps> = ({
  loading,
  error,
  treeData,
  selectedKeys,
  expandedKeys,
  defaultExpandedKeys,
  dropdownVisible,
  onSelect,
  onExpand,
  onMenuClick,
  setDropdownVisible,
  onCollapse,
}) => {
  const renderTreeNode = (label?: React.ReactNode, treeNode?: unknown) => {
    const node = treeNode as
      | {
          key: string;
          title: string;
          nodeType: 'corp' | 'dept';
          businessParentId?: string | null;
          level?: number;
          parentId?: string | null;
        }
      | undefined;
    return (
      <TreeNodeRenderer
        label={label}
        node={node}
        dropdownVisible={dropdownVisible}
        styles={styles}
        onMenuClick={onMenuClick}
        setDropdownVisible={setDropdownVisible}
      />
    );
  };

  if (loading) {
    return (
      <div className={styles.orgTreeContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}
          </h3>
        </div>
        <div className={styles.loadingWrapper}>
          <Spin size="middle" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.orgTreeContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}
          </h3>
        </div>
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NO_DEPARTMENT_DATA)}
            description={t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_CREATE_DEPARTMENT,
            )}
          />
        </div>
      </div>
    );
  }

  if (!treeData || treeData.length === 0) {
    return (
      <div className={styles.orgTreeContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}
          </h3>
        </div>
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NO_DEPARTMENT_DATA)}
            description={t(
              ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_CREATE_DEPARTMENT,
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.orgTreeContainer}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}
        </h3>
        <button
          className={styles.collapseButton}
          onClick={onCollapse}
          title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORG_TREE_COLLAPSE_SIDEBAR)}
        >
          <IconCozArrowLeft />
        </button>
      </div>
      <div className={styles.treeWrapper}>
        <Tree
          treeData={treeData}
          selectedKey={selectedKeys[0]}
          expandedKeys={
            expandedKeys.length > 0 ? expandedKeys : defaultExpandedKeys
          }
          onSelect={onSelect}
          onExpand={onExpand}
          renderLabel={renderTreeNode}
          expandAction={false}
          showLine={false}
          blockNode={true}
          style={
            /* eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- CSS custom properties */
            {
              '--semi-tree-option-indent': '0px',
              '--semi-spacing-base-tight': '0px',
            } as React.CSSProperties
          }
          className={styles.customTree}
        />
      </div>
    </div>
  );
};
