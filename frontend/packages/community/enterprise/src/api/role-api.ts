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

import {
  CreateRole,
  UpdateRole,
  DeleteRole,
  GetRole,
  ListRoles,
  ListPermissionTemplates,
  type permission,
} from '@coze-studio/api-schema/permission';

// 导出API生成的类型
export type RoleData = permission.RoleData;
export type CreateRoleRequest = permission.CreateRoleRequest;
export type UpdateRoleRequest = permission.UpdateRoleRequest;
export type DeleteRoleRequest = permission.DeleteRoleRequest;
export type GetRoleRequest = permission.GetRoleRequest;
export type ListRolesRequest = permission.ListRolesRequest;
export type ListRolesResponse = permission.ListRolesResponse;
export type PermissionTemplateGroup =
  permission.permission_common.PermissionTemplateGroup;
export type PermissionResourceGroup =
  permission.permission_common.PermissionResourceGroup;
export type PermissionTemplateData =
  permission.permission_common.PermissionTemplateData;
// 为了兼容现有代码，添加别名
export type PermissionTemplate = PermissionTemplateGroup;

export const roleApi = {
  // 获取角色列表
  async listRoles(params: ListRolesRequest = {}): Promise<ListRolesResponse> {
    const response = await ListRoles({
      page: params.page || 1,
      page_size: params.page_size || 10, // eslint-disable-line @typescript-eslint/no-magic-numbers
      ...params,
    });
    return response;
  },

  // 创建角色
  async createRole(request: CreateRoleRequest): Promise<void> {
    await CreateRole(request);
  },

  // 更新角色
  async updateRole(request: UpdateRoleRequest): Promise<void> {
    await UpdateRole(request);
  },

  // 删除角色
  async deleteRole(roleId: string): Promise<void> {
    await DeleteRole({ id: roleId });
  },

  // 获取角色详情
  async getRole(roleId: string): Promise<RoleData | undefined> {
    const response = await GetRole({ id: roleId });
    return response.data;
  },

  // 获取权限模板列表
  async listPermissionTemplates(
    domain?: string,
  ): Promise<PermissionTemplateGroup[]> {
    const response = await ListPermissionTemplates({ domain });
    return response.data || [];
  },
};