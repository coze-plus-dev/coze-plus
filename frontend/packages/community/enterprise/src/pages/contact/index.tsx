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

import { type FC, useState, useRef, useEffect } from 'react';

import { type employee } from '@coze-studio/api-schema';

import { Toolbar } from './components/toolbar';
import { OrgTree, type OrgTreeRef } from './components/org-tree';
import { MemberTable, type MemberTableRef } from './components/member-table';
import { MemberDetailPanel } from './components/member-detail-panel';

import styles from './index.module.less';

interface SelectedNodeInfo {
  id: string;
  type: 'corp' | 'dept';
  corpId?: string; // 对于部门节点，存储所属的组织ID
  name?: string;
}

// 使用API schema中的EmployeeData类型
type EmployeeData = employee.employee.EmployeeData;

const ContactPage: FC = () => {
  const [selectedNode, setSelectedNode] = useState<SelectedNodeInfo>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>();
  const [memberDetailVisible, setMemberDetailVisible] =
    useState<boolean>(false);
  const orgTreeRef = useRef<OrgTreeRef>(null);
  const memberTableRef = useRef<MemberTableRef>(null);

  const handleSelectNode = (
    id: string,
    nodeType: 'corp' | 'dept',
    nodeInfo?: { corpId?: string; name?: string },
  ) => {
    const selectedNodeInfo: SelectedNodeInfo = {
      id,
      type: nodeType,
      name: nodeInfo?.name,
    };

    if (nodeType === 'dept') {
      // 对于部门节点，使用从树节点传递来的corpId
      selectedNodeInfo.corpId = nodeInfo?.corpId;
    } else {
      selectedNodeInfo.corpId = id; // 组织节点的corpId就是自己的id
    }

    setSelectedNode(selectedNodeInfo);
  };

  const handleRefresh = () => {
    // 刷新组织树
    orgTreeRef.current?.refresh();
    // 刷新员工列表
    memberTableRef.current?.refresh();
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
  };

  const handleShowMemberDetail = (employee: EmployeeData) => {
    setSelectedEmployeeId(employee.id);
    setMemberDetailVisible(true);
  };

  const handleCloseMemberDetail = () => {
    setMemberDetailVisible(false);
    setSelectedEmployeeId(undefined);
  };

  // 管理body class用于遮罩层
  useEffect(() => {
    if (memberDetailVisible) {
      document.body.classList.add('member-detail-panel-open');
    } else {
      document.body.classList.remove('member-detail-panel-open');
    }

    return () => {
      document.body.classList.remove('member-detail-panel-open');
    };
  }, [memberDetailVisible]);

  return (
    <div className={styles.contactLayout}>
      {!sidebarCollapsed && (
        <div className={styles.sider}>
          <OrgTree
            ref={orgTreeRef}
            onSelectNode={handleSelectNode}
            onCollapse={handleToggleSidebar}
          />
        </div>
      )}
      <div
        className={`${styles.content} ${sidebarCollapsed ? styles.contentExpanded : ''}`}
      >
        <Toolbar
          selectedNode={selectedNode}
          onRefresh={handleRefresh}
          showExpandButton={sidebarCollapsed}
          onExpand={handleToggleSidebar}
          onSearch={handleSearch}
        />
        <MemberTable
          ref={memberTableRef}
          selectedNode={selectedNode}
          searchKeyword={searchKeyword}
          onShowDetail={handleShowMemberDetail}
        />
      </div>

      <MemberDetailPanel
        visible={memberDetailVisible}
        employeeId={selectedEmployeeId}
        onClose={handleCloseMemberDetail}
        onRefresh={() => memberTableRef.current?.refresh()}
      />
    </div>
  );
};

export default ContactPage;
