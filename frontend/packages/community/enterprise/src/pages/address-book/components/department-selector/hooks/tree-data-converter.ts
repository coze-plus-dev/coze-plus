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

import { type TreeNode } from './utils';

interface ApiTreeNode {
  id: string;
  name: string;
  node_type: 'corp' | 'dept';
  corp_id?: string;
  dept_id?: string;
  business_path?: string;
  children?: ApiTreeNode[];
}

// 构建组织名映射表
const buildCorpNameMap = (items: ApiTreeNode[]): Map<string, string> => {
  const map = new Map<string, string>();
  const traverse = (nodes: ApiTreeNode[]) => {
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

interface CorpInfoParams {
  item: ApiTreeNode;
  parentCorpId?: string;
  parentCorpName?: string;
  corpNameMap?: Map<string, string>;
}

// 确定公司信息的辅助函数
const determineCorpInfo = ({
  item,
  parentCorpId,
  parentCorpName,
  corpNameMap,
}: CorpInfoParams): { corpId: string; corpName: string } => {
  const isOrg = item.node_type === 'corp';

  if (isOrg) {
    return { corpId: item.id, corpName: item.name };
  }

  // 部门节点的处理逻辑
  const corpId = item.corp_id || parentCorpId || '';
  let corpName = '';

  // 优先使用映射表查找组织名
  if (corpId && corpNameMap) {
    corpName = corpNameMap.get(corpId) || '';
  }

  // 如果映射表查找失败，使用父级传递的组织名
  if (!corpName && parentCorpName) {
    corpName = parentCorpName;
  }

  // 如果还没有组织名，尝试从business_path提取第一段作为组织名
  if (!corpName && item.business_path) {
    const pathParts = item.business_path.split('/');
    if (pathParts.length > 0) {
      corpName = pathParts[0];
    }
  }

  return { corpId, corpName };
};

interface ConvertTreeDataParams {
  items: ApiTreeNode[];
  parentCorpId?: string;
  parentCorpName?: string;
  corpNameMap?: Map<string, string>;
}

// 转换API数据为树形结构
export const convertToTreeData = ({
  items,
  parentCorpId,
  parentCorpName,
  corpNameMap,
}: ConvertTreeDataParams): TreeNode[] =>
  items.map(item => {
    const isOrg = item.node_type === 'corp';
    const key = isOrg ? `org_${item.id}` : `dept_${item.id}`;

    const { corpId: currentCorpId, corpName: currentCorpName } =
      determineCorpInfo({
        item,
        parentCorpId,
        parentCorpName,
        corpNameMap,
      });

    const node: TreeNode = {
      key,
      label: item.name,
      title: item.name,
      value: key,
      isOrg,
      corpId: currentCorpId,
      corpName: currentCorpName,
      disabled: isOrg,
    };

    // 如果是部门节点，添加部门相关信息
    if (!isOrg) {
      node.deptId = item.dept_id || item.id;
      node.deptName = item.name;
    }

    // 递归处理子节点
    if (item.children && item.children.length > 0) {
      node.children = convertToTreeData({
        items: item.children,
        parentCorpId: currentCorpId,
        parentCorpName: currentCorpName,
        corpNameMap,
      });
    }

    return node;
  });

// 获取所有节点的key
export const getAllKeys = (nodes: TreeNode[]): string[] => {
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

// 处理组织树数据
export const processOrgTreeData = (
  data: ApiTreeNode[],
): { treeData: TreeNode[]; expandedKeys: string[] } => {
  const corpNameMap = buildCorpNameMap(data);
  const treeNodes = convertToTreeData({
    items: data,
    corpNameMap,
  });
  const expandedKeys = getAllKeys(treeNodes);

  return { treeData: treeNodes, expandedKeys };
};
