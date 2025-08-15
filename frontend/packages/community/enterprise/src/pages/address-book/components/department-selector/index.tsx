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

import { type FC, useState, useEffect } from 'react';
import { t } from '../../../../utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '../../../../locales/keys';
import { Tree, Modal, Input, Button, Empty } from '@coze-arch/coze-design';
import { IconCozArrowDown, IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { useRequest } from 'ahooks';
import { employee } from '@coze-studio/api-schema';
import { corporationApi } from '../../../../api/corporationApi';

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

interface DepartmentSelectorProps {
  value?: employee.employee.EmployeeDepartmentInfo[];
  onChange?: (value: employee.employee.EmployeeDepartmentInfo[]) => void;
  placeholder?: string;
  multiple?: boolean;
}

interface TreeNode {
  key: string;
  label?: string;
  title: string;
  value?: string;
  children?: TreeNode[];
  isOrg?: boolean;
  corpId?: string;
  corpName?: string;
  deptId?: string;
  deptName?: string;
  disabled?: boolean;
}

export const DepartmentSelector: FC<DepartmentSelectorProps> = ({
  value = [],
  onChange,
  placeholder,
  multiple = true,
}) => {
  const [visible, setVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<employee.employee.EmployeeDepartmentInfo[]>([]);

  // 获取组织架构树
  const { loading, run: fetchOrgTree } = useRequest(
    async () => {
      const result = await corporationApi.getOrganizationTree({
        include_departments: true,
        depth: 10,
      });
      return result;
    },
    {
      manual: true,
      onSuccess: (data) => {
        // 构建组织名映射表
        const buildCorpNameMap = (items: any[]): Map<string, string> => {
          const map = new Map<string, string>();
          const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
              if (node.node_type === 'corp') {
                map.set(node.id, node.name);
              }
              if (node.children && node.children.length > 0) {
                traverse(node.children);
              }
            });
          };
          traverse(items);
          return map;
        };

        const corpNameMap = buildCorpNameMap(data);

        const convertToTreeData = (items: any[], parentCorpId?: string, parentCorpName?: string): TreeNode[] => {
          return items.map((item) => {
            const isOrg = item.node_type === 'corp';
            const key = isOrg ? `org_${item.id}` : `dept_${item.id}`;
            
            // 确定当前的corpId和corpName
            let currentCorpId: string;
            let currentCorpName: string;
            
            if (isOrg) {
              // 如果是组织节点
              currentCorpId = item.id;
              currentCorpName = item.name;
            } else {
              // 如果是部门节点，使用API提供的corp_id或从父级继承
              currentCorpId = item.corp_id || parentCorpId || '';
              
              // 优先使用映射表查找组织名
              if (currentCorpId) {
                currentCorpName = corpNameMap.get(currentCorpId) || '';
              } else {
                currentCorpName = '';
              }
              
              // 如果映射表查找失败，使用父级传递的组织名
              if (!currentCorpName && parentCorpName) {
                currentCorpName = parentCorpName;
              }
              
              // 如果还没有组织名，尝试从business_path提取第一段作为组织名
              if (!currentCorpName && item.business_path) {
                const pathParts = item.business_path.split('/');
                if (pathParts.length > 0) {
                  currentCorpName = pathParts[0];
                }
              }
            }
            
            const node: TreeNode = {
              key: key,
              label: item.name,  // Semi Design Tree 使用 label 字段
              title: item.name,
              value: key,        // 添加 value 字段
              isOrg: isOrg,
              corpId: currentCorpId,
              corpName: currentCorpName,
              disabled: isOrg, // 组织节点不可选
            };
            
            // 如果是部门节点，添加部门相关信息
            if (!isOrg) {
              node.deptId = item.dept_id || item.id;
              node.deptName = item.name;
            }
            
            // 递归处理子节点
            if (item.children && item.children.length > 0) {
              node.children = convertToTreeData(item.children, currentCorpId, currentCorpName);
            }
            
            return node;
          });
        };

        const treeNodes = convertToTreeData(data);
        setTreeData(treeNodes);
        
        // 默认展开所有节点
        const getAllKeys = (nodes: TreeNode[]): string[] => {
          const keys: string[] = [];
          const traverse = (nodeList: TreeNode[]) => {
            nodeList.forEach(node => {
              keys.push(node.key);
              if (node.children && node.children.length > 0) {
                traverse(node.children);
              }
            });
          };
          traverse(nodes);
          return keys;
        };
        setExpandedKeys(getAllKeys(treeNodes));
        
      },
    }
  );

  // 打开选择器时加载数据
  useEffect(() => {
    if (visible && treeData.length === 0) {
      fetchOrgTree();
    }
  }, [visible, treeData.length, fetchOrgTree]);

  // 从value初始化选中的部门
  useEffect(() => {
    // 确保主部门逻辑一致
    const initDepts = ensurePrimaryDepartment([...value]);
    setSelectedDepts(initDepts);
    const keys = initDepts.map((item) => `dept_${item.department_id}`);
    setSelectedKeys(keys);
  }, [value]);

  // 当弹窗关闭时清理状态
  useEffect(() => {
    if (!visible) {
      setSearchValue('');
    }
  }, [visible]);

  // 处理确认
  const handleConfirm = () => {
    onChange?.(selectedDepts);
    setVisible(false);
  };

  // 处理清空
  const handleClear = () => {
    setSelectedKeys([]);
    setSelectedDepts([]);
  };

  // 处理节点选择
  const handleNodeSelect = (key: string, checked: boolean, node: TreeNode) => {
    if (node.isOrg) return undefined;
    let newKeys = [...selectedKeys];
    let newDepts = [...selectedDepts];
    
    if (checked) {
      if (!selectedKeys.includes(key)) {
        newKeys.push(key);
        if (node.deptId && node.corpId) {
          newDepts.push({
            department_id: node.deptId,
            department_name: node.deptName || '',
            corp_id: node.corpId,
            corp_name: node.corpName || '', // 确保corpName不为undefined
            is_primary: false, // 默认不设为主部门，让ensurePrimaryDepartment函数统一处理
          });
        }
      }
    } else {
      newKeys = selectedKeys.filter(k => k !== key);
      newDepts = selectedDepts.filter(d => `dept_${d.department_id}` !== key);
    }
    
    // 重新整理主部门状态
    newDepts = ensurePrimaryDepartment(newDepts);
    
    setSelectedKeys(newKeys);
    setSelectedDepts(newDepts);
  };


  // 移除已选部门
  const handleRemoveDept = (deptId: string) => {
    const key = `dept_${deptId}`;
    const newKeys = selectedKeys.filter(k => k !== key);
    let newDepts = selectedDepts.filter(d => d.department_id !== deptId);
    
    // 统一使用ensurePrimaryDepartment处理主部门逻辑
    newDepts = ensurePrimaryDepartment(newDepts);
    
    setSelectedKeys(newKeys);
    setSelectedDepts(newDepts);
  };

  // 设置主部门
  const handleSetPrimary = (deptId: string) => {
    // 确保只有指定的部门是主部门，其他都不是主部门
    const newDepts = selectedDepts.map(dept => ({
      ...dept,
      is_primary: dept.department_id === deptId
    }));
    setSelectedDepts(newDepts);
  };

  // 渲染trigger
  const renderTrigger = () => {
    if (value.length === 0) {
      return <span style={{ color: 'var(--semi-color-text-2)' }}>{placeholder}</span>;
    }

    return (
      <div className={styles.selectedTags}>
        {value.map((dept) => (
          <div key={dept.department_id} className={styles.tagItem}>
            <span>{dept.corp_name} - {dept.department_name}</span>
            <IconCozTrashCan 
              className={styles.removeIcon}
              onClick={(e) => {
                e.stopPropagation();
                const newValue = value.filter((item) => item.department_id !== dept.department_id);
                
                // 重新整理主部门状态：确保有主部门且只有一个主部门
                const finalValue = ensurePrimaryDepartment(newValue);
                onChange?.(finalValue);
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // 过滤树节点
  const filterTreeData = (data: TreeNode[], searchValue: string): TreeNode[] => {
    if (!searchValue) return data;
    
    const filterNode = (node: TreeNode): TreeNode | null => {
      const matches = node.title.toLowerCase().includes(searchValue.toLowerCase());
      
      if (node.children) {
        const filteredChildren = node.children
          .map(child => filterNode(child))
          .filter(Boolean) as TreeNode[];
        
        if (filteredChildren.length > 0 || matches) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
      }
      
      return matches ? node : null;
    };
    
    return data
      .map(node => filterNode(node))
      .filter(Boolean) as TreeNode[];
  };

  const filteredTreeData = filterTreeData(treeData, searchValue);

  return (
    <>
      <div
        className={styles.selectorTrigger}
        onClick={() => setVisible(true)}
      >
        <div className={styles.valueContainer}>
          {renderTrigger()}
        </div>
        <IconCozArrowDown className={styles.arrow} />
      </div>

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
          <div className={styles.leftPanel}>
            <div className={styles.searchWrapper}>
              <Input
                placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SEARCH)}
                value={searchValue}
                onChange={(value) => setSearchValue(value)}
                showClear
              />
            </div>
            <div className={styles.treeWrapper}>
              {loading ? (
                <div className={styles.loading}>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOADING)}</div>
              ) : filteredTreeData.length === 0 ? (
                <Empty 
                  description={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NO_DATA)} 
                />
              ) : (
                <Tree
                  treeData={filteredTreeData}
                  multiple
                  value={selectedKeys}
                  expandedKeys={expandedKeys}
                  onExpand={(expandedKeys: string[]) => {
                    setExpandedKeys(expandedKeys);
                  }}
                   onSelect = {(selectedKey: string, selected: boolean, selectedNode: any) =>{
                          handleNodeSelect(selectedKey, selected, selectedNode);
                   }}  
                  renderLabel={(label: React.ReactNode, node?: any) => {
                    if (!node) return label;
                    
                    const isDisabled = node.isOrg;
                    
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
          
          <div className={styles.rightPanel}>
            <div className={styles.selectedHeader}>
              <span>{t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PUBLISH_PERMISSION_CONTROL_PAGE_REMOVE_CHOSEN)}：{selectedDepts.length} {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}</span>
              <Button
                size="small"
                theme="borderless"
                onClick={handleClear}
                disabled={selectedDepts.length === 0}
              >
                {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_ANALYTIC_QUERY_CLEAR)}
              </Button>
            </div>
            <div className={styles.selectedList}>
              {selectedDepts.length === 0 ? (
                <Empty 
                  description={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_QUERY_DATA_EMPTY)} 
                />
              ) :  
              (
                selectedDepts.map((dept) => (
                  <div key={dept.department_id} className={styles.selectedItem}>
                    <div className={styles.deptInfo}>
                      <div className={styles.deptNameWithTag}>
                        <div className={styles.corpName}>{dept.corp_name}</div>
                        <div className={styles.deptName}>
                          {dept.department_name}
                          {dept.is_primary && (
                            <span className={styles.primaryTag}>
                              {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PRIMARY_DEPARTMENT_TAG)}
                            </span>
                          )}
                        </div>
                      </div>
                      {!dept.is_primary && selectedDepts.length > 1 && (
                        <Button
                          size="small"
                          theme="borderless"
                          className={styles.setPrimaryBtn}
                          onClick={() => handleSetPrimary(dept.department_id)}
                        >
                          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_SET_PRIMARY_DEPARTMENT)}
                        </Button>
                      )}
                    </div>
                    <IconCozTrashCan
                      className={styles.removeBtn}
                      onClick={() => handleRemoveDept(dept.department_id)}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};