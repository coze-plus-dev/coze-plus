include "../base.thrift"
include "./permission.thrift"

namespace go permission.permission

service PermissionService {
    permission.CreateRoleResponse CreateRole (1: permission.CreateRoleRequest req) (api.post="/api/permission_api/role/create")
    permission.UpdateRoleResponse UpdateRole (1: permission.UpdateRoleRequest req) (api.post="/api/permission_api/role/update")
    permission.DeleteRoleResponse DeleteRole (1: permission.DeleteRoleRequest req) (api.post="/api/permission_api/role/delete")
    permission.GetRoleResponse GetRole (1: permission.GetRoleRequest req) (api.get="/api/permission_api/role/get")
    permission.ListRolesResponse ListRoles (1: permission.ListRolesRequest req) (api.post="/api/permission_api/role/list")
    permission.ListPermissionTemplatesResponse ListPermissionTemplates (1: permission.ListPermissionTemplatesRequest req) (api.post="/api/permission_api/template/list")
    permission.ListUsersResponse ListUsers (1: permission.ListUsersRequest req) (api.post="/api/permission_api/user/list")
    permission.UpdateUserStatusResponse UpdateUserStatus (1: permission.UpdateUserStatusRequest req) (api.post="/api/permission_api/user/status/update")
    permission.AssignUserMultipleRolesResponse AssignUserMultipleRoles (1: permission.AssignUserMultipleRolesRequest req) (api.post="/api/permission_api/user/assign_roles")
    permission.UnassignUserRolesResponse UnassignUserRoles (1: permission.UnassignUserRolesRequest req) (api.post="/api/permission_api/user/unassign_roles")
    permission.GetUserRolesResponse GetUserRoles (1: permission.GetUserRolesRequest req) (api.get="/api/permission_api/user/roles")
    permission.ResetUserPasswordResponse ResetUserPassword (1: permission.ResetUserPasswordRequest req) (api.post="/api/permission_api/user/reset_password")
}