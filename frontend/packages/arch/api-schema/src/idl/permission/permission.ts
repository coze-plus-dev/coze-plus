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

import * as permission_common from './permission_common';
export { permission_common };
import * as base from './../base';
export { base };
export interface RoleData {
  id?: string,
  role_code?: string,
  role_name?: string,
  super_admin?: number,
  space_role_type?: number,
  is_builtin?: number,
  is_disabled?: number,
  description?: string,
  permissions?: permission_common.PermissionTemplateGroup[],
  created_by?: string,
  created_at?: string,
  updated_at?: string,
}
export interface PermissionTemplateData {
  id?: string,
  template_code?: string,
  template_name?: string,
  domain?: string,
  resource?: string,
  resource_name?: string,
  action?: string,
  action_name?: string,
  description?: string,
  is_default?: number,
  sort_order?: number,
  is_active?: number,
  created_at?: string,
  updated_at?: string,
}
/** Role management */
export interface CreateRoleRequest {
  role_code: string,
  role_name: string,
  description?: string,
}
export interface CreateRoleResponse {
  code: number,
  msg: string,
}
export interface UpdateRoleRequest {
  id: string,
  role_name?: string,
  description?: string,
  is_disabled?: number,
  permissions?: permission_common.PermissionTemplateGroup[],
}
export interface UpdateRoleResponse {
  code: number,
  msg: string,
}
export interface DeleteRoleRequest {
  id: string
}
export interface DeleteRoleResponse {
  code: number,
  msg: string,
}
export interface GetRoleRequest {
  id: string
}
export interface GetRoleResponse {
  data: RoleData,
  code: number,
  msg: string,
}
export interface ListRolesRequest {
  role_type?: number,
  is_builtin?: number,
  is_disabled?: number,
  keyword?: string,
  page?: number,
  page_size?: number,
}
export interface ListRolesResponseData {
  roles: RoleData[],
  total?: string,
  page?: number,
  page_size?: number,
}
export interface ListRolesResponse {
  data: ListRolesResponseData,
  code: number,
  msg: string,
}
/** Permission template management */
export interface ListPermissionTemplatesRequest {
  domain?: string,
  resource?: string,
  is_active?: number,
  keyword?: string,
}
export interface ListPermissionTemplatesResponse {
  data: permission_common.PermissionTemplateGroup[],
  code: number,
  msg: string,
}