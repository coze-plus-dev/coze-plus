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

import * as base from './../base';
export { base };
export enum PermissionDomain {
  GLOBAL = 1,
  SPACE = 2,
}
export enum RoleType {
  SUPER_ADMIN = 0,
  SPACE_ROLE = 1,
  CUSTOM_ROLE = 2,
}
export enum SpaceRoleType {
  OWNER = 1,
  ADMIN = 2,
  MEMBER = 3,
}
export enum CasbinPolicyType {
  POLICY = 1,
  GROUPING = 2,
}
export enum PermissionEffect {
  ALLOW = 1,
  DENY = 2,
}
export enum Status {
  DISABLED = 0,
  ENABLED = 1,
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
}
export interface PermissionResourceGroup {
  resource?: string,
  resource_name?: string,
  actions?: PermissionTemplateData[],
}
export interface PermissionTemplateGroup {
  domain?: string,
  domain_name?: string,
  resources?: PermissionResourceGroup[],
}