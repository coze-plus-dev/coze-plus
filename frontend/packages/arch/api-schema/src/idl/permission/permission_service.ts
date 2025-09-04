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

import * as permission from './permission';
export { permission };
import * as base from './../base';
export { base };
import { createAPI } from './../../api/config';
export const CreateRole = /*#__PURE__*/createAPI<permission.CreateRoleRequest, permission.CreateRoleResponse>({
  "url": "/api/permission_api/role/create",
  "method": "POST",
  "name": "CreateRole",
  "reqType": "permission.CreateRoleRequest",
  "reqMapping": {
    "body": ["role_code", "role_name", "description"]
  },
  "resType": "permission.CreateRoleResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const UpdateRole = /*#__PURE__*/createAPI<permission.UpdateRoleRequest, permission.UpdateRoleResponse>({
  "url": "/api/permission_api/role/update",
  "method": "POST",
  "name": "UpdateRole",
  "reqType": "permission.UpdateRoleRequest",
  "reqMapping": {
    "body": ["id", "role_name", "description", "is_disabled", "permissions"]
  },
  "resType": "permission.UpdateRoleResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const DeleteRole = /*#__PURE__*/createAPI<permission.DeleteRoleRequest, permission.DeleteRoleResponse>({
  "url": "/api/permission_api/role/delete",
  "method": "POST",
  "name": "DeleteRole",
  "reqType": "permission.DeleteRoleRequest",
  "reqMapping": {
    "body": ["id"]
  },
  "resType": "permission.DeleteRoleResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const GetRole = /*#__PURE__*/createAPI<permission.GetRoleRequest, permission.GetRoleResponse>({
  "url": "/api/permission_api/role/get",
  "method": "GET",
  "name": "GetRole",
  "reqType": "permission.GetRoleRequest",
  "reqMapping": {
    "body": ["id"]
  },
  "resType": "permission.GetRoleResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const ListRoles = /*#__PURE__*/createAPI<permission.ListRolesRequest, permission.ListRolesResponse>({
  "url": "/api/permission_api/role/list",
  "method": "POST",
  "name": "ListRoles",
  "reqType": "permission.ListRolesRequest",
  "reqMapping": {
    "body": ["role_domain", "is_builtin", "is_disabled", "keyword", "page", "page_size"]
  },
  "resType": "permission.ListRolesResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const ListPermissionTemplates = /*#__PURE__*/createAPI<permission.ListPermissionTemplatesRequest, permission.ListPermissionTemplatesResponse>({
  "url": "/api/permission_api/template/list",
  "method": "POST",
  "name": "ListPermissionTemplates",
  "reqType": "permission.ListPermissionTemplatesRequest",
  "reqMapping": {
    "body": ["domain", "resource", "is_active", "keyword"]
  },
  "resType": "permission.ListPermissionTemplatesResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const ListUsers = /*#__PURE__*/createAPI<permission.ListUsersRequest, permission.ListUsersResponse>({
  "url": "/api/permission_api/user/list",
  "method": "POST",
  "name": "ListUsers",
  "reqType": "permission.ListUsersRequest",
  "reqMapping": {
    "body": ["keyword", "is_disabled", "page", "limit"]
  },
  "resType": "permission.ListUsersResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const UpdateUserStatus = /*#__PURE__*/createAPI<permission.UpdateUserStatusRequest, permission.UpdateUserStatusResponse>({
  "url": "/api/permission_api/user/status/update",
  "method": "POST",
  "name": "UpdateUserStatus",
  "reqType": "permission.UpdateUserStatusRequest",
  "reqMapping": {
    "body": ["user_id", "is_disabled"]
  },
  "resType": "permission.UpdateUserStatusResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const AssignUserMultipleRoles = /*#__PURE__*/createAPI<permission.AssignUserMultipleRolesRequest, permission.AssignUserMultipleRolesResponse>({
  "url": "/api/permission_api/user/assign_roles",
  "method": "POST",
  "name": "AssignUserMultipleRoles",
  "reqType": "permission.AssignUserMultipleRolesRequest",
  "reqMapping": {
    "body": ["user_id", "role_ids"]
  },
  "resType": "permission.AssignUserMultipleRolesResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const UnassignUserRoles = /*#__PURE__*/createAPI<permission.UnassignUserRolesRequest, permission.UnassignUserRolesResponse>({
  "url": "/api/permission_api/user/unassign_roles",
  "method": "POST",
  "name": "UnassignUserRoles",
  "reqType": "permission.UnassignUserRolesRequest",
  "reqMapping": {
    "body": ["user_id", "role_ids"]
  },
  "resType": "permission.UnassignUserRolesResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const GetUserRoles = /*#__PURE__*/createAPI<permission.GetUserRolesRequest, permission.GetUserRolesResponse>({
  "url": "/api/permission_api/user/roles",
  "method": "GET",
  "name": "GetUserRoles",
  "reqType": "permission.GetUserRolesRequest",
  "reqMapping": {
    "body": ["user_id"]
  },
  "resType": "permission.GetUserRolesResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});
export const ResetUserPassword = /*#__PURE__*/createAPI<permission.ResetUserPasswordRequest, permission.ResetUserPasswordResponse>({
  "url": "/api/permission_api/user/reset_password",
  "method": "POST",
  "name": "ResetUserPassword",
  "reqType": "permission.ResetUserPasswordRequest",
  "reqMapping": {
    "body": ["email", "new_password"]
  },
  "resType": "permission.ResetUserPasswordResponse",
  "schemaRoot": "api://schemas/idl_permission_permission_service",
  "service": "permission"
});