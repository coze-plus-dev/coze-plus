include "../base.thrift"

namespace go permission.common

enum PermissionDomain {
    GLOBAL = 1,
    SPACE = 2,
}

enum RoleType {
    SUPER_ADMIN = 0,
    SPACE_ROLE = 1,
    CUSTOM_ROLE = 2,
}

enum SpaceRoleType {
    OWNER = 1,
    ADMIN = 2,
    MEMBER = 3,
}

enum CasbinPolicyType {
    POLICY = 1,
    GROUPING = 2,
}

enum PermissionEffect {
    ALLOW = 1,
    DENY = 2,
}

enum Status {
    DISABLED = 0,
    ENABLED = 1,
}

enum UserStatus {
    ENABLED = 0,
    DISABLED = 1,
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
}

struct PermissionResourceGroup {
    1: optional string resource (api.body = "resource"),
    2: optional string resource_name (api.body = "resource_name"),
    3: optional list<PermissionTemplateData> actions (api.body = "actions"),
}

struct PermissionTemplateGroup {
    1: optional string domain (api.body = "domain"),
    2: optional string domain_name (api.body = "domain_name"),
    3: optional list<PermissionResourceGroup> resources (api.body = "resources"),
}