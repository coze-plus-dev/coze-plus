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

import * as employee from './employee';
export { employee };
import { createAPI } from './../../api/config';
export const CreateEmployee = /*#__PURE__*/createAPI<employee.CreateEmployeeRequest, employee.CreateEmployeeResponse>({
  "url": "/api/v1/corporation/employee/create",
  "method": "POST",
  "name": "CreateEmployee",
  "reqType": "employee.CreateEmployeeRequest",
  "reqMapping": {
    "body": ["name", "department_ids", "employee_no", "en_name", "nickname", "avatar", "email", "mobile", "out_employee_id", "employee_source", "create_account", "password"]
  },
  "resType": "employee.CreateEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const GetEmployee = /*#__PURE__*/createAPI<employee.GetEmployeeRequest, employee.GetEmployeeResponse>({
  "url": "/api/v1/corporation/employee/:id",
  "method": "GET",
  "name": "GetEmployee",
  "reqType": "employee.GetEmployeeRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "employee.GetEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const UpdateEmployee = /*#__PURE__*/createAPI<employee.UpdateEmployeeRequest, employee.UpdateEmployeeResponse>({
  "url": "/api/v1/corporation/employee/:id",
  "method": "PUT",
  "name": "UpdateEmployee",
  "reqType": "employee.UpdateEmployeeRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["name", "employee_no", "en_name", "nickname", "avatar", "email", "mobile", "status", "out_employee_id", "employee_source", "departments"]
  },
  "resType": "employee.UpdateEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const DeleteEmployee = /*#__PURE__*/createAPI<employee.DeleteEmployeeRequest, employee.DeleteEmployeeResponse>({
  "url": "/api/v1/corporation/employee/:id",
  "method": "DELETE",
  "name": "DeleteEmployee",
  "reqType": "employee.DeleteEmployeeRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "employee.DeleteEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const ListEmployees = /*#__PURE__*/createAPI<employee.ListEmployeeRequest, employee.ListEmployeeResponse>({
  "url": "/api/v1/corporation/employee/list",
  "method": "POST",
  "name": "ListEmployees",
  "reqType": "employee.ListEmployeeRequest",
  "reqMapping": {
    "body": ["corp_id", "department_id", "keyword", "status", "page", "page_size"]
  },
  "resType": "employee.ListEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const ChangeEmployeeDepartment = /*#__PURE__*/createAPI<employee.ChangeEmployeeDepartmentRequest, employee.ChangeEmployeeDepartmentResponse>({
  "url": "/api/v1/corporation/employee/:id/department",
  "method": "PUT",
  "name": "ChangeEmployeeDepartment",
  "reqType": "employee.ChangeEmployeeDepartmentRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["departments"]
  },
  "resType": "employee.ChangeEmployeeDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const ResignEmployee = /*#__PURE__*/createAPI<employee.ResignEmployeeRequest, employee.ResignEmployeeResponse>({
  "url": "/api/v1/corporation/employee/:id/resign",
  "method": "PUT",
  "name": "ResignEmployee",
  "reqType": "employee.ResignEmployeeRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["reason"]
  },
  "resType": "employee.ResignEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});
export const RestoreEmployee = /*#__PURE__*/createAPI<employee.RestoreEmployeeRequest, employee.RestoreEmployeeResponse>({
  "url": "/api/v1/corporation/employee/:id/restore",
  "method": "PUT",
  "name": "RestoreEmployee",
  "reqType": "employee.RestoreEmployeeRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["departments"]
  },
  "resType": "employee.RestoreEmployeeResponse",
  "schemaRoot": "api://schemas/idl_corporation_employee_service",
  "service": "employee"
});