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

import { type FC, useEffect, useRef } from 'react';

import { 
  Spin, 
  EmptyState, 
  Checkbox, 
  Tag,
} from '@coze-arch/coze-design';
import { IconCozEmpty } from '@coze-arch/coze-design/icons';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { RoleData } from '@/api/role-api';

import styles from './role-list-panel.module.less';

const SCROLL_THRESHOLD_PX = 100;

// 检查角色是否有有效权限
const hasValidPermissions = (role: RoleData): boolean => !!(role.permissions && role.permissions.length > 0);

interface RoleListPanelProps {
  roles: RoleData[];
  loading: boolean;
  selectedRoles: Set<string>;
  selectedRoleForPreview: RoleData | null;
  hasMore: boolean;
  loadMore: () => void;
  onRoleSelect: (role: RoleData) => void;
  onRoleToggle: (role: RoleData, checked: boolean) => void;
}

export const RoleListPanel: FC<RoleListPanelProps> = ({
  roles,
  loading,
  selectedRoles,
  selectedRoleForPreview,
  hasMore,
  loadMore,
  onRoleSelect,
  onRoleToggle,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // 调试日志
  console.log('RoleListPanel received:', { 
    roles, 
    rolesLength: roles?.length, 
    loading, 
    selectedRoles 
  });

  // 监听滚动事件，实现自动加载更多
  useEffect(() => {
    const listElement = listRef.current;
    if (!listElement) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = listElement;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - SCROLL_THRESHOLD_PX;

      if (isNearBottom && hasMore && !loading) {
        loadMore();
      }
    };

    listElement.addEventListener('scroll', handleScroll);
    return () => {
      listElement.removeEventListener('scroll', handleScroll);
    };
  }, [hasMore, loading, loadMore]);

  // 初次加载时显示loading
  if (loading && roles.length === 0) {
    return (
      <div className={styles.roleListPanel}>
        <div className={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!loading && roles.length === 0) {
    return (
      <div className={styles.roleListPanel}>
        <div className={styles.emptyContainer}>
          <EmptyState
            icon={<IconCozEmpty className="w-[64px] h-[64px] coz-fg-dim" />}
            title={t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_EMPTY_ROLES)}
            description={t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_EMPTY_ROLES_DESC)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.roleListPanel}>
      <div className={styles.roleList} ref={listRef}>
        {roles.map((role) => {
          const roleId = role.id?.toString();
          if (!roleId) {
            return null; // 如果没有roleId，跳过这个角色
          }
          const isSelected = selectedRoles.has(roleId);
          const isPreviewSelected = selectedRoleForPreview?.id === role.id;
          const hasPermissions = hasValidPermissions(role);

          return (
            <div
              key={roleId}
              className={`${styles.roleItem} ${isPreviewSelected ? styles.previewSelected : ''} ${!hasPermissions ? styles.disabled : ''}`}
              onClick={() => onRoleSelect(role)}
            >
              <div className={styles.roleItemContent}>
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={styles.checkboxWrapper}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!hasPermissions}
                    onChange={(e) => hasPermissions && onRoleToggle(role, e.target.checked || false)}
                    className={styles.checkbox}
                  />
                </div>
                
                <div className={styles.roleInfo}>
                  <div className={styles.roleHeader}>
                    <span className={styles.roleName}>{role.role_name}</span>
                    <Tag
                      size="small"
                      color={role.is_builtin === 1 ? 'green' : 'grey'}
                    >
                      {role.is_builtin === 1
                        ? t(ENTERPRISE_I18N_KEYS.ROLE_BUILTIN_TAG)
                        : t(ENTERPRISE_I18N_KEYS.ROLE_CUSTOM_TAG)}
                    </Tag>
                  </div>
                  
                  <div className={styles.roleDescription}>
                    {role.description || t(ENTERPRISE_I18N_KEYS.ROLE_NO_DESCRIPTION)}
                    {!hasPermissions && (
                      <div className={styles.noPermissionWarning}>
                        {t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_NO_PERMISSIONS_WARNING)}
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.roleCode}>
                    {role.role_code}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* 加载更多指示器 */}
        {loading && roles.length > 0 && (
          <div className={styles.loadMoreContainer}>
            <Spin size="small" />
          </div>
        )}
        
        {/* 没有更多数据时的提示 */}
        {!hasMore && roles.length > 0 && (
          <div className={styles.noMoreContainer}>
            <span className={styles.noMoreText}>
              {t(ENTERPRISE_I18N_KEYS.ASSIGN_ROLE_MODAL_ALL_ROLES_LOADED)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};