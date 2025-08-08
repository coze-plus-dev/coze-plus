namespace go corporation.common


// 企业类型枚举
enum CorporationType {
    GROUP = 1,     // 集团
    COMPANY = 2,   // 公司  
    BRANCH = 3,    // 分公司
}

// 数据来源枚举
enum DataSource {
    ENTERPRISE_WECHAT = 1,  // 企业微信
    DINGTALK = 2,           // 钉钉
    FEISHU = 3,             // 飞书
    MANUAL = 4,             // 手动创建
}

// 员工状态枚举
enum EmployeeStatus {
    EMPLOYED = 1,  // 在职
    QUIT = 2,      // 离职
}

// 部门状态枚举
enum DepartmentStatus {
    NORMAL = 1,    // 正常
    DISABLED = 2,  // 停用
}

// 员工部门关系状态枚举
enum EmployeeDepartmentStatus {
    NORMAL = 1,    // 正常
    TRANSFERRED = 2, // 调离
}