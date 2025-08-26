include "../base.thrift"
include "./permission_common.thrift"

namespace go permission.permission

struct RoleData {
    1: optional i64 id (api.body = "id", api.js_conv = "true"),
    2: optional string role_code (api.body = "role_code"),
    3: optional string role_name (api.body = "role_name"),
    4: optional i32 super_admin (api.body = "super_admin"),
    5: optional i32 space_role_type (api.body = "space_role_type"),
    6: optional i32 is_builtin (api.body = "is_builtin"),
    7: optional i32 is_disabled (api.body = "is_disabled"),
    8: optional string description (api.body = "description"),
    9: optional list<permission_common.PermissionTemplateGroup> permissions (api.body = "permissions"),
    10: optional i64 created_by (api.body = "created_by", api.js_conv = "true"),
    11: optional i64 created_at (api.body = "created_at", api.js_conv = "true"),
    12: optional i64 updated_at (api.body = "updated_at", api.js_conv = "true"),
}

struct PermissionTemplateData {
    1: optional i64 id (api.body = "id", api.js_conv = "true"),
    2: optional string template_code (api.body = "template_code"),
    3: optional string template_name (api.body = "template_name"),
    4: optional string domain (api.body = "domain"),
    5: optional string resource (api.body = "resource"),
    6: optional string resource_name (api.body = "resource_name"),
    7: optional string action (api.body = "action"),
    8: optional string action_name (api.body = "action_name"),
    9: optional string description (api.body = "description"),
    10: optional i32 is_default (api.body = "is_default"),
    11: optional i32 sort_order (api.body = "sort_order"),
    12: optional i32 is_active (api.body = "is_active"),
    13: optional i64 created_at (api.body = "created_at", api.js_conv = "true"),
    14: optional i64 updated_at (api.body = "updated_at", api.js_conv = "true"),
}


// Role management
struct CreateRoleRequest {
    1: required string role_code (api.body = "role_code"),
    2: required string role_name (api.body = "role_name"),
    3: optional string description (api.body = "description"),
    255: optional base.Base base,
}

struct CreateRoleResponse {
    1: required i32 code,
    2: required string msg,
}

struct UpdateRoleRequest {
    1: required i64 id (api.body = "id", api.js_conv = "true"),
    2: optional string role_name (api.body = "role_name"),
    3: optional string description (api.body = "description"),
    4: optional i32 is_disabled (api.body = "is_disabled"),
    5: optional list<permission_common.PermissionTemplateGroup> permissions (api.body = "permissions"),
    255: optional base.Base base,
}

struct UpdateRoleResponse {
    1: required i32 code,
    2: required string msg,
}

struct DeleteRoleRequest {
    1: required i64 id (api.body = "id", api.js_conv = "true"),
    255: optional base.Base base,
}

struct DeleteRoleResponse {
    1: required i32 code,
    2: required string msg,
}

struct GetRoleRequest {
    1: required i64 id (api.body = "id", api.js_conv = "true"),
    255: optional base.Base base,
}

struct GetRoleResponse {
    1: required RoleData data,
    2: required i32 code,
    3: required string msg,
}

struct ListRolesRequest {
    1: optional i32 role_type (api.body = "role_type"),
    2: optional i32 is_builtin (api.body = "is_builtin"),
    3: optional i32 is_disabled (api.body = "is_disabled"),
    4: optional string keyword (api.body = "keyword"),
    5: optional i32 page (api.body = "page"),
    6: optional i32 page_size (api.body = "page_size"),
    255: optional base.Base base,
}

struct ListRolesResponseData {
    1: required list<RoleData> roles,
    2: optional i64 total (api.js_conv = "true"),
    3: optional i32 page,
    4: optional i32 page_size,
}

struct ListRolesResponse {
    1: required ListRolesResponseData data,
    2: required i32 code,
    3: required string msg,
}


// Permission template management
struct ListPermissionTemplatesRequest {
    1: optional string domain (api.body = "domain"),
    2: optional string resource (api.body = "resource"),
    3: optional i32 is_active (api.body = "is_active"),
    4: optional string keyword (api.body = "keyword"),
    255: optional base.Base base,
}

struct ListPermissionTemplatesResponse {
    1: required list<permission_common.PermissionTemplateGroup> data,
    2: required i32 code,
    3: required string msg,
}


