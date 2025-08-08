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
    255: required base.Base base
}

struct CreateCorpResponse {
    1: optional CorporationData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct UpdateCorpRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    2: optional string name (api.body = "name")
    3: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    4: optional common.CorporationType corp_type (api.body = "corp_type")
    5: optional i32 sort (api.body = "sort")
    6: optional string out_corp_id (api.body = "out_corp_id") 
    7: optional common.DataSource corp_source (api.body = "corp_source")
    255: required base.Base base
}

struct UpdateCorpResponse {
    255: required base.BaseResp base_resp
}

struct DeleteCorpRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct DeleteCorpResponse {
    255: required base.BaseResp base_resp
}

struct GetCorpRequest {
    1: required i64 id (api.body = "id", agw.key = "id", api.js_conv="true")
    255: required base.Base base
}

struct GetCorpResponse {
    1: optional CorporationData data (api.body = "data")
    255: required base.BaseResp base_resp
}

struct ListCorpsRequest {
    1: optional string keyword (api.body = "keyword")
    2: optional i64 parent_id (api.body = "parent_id", api.js_conv="true")
    3: optional common.CorporationType corp_type (api.body = "corp_type")
    4: optional i32 page (api.body = "page")
    5: optional i32 page_size (api.body = "page_size")
    255: required base.Base base
}

struct ListCorpsResponse {
    1: list<CorporationData> data (api.body = "data")
    2: i64 total (api.body = "total", api.js_conv="true")
    255: required base.BaseResp base_resp
}