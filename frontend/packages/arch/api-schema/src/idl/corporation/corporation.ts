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
export interface CorporationData {
  id: string,
  parent_id?: string,
  name: string,
  corp_type: common.CorporationType,
  sort: number,
  out_corp_id?: string,
  corp_source?: common.DataSource,
  creator_id: string,
  created_at: string,
  updated_at: string,
  deleted_at?: string,
}
export interface CreateCorpRequest {
  name: string,
  corp_type?: common.CorporationType,
  parent_id?: string,
  sort?: number,
  out_corp_id?: string,
  corp_source?: common.DataSource,
}
export interface CreateCorpResponse {
  code: number,
  msg: string,
  data?: CorporationData,
}
export interface UpdateCorpRequest {
  id: string,
  name?: string,
  parent_id?: string,
  corp_type?: common.CorporationType,
  sort?: number,
  out_corp_id?: string,
  corp_source?: common.DataSource,
}
export interface UpdateCorpResponse {
  code: number,
  msg: string,
}
export interface DeleteCorpRequest {
  id: string
}
export interface DeleteCorpResponse {
  code: number,
  msg: string,
}
export interface GetCorpRequest {
  id: string
}
export interface GetCorpResponse {
  code: number,
  msg: string,
  data?: CorporationData,
}
export interface ListCorpsRequest {
  keyword?: string,
  parent_id?: string,
  corp_type?: common.CorporationType,
  page?: number,
  page_size?: number,
}
export interface ListCorpsResponse {
  code: number,
  msg: string,
  data: CorporationData[],
  total: string,
}
/** 企业树节点（包含部门） */
export interface CorporationTreeNode {
  id: string,
  /** 树状结构关系 - 前端展示用的父节点ID（主要使用） */
  parent_id?: string,
  /** 业务层级关系 - 组织的上级组织，部门的上级部门 */
  business_parent_id?: string,
  name: string,
  corp_type: common.CorporationType,
  sort: number,
  /** "corp" or "dept" */
  node_type: string,
  children: CorporationTreeNode[],
  has_children: boolean,
  is_expanded: boolean,
  employee_count: number,
  /**
   * 部门专用字段
   * 部门所属的组织ID
  */
  corp_id?: string,
  /** 部门的实际ID */
  dept_id?: string,
  /** 部门层级 */
  level?: number,
  /**
   * 路径信息 - 便于理解层级关系
   * 业务路径: "集团A/公司B/部门C"
  */
  business_path?: string,
  /** 树状路径: "集团A/公司B/部门C" */
  tree_path?: string,
}
/** 获取组织架构树请求 */
export interface GetOrganizationTreeRequest {
  /** 如果不传，返回所有企业的树 */
  corp_id?: string,
  /** 是否包含部门 */
  include_departments?: boolean,
  /** 展开深度，0表示全部展开 */
  depth?: number,
  /** 是否包含员工数量统计 */
  include_employee_count?: boolean,
}
/** 获取组织架构树响应 */
export interface GetOrganizationTreeResponse {
  code: number,
  msg: string,
  data: CorporationTreeNode[],
}