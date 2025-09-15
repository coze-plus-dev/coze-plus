include "./department.thrift"
 
namespace go corporation.department

service DepartmentService {
    department.CreateDepartmentResponse CreateDepartment(1: department.CreateDepartmentRequest request)(api.post='/api/v1/corporation/department/create', api.category="corporation", api.gen_path= "department")
    department.GetDepartmentResponse GetDepartment(1: department.GetDepartmentRequest request)(api.get='/api/v1/corporation/department/:id', api.category="corporation", api.gen_path= "department")
    department.UpdateDepartmentResponse UpdateDepartment(1: department.UpdateDepartmentRequest request)(api.put='/api/v1/corporation/department/:id', api.category="corporation", api.gen_path= "department")
    department.DeleteDepartmentResponse DeleteDepartment(1: department.DeleteDepartmentRequest request)(api.delete='/api/v1/corporation/department/:id', api.category="corporation", api.gen_path= "department")
    department.ListDepartmentResponse ListDepartments(1: department.ListDepartmentRequest request)(api.post='/api/v1/corporation/department/list', api.category="corporation", api.gen_path= "department")
    department.SortDepartmentResponse SortDepartments(1: department.SortDepartmentRequest request)(api.post='/api/v1/corporation/department/sort', api.category="corporation", api.gen_path= "department")
    department.GetDepartmentTreeResponse GetDepartmentTree(1: department.GetDepartmentTreeRequest request)(api.post='/api/v1/corporation/department/tree', api.category="corporation", api.gen_path= "department")
}