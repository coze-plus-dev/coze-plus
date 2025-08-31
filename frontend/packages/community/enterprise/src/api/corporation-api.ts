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

import { corporation, department, employee } from '@coze-studio/api-schema';

/**
 * 企业组织管理API封装
 * 基于自动生成的API客户端，提供类型安全的企业管理接口
 */
export class CorporationApiService {
  /**
   * 创建企业
   */
  async createCorporation(params: {
    name: string;
    corp_type?: corporation.corporation.common.CorporationType;
    parent_id?: string;
    sort?: number;
  }) {
    const response = await corporation.CreateCorporation({
      name: params.name,
      corp_type: params.corp_type,
      parent_id: params.parent_id,
      sort: params.sort,
    });
    return response.data;
  }

  /**
   * 获取企业信息
   */
  async getCorporation(id: string) {
    const response = await corporation.GetCorporation({ id });
    return response.data;
  }

  /**
   * 更新企业信息
   */
  async updateCorporation(params: {
    id: string;
    name?: string;
    corp_type?: corporation.corporation.common.CorporationType;
    parent_id?: string;
    sort?: number;
  }) {
    await corporation.UpdateCorporation({
      id: params.id,
      name: params.name,
      corp_type: params.corp_type,
      parent_id: params.parent_id,
      sort: params.sort,
    });
  }

  /**
   * 删除企业
   */
  async deleteCorporation(id: string) {
    await corporation.DeleteCorporation({ id });
  }

  /**
   * 获取企业列表
   */
  async listCorporations(params?: {
    keyword?: string;
    parent_id?: string;
    corp_type?: corporation.corporation.common.CorporationType;
    page?: number;
    page_size?: number;
  }) {
    const response = await corporation.ListCorporations(params || {});
    return {
      data: response.data || [],
      total: parseInt(response.total || '0', 10),
    };
  }

  /**
   * 获取组织架构树
   */
  async getOrganizationTree(params?: {
    corp_id?: string;
    include_departments?: boolean;
    depth?: number;
    include_employee_count?: boolean;
  }) {
    const response = await corporation.GetOrganizationTree(params || {});
    return response.data || [];
  }
}

/**
 * 部门管理API封装
 */
export class DepartmentApiService {
  /**
   * 创建部门
   */
  async createDepartment(params: {
    name: string;
    corp_id: string;
    parent_id?: string;
    sort?: number;
  }) {
    const response = await department.CreateDepartment({
      name: params.name,
      corp_id: params.corp_id,
      parent_id: params.parent_id,
      sort: params.sort,
    });
    return response.data;
  }

  /**
   * 获取部门信息
   */
  async getDepartment(id: string) {
    const response = await department.GetDepartment({ id });
    return response.data;
  }

  /**
   * 获取部门列表
   */
  async listDepartments(params: {
    corp_id: string;
    parent_id?: string;
    keyword?: string;
    page?: number;
    page_size?: number;
  }) {
    const response = await department.ListDepartments(params);
    return {
      data: response.data || [],
      total: parseInt(response.total || '0', 10),
    };
  }

  /**
   * 获取部门树
   */
  async getDepartmentTree(params: {
    corp_id: string;
    parent_id?: string;
    depth?: number;
    include_employee_count?: boolean;
    status?: department.department.common.DepartmentStatus;
  }) {
    const response = await department.GetDepartmentTree(params);
    return response.data || [];
  }

  /**
   * 更新部门信息
   */
  async updateDepartment(params: {
    id: string;
    name?: string;
    parent_id?: string;
    sort?: number;
  }) {
    await department.UpdateDepartment({
      id: params.id,
      name: params.name,
      parent_id: params.parent_id,
      sort: params.sort,
    });
  }

  /**
   * 删除部门
   */
  async deleteDepartment(id: string) {
    await department.DeleteDepartment({ id });
  }

  /**
   * 排序部门
   */
  async sortDepartments(params: {
    parent_id: string;
    department_ids: { id: string; sort: number }[];
  }) {
    await department.SortDepartments(params);
  }
}

/**
 * 员工管理API封装
 */
export class EmployeeApiService {
  /**
   * 创建员工
   */
  async createEmployee(params: {
    name: string;
    department_ids: employee.employee.EmployeeDepartmentInfo[];
    mobile: string;
    employee_no?: string;
    en_name?: string;
    nickname?: string;
    avatar?: string;
    email?: string;
    out_employee_id?: string;
    employee_source?: employee.employee.common.DataSource;
  }) {
    const response = await employee.CreateEmployee({
      name: params.name,
      department_ids: params.department_ids,
      mobile: params.mobile,
      employee_no: params.employee_no,
      en_name: params.en_name,
      nickname: params.nickname,
      avatar: params.avatar,
      email: params.email,
      out_employee_id: params.out_employee_id,
      employee_source: params.employee_source,
    });
    return response.data;
  }

  /**
   * 获取员工信息
   */
  async getEmployee(id: string) {
    const response = await employee.GetEmployee({ id });
    return response.data;
  }

  /**
   * 更新员工信息
   */
  async updateEmployee(params: {
    id: string;
    name?: string;
    employee_no?: string;
    en_name?: string;
    nickname?: string;
    avatar?: string;
    email?: string;
    mobile?: string;
    status?: employee.employee.common.EmployeeStatus;
    out_employee_id?: string;
    employee_source?: employee.employee.common.DataSource;
    departments?: employee.employee.EmployeeDepartmentInfo[];
  }) {
    await employee.UpdateEmployee(params);
  }

  /**
   * 删除员工
   */
  async deleteEmployee(id: string) {
    await employee.DeleteEmployee({ id });
  }

  /**
   * 获取员工列表
   */
  async listEmployees(params: {
    corp_id: string;
    department_id?: string;
    keyword?: string;
    status?: employee.employee.common.EmployeeStatus;
    page?: number;
    page_size?: number;
  }) {
    const response = await employee.ListEmployees(params);
    return {
      data: response.data || [],
      total: parseInt(response.total || '0', 10),
    };
  }

  /**
   * 变更员工部门
   */
  async changeEmployeeDepartment(params: {
    id: string;
    departments: employee.employee.EmployeeDepartmentInfo[];
  }) {
    const response = await employee.ChangeEmployeeDepartment({
      id: params.id,
      departments: params.departments,
    });
    return response.data;
  }

  /**
   * 员工离职
   */
  async resignEmployee(params: { id: string; reason?: string }) {
    const response = await employee.ResignEmployee({
      id: params.id,
      reason: params.reason,
    });
    return response.data;
  }

  /**
   * 恢复员工在职
   */
  async restoreEmployee(params: {
    id: string;
    departments: employee.employee.EmployeeDepartmentInfo[];
  }) {
    const response = await employee.RestoreEmployee({
      id: params.id,
      departments: params.departments,
    });
    return response.data;
  }
}

// 导出单例实例
export const corporationApi = new CorporationApiService();
export const departmentApi = new DepartmentApiService();
export const employeeApi = new EmployeeApiService();

// 导出类型定义，方便组件使用
export type CorporationType = corporation.corporation.common.CorporationType;
export type DataSource = corporation.corporation.common.DataSource;
export type EmployeeStatus = employee.employee.common.EmployeeStatus;
export type DepartmentStatus = department.department.common.DepartmentStatus;
