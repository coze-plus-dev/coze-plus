/*
 * Copyright 2025 coze-plus Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** 企业类型枚举 */
export enum CorporationType {
  /** 集团 */
  GROUP = 1,
  /** 公司 */
  COMPANY = 2,
  /** 分公司 */
  BRANCH = 3,
}
/** 数据来源枚举 */
export enum DataSource {
  /** 企业微信 */
  ENTERPRISE_WECHAT = 1,
  /** 钉钉 */
  DINGTALK = 2,
  /** 飞书 */
  FEISHU = 3,
  /** 手动创建 */
  MANUAL = 4,
}
/** 员工状态枚举 */
export enum EmployeeStatus {
  /** 在职 */
  EMPLOYED = 1,
  /** 离职 */
  QUIT = 2,
}
/** 部门状态枚举 */
export enum DepartmentStatus {
  /** 正常 */
  NORMAL = 1,
  /** 停用 */
  DISABLED = 2,
}
/** 员工部门关系状态枚举 */
export enum EmployeeDepartmentStatus {
  /** 正常 */
  NORMAL = 1,
  /** 调离 */
  TRANSFERRED = 2,
}
/** Create account type enumeration */
export enum CreateAccountType {
  /** Do not create account */
  NO_CREATE = 0,
  /** Create account using work email */
  CREATE_BY_EMAIL = 1,
}