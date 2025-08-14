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

import * as department from './department';
export { department };
import { createAPI } from './../../api/config';
export const CreateDepartment = /*#__PURE__*/createAPI<department.CreateDepartmentRequest, department.CreateDepartmentResponse>({
  "url": "/api/v1/corporation/department/create",
  "method": "POST",
  "name": "CreateDepartment",
  "reqType": "department.CreateDepartmentRequest",
  "reqMapping": {
    "body": ["name", "corp_id", "parent_id", "code", "leader_id", "sort", "out_department_id", "department_source"]
  },
  "resType": "department.CreateDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});
export const GetDepartment = /*#__PURE__*/createAPI<department.GetDepartmentRequest, department.GetDepartmentResponse>({
  "url": "/api/v1/corporation/department/:id",
  "method": "GET",
  "name": "GetDepartment",
  "reqType": "department.GetDepartmentRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "department.GetDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});
export const UpdateDepartment = /*#__PURE__*/createAPI<department.UpdateDepartmentRequest, department.UpdateDepartmentResponse>({
  "url": "/api/v1/corporation/department/:id",
  "method": "PUT",
  "name": "UpdateDepartment",
  "reqType": "department.UpdateDepartmentRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["name", "parent_id", "code", "leader_id", "sort", "status", "out_department_id", "department_source"]
  },
  "resType": "department.UpdateDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});
export const DeleteDepartment = /*#__PURE__*/createAPI<department.DeleteDepartmentRequest, department.DeleteDepartmentResponse>({
  "url": "/api/v1/corporation/department/:id",
  "method": "DELETE",
  "name": "DeleteDepartment",
  "reqType": "department.DeleteDepartmentRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "department.DeleteDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});
export const ListDepartments = /*#__PURE__*/createAPI<department.ListDepartmentRequest, department.ListDepartmentResponse>({
  "url": "/api/v1/corporation/department/list",
  "method": "POST",
  "name": "ListDepartments",
  "reqType": "department.ListDepartmentRequest",
  "reqMapping": {
    "body": ["corp_id", "parent_id", "keyword", "status", "page", "page_size"]
  },
  "resType": "department.ListDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});
export const SortDepartments = /*#__PURE__*/createAPI<department.SortDepartmentRequest, department.SortDepartmentResponse>({
  "url": "/api/v1/corporation/department/sort",
  "method": "POST",
  "name": "SortDepartments",
  "reqType": "department.SortDepartmentRequest",
  "reqMapping": {
    "body": ["parent_id", "department_ids"]
  },
  "resType": "department.SortDepartmentResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});
export const GetDepartmentTree = /*#__PURE__*/createAPI<department.GetDepartmentTreeRequest, department.GetDepartmentTreeResponse>({
  "url": "/api/v1/corporation/department/tree",
  "method": "POST",
  "name": "GetDepartmentTree",
  "reqType": "department.GetDepartmentTreeRequest",
  "reqMapping": {
    "body": ["corp_id", "parent_id", "depth", "include_employee_count", "status"]
  },
  "resType": "department.GetDepartmentTreeResponse",
  "schemaRoot": "api://schemas/idl_corporation_department_service",
  "service": "department"
});