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

/**
 * API 类型测试文件
 * 用于验证企业管理API的类型定义是否正确
 */

import { corporation, department, employee } from '@coze-studio/api-schema';

// 测试企业API类型
export const testCorporationAPI = () => {
  // 测试创建企业的请求参数类型
  const createCorpRequest: corporation.corporation.CreateCorpRequest = {
    name: '测试企业',
    corp_type: corporation.corporation.common.CorporationType.COMPANY,
  };

  // 测试企业数据类型
  const corpData: corporation.corporation.CorporationData = {
    id: '1',
    name: '测试企业',
    corp_type: corporation.corporation.common.CorporationType.COMPANY,
    sort: 1,
    creator_id: 'user1',
    created_at: '2025-08-08T00:00:00Z',
    updated_at: '2025-08-08T00:00:00Z',
  };

  return { createCorpRequest, corpData };
};

// 测试部门API类型
export const testDepartmentAPI = () => {
  const createDeptRequest: department.department.CreateDepartmentRequest = {
    name: '技术部',
    corp_id: '1',
  };

  const deptData: department.department.DepartmentData = {
    id: '1',
    name: '技术部',
    corp_id: '1',
    sort: 1,
    status: department.department.common.DepartmentStatus.NORMAL,
    creator_id: 'user1',
    created_at: '2025-08-08T00:00:00Z',
    updated_at: '2025-08-08T00:00:00Z',
  };

  return { createDeptRequest, deptData };
};

// 测试员工API类型
export const testEmployeeAPI = () => {
  const createEmpRequest: employee.employee.CreateEmployeeRequest = {
    name: '张三',
    corp_id: '1',
    mobile: '13800138000',
  };

  const empData: employee.employee.EmployeeData = {
    id: '1',
    name: '张三',
    corp_id: '1',
    mobile: '13800138000',
    status: employee.employee.common.EmployeeStatus.EMPLOYED,
    creator_id: 'user1',
    created_at: '2025-08-08T00:00:00Z',
    updated_at: '2025-08-08T00:00:00Z',
  };

  return { createEmpRequest, empData };
};

// 测试API函数调用（仅类型检查，不实际执行）
export const testAPIFunctions = async () => {
  // 这些函数调用仅用于类型检查，不会实际执行
  if (false) {
    // 企业API
    const corpResult = await corporation.CreateCorporation({
      name: '测试企业',
      corp_type: corporation.corporation.common.CorporationType.COMPANY,
    });
    
    // 部门API
    const deptResult = await department.CreateDepartment({
      name: '技术部',
      corp_id: '1',
    });
    
    // 员工API
    const empResult = await employee.CreateEmployee({
      name: '张三',
      corp_id: '1',
      mobile: '13800138000',
    });

    // 避免未使用变量警告
    void corpResult;
    void deptResult; 
    void empResult;
  }
};