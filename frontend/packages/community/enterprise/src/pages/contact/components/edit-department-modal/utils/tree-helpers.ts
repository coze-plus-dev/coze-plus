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

import type { TreeNode } from '@/hooks/use-organization-tree';

export interface TreeSelectItem {
  label: string;
  value: string;
  key: string;
  disabled?: boolean;
  children?: TreeSelectItem[];
}

// Convert tree data for TreeSelect component, excluding current department and its children
export const convertTreeDataForSelect = (
  nodes: TreeNode[],
  excludeId?: string,
): TreeSelectItem[] =>
  nodes
    .filter(node => node.key !== excludeId)
    .map(node => ({
      label: node.title,
      value: node.key,
      key: node.key,
      children: node.children
        ? convertTreeDataForSelect(node.children, excludeId)
        : undefined,
    }));

// Find node helper
export const findNode = (nodes: TreeNode[], targetKey: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.key === targetKey) {
      return node;
    }
    if (node.children) {
      const found = findNode(node.children, targetKey);
      if (found) {
        return found;
      }
    }
  }
  return null;
};