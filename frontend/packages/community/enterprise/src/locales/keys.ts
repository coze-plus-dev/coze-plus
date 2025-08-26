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

/**
 * 企业管理模块多语言key定义
 * 用于扁平化的多语言key结构
 */

export const ENTERPRISE_I18N_KEYS = {
  // 通用
  ENTERPRISE_NAME: 'enterprise_name',
  ENTERPRISE_STATUS: 'enterprise_status',
  ENTERPRISE_MOBILE: 'enterprise_mobile',
  ENTERPRISE_EMAIL: 'enterprise_email',
  ENTERPRISE_DEPARTMENT: 'enterprise_department',
  ENTERPRISE_ACTIONS: 'enterprise_actions',
  ENTERPRISE_DETAIL: 'enterprise_detail',
  ENTERPRISE_CANCEL: 'enterprise_cancel',
  ENTERPRISE_CONFIRM: 'enterprise_confirm',
  ENTERPRISE_EDIT: 'enterprise_edit',
  ENTERPRISE_DELETE: 'enterprise_delete',
  ENTERPRISE_ADD: 'enterprise_add',
  ENTERPRISE_SAVE: 'enterprise_save',
  ENTERPRISE_CLOSE: 'enterprise_close',
  ENTERPRISE_LOADING: 'enterprise_loading',
  ENTERPRISE_NO_DATA: 'enterprise_no_data',

  // 状态
  ENTERPRISE_STATUS_EMPLOYED: 'enterprise_status_employed',
  ENTERPRISE_STATUS_QUIT: 'enterprise_status_quit',

  // 工具栏
  ENTERPRISE_TOOLBAR_REFRESH: 'enterprise_toolbar_refresh',
  ENTERPRISE_TOOLBAR_SEARCH: 'enterprise_toolbar_search',
  ENTERPRISE_TOOLBAR_SEARCH_PLACEHOLDER:
    'enterprise_toolbar_search_placeholder',
  ENTERPRISE_TOOLBAR_EXPAND_SIDEBAR: 'enterprise_toolbar_expand_sidebar',

  // 通讯录
  ENTERPRISE_ADDRESS_BOOK_TITLE: 'navigation_organization_address_book',

  // 员工表格
  ENTERPRISE_MEMBER_TABLE_COLUMN_NAME: 'enterprise_member_table_column_name',
  ENTERPRISE_MEMBER_TABLE_COLUMN_STATUS:
    'enterprise_member_table_column_status',
  ENTERPRISE_MEMBER_TABLE_COLUMN_MOBILE:
    'enterprise_member_table_column_mobile',
  ENTERPRISE_MEMBER_TABLE_COLUMN_DEPARTMENT:
    'enterprise_member_table_column_department',
  ENTERPRISE_MEMBER_TABLE_COLUMN_EMAIL: 'enterprise_member_table_column_email',
  ENTERPRISE_MEMBER_TABLE_COLUMN_ACTIONS:
    'enterprise_member_table_column_actions',

  ENTERPRISE_MEMBER_TABLE_ACTION_DETAIL:
    'enterprise_member_table_action_detail',
  ENTERPRISE_MEMBER_TABLE_ACTION_CHANGE_DEPARTMENT:
    'enterprise_member_table_action_change_department',
  ENTERPRISE_MEMBER_TABLE_ACTION_RESIGNATION:
    'enterprise_member_table_action_resignation',
  ENTERPRISE_MEMBER_TABLE_ACTION_RESTORE:
    'enterprise_member_table_action_restore',
  ENTERPRISE_MEMBER_TABLE_ACTION_PIN: 'enterprise_member_table_action_pin',

  ENTERPRISE_MEMBER_TABLE_EMPTY_SELECT_NODE_TITLE:
    'enterprise_member_table_empty_select_node_title',
  ENTERPRISE_MEMBER_TABLE_EMPTY_SELECT_NODE_DESCRIPTION:
    'enterprise_member_table_empty_select_node_description',
  ENTERPRISE_MEMBER_TABLE_EMPTY_NO_EMPLOYEES_TITLE:
    'enterprise_member_table_empty_no_employees_title',
  ENTERPRISE_MEMBER_TABLE_EMPTY_NO_EMPLOYEES_DESCRIPTION:
    'enterprise_member_table_empty_no_employees_description',

  ENTERPRISE_MEMBER_TABLE_TOTAL_MEMBERS:
    'enterprise_member_table_total_members',

  // 员工详情
  ENTERPRISE_MEMBER_DETAIL_SECTION_BASIC_INFO:
    'enterprise_member_detail_section_basic_info',
  ENTERPRISE_MEMBER_DETAIL_SECTION_DEPARTMENT:
    'enterprise_member_detail_section_department',

  ENTERPRISE_MEMBER_DETAIL_FIELD_NAME: 'enterprise_member_detail_field_name',
  ENTERPRISE_MEMBER_DETAIL_FIELD_USER_ID:
    'enterprise_member_detail_field_user_id',
  ENTERPRISE_MEMBER_DETAIL_FIELD_MOBILE:
    'enterprise_member_detail_field_mobile',
  ENTERPRISE_MEMBER_DETAIL_FIELD_EMAIL: 'enterprise_member_detail_field_email',

  ENTERPRISE_MEMBER_DETAIL_ACTION_MORE_ACTIONS:
    'enterprise_member_detail_action_more_actions',
  ENTERPRISE_MEMBER_DETAIL_ACTION_CHANGE_DEPARTMENT:
    'enterprise_member_detail_action_change_department',
  ENTERPRISE_MEMBER_DETAIL_ACTION_RESIGNATION:
    'enterprise_member_detail_action_resignation',
  ENTERPRISE_MEMBER_DETAIL_ACTION_EDIT_BASIC_INFO:
    'enterprise_member_detail_action_edit_basic_info',

  ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_UNASSIGNED:
    'enterprise_member_detail_department_unassigned',
  ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_PRIMARY:
    'enterprise_member_detail_department_primary',
  ENTERPRISE_MEMBER_DETAIL_DEPARTMENT_PART_TIME:
    'enterprise_member_detail_department_part_time',

  ENTERPRISE_MEMBER_DETAIL_USER_ID_PREFIX:
    'enterprise_member_detail_user_id_prefix',

  // 组织树
  ENTERPRISE_ORG_TREE_COLLAPSE_SIDEBAR: 'enterprise_org_tree_collapse_sidebar',

  // 部门选择器
  ENTERPRISE_DEPARTMENT_SELECTOR_PRIMARY_DEPARTMENT:
    'enterprise_department_selector_primary_department',
  ENTERPRISE_DEPARTMENT_SELECTOR_SET_PRIMARY:
    'enterprise_department_selector_set_primary',

  // 验证
  ENTERPRISE_VALIDATION_REQUIRED: 'enterprise_validation_required',
  ENTERPRISE_VALIDATION_INVALID_MOBILE: 'enterprise_validation_invalid_mobile',
  ENTERPRISE_VALIDATION_INVALID_EMAIL: 'enterprise_validation_invalid_email',
  ENTERPRISE_VALIDATION_NAME_TOO_LONG: 'enterprise_validation_name_too_long',

  // 新增缺失的键值 - 使用扁平化结构
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_NAME_REQUIRED:
    'enterprise_create_employee_fields_name_required',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_NAME_PLACEHOLDER:
    'enterprise_create_employee_fields_name_placeholder',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_REQUIRED:
    'enterprise_create_employee_fields_mobile_required',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_PLACEHOLDER:
    'enterprise_create_employee_fields_mobile_placeholder',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_MOBILE_INVALID:
    'enterprise_create_employee_fields_mobile_invalid',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_EMAIL_PLACEHOLDER:
    'enterprise_create_employee_fields_email_placeholder',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_EMAIL_INVALID:
    'enterprise_create_employee_fields_email_invalid',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_DEPARTMENT_REQUIRED:
    'enterprise_create_employee_fields_department_required',
  ENTERPRISE_CREATE_EMPLOYEE_FIELDS_DEPARTMENT_PLACEHOLDER:
    'enterprise_create_employee_fields_department_placeholder',

  ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_CANCEL:
    'enterprise_edit_organization_buttons_cancel',
  ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_SAVE:
    'enterprise_edit_organization_buttons_save',
  ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_SUCCESS:
    'enterprise_edit_organization_messages_update_success',
  ENTERPRISE_EDIT_ORGANIZATION_MESSAGES_UPDATE_FAILED:
    'enterprise_edit_organization_messages_update_failed',

  // 离职相关
  ENTERPRISE_RESIGNATION_CONFIRM_TITLE: 'enterprise_resignation_confirm_title',
  ENTERPRISE_RESIGNATION_CONFIRM_OK_TEXT:
    'enterprise_resignation_confirm_ok_text',
  ENTERPRISE_RESIGNATION_SUCCESS_MESSAGE:
    'enterprise_resignation_success_message',
  ENTERPRISE_RESIGNATION_FAILED_MESSAGE:
    'enterprise_resignation_failed_message',
  ENTERPRISE_RESIGNATION_CONFIRM_CONTENT:
    'enterprise_resignation_confirm_content',
  ENTERPRISE_RESIGNATION_CONFIRM_DESCRIPTION:
    'enterprise_resignation_confirm_description',

  // 恢复在职相关
  ENTERPRISE_RESTORE_CONFIRM_TITLE: 'enterprise_restore_confirm_title',
  ENTERPRISE_RESTORE_CONFIRM_OK_TEXT: 'enterprise_restore_confirm_ok_text',
  ENTERPRISE_RESTORE_SUCCESS_MESSAGE: 'enterprise_restore_success_message',
  ENTERPRISE_RESTORE_FAILED_MESSAGE: 'enterprise_restore_failed_message',
  ENTERPRISE_RESTORE_EMPLOYEE_TITLE: 'enterprise_restore_employee_title',

  // 部门选择相关
  ENTERPRISE_SELECT_DEPARTMENT: 'enterprise_select_department',
  ENTERPRISE_CHANGE_DEPARTMENT_TIP_1: 'enterprise_change_department_tip_1',
  ENTERPRISE_CHANGE_DEPARTMENT_TIP_2: 'enterprise_change_department_tip_2',

  // 创建员工相关
  ENTERPRISE_CREATE_EMPLOYEE: 'enterprise_create_employee',
  ENTERPRISE_EMPLOYEE_NAME: 'enterprise_employee_name',
  ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME:
    'enterprise_please_input_employee_name',
  ENTERPRISE_EMPLOYEE_NAME_TOO_LONG: 'enterprise_employee_name_too_long',
  ENTERPRISE_PLEASE_SELECT_DEPARTMENT: 'enterprise_please_select_department',
  ENTERPRISE_PLEASE_INPUT_MOBILE: 'enterprise_please_input_mobile',
  ENTERPRISE_MOBILE_FORMAT_ERROR: 'enterprise_mobile_format_error',
  ENTERPRISE_PLEASE_INPUT_EMAIL: 'enterprise_please_input_email',
  ENTERPRISE_EMAIL_FORMAT_ERROR: 'enterprise_email_format_error',

  // 创建部门相关
  ENTERPRISE_CREATE_DEPARTMENT: 'enterprise_create_department',
  ENTERPRISE_DEPARTMENT_NAME: 'enterprise_department_name',
  ENTERPRISE_PLEASE_INPUT_DEPARTMENT_NAME:
    'enterprise_please_input_department_name',
  ENTERPRISE_DEPARTMENT_NAME_TOO_LONG: 'enterprise_department_name_too_long',
  ENTERPRISE_PARENT_DEPARTMENT: 'enterprise_parent_department',
  ENTERPRISE_PLEASE_SELECT_PARENT_DEPARTMENT:
    'enterprise_please_select_parent_department',
  ENTERPRISE_PARENT_NOT_FOUND: 'enterprise_parent_not_found',
  ENTERPRISE_DEPARTMENT_CREATED_SUCCESS:
    'enterprise_department_created_success',
  ENTERPRISE_COMMON_CREATE_FAIL: 'common_create_fail',
  ENTERPRISE_COMMON_CREATE: 'common_create',
  ENTERPRISE_COMMON_CANCEL: 'common_cancel',

  // 创建组织相关
  ENTERPRISE_NEW_ORGANIZATION: 'new_organization',
  ENTERPRISE_ORGANIZATION_NAME: 'organization_name',
  ENTERPRISE_PLEASE_INPUT_ORGANIZATION_NAME: 'please_input_organization_name',
  ENTERPRISE_ORGANIZATION_NAME_TOO_LONG: 'organization_name_too_long',
  ENTERPRISE_ORGANIZATION_TYPE: 'organization_type',
  ENTERPRISE_PLEASE_SELECT_ORGANIZATION_TYPE: 'please_select_organization_type',
  ENTERPRISE_PARENT_ORGANIZATION: 'parent_organization',
  ENTERPRISE_PLEASE_SELECT_PARENT_ORGANIZATION:
    'please_select_parent_organization',
  ENTERPRISE_CORP_TYPE_GROUP: 'corp_type_group',
  ENTERPRISE_CORP_TYPE_COMPANY: 'corp_type_company',
  ENTERPRISE_CORP_TYPE_BRANCH: 'corp_type_branch',

  // 部门选择器相关
  ENTERPRISE_PUBLISH_PERMISSION_CONTROL_PAGE_REMOVE_CHOSEN:
    'publish_permission_control_page_remove_chosen',
  ENTERPRISE_ANALYTIC_QUERY_CLEAR: 'analytic_query_clear',
  ENTERPRISE_QUERY_DATA_EMPTY: 'query_data_empty',
  ENTERPRISE_PRIMARY_DEPARTMENT_TAG: 'enterprise_primary_department_tag',
  ENTERPRISE_SET_PRIMARY_DEPARTMENT: 'enterprise_set_primary_department',

  // 编辑部门相关
  ENTERPRISE_EDIT_DEPARTMENT: 'edit_department',
  ENTERPRISE_UPDATE_SUCCESS: 'Update_success',
  ENTERPRISE_UPDATE_FAILED: 'Update_failed',

  // 编辑组织相关
  ENTERPRISE_EDIT_ORGANIZATION: 'edit_organization',
  ENTERPRISE_LOAD_FAILED: 'enterprise_load_failed',
  ENTERPRISE_PLUGIN_UPDATE_SUCCESS: 'Plugin_update_success',

  // 组织树相关
  ENTERPRISE_DELETE_TITLE: 'delete_title',
  ENTERPRISE_DELETE_SUCCESS: 'Delete_success',
  ENTERPRISE_DELETE_FAILED: 'Delete_failed',
  ENTERPRISE_NO_DEPARTMENT_DATA: 'enterprise_no_department_data',
  ENTERPRISE_PLEASE_CREATE_DEPARTMENT: 'enterprise_please_create_department',

  // 工具栏相关
  ENTERPRISE_DATASETS_PLACEHOLDER_SEARCH: 'datasets_placeholder_search',
  ENTERPRISE_SEARCH_EMPLOYEES_PLACEHOLDER:
    'enterprise_search_employees_placeholder',
  ENTERPRISE_ORGANIZATION: 'enterprise_organization',
  ENTERPRISE_MEMBER: 'enterprise_member',
  ENTERPRISE_SEARCH: 'Search',

  // 通用操作
  ENTERPRISE_CREATE: 'Create',
  ENTERPRISE_CREATE_SUCCESS: 'create_success',
  ENTERPRISE_CREATE_FAILED: 'create_failed',

  // 角色管理相关
  ROLE_VALIDATION_NAME_REQUIRED: 'role_validation_name_required',
  ROLE_INVALID_PARAM_ERROR: 'role_invalid_param_error',
  
  // 角色管理页面
  ROLE_MANAGEMENT_TITLE: 'role_management_title',
  ROLE_LIST_TITLE: 'role_list_title',
  
  // 角色删除
  ROLE_DELETE_CONFIRM_TITLE: 'role_delete_confirm_title',
  ROLE_DELETE_CONFIRM_CONTENT: 'role_delete_confirm_content',
  
  // 权限编辑
  ROLE_PERMISSION_SAVE_SUCCESS: 'role_permission_save_success',
  ROLE_PERMISSION_SAVE_FAILED: 'role_permission_save_failed',
  
  // 角色管理消息
  ROLE_LIST_LOAD_FAILED: 'role_list_load_failed',
  
  // 角色列表空状态
  ROLE_LIST_EMPTY_TITLE: 'role_list_empty_title',
  ROLE_LIST_EMPTY_DESCRIPTION: 'role_list_empty_description',
  
  // 权限分配
  ROLE_PERMISSION_ASSIGN_TITLE: 'role_permission_assign_title',
  ROLE_PERMISSION_TEMPLATE_EMPTY_TITLE: 'role_permission_template_empty_title',
  ROLE_PERMISSION_TEMPLATE_EMPTY_DESCRIPTION: 'role_permission_template_empty_description',
  ROLE_PERMISSION_ASSIGN_SUCCESS: 'role_permission_assign_success',
  ROLE_PERMISSION_ASSIGN_FAILED: 'role_permission_assign_failed',
  ROLE_PERMISSION_DATA_LOAD_FAILED: 'role_permission_data_load_failed',
  
  // 权限矩阵
  ROLE_PERMISSION_MATRIX_SELECT_ROLE_TITLE: 'role_permission_matrix_select_role_title',
  ROLE_PERMISSION_MATRIX_SELECT_ROLE_DESCRIPTION: 'role_permission_matrix_select_role_description',
  ROLE_PERMISSION_MATRIX_NO_DATA_TITLE: 'role_permission_matrix_no_data_title',
  ROLE_PERMISSION_MATRIX_NO_DATA_DESCRIPTION: 'role_permission_matrix_no_data_description',
  ROLE_PERMISSION_MATRIX_OTHER_DOMAIN: 'role_permission_matrix_other_domain',
  
  // 编辑角色模态框
  ROLE_EDIT_MODAL_TITLE: 'role_edit_modal_title',
  ROLE_EDIT_NAME_LABEL: 'role_edit_name_label',
  ROLE_EDIT_NAME_PLACEHOLDER: 'role_edit_name_placeholder',
  ROLE_EDIT_NAME_REQUIRED: 'role_edit_name_required',
  ROLE_EDIT_NAME_TOO_LONG: 'role_edit_name_too_long',
  ROLE_EDIT_CODE_LABEL: 'role_edit_code_label',
  ROLE_EDIT_CODE_PLACEHOLDER: 'role_edit_code_placeholder',
  ROLE_EDIT_DESCRIPTION_LABEL: 'role_edit_description_label',
  ROLE_EDIT_DESCRIPTION_PLACEHOLDER: 'role_edit_description_placeholder',
  ROLE_EDIT_DESCRIPTION_TOO_LONG: 'role_edit_description_too_long',
  
  // 创建角色模态框
  ROLE_CREATE_MODAL_TITLE: 'role_create_modal_title',
  ROLE_CREATE_NAME_LABEL: 'role_create_name_label',
  ROLE_CREATE_NAME_PLACEHOLDER: 'role_create_name_placeholder',
  ROLE_CREATE_NAME_REQUIRED: 'role_create_name_required',
  ROLE_CREATE_CODE_LABEL: 'role_create_code_label',
  ROLE_CREATE_CODE_PLACEHOLDER: 'role_create_code_placeholder',
  ROLE_CREATE_CODE_REQUIRED: 'role_create_code_required',
  ROLE_CREATE_CODE_INVALID: 'role_create_code_invalid',
  ROLE_CREATE_DESCRIPTION_LABEL: 'role_create_description_label',
  ROLE_CREATE_DESCRIPTION_PLACEHOLDER: 'role_create_description_placeholder',
  ROLE_CREATE_DESCRIPTION_TOO_LONG: 'role_create_description_too_long',
  
  // 角色标签
  ROLE_BUILTIN_TAG: 'role_builtin_tag',
  ROLE_CUSTOM_TAG: 'role_custom_tag',
  ROLE_NO_PERMISSION_TAG: 'role_no_permission_tag',
  ROLE_NO_DESCRIPTION: 'role_no_description',
  
  // 权限分配表格
  ROLE_PERMISSION_TABLE_PERMISSION_COLUMN: 'role_permission_table_permission_column',
  ROLE_PERMISSION_TABLE_ACTION_COLUMN: 'role_permission_table_action_column',
  
  // 权限矩阵操作按钮
  ROLE_PERMISSION_EDIT_BUTTON: 'role_permission_edit_button',
  ROLE_PERMISSION_CANCEL_BUTTON: 'role_permission_cancel_button',
  ROLE_PERMISSION_SAVE_BUTTON: 'role_permission_save_button',
  ROLE_PERMISSION_BUILTIN_NOTICE: 'role_permission_builtin_notice',
} as const;

export type EnterpriseI18nKey =
  (typeof ENTERPRISE_I18N_KEYS)[keyof typeof ENTERPRISE_I18N_KEYS];
