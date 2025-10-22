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

import { type FC, useEffect } from 'react';

import { Spin } from '@coze-arch/coze-design';

import type { UserData } from '../../types';
import { useUserRoleDetail } from './hooks/use-user-role-detail';
import { UserRolePanelContent } from './components/user-role-panel-content';

import styles from './index.module.less';

interface UserRoleDetailPanelProps {
  visible: boolean;
  user?: UserData | null;
  onClose: () => void;
}

export const UserRoleDetailPanel: FC<UserRoleDetailPanelProps> = ({
  visible,
  user,
  onClose,
}) => {
  const {
    data: userRoles,
    loading,
    error,
    refresh,
  } = useUserRoleDetail(visible, user?.user_id);

  // 管理body class用于遮罩层，并处理下拉菜单隐藏
  useEffect(() => {
    if (visible) {
      document.body.classList.add('user-role-detail-panel-open');
      
      // 通过触发点击事件来关闭所有打开的下拉菜单
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
      });
      
      // 点击body来关闭下拉菜单
      setTimeout(() => {
        document.body.dispatchEvent(clickEvent);
      }, 0);
      
    } else {
      document.body.classList.remove('user-role-detail-panel-open');
    }

    return () => {
      document.body.classList.remove('user-role-detail-panel-open');
    };
  }, [visible]);

  // 早期返回
  if (!visible || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className={`${styles.panel} ${visible ? styles.visible : ''}`}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <UserRolePanelContent
      visible={visible}
      user={user}
      userRoles={userRoles || []}
      error={error}
      onClose={onClose}
      onRefresh={refresh}
    />
  );
};