namespace go corporation.department

include "common.thrift"
include "../base.thrift"

struct DepartmentData {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: i64 corp_id (api.body = "corp_id", api.js_conv="true")
    3: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    4: string name (api.body = "name")
    5: optional string code (api.body = "code")
    6: i32 level (api.body = "level")
    7: optional string full_path (api.body = "full_path")
    8: optional i64 leader_id (api.body = "leader_id", api.js_conv="true")
    9: i32 sort (api.body = "sort")
    10: common.DepartmentStatus status (api.body = "status")
    11: optional string out_department_id (api.body = "out_department_id")
    12: optional common.DataSource department_source (api.body = "department_source")
    13: i64 creator_id (api.body = "creator_id", api.js_conv="true")
    14: i64 created_at (api.body = "created_at", api.js_conv="true")
    15: i64 updated_at (api.body = "updated_at", api.js_conv="true")
    16: optional i64 deleted_at (api.body = "deleted_at", api.js_conv="true")
}

struct CreateDepartmentRequest {
    1: required string name (api.body = "name")
    2: required i64 corp_id (api.body = "corp_id", api.js_conv="true")
    3: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    4: optional string code (api.body = "code")
    5: optional i64 leader_id (api.body = "leader_id", api.js_conv="true")
    6: optional i32 sort (api.body = "sort")
    7: optional string out_department_id (api.body = "out_department_id")
    8: optional common.DataSource department_source (api.body = "department_source")
    255: required base.Base base
}

struct CreateDepartmentResponse {
    1: optional DepartmentData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct UpdateDepartmentRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: optional string name (api.body = "name")
    3: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    4: optional string code (api.body = "code")
    5: optional i64 leader_id (api.body = "leader_id", api.js_conv="true")
    6: optional i32 sort (api.body = "sort")
    7: optional common.DepartmentStatus status (api.body = "status")
    8: optional string out_department_id (api.body = "out_department_id")
    9: optional common.DataSource department_source (api.body = "department_source")
    255: required base.Base base
}

struct UpdateDepartmentResponse {
    255: required base.BaseResp base_resp
}

struct DeleteDepartmentRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct DeleteDepartmentResponse {
    255: required base.BaseResp base_resp
}

struct GetDepartmentRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct GetDepartmentResponse {
    1: optional DepartmentData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct ListDepartmentRequest {
    1: required i64 corp_id (api.body = "corp_id", api.js_conv="true")
    2: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    3: optional string keyword (api.body = "keyword")
    4: optional common.DepartmentStatus status (api.body = "status")
    5: optional i32 page (api.body = "page")
    6: optional i32 page_size (api.body = "page_size")
    255: required base.Base base
}

struct ListDepartmentResponse {
    1: list<DepartmentData> data (api.body = "data")
    2: i64 total (api.body = "total", api.js_conv="true")
    255: required base.BaseResp base_resp
}

struct DepartmentId {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: i32 sort (api.body = "sort")
}

struct SortDepartmentRequest {
    1: required i64 parent_id (api.body = "parent_id", api.js_conv="true")
    2: required list<DepartmentId> department_ids (api.body = "department_ids")
    255: required base.Base base
}

struct SortDepartmentResponse {
    255: required base.BaseResp base_resp
}

