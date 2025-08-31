namespace go corporation.corporation

include "common.thrift"
include "../base.thrift"

struct CorporationData {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: optional i64 parent_id (api.body = "parent_id", agw.key = "parent_id", api.js_conv="true")
    3: string name (api.body = "name")
    4: common.CorporationType corp_type (api.body = "corp_type")
    5: i32 sort (api.body = "sort")
    6: optional string out_corp_id (api.body = "out_corp_id")
    7: optional common.DataSource corp_source (api.body = "corp_source")
    8: i64 creator_id (api.body = "creator_id", agw.key = "creator_id", api.js_conv="true")
    9: i64 created_at (api.body = "created_at", agw.key = "created_at", api.js_conv="true")
    10: i64 updated_at (api.body = "updated_at", agw.key = "updated_at", api.js_conv="true")
    11: optional i64 deleted_at (api.body = "deleted_at", agw.key = "deleted_at", api.js_conv="true")
}

struct CreateCorpRequest {
    1: required string name (api.body = "name")
    2: optional common.CorporationType corp_type (api.body = "corp_type")  
    3: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    4: optional i32 sort (api.body = "sort")
    5: optional string out_corp_id (api.body = "out_corp_id")
    6: optional common.DataSource corp_source (api.body = "corp_source")
    255: optional base.Base base
}

struct CreateCorpResponse {
    1: i64    code
    2: string msg
    3: optional CorporationData data (api.body = "data")
}

struct UpdateCorpRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true")
    2: optional string name (api.body = "name")
    3: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    4: optional common.CorporationType corp_type (api.body = "corp_type")
    5: optional i32 sort (api.body = "sort")
    6: optional string out_corp_id (api.body = "out_corp_id") 
    7: optional common.DataSource corp_source (api.body = "corp_source")
    255: optional base.Base base
}

struct UpdateCorpResponse {
    1: i64    code
    2: string msg
}

struct DeleteCorpRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true")
    255: optional base.Base base
}

struct DeleteCorpResponse {
    1: i64    code
    2: string msg
}

struct GetCorpRequest {
    1: required i64 id (api.path = "id", agw.key = "id", api.js_conv="true")
    255: optional base.Base base
}

struct GetCorpResponse {
    1: i64    code
    2: string msg
    3: optional CorporationData data (api.body = "data")
}

struct ListCorpsRequest {
    1: optional string keyword (api.body = "keyword")
    2: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    3: optional common.CorporationType corp_type (api.body = "corp_type")
    4: optional i32 page (api.body = "page")
    5: optional i32 page_size (api.body = "page_size")
    255: optional base.Base base
}

struct ListCorpsResponse {
    1: i64    code
    2: string msg
    3: list<CorporationData> data (api.body = "data")
    4: i64 total (api.body = "total", api.js_conv="true")
}

// 企业树节点（包含部门）
struct CorporationTreeNode {
    1: i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    
    // 树状结构关系 - 前端展示用的父节点ID（主要使用）
    2: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    
    // 业务层级关系 - 组织的上级组织，部门的上级部门
    3: optional i64 business_parent_id (api.body = "business_parent_id", api.js_conv="true")
    
    4: string name (api.body = "name")
    5: common.CorporationType corp_type (api.body = "corp_type")
    6: i32 sort (api.body = "sort")
    7: string node_type (api.body = "node_type") // "corp" or "dept"
    8: list<CorporationTreeNode> children (api.body = "children")
    9: bool has_children (api.body = "has_children")
    10: bool is_expanded (api.body = "is_expanded")
    11: i32 employee_count (api.body = "employee_count")
    
    // 部门专用字段
    12: optional i64 corp_id (api.body = "corp_id", api.js_conv="true") // 部门所属的组织ID
    13: optional i64 dept_id (api.body = "dept_id", api.js_conv="true") // 部门的实际ID
    14: optional i32 level (api.body = "level") // 部门层级
    
    // 路径信息 - 便于理解层级关系
    15: optional string business_path (api.body = "business_path") // 业务路径: "集团A/公司B/部门C"
    16: optional string tree_path (api.body = "tree_path") // 树状路径: "集团A/公司B/部门C"
}


// 获取组织架构树请求
struct GetOrganizationTreeRequest {
    1: optional i64 corp_id (api.body = "corp_id", api.js_conv="true") // 如果不传，返回所有企业的树
    2: optional bool include_departments (api.body = "include_departments") // 是否包含部门
    3: optional i32 depth (api.body = "depth") // 展开深度，0表示全部展开
    4: optional bool include_employee_count (api.body = "include_employee_count") // 是否包含员工数量统计
    255: optional base.Base base
}

// 获取组织架构树响应
struct GetOrganizationTreeResponse {
    1: i64    code
    2: string msg
    3: list<CorporationTreeNode> data (api.body = "data")
}