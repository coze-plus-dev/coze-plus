include "./employee.thrift"
 

namespace go corporation.employee

service EmployeeService {
    employee.CreateEmployeeResponse CreateEmployee(1: employee.CreateEmployeeRequest request)(api.post='/v1/corporation/employee/create', api.category="corporation", api.gen_path= "employee")
    employee.GetEmployeeResponse GetEmployee(1: employee.GetEmployeeRequest request)(api.get='/v1/corporation/employee/:id', api.category="corporation", api.gen_path= "employee")
    employee.UpdateEmployeeResponse UpdateEmployee(1: employee.UpdateEmployeeRequest request)(api.put='/v1/corporation/employee/:id', api.category="corporation", api.gen_path= "employee")
    employee.DeleteEmployeeResponse DeleteEmployee(1: employee.DeleteEmployeeRequest request)(api.delete='/v1/corporation/employee/:id', api.category="corporation", api.gen_path= "employee")
    employee.ListEmployeeResponse ListEmployees(1: employee.ListEmployeeRequest request)(api.post='/v1/corporation/employee/list', api.category="corporation", api.gen_path= "employee")
    employee.AssignEmployeeToDepartmentResponse AssignEmployeeToDepartment(1: employee.AssignEmployeeToDepartmentRequest request)(api.post='/v1/corporation/employee/assign-department', api.category="corporation", api.gen_path= "employee")
    employee.UpdateEmployeeDepartmentResponse UpdateEmployeeDepartment(1: employee.UpdateEmployeeDepartmentRequest request)(api.put='/v1/corporation/employee/department/:id', api.category="corporation", api.gen_path= "employee")
    employee.RemoveEmployeeFromDepartmentResponse RemoveEmployeeFromDepartment(1: employee.RemoveEmployeeFromDepartmentRequest request)(api.delete='/v1/corporation/employee/department/:id', api.category="corporation", api.gen_path= "employee")
}