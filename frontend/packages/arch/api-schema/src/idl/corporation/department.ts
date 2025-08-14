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
import * as common from './common';
export { common };
export interface DepartmentData {
  id: string,
  corp_id: string,
  parent_id?: string,
  name: string,
  code?: string,
  level: number,
  full_path?: string,
  leader_id?: string,
  sort: number,
  status: common.DepartmentStatus,
  out_department_id?: string,
  department_source?: common.DataSource,
  creator_id: string,
  created_at: string,
  updated_at: string,
  deleted_at?: string,
}
export interface CreateDepartmentRequest {
  name: string,
  corp_id: string,
  parent_id?: string,
  code?: string,
  leader_id?: string,
  sort?: number,
  out_department_id?: string,
  department_source?: common.DataSource,
}
export interface CreateDepartmentResponse {
  code: number,
  msg: string,
  data?: DepartmentData,
}
export interface UpdateDepartmentRequest {
  id: string,
  name?: string,
  parent_id?: string,
  code?: string,
  leader_id?: string,
  sort?: number,
  status?: common.DepartmentStatus,
  out_department_id?: string,
  department_source?: common.DataSource,
}
export interface UpdateDepartmentResponse {
  code: number,
  msg: string,
}
export interface DeleteDepartmentRequest {
  id: string
}
export interface DeleteDepartmentResponse {
  code: number,
  msg: string,
}
export interface GetDepartmentRequest {
  id: string
}
export interface GetDepartmentResponse {
  code: number,
  msg: string,
  data?: DepartmentData,
}
export interface ListDepartmentRequest {
  corp_id: string,
  parent_id?: string,
  keyword?: string,
  status?: common.DepartmentStatus,
  page?: number,
  page_size?: number,
}
export interface ListDepartmentResponse {
  code: number,
  msg: string,
  data: DepartmentData[],
  total: string,
}
export interface DepartmentId {
  id: string,
  sort: number,
}
export interface SortDepartmentRequest {
  parent_id: string,
  department_ids: DepartmentId[],
}
export interface SortDepartmentResponse {
  code: number,
  msg: string,
}
/** 部门树节点 */
export interface DepartmentTreeNode {
  id: string,
  corp_id: string,
  parent_id?: string,
  name: string,
  code?: string,
  level: number,
  full_path?: string,
  leader_id?: string,
  sort: number,
  status: common.DepartmentStatus,
  employee_count: number,
  children: DepartmentTreeNode[],
  has_children: boolean,
  is_expanded: boolean,
}
/** 获取部门树请求 */
export interface GetDepartmentTreeRequest {
  corp_id: string,
  parent_id?: string,
  /** 展开深度，0表示全部展开 */
  depth?: number,
  include_employee_count?: boolean,
  status?: common.DepartmentStatus,
}
/** 获取部门树响应 */
export interface GetDepartmentTreeResponse {
  code: number,
  msg: string,
  data: DepartmentTreeNode[],
}