namespace go corporation.employee

include "common.thrift"
include "../base.thrift"

struct EmployeeData {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: i64 corp_id (api.body = "corp_id", api.js_conv="true")
    3: optional string employee_no (api.body = "employee_no")
    4: string name (api.body = "name")
    5: optional string en_name (api.body = "en_name")
    6: optional string nickname (api.body = "nickname")
    7: optional string avatar (api.body = "avatar")
    8: optional string email (api.body = "email")
    9: string mobile (api.body = "mobile")
    10: common.EmployeeStatus status (api.body = "status")
    11: optional string out_employee_id (api.body = "out_employee_id")
    12: optional common.DataSource employee_source (api.body = "employee_source")
    13: i64 creator_id (api.body = "creator_id", api.js_conv="true")
    14: i64 created_at (api.body = "created_at", api.js_conv="true")
    15: i64 updated_at (api.body = "updated_at", api.js_conv="true")
    16: optional i64 deleted_at (api.body = "deleted_at", api.js_conv="true")
}

struct EmployeeDepartmentData {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: i64 employee_id (api.body = "employee_id", api.js_conv="true")
    3: i64 department_id (api.body = "department_id", api.js_conv="true")
    4: optional string job_title (api.body = "job_title")
    5: common.EmployeeDepartmentStatus status (api.body = "status")
    6: i64 creator_id (api.body = "creator_id", api.js_conv="true")
    7: i64 created_at (api.body = "created_at", api.js_conv="true")
    8: i64 updated_at (api.body = "updated_at", api.js_conv="true")
    9: optional i64 deleted_at (api.body = "deleted_at", api.js_conv="true")
}

struct CreateEmployeeRequest {
    1: required string name (api.body = "name")
    2: required i64 corp_id (api.body = "corp_id", api.js_conv="true")
    3: optional string employee_no (api.body = "employee_no")
    4: optional string en_name (api.body = "en_name")
    5: optional string nickname (api.body = "nickname")
    6: optional string avatar (api.body = "avatar")
    7: optional string email (api.body = "email")
    8: required string mobile (api.body = "mobile")
    9: optional string out_employee_id (api.body = "out_employee_id")
    10: optional common.DataSource employee_source (api.body = "employee_source")
    255: required base.Base base
}

struct CreateEmployeeResponse {
    1: optional EmployeeData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct UpdateEmployeeRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: optional string name (api.body = "name")
    3: optional string employee_no (api.body = "employee_no")
    4: optional string en_name (api.body = "en_name")
    5: optional string nickname (api.body = "nickname")
    6: optional string avatar (api.body = "avatar")
    7: optional string email (api.body = "email")
    8: optional string mobile (api.body = "mobile")
    9: optional common.EmployeeStatus status (api.body = "status")
    10: optional string out_employee_id (api.body = "out_employee_id")
    11: optional common.DataSource employee_source (api.body = "employee_source")
    255: required base.Base base
}

struct UpdateEmployeeResponse {
    255: required base.BaseResp base_resp
}

struct DeleteEmployeeRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct DeleteEmployeeResponse {
    255: required base.BaseResp base_resp
}

struct GetEmployeeRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct GetEmployeeResponse {
    1: optional EmployeeData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct ListEmployeeRequest {
    1: required i64 corp_id (api.body = "corp_id", api.js_conv="true")
    2: optional i64 department_id (api.body = "department_id", api.js_conv="true")
    3: optional string keyword (api.body = "keyword")
    4: optional common.EmployeeStatus status (api.body = "status")
    5: optional i32 page (api.body = "page")
    6: optional i32 page_size (api.body = "page_size")
    255: required base.Base base
}

struct ListEmployeeResponse {
    1: list<EmployeeData> data (api.body = "data")
    2: i64 total (api.body = "total", api.js_conv="true")
    255: required base.BaseResp base_resp
}

// 员工部门关系管理
struct AssignEmployeeToDepartmentRequest {
    1: required i64 employee_id (api.body = "employee_id", api.js_conv="true")
    2: required i64 department_id (api.body = "department_id", api.js_conv="true")
    3: optional string job_title (api.body = "job_title")
    255: required base.Base base
}

struct AssignEmployeeToDepartmentResponse {
    1: optional EmployeeDepartmentData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct UpdateEmployeeDepartmentRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: optional string job_title (api.body = "job_title")
    3: optional common.EmployeeDepartmentStatus status (api.body = "status")
    255: required base.Base base
}

struct UpdateEmployeeDepartmentResponse {
    255: required base.BaseResp base_resp
}

struct RemoveEmployeeFromDepartmentRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct RemoveEmployeeFromDepartmentResponse {
    255: required base.BaseResp base_resp
}
