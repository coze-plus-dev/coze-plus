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

interface OrgAPINode {
  id: string;
  name: string;
  node_type: string;
  corp_id?: string;
  dept_id?: string;
  business_path?: string;
  children?: unknown[];
}

export const useOrganizationTreeConverter = () => {
  const buildCorpNameMap = (items: OrgAPINode[]): Map<string, string> => {
    const map = new Map<string, string>();
    const traverse = (nodes: OrgAPINode[]) => {
      nodes.forEach(node => {
        if (node.node_type === 'corp') {
          map.set(node.id, node.name);
        }
        if (
          node.children &&
          Array.isArray(node.children) &&
          node.children.length > 0
        ) {
          traverse(node.children as OrgAPINode[]);
        }
      });
    };
    traverse(items);
    return map;
  };

  const convertToTreeData = (
    items: OrgAPINode[],
    options: {
      corpNameMap: Map<string, string>;
      parentCorpId?: string;
      parentCorpName?: string;
    },
  ): TreeNode[] =>
    items.map(item => {
      const { corpNameMap, parentCorpId, parentCorpName } = options;
      const isOrg = item.node_type === 'corp';
      const key = isOrg ? `org_${item.id}` : `dept_${item.id}`;

      let currentCorpId: string;
      let currentCorpName: string;

      if (isOrg) {
        currentCorpId = item.id;
        currentCorpName = item.name;
      } else {
        currentCorpId = item.corp_id || parentCorpId || '';
        if (currentCorpId) {
          currentCorpName = corpNameMap.get(currentCorpId) || '';
        } else {
          currentCorpName = '';
        }

        if (!currentCorpName && parentCorpName) {
          currentCorpName = parentCorpName;
        }

        if (!currentCorpName && item.business_path) {
          const pathParts = item.business_path.split('/');
          if (pathParts.length > 0) {
            currentCorpName = pathParts[0];
          }
        }
      }

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

      if (!isOrg) {
        node.deptId = item.dept_id || item.id;
        node.deptName = item.name;
      }

      if (
        item.children &&
        Array.isArray(item.children) &&
        item.children.length > 0
      ) {
        node.children = convertToTreeData(item.children as OrgAPINode[], {
          corpNameMap,
          parentCorpId: currentCorpId,
          parentCorpName: currentCorpName,
        });
      }

      return node;
    });

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

  const convertOrgDataToTreeNodes = (
    data: OrgAPINode[],
  ): {
    treeNodes: TreeNode[];
    expandedKeys: string[];
  } => {
    const corpNameMap = buildCorpNameMap(data);
    const treeNodes = convertToTreeData(data, { corpNameMap });
    const expandedKeys = getAllKeys(treeNodes);

    return { treeNodes, expandedKeys };
  };

  return {
    convertOrgDataToTreeNodes,
  };
};
