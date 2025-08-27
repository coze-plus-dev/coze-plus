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

import {
  IconCozFolder,
  IconCozTeamFill,
  IconCozMore,
} from '@coze-arch/coze-design/icons';
import { Dropdown } from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

interface TreeNode {
  key: string;
  title: string;
  nodeType: 'corp' | 'dept';
  businessParentId?: string | null;
  level?: number;
  parentId?: string | null;
}

interface TreeNodeRendererProps {
  label: React.ReactNode;
  node?: TreeNode;
  dropdownVisible: string | null;
  styles: Record<string, string>;
  onMenuClick: (action: string, node: TreeNode) => void;
  setDropdownVisible: (visible: string | null) => void;
}

export const TreeNodeRenderer: React.FC<TreeNodeRendererProps> = ({
  label,
  node,
  dropdownVisible,
  styles,
  onMenuClick,
  setDropdownVisible,
}) => {
  if (!node) {
    return <>{label}</>;
  }

  // 判断是否是顶级企业节点
  const isTopCorp =
    node.nodeType === 'corp' &&
    (!node.businessParentId ||
      node.businessParentId === '' ||
      node.businessParentId === null ||
      node.level === 0 ||
      !node.parentId ||
      node.parentId === '' ||
      node.parentId === null);

  // 根据节点类型决定是否显示图标
  let icon: JSX.Element | null = null;
  if (isTopCorp) {
    icon = <IconCozTeamFill className={styles.nodeIcon} />;
  } else if (node.nodeType === 'dept') {
    icon = <IconCozFolder className={styles.nodeIcon} />;
  }

  // 根据节点类型设置菜单项
  const menuItems =
    node.nodeType === 'corp'
      ? [
          {
            key: 'edit',
            label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION),
            onClick: () => onMenuClick('edit', node),
          },
          {
            key: 'delete',
            label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
            onClick: () => onMenuClick('delete', node),
          },
        ]
      : [
          {
            key: 'edit',
            label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_DEPARTMENT),
            onClick: () => onMenuClick('edit', node),
          },
          {
            key: 'delete',
            label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
            onClick: () => onMenuClick('delete', node),
          },
        ];

  // 确定节点样式类名
  let nodeClass = styles.treeNode;
  if (isTopCorp) {
    nodeClass += ` ${styles.topCorpNode}`;
  } else if (node.nodeType === 'corp') {
    nodeClass += ` ${styles.subCorpNode}`;
  } else {
    nodeClass += ` ${styles.deptNode}`;
  }

  return (
    <div className={nodeClass}>
      {icon}
      <span className={styles.nodeTitle}>{node.title || label}</span>
      <Dropdown
        trigger="click"
        position="bottomRight"
        stopPropagation
        visible={dropdownVisible === node.key}
        onVisibleChange={visible =>
          setDropdownVisible(visible ? node.key : null)
        }
        render={
          <Dropdown.Menu>
            {menuItems.map(item => (
              <Dropdown.Item key={item.key} onClick={item.onClick}>
                {item.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        }
      >
        <IconCozMore
          className={`${styles.moreIcon} rotate-90`}
          onClick={e => {
            e.stopPropagation();
          }}
        />
      </Dropdown>
    </div>
  );
};
