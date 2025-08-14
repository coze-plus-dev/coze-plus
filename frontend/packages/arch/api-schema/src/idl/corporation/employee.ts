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
export interface EmployeeData {
  id: string,
  employee_no?: string,
  name: string,
  en_name?: string,
  nickname?: string,
  avatar?: string,
  email?: string,
  mobile: string,
  status: common.EmployeeStatus,
  out_employee_id?: string,
  employee_source?: common.DataSource,
  /** 员工所属部门信息列表（包含部门名称） */
  departments?: EmployeeDepartmentInfo[],
}
export interface EmployeeDepartmentInfo {
  department_id: string,
  /** 部门名称 */
  department_name: string,
  /** 部门所属组织ID */
  corp_id: string,
  /** 组织名称 */
  corp_name: string,
  /** 职位 */
  job_title?: string,
  /** 是否主部门 */
  is_primary?: boolean,
  /** 部门路径，例如："集团A/公司B/部门C" */
  department_path?: string,
}
export interface CreateEmployeeRequest {
  name: string,
  department_ids: EmployeeDepartmentInfo[],
  employee_no?: string,
  en_name?: string,
  nickname?: string,
  avatar?: string,
  email?: string,
  mobile: string,
  out_employee_id?: string,
  employee_source?: common.DataSource,
}
export interface CreateEmployeeResponse {
  code: number,
  msg: string,
  data?: EmployeeData,
}
export interface UpdateEmployeeRequest {
  id: string,
  name?: string,
  employee_no?: string,
  en_name?: string,
  nickname?: string,
  avatar?: string,
  email?: string,
  mobile?: string,
  status?: common.EmployeeStatus,
  out_employee_id?: string,
  employee_source?: common.DataSource,
  /** 员工所属部门信息列表（包含部门名称） */
  departments?: EmployeeDepartmentInfo[],
}
export interface UpdateEmployeeResponse {
  code: number,
  msg: string,
}
export interface DeleteEmployeeRequest {
  id: string
}
export interface DeleteEmployeeResponse {
  code: number,
  msg: string,
}
export interface GetEmployeeRequest {
  id: string
}
export interface GetEmployeeResponse {
  code: number,
  msg: string,
  data?: EmployeeData,
}
export interface ListEmployeeRequest {
  corp_id: string,
  department_id?: string,
  /** 支持姓名和手机号模糊查询 */
  keyword?: string,
  status?: common.EmployeeStatus,
  page?: number,
  page_size?: number,
}
export interface ListEmployeeResponse {
  code: number,
  msg: string,
  data: EmployeeData[],
  total: string,
}
export interface ChangeEmployeeDepartmentRequest {
  /** 员工ID */
  id: string,
  /** 新的部门列表 */
  departments: EmployeeDepartmentInfo[],
}
export interface ChangeEmployeeDepartmentResponse {
  code: number,
  msg: string,
  data?: EmployeeData,
}
export interface ResignEmployeeRequest {
  /** 员工ID */
  id: string,
  /** 离职原因 */
  reason?: string,
}
export interface ResignEmployeeResponse {
  code: number,
  msg: string,
  data?: EmployeeData,
}
export interface RestoreEmployeeRequest {
  /** 员工ID */
  id: string,
  /** 恢复后的部门列表 */
  departments: EmployeeDepartmentInfo[],
}
export interface RestoreEmployeeResponse {
  code: number,
  msg: string,
  data?: EmployeeData,
}