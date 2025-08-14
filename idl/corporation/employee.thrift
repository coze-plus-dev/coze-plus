namespace go corporation.employee

include "common.thrift"
include "../base.thrift"

struct EmployeeData {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: optional string employee_no (api.body = "employee_no")
    3: string name (api.body = "name")
    4: optional string en_name (api.body = "en_name")
    5: optional string nickname (api.body = "nickname")
    6: optional string avatar (api.body = "avatar")
    7: optional string email (api.body = "email")
    8: string mobile (api.body = "mobile")
    9: common.EmployeeStatus status (api.body = "status")
    10: optional string out_employee_id (api.body = "out_employee_id")
    11: optional common.DataSource employee_source (api.body = "employee_source")
    12: optional list<EmployeeDepartmentInfo> departments (api.body = "departments") // 员工所属部门信息列表（包含部门名称）
}

struct EmployeeDepartmentInfo {
    1: i64 department_id (api.body = "department_id", api.js_conv="true")
    2: string department_name (api.body = "department_name") // 部门名称
    3: i64 corp_id (api.body = "corp_id", api.js_conv="true") // 部门所属组织ID
    4: string corp_name (api.body = "corp_name") // 组织名称
    5: optional string job_title (api.body = "job_title") // 职位
    6: optional bool is_primary (api.body = "is_primary") // 是否主部门
    7: optional string department_path (api.body = "department_path") // 部门路径，例如："集团A/公司B/部门C"
}

struct CreateEmployeeRequest {
    1: required string name (api.body = "name")
    2: required list<EmployeeDepartmentInfo> department_ids (api.body = "department_ids") 
    3: optional string employee_no (api.body = "employee_no")
    4: optional string en_name (api.body = "en_name")
    5: optional string nickname (api.body = "nickname")
    6: optional string avatar (api.body = "avatar")
    7: optional string email (api.body = "email")
    8: required string mobile (api.body = "mobile")
    9: optional string out_employee_id (api.body = "out_employee_id")
    10: optional common.DataSource employee_source (api.body = "employee_source")
    255: optional base.Base base
}

struct CreateEmployeeResponse {
    1: i64    code
    2: string msg
    3: optional EmployeeData data (api.body = "data")
}

struct UpdateEmployeeRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true")
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
    12: optional list<EmployeeDepartmentInfo> departments (api.body = "departments") // 员工所属部门信息列表（包含部门名称）
    255: optional base.Base base
}

struct UpdateEmployeeResponse {
    1: i64    code
    2: string msg
}

struct DeleteEmployeeRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true")
    255: optional base.Base base
}

struct DeleteEmployeeResponse {
    1: i64    code
    2: string msg
}

struct GetEmployeeRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true")
    255: optional base.Base base
}

struct GetEmployeeResponse {
    1: i64    code
    2: string msg
    3: optional EmployeeData data (api.body = "data")
}

struct ListEmployeeRequest {
    1: required i64 corp_id (api.body = "corp_id", api.js_conv="true")
    2: optional i64 department_id (api.body = "department_id", api.js_conv="true")
    3: optional string keyword (api.body = "keyword") // 支持姓名和手机号模糊查询
    4: optional common.EmployeeStatus status (api.body = "status")
    5: optional i32 page (api.body = "page")
    6: optional i32 page_size (api.body = "page_size")
    255: optional base.Base base
}

struct ListEmployeeResponse {
    1: i64    code
    2: string msg
    3: list<EmployeeData> data (api.body = "data")
    4: i64 total (api.body = "total", api.js_conv="true")
}

struct ChangeEmployeeDepartmentRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true") // 员工ID
    2: required list<EmployeeDepartmentInfo> departments (api.body = "departments") // 新的部门列表
    255: optional base.Base base
}

struct ChangeEmployeeDepartmentResponse {
    1: i64    code
    2: string msg
    3: optional EmployeeData data (api.body = "data")
}

struct ResignEmployeeRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true") // 员工ID
    2: optional string reason (api.body = "reason") // 离职原因
    255: optional base.Base base
}

struct ResignEmployeeResponse {
    1: i64    code
    2: string msg
    3: optional EmployeeData data (api.body = "data")
}

struct RestoreEmployeeRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true") // 员工ID
    2: required list<EmployeeDepartmentInfo> departments (api.body = "departments") // 恢复后的部门列表
    255: optional base.Base base
}

struct RestoreEmployeeResponse {
    1: i64    code
    2: string msg
    3: optional EmployeeData data (api.body = "data")
}

