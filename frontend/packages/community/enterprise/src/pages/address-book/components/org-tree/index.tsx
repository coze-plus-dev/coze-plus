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

import { useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react';

import { t } from '../../../../utils/i18n';
import { Tree, EmptyState, Spin, Dropdown, Toast, Modal } from '@coze-arch/coze-design';
import { IconCozEmpty, IconCozFolder, IconCozTeamFill, IconCozMore, IconCozArrowLeft } from '@coze-arch/coze-design/icons';

import { useOrganizationTree } from '../../../../hooks/useOrganizationTree';
import { corporationApi, departmentApi } from '../../../../api/corporationApi';
import { EditOrganizationModal } from '../edit-organization-modal';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { EditDepartmentModal } from '../edit-department-modal';

import styles from './index.module.less';

interface OrgTreeProps {
  onSelectNode?: (id: string, nodeType: 'corp' | 'dept', nodeInfo?: any) => void;
  onRefresh?: () => void;
  onCollapse?: () => void;
}

export interface OrgTreeRef {
  refresh: () => void;
}

const OrgTree = forwardRef<OrgTreeRef, OrgTreeProps>(({ onSelectNode, onRefresh, onCollapse }, ref) => {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [editOrgVisible, setEditOrgVisible] = useState(false);
  const [editDeptVisible, setEditDeptVisible] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string>('');
  const [dropdownVisible, setDropdownVisible] = useState<string | null>(null);
  
  const { treeData, loading, error, refetch } = useOrganizationTree({
    includeDepartments: true,
    includeEmployeeCount: true,
  });

  // 暴露refresh方法给父组件
  useImperativeHandle(ref, () => ({
    refresh: refetch,
  }), [refetch]);

  // 自动展开所有企业节点
  const defaultExpandedKeys = useMemo(() => {
    const keys: string[] = [];
    const traverse = (nodes: typeof treeData) => {
      nodes.forEach(node => {
        if (node.nodeType === 'corp') {
          keys.push(node.key);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    return keys;
  }, [treeData]);

  // 获取顶级企业节点
  const topLevelCorp = useMemo(() => {
    return treeData.find(node => 
      node.nodeType === 'corp' && 
      (!node.businessParentId || node.businessParentId === '' || node.businessParentId === null ||
       node.level === 0 || (!node.parentId || node.parentId === '' || node.parentId === null))
    );
  }, [treeData]);

  // 当树数据加载完成且没有选中节点时，自动选中顶级企业
  useEffect(() => {
    if (topLevelCorp && selectedKeys.length === 0 && treeData.length > 0) {
      setSelectedKeys([topLevelCorp.key]);
      if (onSelectNode) {
        onSelectNode(topLevelCorp.key, topLevelCorp.nodeType, {
          name: topLevelCorp.title,
          corpId: topLevelCorp.corpId || topLevelCorp.key,
          nodeData: topLevelCorp,
        });
      }
    }
  }, [topLevelCorp, selectedKeys.length, treeData.length, onSelectNode]);

  const handleSelect = (selectedKey: string, selected: boolean, node: any) => {
    if (selected) {
      setSelectedKeys([selectedKey]);
      if (onSelectNode) {
        onSelectNode(selectedKey, node.nodeType, {
          name: node.title,
          corpId: node.corpId,
          deptId: node.deptId,
          nodeData: node,
        });
      }
    } else {
      setSelectedKeys([]);
    }
  };

  const handleExpand = (expandedKeys: string[]) => {
    setExpandedKeys(expandedKeys);
  };

  const handleMenuClick = async (action: string, node: any) => {
    switch (action) {
      case 'edit':
        setEditingNodeId(node.key);
        setDropdownVisible(null); // 关闭下拉菜单
        if (node.nodeType === 'corp') {
          setEditOrgVisible(true);
        } else {
          setEditDeptVisible(true);
        }
        break;
      case 'delete':
        Modal.confirm({
          title: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_TITLE),
          content: `${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_TITLE)} "${node.title}"?`,
          okText: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
          cancelText: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL),
          okButtonColor: 'red',
          centered: true,
          maskClosable: false,
          onOk: async () => {
            try {
              if (node.nodeType === 'corp') {
                await corporationApi.deleteCorporation(node.key);
              } else {
                await departmentApi.deleteDepartment(node.key);
              }
              Toast.success(t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_SUCCESS));
              // Refresh tree data
              refetch();
              onRefresh?.();
            } catch (error: any) {
              Toast.error(error.message || t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE_FAILED));
            }
          },
        });
        break;
      default:
        break;
    }
  };

  const renderTreeNode = (label: React.ReactNode, node?: any) => {
    if (!node) {
      return label;
    }
    
    // 判断是否是顶级企业节点（多重判断逻辑）
    const isTopCorp = node.nodeType === 'corp' && 
      (!node.businessParentId || node.businessParentId === '' || node.businessParentId === null ||
       node.level === 0 || (!node.parentId || node.parentId === '' || node.parentId === null));
    
    
    // 根据节点类型决定是否显示图标
    let icon: JSX.Element | null = null;
    if (isTopCorp) {
      // 顶级企业节点显示图标
      icon = <IconCozTeamFill className={styles.nodeIcon} />;
    } else if (node.nodeType === 'dept') {
      // 部门节点显示图标
      icon = <IconCozFolder className={styles.nodeIcon} />;
    }
    // 子企业节点不显示图标
    
    // 根据节点类型设置菜单项
    const menuItems = node.nodeType === 'corp' ? [
      {
        key: 'edit',
        label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION),
        onClick: () => handleMenuClick('edit', node),
      },
      {
        key: 'delete',
        label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
        onClick: () => handleMenuClick('delete', node),
      },
    ] : [
      {
        key: 'edit',
        label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_DEPARTMENT),
        onClick: () => handleMenuClick('edit', node),
      },
      {
        key: 'delete',
        label: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DELETE),
        onClick: () => handleMenuClick('delete', node),
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
          onVisibleChange={(visible) => setDropdownVisible(visible ? node.key : null)}
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
            onClick={(e) => {
              e.stopPropagation();
            }}
          />
        </Dropdown>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.orgTreeContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}</h3>
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
          <h3 className={styles.title}>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}</h3>
        </div>
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOAD_FAILED)}
            description={error.message}
          />
        </div>
      </div>
    );
  }

  if (treeData.length === 0) {
    return (
      <div className={styles.orgTreeContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}</h3>
        </div>
        <div className={styles.emptyWrapper}>
          <EmptyState
            icon={<IconCozEmpty className="w-[48px] h-[48px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NO_DEPARTMENT_DATA)}
            description={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_CREATE_DEPARTMENT)}
          />
        </div>
      </div>
    );
  }

  const handleEditOrgSuccess = () => {
    refetch();
    onRefresh?.();
  };

  const handleEditDeptSuccess = () => {
    refetch();
    onRefresh?.();
  };

  return (
    <>
      <div className={styles.orgTreeContainer}>
        <div className={styles.header}>
          <h3 className={styles.title}>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ADDRESS_BOOK_TITLE)}</h3>
          <button className={styles.collapseButton} onClick={onCollapse} title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ORG_TREE_COLLAPSE_SIDEBAR)}>
            <IconCozArrowLeft />
          </button>
        </div>
        <div className={styles.treeWrapper}>
          <Tree
            treeData={treeData}
            selectedKey={selectedKeys[0]}
            expandedKeys={expandedKeys.length > 0 ? expandedKeys : defaultExpandedKeys}
            onSelect={handleSelect}
            onExpand={handleExpand}
            renderLabel={renderTreeNode}
            expandAction={false}
            showLine={false}
            blockNode={true}
            style={{
              '--semi-tree-option-indent': '0px',
              '--semi-spacing-base-tight': '0px'
            } as any}
            className={styles.customTree}
          />
        </div>
      </div>
      
      <EditOrganizationModal
        visible={editOrgVisible}
        organizationId={editingNodeId}
        onClose={() => {
          setEditOrgVisible(false);
          setEditingNodeId('');
        }}
        onSuccess={handleEditOrgSuccess}
      />
      
      <EditDepartmentModal
        visible={editDeptVisible}
        departmentId={editingNodeId}
        onClose={() => {
          setEditDeptVisible(false);
          setEditingNodeId('');
        }}
        onSuccess={handleEditDeptSuccess}
      />
    </>
  );
});

OrgTree.displayName = 'OrgTree';

export { OrgTree };