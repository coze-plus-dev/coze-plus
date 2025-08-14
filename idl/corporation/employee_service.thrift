include "./employee.thrift"
 

namespace go corporation.employee

service EmployeeService {
    employee.CreateEmployeeResponse CreateEmployee(1: employee.CreateEmployeeRequest request)(api.post='/api/v1/corporation/employee/create', api.category="corporation", api.gen_path= "employee")
    employee.GetEmployeeResponse GetEmployee(1: employee.GetEmployeeRequest request)(api.get='/api/v1/corporation/employee/:id', api.category="corporation", api.gen_path= "employee")
    employee.UpdateEmployeeResponse UpdateEmployee(1: employee.UpdateEmployeeRequest request)(api.put='/api/v1/corporation/employee/:id', api.category="corporation", api.gen_path= "employee")
    employee.DeleteEmployeeResponse DeleteEmployee(1: employee.DeleteEmployeeRequest request)(api.delete='/api/v1/corporation/employee/:id', api.category="corporation", api.gen_path= "employee")
    employee.ListEmployeeResponse ListEmployees(1: employee.ListEmployeeRequest request)(api.post='/api/v1/corporation/employee/list', api.category="corporation", api.gen_path= "employee")
    employee.ChangeEmployeeDepartmentResponse ChangeEmployeeDepartment(1: employee.ChangeEmployeeDepartmentRequest request)(api.put='/api/v1/corporation/employee/:id/department', api.category="corporation", api.gen_path= "employee")
    employee.ResignEmployeeResponse ResignEmployee(1: employee.ResignEmployeeRequest request)(api.put='/api/v1/corporation/employee/:id/resign', api.category="corporation", api.gen_path= "employee")
    employee.RestoreEmployeeResponse RestoreEmployee(1: employee.RestoreEmployeeRequest request)(api.put='/api/v1/corporation/employee/:id/restore', api.category="corporation", api.gen_path= "employee")
}