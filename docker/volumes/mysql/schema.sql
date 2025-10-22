-- Create "agent_to_database" table
CREATE TABLE IF NOT EXISTS `agent_to_database` (
  `id` bigint unsigned NOT NULL COMMENT "ID",
  `agent_id` bigint unsigned NOT NULL COMMENT "Agent ID",
  `database_id` bigint unsigned NOT NULL COMMENT "ID of database_info",
  `is_draft` bool NOT NULL COMMENT "Is draft",
  `prompt_disable` bool NOT NULL DEFAULT 0 COMMENT "Support prompt calls: 1 not supported, 0 supported",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_agent_db_draft` (`agent_id`, `database_id`, `is_draft`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "agent_to_database info";
-- Create "agent_tool_draft" table
CREATE TABLE IF NOT EXISTS `agent_tool_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `tool_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `tool_name` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Name",
  `tool_version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `source` tinyint NOT NULL DEFAULT 0 COMMENT "tool source 1 coze saas 0 default",
  PRIMARY KEY (`id`),
  INDEX `idx_agent_plugin_tool` (`agent_id`, `plugin_id`, `tool_id`),
  INDEX `idx_agent_tool_bind` (`agent_id`, `created_at`),
  UNIQUE INDEX `uniq_idx_agent_tool_id` (`agent_id`, `tool_id`),
  UNIQUE INDEX `uniq_idx_agent_tool_name` (`agent_id`, `tool_name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Agent Tool";
-- Create "agent_tool_version" table
CREATE TABLE IF NOT EXISTS `agent_tool_version` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `tool_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `agent_version` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Tool Version",
  `tool_name` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Name",
  `tool_version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `source` tinyint NOT NULL DEFAULT 0 COMMENT "tool source 1 coze saas 0 default",
  PRIMARY KEY (`id`),
  INDEX `idx_agent_tool_id_created_at` (`agent_id`, `tool_id`, `created_at`),
  INDEX `idx_agent_tool_name_created_at` (`agent_id`, `tool_name`, `created_at`),
  UNIQUE INDEX `uniq_idx_agent_tool_id_agent_version` (`agent_id`, `tool_id`, `agent_version`),
  UNIQUE INDEX `uniq_idx_agent_tool_name_agent_version` (`agent_id`, `tool_name`, `agent_version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Agent Tool Version";
-- Create "api_key" table
CREATE TABLE IF NOT EXISTS `api_key` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `api_key` varchar(255) NOT NULL DEFAULT "" COMMENT "API Key hash",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "API Key Name",
  `status` tinyint NOT NULL DEFAULT 0 COMMENT "0 normal, 1 deleted",
  `user_id` bigint NOT NULL DEFAULT 0 COMMENT "API Key Owner",
  `expired_at` bigint NOT NULL DEFAULT 0 COMMENT "API Key Expired Time",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `last_used_at` bigint NOT NULL DEFAULT 0 COMMENT "Used Time in Milliseconds",
  `ak_type` tinyint NOT NULL DEFAULT 0 COMMENT "api key type ",
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "api key table";
-- Create "app_connector_release_ref" table
CREATE TABLE IF NOT EXISTS `app_connector_release_ref` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key",
  `record_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Record ID",
  `connector_id` bigint unsigned NULL COMMENT "Publish Connector ID",
  `publish_config` json NULL COMMENT "Publish Configuration",
  `publish_status` tinyint NOT NULL DEFAULT 0 COMMENT "Publish Status",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_record_connector` (`record_id`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Connector Release Record Reference";
-- Create "app_conversation_template_draft" table
CREATE TABLE IF NOT EXISTS `app_conversation_template_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `space_id` bigint unsigned NOT NULL COMMENT "space id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_space_id_app_id_template_id` (`space_id`, `app_id`, `template_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "app_conversation_template_draft";
-- Create "app_conversation_template_online" table
CREATE TABLE IF NOT EXISTS `app_conversation_template_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `space_id` bigint unsigned NOT NULL COMMENT "space id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `version` varchar(256) NOT NULL COMMENT "version name",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_space_id_app_id_template_id_version` (`space_id`, `app_id`, `template_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "app_conversation_template_online";
-- Create "app_draft" table
CREATE TABLE IF NOT EXISTS `app_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "APP ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `owner_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Owner ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Application Name",
  `description` text NULL COMMENT "Application Description",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Application";
-- Create "app_dynamic_conversation_draft" table
CREATE TABLE IF NOT EXISTS `app_dynamic_conversation_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id_connector_id_user_id` (`app_id`, `connector_id`, `user_id`),
  INDEX `idx_connector_id_user_id_name` (`connector_id`, `user_id`, `name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "app_dynamic_conversation_draft";
-- Create "app_dynamic_conversation_online" table
CREATE TABLE IF NOT EXISTS `app_dynamic_conversation_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `name` varchar(256) NOT NULL COMMENT "conversation name",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id_connector_id_user_id` (`app_id`, `connector_id`, `user_id`),
  INDEX `idx_connector_id_user_id_name` (`connector_id`, `user_id`, `name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "app_dynamic_conversation_online";
-- Create "app_release_record" table
CREATE TABLE IF NOT EXISTS `app_release_record` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Record ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `owner_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Owner ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Application Name",
  `description` text NULL COMMENT "Application Description",
  `connector_ids` json NULL COMMENT "Publish Connector IDs",
  `extra_info` json NULL COMMENT "Publish Extra Info",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Release Version",
  `version_desc` text NULL COMMENT "Version Description",
  `publish_status` tinyint NOT NULL DEFAULT 0 COMMENT "Publish Status",
  `publish_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Time in Milliseconds",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_app_publish_at` (`app_id`, `publish_at`),
  UNIQUE INDEX `uniq_idx_app_version_connector` (`app_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Application Release Record";
-- Create "app_static_conversation_draft" table
CREATE TABLE IF NOT EXISTS `app_static_conversation_draft` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_user_id_template_id` (`connector_id`, `user_id`, `template_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "app_static_conversation_online" table
CREATE TABLE IF NOT EXISTS `app_static_conversation_online` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `template_id` bigint unsigned NOT NULL COMMENT "template id",
  `user_id` bigint unsigned NOT NULL COMMENT "user id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `conversation_id` bigint unsigned NOT NULL COMMENT "conversation id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_user_id_template_id` (`connector_id`, `user_id`, `template_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create "casbin_rule" table
CREATE TABLE IF NOT EXISTS `casbin_rule` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `ptype` varchar(100) NOT NULL COMMENT "Policy type: p(policy), g(user role)",
  `v0` varchar(100) NOT NULL COMMENT "User ID/Role",
  `v1` varchar(100) NOT NULL COMMENT "Resource domain",
  `v2` varchar(100) NOT NULL COMMENT "Resource type",
  `v3` varchar(100) NULL COMMENT "Action",
  `v4` varchar(100) NULL COMMENT "Effect",
  `v5` varchar(100) NULL COMMENT "Extension field",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_ptype_v0_v1` (`ptype`, `v0`, `v1`),
  UNIQUE INDEX `uniq_rule` (`ptype`, `v0`, `v1`, `v2`, `v3`, `v4`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Casbin permission policy table";
-- Create "chat_flow_role_config" table
CREATE TABLE IF NOT EXISTS `chat_flow_role_config` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `connector_id` bigint unsigned NULL COMMENT "connector id",
  `name` varchar(256) NOT NULL COMMENT "role name",
  `description` mediumtext NULL COMMENT "role description",
  `version` varchar(256) NULL COMMENT "version",
  `avatar` varchar(256) NOT NULL COMMENT "avatar uri",
  `background_image_info` mediumtext NULL COMMENT "background image information, object structure",
  `onboarding_info` mediumtext NULL COMMENT "intro information, object structure",
  `suggest_reply_info` mediumtext NULL COMMENT "user suggestions, object structure",
  `audio_config` mediumtext NULL COMMENT "agent audio config, object structure",
  `user_input_config` varchar(256) NOT NULL COMMENT "user input config, object structure",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_version` (`connector_id`, `version`),
  INDEX `idx_workflow_id_version` (`workflow_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "chat_flow_role_config";
-- Create "connector_workflow_version" table
CREATE TABLE IF NOT EXISTS `connector_workflow_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `app_id` bigint unsigned NOT NULL COMMENT "app id",
  `connector_id` bigint unsigned NOT NULL COMMENT "connector id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `version` varchar(256) NOT NULL COMMENT "version",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_id_workflow_id_create_at` (`connector_id`, `workflow_id`, `created_at`),
  UNIQUE INDEX `uniq_connector_id_workflow_id_version` (`connector_id`, `workflow_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "connector workflow version";
-- Create "conversation" table
CREATE TABLE IF NOT EXISTS `conversation` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `connector_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Publish Connector ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "agent_id",
  `scene` tinyint NOT NULL DEFAULT 0 COMMENT "conversation scene",
  `section_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "section_id",
  `creator_id` bigint unsigned NULL DEFAULT 0 COMMENT "creator_id",
  `ext` text NULL COMMENT "ext",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "status: 1-normal 2-deleted",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `name` varchar(255) NULL DEFAULT "" COMMENT "conversation name",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_bot_status` (`connector_id`, `agent_id`, `creator_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "conversation info record";
-- Create "corporation" table
CREATE TABLE IF NOT EXISTS `corporation` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Corporation ID",
  `parent_id` bigint unsigned NULL COMMENT "Parent Corporation ID (NULL for root corporation)",
  `name` varchar(150) NOT NULL COMMENT "Corporation Name",
  `corp_type` varchar(50) NOT NULL DEFAULT "company" COMMENT "Corporation Type: group,company,branch",
  `sort` int NOT NULL DEFAULT 0 COMMENT "Sort Order",
  `out_corp_id` varchar(100) NULL COMMENT "External Corporation ID",
  `corp_source` tinyint unsigned NULL COMMENT "Data Source: 1-Enterprise WeChat,2-DingTalk,3-Feishu,4-Manual",
  `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp",
  PRIMARY KEY (`id`),
  INDEX `idx_corp_source` (`corp_source`),
  INDEX `idx_corp_type` (`corp_type`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_sort` (`sort`),
  UNIQUE INDEX `uk_out_corp_source` (`out_corp_id`, `corp_source`),
  UNIQUE INDEX `uk_parent_name` (`parent_id`, `name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Corporation Info Table";
-- Create "corporation_department" table
CREATE TABLE IF NOT EXISTS `corporation_department` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Department ID",
  `corp_id` bigint unsigned NOT NULL COMMENT "Corporation ID",
  `parent_id` bigint unsigned NULL COMMENT "Parent Department ID (NULL for root department)",
  `name` varchar(150) NOT NULL COMMENT "Department Name",
  `code` varchar(32) NULL COMMENT "Department Code",
  `level` int NOT NULL DEFAULT 1 COMMENT "Department Level",
  `full_path` varchar(500) NULL COMMENT "Department Full Path",
  `leader_id` bigint unsigned NULL COMMENT "Department Leader ID",
  `sort` int NOT NULL DEFAULT 0 COMMENT "Sort Order",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "Status: 1-Active, 2-Inactive",
  `out_department_id` varchar(100) NULL COMMENT "External Department ID",
  `department_source` tinyint unsigned NULL COMMENT "Data Source: 1-Enterprise WeChat,2-DingTalk,3-Feishu,4-Manual",
  `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp",
  PRIMARY KEY (`id`),
  INDEX `idx_corp_id` (`corp_id`),
  INDEX `idx_corp_parent_level` (`corp_id`, `parent_id`, `level`),
  INDEX `idx_corp_status` (`corp_id`, `status`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_department_source` (`department_source`),
  INDEX `idx_leader_id` (`leader_id`),
  INDEX `idx_level` (`level`),
  INDEX `idx_parent_id` (`parent_id`),
  INDEX `idx_status` (`status`),
  UNIQUE INDEX `uk_corp_code` (`corp_id`, `code`),
  UNIQUE INDEX `uk_corp_parent_dept_name` (`corp_id`, `parent_id`, `name`),
  UNIQUE INDEX `uk_out_dept_source` (`out_department_id`, `department_source`, `corp_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Department Info Table";
-- Create "corporation_employee" table
CREATE TABLE IF NOT EXISTS `corporation_employee` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Employee ID",
  `employee_no` varchar(32) NULL COMMENT "Employee Number (unique in corporation)",
  `name` varchar(50) NOT NULL COMMENT "Employee Name",
  `en_name` varchar(50) NULL COMMENT "English Name",
  `nickname` varchar(50) NULL COMMENT "Nickname",
  `avatar` varchar(255) NULL COMMENT "Avatar URL",
  `email` varchar(100) NULL COMMENT "Email Address",
  `mobile` varchar(20) NOT NULL COMMENT "Mobile Phone",
  `user_id` bigint unsigned NULL COMMENT "Associated User ID (NULL if no user account)",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "Employee Status: 1-Active, 2-Resigned",
  `out_employee_id` varchar(100) NULL COMMENT "External Employee ID",
  `employee_source` tinyint unsigned NULL COMMENT "Data Source: 1-Enterprise WeChat,2-DingTalk,3-Feishu,4-Manual",
  `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_employee_source` (`employee_source`),
  INDEX `idx_status` (`status`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE INDEX `uk_email` (`email`),
  UNIQUE INDEX `uk_employee_no` (`employee_no`),
  UNIQUE INDEX `uk_mobile` (`mobile`),
  UNIQUE INDEX `uk_out_emp_source` (`out_employee_id`, `employee_source`),
  UNIQUE INDEX `uk_user_id` (`user_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Employee Info Table";
-- Create "corporation_employee_department" table
CREATE TABLE IF NOT EXISTS `corporation_employee_department` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Relationship ID",
  `employee_id` bigint unsigned NOT NULL COMMENT "Employee ID",
  `department_id` bigint unsigned NOT NULL COMMENT "Department ID",
  `corp_id` bigint unsigned NOT NULL COMMENT "Corporation ID (departments corporation)",
  `job_title` varchar(100) NULL COMMENT "Job Title",
  `is_primary` tinyint NOT NULL DEFAULT 0 COMMENT "Is Primary Department: 0-No, 1-Yes",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "Status: 1-Active, 2-Transferred",
  `creator_id` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Deletion timestamp",
  PRIMARY KEY (`id`),
  INDEX `idx_corp_id` (`corp_id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_department_id` (`department_id`),
  INDEX `idx_dept_status` (`department_id`, `status`),
  INDEX `idx_employee_corp` (`employee_id`, `corp_id`),
  INDEX `idx_employee_id` (`employee_id`),
  INDEX `idx_is_primary` (`is_primary`),
  INDEX `idx_status` (`status`),
  UNIQUE INDEX `uk_employee_department` (`employee_id`, `department_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Employee Department Relationship Table";
-- Create "data_copy_task" table
CREATE TABLE IF NOT EXISTS `data_copy_task` (
  `master_task_id` varchar(128) NULL DEFAULT "" COMMENT "task id",
  `origin_data_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "origin data id",
  `target_data_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "target data id",
  `origin_space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "origin space id",
  `target_space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "target space id",
  `origin_user_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "origin user id",
  `target_user_id` bigint unsigned NULL DEFAULT 0 COMMENT "target user id",
  `origin_app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "origin app id",
  `target_app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "target app id",
  `data_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "data type 1:knowledge, 2:database",
  `ext_info` varchar(255) NOT NULL DEFAULT "" COMMENT "ext",
  `start_time` bigint NULL DEFAULT 0 COMMENT "task start time",
  `finish_time` bigint NULL COMMENT "task finish time",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "1: Create 2: Running 3: Success 4: Failure",
  `error_msg` varchar(128) NULL COMMENT "error msg",
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_master_task_id_origin_data_id_data_type` (`master_task_id`, `origin_data_id`, `data_type`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "data copy task record";
-- Create "draft_database_info" table
CREATE TABLE IF NOT EXISTS `draft_database_info` (
  `id` bigint unsigned NOT NULL COMMENT "ID",
  `app_id` bigint unsigned NULL COMMENT "App ID",
  `space_id` bigint unsigned NOT NULL COMMENT "Space ID",
  `related_online_id` bigint unsigned NOT NULL COMMENT "The primary key ID of online_database_info table",
  `is_visible` tinyint NOT NULL DEFAULT 1 COMMENT "Visibility: 0 invisible, 1 visible",
  `prompt_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Support prompt calls: 1 not supported, 0 supported",
  `table_name` varchar(255) NOT NULL COMMENT "Table name",
  `table_desc` varchar(256) NULL COMMENT "Table description",
  `table_field` text NULL COMMENT "Table field info",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `icon_uri` varchar(255) NOT NULL COMMENT "Icon Uri",
  `physical_table_name` varchar(255) NULL COMMENT "The name of the real physical table",
  `rw_mode` bigint NOT NULL DEFAULT 1 COMMENT "Read and write permission modes: 1. Limited read and write mode 2. Read-only mode 3. Full read and write mode",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_space_app_creator_deleted` (`space_id`, `app_id`, `creator_id`, `deleted_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "draft database info";
-- Create "files" table
CREATE TABLE IF NOT EXISTS `files` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "file name",
  `file_size` bigint unsigned NOT NULL DEFAULT 0 COMMENT "file size",
  `tos_uri` varchar(1024) NOT NULL DEFAULT "" COMMENT "TOS URI",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "status，0invalid，1valid",
  `comment` varchar(1024) NOT NULL DEFAULT "" COMMENT "file comment",
  `source` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "source：1 from API,",
  `creator_id` varchar(512) NOT NULL DEFAULT "" COMMENT "creator id",
  `content_type` varchar(255) NOT NULL DEFAULT "" COMMENT "content type",
  `coze_account_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "coze account id",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "file resource table";
-- Create "knowledge" table
CREATE TABLE IF NOT EXISTS `knowledge` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `name` varchar(150) NOT NULL DEFAULT "" COMMENT "knowledge_s name",
  `app_id` bigint NOT NULL DEFAULT 0 COMMENT "app id",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "creator id",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "space id",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  `status` tinyint NOT NULL DEFAULT 1 COMMENT "0 initialization, 1 effective, 2 invalid",
  `description` text NULL COMMENT "description",
  `icon_uri` varchar(150) NULL COMMENT "icon uri",
  `format_type` tinyint NOT NULL DEFAULT 0 COMMENT "0: Text 1: Table 2: Images",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id` (`app_id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_space_id_deleted_at_updated_at` (`space_id`, `deleted_at`, `updated_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "knowledge tabke";
-- Create "knowledge_document" table
CREATE TABLE IF NOT EXISTS `knowledge_document` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `knowledge_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "knowledge id",
  `name` varchar(150) NOT NULL DEFAULT "" COMMENT "document name",
  `file_extension` varchar(20) NOT NULL DEFAULT "0" COMMENT "Document type, txt/pdf/csv etc..",
  `document_type` int NOT NULL DEFAULT 0 COMMENT "Document type: 0: Text 1: Table 2: Image",
  `uri` text NULL COMMENT "uri",
  `size` bigint unsigned NOT NULL DEFAULT 0 COMMENT "document size",
  `slice_count` bigint unsigned NOT NULL DEFAULT 0 COMMENT "slice count",
  `char_count` bigint unsigned NOT NULL DEFAULT 0 COMMENT "number of characters",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "creator id",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "space id",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  `source_type` int NULL DEFAULT 0 COMMENT "0: Local file upload, 2: Custom text, 103: Feishu 104: Lark",
  `status` int NOT NULL DEFAULT 0 COMMENT "status",
  `fail_reason` text NULL COMMENT "fail reason",
  `parse_rule` json NULL COMMENT "parse rule",
  `table_info` json NULL COMMENT "table info",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_knowledge_id_deleted_at_updated_at` (`knowledge_id`, `deleted_at`, `updated_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "knowledge document info";
-- Create "knowledge_document_review" table
CREATE TABLE IF NOT EXISTS `knowledge_document_review` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "id",
  `knowledge_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "knowledge id",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "space id",
  `name` varchar(150) NOT NULL DEFAULT "" COMMENT "name",
  `type` varchar(10) NOT NULL DEFAULT "0" COMMENT "document type",
  `uri` text NULL COMMENT "uri",
  `format_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0 text, 1 table, 2 images",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0 Processing 1 Completed 2 Failed 3 Expired",
  `chunk_resp_uri` text NULL COMMENT "pre-sliced uri",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "creator id",
  PRIMARY KEY (`id`),
  INDEX `idx_dataset_id` (`knowledge_id`, `status`, `updated_at`),
  INDEX `idx_uri` (`uri` (100))
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Document slice preview info";
-- Create "knowledge_document_slice" table
CREATE TABLE IF NOT EXISTS `knowledge_document_slice` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "id",
  `knowledge_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "knowledge id",
  `document_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "document_id",
  `content` text NULL COMMENT "content",
  `sequence` decimal(20,5) NOT NULL COMMENT "slice sequence number, starting from 1",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "creator id",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "space id",
  `status` int NOT NULL DEFAULT 0 COMMENT "status",
  `fail_reason` text NULL COMMENT "fail reason",
  `hit` bigint unsigned NOT NULL DEFAULT 0 COMMENT "hit counts ",
  PRIMARY KEY (`id`),
  INDEX `idx_document_id_deleted_at_sequence` (`document_id`, `deleted_at`, `sequence`),
  INDEX `idx_knowledge_id_document_id` (`knowledge_id`, `document_id`),
  INDEX `idx_sequence` (`sequence`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "knowledge document slice";
-- Create "kv_entries" table
CREATE TABLE IF NOT EXISTS `kv_entries` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `namespace` varchar(255) NOT NULL COMMENT "namespace",
  `key_data` varchar(255) NOT NULL COMMENT "key_data",
  `value_data` longblob NULL COMMENT "value_data",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_namespace_key` (`namespace`, `key_data`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "kv data";
-- Create "message" table
CREATE TABLE IF NOT EXISTS `message` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `run_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "run_id",
  `conversation_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "conversation id",
  `user_id` varchar(60) NOT NULL DEFAULT "" COMMENT "user id",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "agent_id",
  `role` varchar(100) NOT NULL DEFAULT "" COMMENT "role: user、assistant、system",
  `content_type` varchar(100) NOT NULL DEFAULT "" COMMENT "content type 1 text",
  `content` mediumtext NULL COMMENT "content",
  `message_type` varchar(100) NOT NULL DEFAULT "" COMMENT "message_type",
  `display_content` text NULL COMMENT "display content",
  `ext` text NULL COMMENT "message ext" COLLATE utf8mb4_general_ci,
  `section_id` bigint unsigned NULL COMMENT "section_id",
  `broken_position` int NULL DEFAULT -1 COMMENT "broken position",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "message status: 1 Available 2 Deleted 3 Replaced 4 Broken 5 Failed 6 Streaming 7 Pending",
  `model_content` mediumtext NULL COMMENT "model content",
  `meta_info` text NULL COMMENT "text tagging information such as citation and highlighting",
  `reasoning_content` text NULL COMMENT "reasoning content" COLLATE utf8mb4_general_ci,
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_conversation_id` (`conversation_id`),
  INDEX `idx_run_id` (`run_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "message record";
-- Create "model_entity" table
CREATE TABLE IF NOT EXISTS `model_entity` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `meta_id` bigint unsigned NOT NULL COMMENT "model metadata id",
  `name` varchar(128) NOT NULL COMMENT "name",
  `description` text NULL COMMENT "description",
  `default_params` json NULL COMMENT "default params",
  `scenario` bigint unsigned NOT NULL COMMENT "scenario",
  `status` int NOT NULL DEFAULT 1 COMMENT "model status",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` bigint unsigned NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_scenario` (`scenario`),
  INDEX `idx_status` (`status`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Model information";
-- Create "model_instance" table
CREATE TABLE IF NOT EXISTS `model_instance` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `type` tinyint NOT NULL COMMENT "Model Type 0-LLM 1-TextEmbedding 2-Rerank ",
  `provider` json NOT NULL COMMENT "Provider Information",
  `display_info` json NOT NULL COMMENT "Display Information",
  `connection` json NOT NULL COMMENT "Connection Information",
  `capability` json NOT NULL COMMENT "Model Capability",
  `parameters` json NOT NULL COMMENT "Model Parameters",
  `extra` json NULL COMMENT "Extra Information",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Model Instance Management Table";
-- Create "model_meta" table
CREATE TABLE IF NOT EXISTS `model_meta` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `model_name` varchar(128) NOT NULL COMMENT "model name",
  `protocol` varchar(128) NOT NULL COMMENT "model protocol",
  `icon_uri` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `capability` json NULL COMMENT "capability",
  `conn_config` json NULL COMMENT "model conn config",
  `status` int NOT NULL DEFAULT 1 COMMENT "model status",
  `description` varchar(2048) NOT NULL DEFAULT "" COMMENT "description",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` bigint unsigned NULL COMMENT "Delete Time",
  `icon_url` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URL",
  PRIMARY KEY (`id`),
  INDEX `idx_status` (`status`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Model metadata";
-- Create "node_execution" table
CREATE TABLE IF NOT EXISTS `node_execution` (
  `id` bigint unsigned NOT NULL COMMENT "node execution id",
  `execute_id` bigint unsigned NOT NULL COMMENT "the workflow execute id this node execution belongs to",
  `node_id` varchar(128) NOT NULL COMMENT "node key",
  `node_name` varchar(128) NOT NULL COMMENT "name of the node",
  `node_type` varchar(128) NOT NULL COMMENT "the type of the node, in string",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `status` tinyint unsigned NOT NULL COMMENT "1=waiting 2=running 3=success 4=fail",
  `duration` bigint unsigned NULL COMMENT "execution duration in millisecond",
  `input` mediumtext NULL COMMENT "actual input of the node",
  `output` mediumtext NULL COMMENT "actual output of the node",
  `raw_output` mediumtext NULL COMMENT "the original output of the node",
  `error_info` mediumtext NULL COMMENT "error info",
  `error_level` varchar(32) NULL COMMENT "level of the error",
  `input_tokens` bigint unsigned NULL COMMENT "number of input tokens",
  `output_tokens` bigint unsigned NULL COMMENT "number of output tokens",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `composite_node_index` bigint unsigned NULL COMMENT "loop or batch_s execution index",
  `composite_node_items` mediumtext NULL COMMENT "the items extracted from parent composite node for this index",
  `parent_node_id` varchar(128) NULL COMMENT "when as inner node for loop or batch, this is the parent node_s key",
  `sub_execute_id` bigint unsigned NULL COMMENT "if this node is sub_workflow, the exe id of the sub workflow",
  `extra` mediumtext NULL COMMENT "extra info",
  PRIMARY KEY (`id`),
  INDEX `idx_execute_id_node_id` (`execute_id`, `node_id`),
  INDEX `idx_execute_id_parent_node_id` (`execute_id`, `parent_node_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Node run record, used to record the status information of each node during each workflow execution";
-- Create "online_database_info" table
CREATE TABLE IF NOT EXISTS `online_database_info` (
  `id` bigint unsigned NOT NULL COMMENT "ID",
  `app_id` bigint unsigned NULL COMMENT "App ID",
  `space_id` bigint unsigned NOT NULL COMMENT "Space ID",
  `related_draft_id` bigint unsigned NOT NULL COMMENT "The primary key ID of draft_database_info table",
  `is_visible` tinyint NOT NULL DEFAULT 1 COMMENT "Visibility: 0 invisible, 1 visible",
  `prompt_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Support prompt calls: 1 not supported, 0 supported",
  `table_name` varchar(255) NOT NULL COMMENT "Table name",
  `table_desc` varchar(256) NULL COMMENT "Table description",
  `table_field` text NULL COMMENT "Table field info",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `icon_uri` varchar(255) NOT NULL COMMENT "Icon Uri",
  `physical_table_name` varchar(255) NULL COMMENT "The name of the real physical table",
  `rw_mode` bigint NOT NULL DEFAULT 1 COMMENT "Read and write permission modes: 1. Limited read and write mode 2. Read-only mode 3. Full read and write mode",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_space_app_creator_deleted` (`space_id`, `app_id`, `creator_id`, `deleted_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "online database info";
-- Create "permission_template" table
CREATE TABLE IF NOT EXISTS `permission_template` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Template ID",
  `template_code` varchar(50) NOT NULL COMMENT "Template code",
  `template_name` varchar(100) NOT NULL COMMENT "Template name",
  `domain` varchar(50) NOT NULL COMMENT "Permission domain: global-Global permissions, space-Space permissions",
  `resource` varchar(50) NOT NULL COMMENT "Resource type: agent, workflow, knowledge etc",
  `resource_name` varchar(100) NOT NULL COMMENT "Resource Chinese name",
  `action` varchar(50) NOT NULL COMMENT "Action type: create, read, update, delete etc",
  `action_name` varchar(100) NOT NULL COMMENT "Action Chinese name",
  `description` text NULL COMMENT "Permission description",
  `is_default` tinyint NOT NULL DEFAULT 0 COMMENT "Is default enabled: 0-No, 1-Yes",
  `sort_order` int NOT NULL DEFAULT 0 COMMENT "Sort weight",
  `is_active` tinyint NOT NULL DEFAULT 1 COMMENT "Is active: 0-Disabled, 1-Enabled",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation time",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update time",
  PRIMARY KEY (`id`),
  INDEX `idx_domain` (`domain`),
  INDEX `idx_is_active` (`is_active`),
  INDEX `idx_resource` (`resource`),
  INDEX `idx_sort_order` (`sort_order`),
  INDEX `idx_template_code` (`template_code`),
  UNIQUE INDEX `uniq_template_domain_resource_action` (`template_code`, `domain`, `resource`, `action`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Permission template table";
-- Create "plugin" table
CREATE TABLE IF NOT EXISTS `plugin` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `developer_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Developer ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `server_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Server URL",
  `plugin_type` tinyint NOT NULL DEFAULT 0 COMMENT "Plugin Type, 1:http, 6:local",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Plugin Version, e.g. v1.0.0",
  `version_desc` text NULL COMMENT "Plugin Version Description",
  `manifest` json NULL COMMENT "Plugin Manifest",
  `openapi_doc` json NULL COMMENT "OpenAPI Document, only stores the root",
  PRIMARY KEY (`id`),
  INDEX `idx_space_created_at` (`space_id`, `created_at`),
  INDEX `idx_space_updated_at` (`space_id`, `updated_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Latest Plugin";
-- Create "plugin_draft" table
CREATE TABLE IF NOT EXISTS `plugin_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `developer_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Developer ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `server_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Server URL",
  `plugin_type` tinyint NOT NULL DEFAULT 0 COMMENT "Plugin Type, 1:http, 6:local",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  `manifest` json NULL COMMENT "Plugin Manifest",
  `openapi_doc` json NULL COMMENT "OpenAPI Document, only stores the root",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id` (`app_id`, `id`),
  INDEX `idx_space_app_created_at` (`space_id`, `app_id`, `created_at`),
  INDEX `idx_space_app_updated_at` (`space_id`, `app_id`, `updated_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Plugin";
-- Create "plugin_oauth_auth" table
CREATE TABLE IF NOT EXISTS `plugin_oauth_auth` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key",
  `user_id` varchar(255) NOT NULL DEFAULT "" COMMENT "User ID",
  `plugin_id` bigint NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `is_draft` bool NOT NULL DEFAULT 0 COMMENT "Is Draft Plugin",
  `oauth_config` json NULL COMMENT "Authorization Code OAuth Config",
  `access_token` text NULL COMMENT "Access Token",
  `refresh_token` text NULL COMMENT "Refresh Token",
  `token_expired_at` bigint NULL COMMENT "Token Expired in Milliseconds",
  `next_token_refresh_at` bigint NULL COMMENT "Next Token Refresh Time in Milliseconds",
  `last_active_at` bigint NULL COMMENT "Last active time in Milliseconds",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_last_active_at` (`last_active_at`),
  INDEX `idx_last_token_expired_at` (`token_expired_at`),
  INDEX `idx_next_token_refresh_at` (`next_token_refresh_at`),
  UNIQUE INDEX `uniq_idx_user_plugin_is_draft` (`user_id`, `plugin_id`, `is_draft`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Plugin OAuth Authorization Code Info";
-- Create "plugin_version" table
CREATE TABLE IF NOT EXISTS `plugin_version` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `developer_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Developer ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `app_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Application ID",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `server_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Server URL",
  `plugin_type` tinyint NOT NULL DEFAULT 0 COMMENT "Plugin Type, 1:http, 6:local",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Plugin Version, e.g. v1.0.0",
  `version_desc` text NULL COMMENT "Plugin Version Description",
  `manifest` json NULL COMMENT "Plugin Manifest",
  `openapi_doc` json NULL COMMENT "OpenAPI Document, only stores the root",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_idx_plugin_version` (`plugin_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Plugin Version";
-- Create "prompt_resource" table
CREATE TABLE IF NOT EXISTS `prompt_resource` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `space_id` bigint NOT NULL COMMENT "space id",
  `name` varchar(255) NOT NULL COMMENT "name" COLLATE utf8mb4_0900_ai_ci,
  `description` varchar(255) NOT NULL COMMENT "description" COLLATE utf8mb4_0900_ai_ci,
  `prompt_text` mediumtext NULL COMMENT "prompt text" COLLATE utf8mb4_0900_ai_ci,
  `status` int NOT NULL COMMENT "status, 0 is invalid, 1 is valid",
  `creator_id` bigint NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "prompt_resource";
-- Create "role" table
CREATE TABLE IF NOT EXISTS `role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Role ID",
  `role_code` varchar(50) NOT NULL COMMENT "Role code",
  `role_name` varchar(100) NOT NULL COMMENT "Role name",
  `role_domain` varchar(50) NOT NULL DEFAULT "global" COMMENT "Permission domain: global-Global permissions, space-Space permissions",
  `super_admin` tinyint NOT NULL DEFAULT 0 COMMENT "Is super admin: 0-No, 1-Yes",
  `space_role_type` tinyint NULL COMMENT "Space role type: 1-owner, 2-admin, 3-member (only valid when role_domain=space)",
  `is_builtin` tinyint NOT NULL DEFAULT 0 COMMENT "Is builtin role: 0-No, 1-Yes",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "Is disabled: 0-Enabled, 1-Disabled",
  `permissions` json NULL COMMENT "Permission matrix JSON configuration",
  `description` text NULL COMMENT "Role description",
  `created_by` bigint unsigned NOT NULL COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0,
  `updated_at` bigint unsigned NOT NULL DEFAULT 0,
  `deleted_at` datetime(3) NULL COMMENT "Soft delete timestamp (NULL means not deleted)",
  PRIMARY KEY (`id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_is_builtin` (`is_builtin`),
  INDEX `idx_is_disabled` (`is_disabled`),
  INDEX `idx_role_domain` (`role_domain`),
  INDEX `idx_space_role_type` (`space_role_type`),
  INDEX `idx_super_admin` (`super_admin`),
  UNIQUE INDEX `uniq_role_code` (`role_code`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Role definition table";
-- Create "run_record" table
CREATE TABLE IF NOT EXISTS `run_record` (
  `id` bigint unsigned NOT NULL COMMENT "id",
  `conversation_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "conversation id",
  `section_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "section ID",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "agent_id",
  `user_id` varchar(255) NOT NULL DEFAULT "" COMMENT "user id",
  `source` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "Execute source 0 API",
  `status` varchar(255) NOT NULL DEFAULT "" COMMENT "status,0 Unknown, 1-Created,2-InProgress,3-Completed,4-Failed,5-Expired,6-Cancelled,7-RequiresAction",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `failed_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Fail Time in Milliseconds",
  `last_error` text NULL COMMENT "error message" COLLATE utf8mb4_general_ci,
  `completed_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Finish Time in Milliseconds",
  `chat_request` text NULL COMMENT "Original request field" COLLATE utf8mb4_general_ci,
  `ext` text NULL COMMENT "ext" COLLATE utf8mb4_general_ci,
  `usage` json NULL COMMENT "usage",
  PRIMARY KEY (`id`),
  INDEX `idx_c_s` (`conversation_id`, `section_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "run record";
-- Create "shortcut_command" table
CREATE TABLE IF NOT EXISTS `shortcut_command` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `object_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Entity ID, this command can be used for this entity",
  `command_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "command id",
  `command_name` varchar(255) NOT NULL DEFAULT "" COMMENT "command name",
  `shortcut_command` varchar(255) NOT NULL DEFAULT "" COMMENT "shortcut command",
  `description` varchar(2000) NOT NULL DEFAULT "" COMMENT "description",
  `send_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "send type 0:query 1:panel",
  `tool_type` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "Type 1 of tool used: WorkFlow 2: Plugin",
  `work_flow_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "workflow id",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "plugin id",
  `plugin_tool_name` varchar(255) NOT NULL DEFAULT "" COMMENT "plugin tool name",
  `template_query` text NULL COMMENT "template query",
  `components` json NULL COMMENT "Panel parameters",
  `card_schema` text NULL COMMENT "card schema",
  `tool_info` json NULL COMMENT "Tool information includes name+variable list",
  `status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "Status, 0 is invalid, 1 is valid",
  `creator_id` bigint unsigned NULL DEFAULT 0 COMMENT "creator id",
  `is_online` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "Is online information: 0 draft 1 online",
  `created_at` bigint NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "When executing a multi instruction, which node executes the instruction",
  `shortcut_icon` json NULL COMMENT "shortcut icon",
  `plugin_tool_id` bigint NOT NULL DEFAULT 0 COMMENT "tool_id",
  `source` tinyint NULL DEFAULT 0 COMMENT "plugin source 1 coze saas 0 default",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_object_command_id_type` (`object_id`, `command_id`, `is_online`)
) CHARSET utf8mb4 COLLATE utf8mb4_general_ci COMMENT "bot shortcut command table";
-- Create "single_agent_draft" table
CREATE TABLE IF NOT EXISTS `single_agent_draft` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "Space ID",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Name",
  `description` text NULL COMMENT "Agent Description",
  `icon_uri` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  `variables_meta_id` bigint NULL COMMENT "variables meta table ID",
  `model_info` json NULL COMMENT "Model Configuration Information",
  `onboarding_info` json NULL COMMENT "Onboarding Information",
  `prompt` json NULL COMMENT "Agent Prompt Configuration",
  `plugin` json NULL COMMENT "Agent Plugin Base Configuration",
  `knowledge` json NULL COMMENT "Agent Knowledge Base Configuration",
  `workflow` json NULL COMMENT "Agent Workflow Configuration",
  `suggest_reply` json NULL COMMENT "Suggested Replies",
  `jump_config` json NULL COMMENT "Jump Configuration",
  `background_image_info_list` json NULL COMMENT "Background image",
  `database_config` json NULL COMMENT "Agent Database Base Configuration",
  `shortcut_command` json NULL COMMENT "shortcut command",
  `bot_mode` tinyint NOT NULL DEFAULT 0 COMMENT "bot mode,0:single mode 2:chatflow mode",
  `layout_info` text NULL COMMENT "chatflow layout info",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  UNIQUE INDEX `uniq_agent_id` (`agent_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Single Agent Draft Copy Table";
-- Create "single_agent_publish" table
CREATE TABLE IF NOT EXISTS `single_agent_publish` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "id",
  `agent_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "agent_id",
  `publish_id` varchar(50) NOT NULL DEFAULT "" COMMENT "publish id" COLLATE utf8mb4_general_ci,
  `connector_ids` json NULL COMMENT "connector_ids",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Version",
  `publish_info` text NULL COMMENT "publish info" COLLATE utf8mb4_general_ci,
  `publish_time` bigint unsigned NOT NULL DEFAULT 0 COMMENT "publish time",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "creator id",
  `status` tinyint NOT NULL DEFAULT 0 COMMENT "Status 0: In use 1: Delete 3: Disabled",
  `extra` json NULL COMMENT "extra",
  PRIMARY KEY (`id`),
  INDEX `idx_agent_id_version` (`agent_id`, `version`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_publish_id` (`publish_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Bot connector and release version info";
-- Create "single_agent_version" table
CREATE TABLE IF NOT EXISTS `single_agent_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `creator_id` bigint NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "Space ID",
  `name` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Name",
  `description` text NULL COMMENT "Agent Description",
  `icon_uri` varchar(255) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  `variables_meta_id` bigint NULL COMMENT "variables meta table ID",
  `model_info` json NULL COMMENT "Model Configuration Information",
  `onboarding_info` json NULL COMMENT "Onboarding Information",
  `prompt` json NULL COMMENT "Agent Prompt Configuration",
  `plugin` json NULL COMMENT "Agent Plugin Base Configuration",
  `knowledge` json NULL COMMENT "Agent Knowledge Base Configuration",
  `workflow` json NULL COMMENT "Agent Workflow Configuration",
  `suggest_reply` json NULL COMMENT "Suggested Replies",
  `jump_config` json NULL COMMENT "Jump Configuration",
  `connector_id` bigint unsigned NOT NULL COMMENT "Connector ID",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Agent Version",
  `background_image_info_list` json NULL COMMENT "Background image",
  `database_config` json NULL COMMENT "Agent Database Base Configuration",
  `shortcut_command` json NULL COMMENT "shortcut command",
  `bot_mode` tinyint NOT NULL DEFAULT 0 COMMENT "bot mode,0:single mode 2:chatflow mode",
  `layout_info` text NULL COMMENT "chatflow layout info",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  UNIQUE INDEX `uniq_agent_id_and_version_connector_id` (`agent_id`, `version`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Single Agent Version Copy Table";
-- Create "space" table
CREATE TABLE IF NOT EXISTS `space` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID, Space ID",
  `owner_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Owner ID",
  `name` varchar(200) NOT NULL DEFAULT "" COMMENT "Space Name",
  `description` varchar(2000) NOT NULL DEFAULT "" COMMENT "Space Description",
  `icon_uri` varchar(200) NOT NULL DEFAULT "" COMMENT "Icon URI",
  `creator_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creator ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation Time (Milliseconds)",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time (Milliseconds)",
  `deleted_at` bigint unsigned NULL COMMENT "Deletion Time (Milliseconds)",
  PRIMARY KEY (`id`),
  INDEX `idx_creator_id` (`creator_id`),
  INDEX `idx_owner_id` (`owner_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Space Table";
-- Create "space_user" table
CREATE TABLE IF NOT EXISTS `space_user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID, Auto Increment",
  `space_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Space ID",
  `user_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "User ID",
  `role_type` int NOT NULL DEFAULT 3 COMMENT "Role Type: 1.owner 2.admin 3.member",
  `role_id` bigint unsigned NULL COMMENT "Custom role ID (NULL uses role_type)",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation Time (Milliseconds)",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time (Milliseconds)",
  `expired_at` bigint unsigned NULL COMMENT "Permission expiration time (NULL means permanent)",
  PRIMARY KEY (`id`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE INDEX `uniq_space_user` (`space_id`, `user_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Space Member Table";
-- Create "template" table
CREATE TABLE IF NOT EXISTS `template` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `agent_id` bigint NOT NULL DEFAULT 0 COMMENT "Agent ID",
  `workflow_id` bigint NOT NULL DEFAULT 0 COMMENT "Workflow ID",
  `space_id` bigint NOT NULL DEFAULT 0 COMMENT "Space ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `heat` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Heat",
  `product_entity_type` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Product Entity Type",
  `meta_info` json NULL COMMENT "Meta Info",
  `agent_extra` json NULL COMMENT "Agent Extra Info",
  `workflow_extra` json NULL COMMENT "Workflow Extra Info",
  `project_extra` json NULL COMMENT "Project Extra Info",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_agent_id` (`agent_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Template Info Table";
-- Create "tool" table
CREATE TABLE IF NOT EXISTS `tool` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `activated_status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0:activated; 1:deactivated",
  PRIMARY KEY (`id`),
  INDEX `idx_plugin_activated_status` (`plugin_id`, `activated_status`),
  UNIQUE INDEX `uniq_idx_plugin_sub_url_method` (`plugin_id`, `sub_url`, `method`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Latest Tool";
-- Create "tool_draft" table
CREATE TABLE IF NOT EXISTS `tool_draft` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `debug_status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0:not pass; 1:pass",
  `activated_status` tinyint unsigned NOT NULL DEFAULT 0 COMMENT "0:activated; 1:deactivated",
  PRIMARY KEY (`id`),
  INDEX `idx_plugin_created_at_id` (`plugin_id`, `created_at`, `id`),
  UNIQUE INDEX `uniq_idx_plugin_sub_url_method` (`plugin_id`, `sub_url`, `method`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Draft Tool";
-- Create "tool_version" table
CREATE TABLE IF NOT EXISTS `tool_version` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Primary Key ID",
  `tool_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Tool ID",
  `plugin_id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Plugin ID",
  `version` varchar(255) NOT NULL DEFAULT "" COMMENT "Tool Version, e.g. v1.0.0",
  `sub_url` varchar(512) NOT NULL DEFAULT "" COMMENT "Sub URL Path",
  `method` varchar(64) NOT NULL DEFAULT "" COMMENT "HTTP Request Method",
  `operation` json NULL COMMENT "Tool Openapi Operation Schema",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `deleted_at` datetime NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_idx_tool_version` (`tool_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Tool Version";
-- Create "user" table
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "Primary Key ID",
  `name` varchar(128) NOT NULL DEFAULT "" COMMENT "User Nickname",
  `unique_name` varchar(128) NOT NULL DEFAULT "" COMMENT "User Unique Name",
  `email` varchar(128) NOT NULL DEFAULT "" COMMENT "Email",
  `password` varchar(128) NOT NULL DEFAULT "" COMMENT "Password (Encrypted)",
  `description` varchar(512) NOT NULL DEFAULT "" COMMENT "User Description",
  `icon_uri` varchar(512) NOT NULL DEFAULT "" COMMENT "Avatar URI",
  `user_verified` bool NOT NULL DEFAULT 0 COMMENT "User Verification Status",
  `is_disabled` tinyint NOT NULL DEFAULT 0 COMMENT "User status: 0-enabled, 1-disabled",
  `locale` varchar(128) NOT NULL DEFAULT "" COMMENT "Locale",
  `created_by` bigint unsigned NULL COMMENT "Creator user ID",
  `session_key` varchar(256) NOT NULL DEFAULT "" COMMENT "Session Key",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Creation Time (Milliseconds)",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time (Milliseconds)",
  `deleted_at` bigint unsigned NULL COMMENT "Deletion Time (Milliseconds)",
  `deleted_by` bigint unsigned NULL COMMENT "Deleter user ID",
  PRIMARY KEY (`id`),
  INDEX `idx_created_by` (`created_by`),
  INDEX `idx_deleted_by` (`deleted_by`),
  INDEX `idx_is_disabled` (`is_disabled`),
  INDEX `idx_session_key` (`session_key`),
  UNIQUE INDEX `uniq_email` (`email`),
  UNIQUE INDEX `uniq_unique_name` (`unique_name`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "User Table";
-- Create "user_role" table
CREATE TABLE IF NOT EXISTS `user_role` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL COMMENT "User ID",
  `role_id` bigint unsigned NOT NULL COMMENT "Role ID",
  `assigned_by` bigint unsigned NOT NULL COMMENT "Assigner ID",
  `assigned_at` bigint unsigned NOT NULL COMMENT "Assignment time",
  `expired_at` bigint unsigned NULL COMMENT "Expiration time (NULL means permanent)",
  `deleted_at` datetime(3) NULL COMMENT "Soft delete timestamp (NULL means not deleted)",
  PRIMARY KEY (`id`),
  INDEX `idx_deleted_at` (`deleted_at`),
  INDEX `idx_expired_at` (`expired_at`),
  INDEX `idx_role_id` (`role_id`),
  INDEX `idx_user_id` (`user_id`),
  UNIQUE INDEX `uniq_user_role_active` (`user_id`, `role_id`, `deleted_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "User role relationship table";
-- Create "variable_instance" table
CREATE TABLE IF NOT EXISTS `variable_instance` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "id",
  `biz_type` tinyint unsigned NOT NULL COMMENT "1 for agent，2 for app",
  `biz_id` varchar(128) NOT NULL DEFAULT "" COMMENT "1 for agent_id，2 for app_id" COLLATE utf8mb4_0900_ai_ci,
  `version` varchar(255) NOT NULL COMMENT "agent or project version empty represents draft status" COLLATE utf8mb4_0900_ai_ci,
  `keyword` varchar(255) NOT NULL COMMENT "Keyword to Memory" COLLATE utf8mb4_0900_ai_ci,
  `type` tinyint NOT NULL COMMENT "Memory type 1 KV 2 list",
  `content` text NULL COMMENT "content" COLLATE utf8mb4_0900_ai_ci,
  `connector_uid` varchar(255) NOT NULL COMMENT "connector_uid" COLLATE utf8mb4_0900_ai_ci,
  `connector_id` bigint NOT NULL COMMENT "connector_id, e.g. coze = 10000010",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  PRIMARY KEY (`id`),
  INDEX `idx_connector_key` (`biz_id`, `biz_type`, `version`, `connector_uid`, `connector_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "KV Memory";
-- Create "variables_meta" table
CREATE TABLE IF NOT EXISTS `variables_meta` (
  `id` bigint unsigned NOT NULL DEFAULT 0 COMMENT "id",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `biz_type` tinyint unsigned NOT NULL COMMENT "1 for agent，2 for app",
  `biz_id` varchar(128) NOT NULL DEFAULT "" COMMENT "1 for agent_id，2 for app_id" COLLATE utf8mb4_0900_ai_ci,
  `variable_list` json NULL COMMENT "JSON data for variable configuration",
  `created_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Create Time in Milliseconds",
  `updated_at` bigint unsigned NOT NULL DEFAULT 0 COMMENT "Update Time in Milliseconds",
  `version` varchar(255) NOT NULL COMMENT "Project version, empty represents draft status" COLLATE utf8mb4_0900_ai_ci,
  PRIMARY KEY (`id`),
  INDEX `idx_user_key` (`creator_id`),
  UNIQUE INDEX `uniq_project_key` (`biz_id`, `biz_type`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "KV Memory meta";
-- Create "workflow_draft" table
CREATE TABLE IF NOT EXISTS `workflow_draft` (
  `id` bigint unsigned NOT NULL COMMENT "workflow ID",
  `canvas` mediumtext NULL COMMENT "Front end schema",
  `input_params` mediumtext NULL COMMENT "Input schema",
  `output_params` mediumtext NULL COMMENT "Output parameter schema",
  `test_run_success` bool NOT NULL DEFAULT 0 COMMENT "0 not running, 1 running successfully",
  `modified` bool NOT NULL DEFAULT 0 COMMENT "0 has not been modified, 1 has been modified",
  `updated_at` bigint unsigned NULL COMMENT "Update Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  `commit_id` varchar(255) NOT NULL COMMENT "used to uniquely identify a draft snapshot",
  PRIMARY KEY (`id`),
  INDEX `idx_updated_at` (`updated_at` DESC)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Workflow canvas draft table, used to record the latest draft canvas information of workflow";
-- Create "workflow_execution" table
CREATE TABLE IF NOT EXISTS `workflow_execution` (
  `id` bigint unsigned NOT NULL COMMENT "execute id",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow_id",
  `version` varchar(50) NULL COMMENT "workflow version. empty if is draft",
  `space_id` bigint unsigned NOT NULL COMMENT "the space id the workflow belongs to",
  `mode` tinyint unsigned NOT NULL COMMENT "the execution mode: 1. debug run 2. release run 3. node debug",
  `operator_id` bigint unsigned NOT NULL COMMENT "the user id that runs this workflow",
  `connector_id` bigint unsigned NULL COMMENT "the connector on which this execution happened",
  `connector_uid` varchar(64) NULL COMMENT "user id of the connector",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `log_id` varchar(128) NULL COMMENT "log id",
  `status` tinyint unsigned NULL COMMENT "1=running 2=success 3=fail 4=interrupted",
  `duration` bigint unsigned NULL COMMENT "execution duration in millisecond",
  `input` mediumtext NULL COMMENT "actual input of this execution",
  `output` mediumtext NULL COMMENT "the actual output of this execution",
  `error_code` varchar(255) NULL COMMENT "error code if any",
  `fail_reason` mediumtext NULL COMMENT "the reason for failure",
  `input_tokens` bigint unsigned NULL COMMENT "number of input tokens",
  `output_tokens` bigint unsigned NULL COMMENT "number of output tokens",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `root_execution_id` bigint unsigned NULL COMMENT "the top level execution id. Null if this is the root",
  `parent_node_id` varchar(128) NULL COMMENT "the node key for the sub_workflow node that executes this workflow",
  `app_id` bigint unsigned NULL COMMENT "app id this workflow execution belongs to",
  `node_count` mediumint unsigned NULL COMMENT "the total node count of the workflow",
  `resume_event_id` bigint unsigned NULL COMMENT "the current event ID which is resuming",
  `agent_id` bigint unsigned NULL COMMENT "the agent that this execution binds to",
  `sync_pattern` tinyint unsigned NULL COMMENT "the sync pattern 1. sync 2. async 3. stream",
  `commit_id` varchar(255) NULL COMMENT "draft commit id this execution belongs to",
  PRIMARY KEY (`id`),
  INDEX `idx_workflow_id_version_mode_created_at` (`workflow_id`, `version`, `mode`, `created_at`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Workflow Execution Record Table, used to record the status of each workflow execution";
-- Create "workflow_meta" table
CREATE TABLE IF NOT EXISTS `workflow_meta` (
  `id` bigint unsigned NOT NULL COMMENT "workflow id",
  `name` varchar(256) NOT NULL COMMENT "workflow name",
  `description` varchar(2000) NOT NULL COMMENT "workflow description",
  `icon_uri` varchar(256) NOT NULL COMMENT "icon uri",
  `status` tinyint unsigned NOT NULL COMMENT "0: Not published, 1: Published",
  `content_type` tinyint unsigned NOT NULL COMMENT "0 Users 1 Official",
  `mode` tinyint unsigned NOT NULL COMMENT "0:workflow, 3:chat_flow",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `updated_at` bigint unsigned NULL COMMENT "update time in millisecond",
  `deleted_at` datetime(3) NULL COMMENT "delete time in millisecond",
  `creator_id` bigint unsigned NOT NULL COMMENT "user id for creator",
  `tag` tinyint unsigned NULL COMMENT "template tag: Tag: 1=All, 2=Hot, 3=Information, 4=Music, 5=Picture, 6=UtilityTool, 7=Life, 8=Traval, 9=Network, 10=System, 11=Movie, 12=Office, 13=Shopping, 14=Education, 15=Health, 16=Social, 17=Entertainment, 18=Finance, 100=Hidden",
  `author_id` bigint unsigned NOT NULL COMMENT "Original author user ID",
  `space_id` bigint unsigned NOT NULL COMMENT "space id",
  `updater_id` bigint unsigned NULL COMMENT "User ID for updating metadata",
  `source_id` bigint unsigned NULL COMMENT "Workflow ID of source",
  `app_id` bigint unsigned NULL COMMENT "app id",
  `latest_version` varchar(50) NULL COMMENT "the version of the most recent publish",
  `latest_version_ts` bigint unsigned NULL COMMENT "create time of latest version",
  PRIMARY KEY (`id`),
  INDEX `idx_app_id` (`app_id`),
  INDEX `idx_latest_version_ts` (`latest_version_ts` DESC),
  INDEX `idx_space_id_app_id_status_latest_version_ts` (`space_id`, `app_id`, `status`, `latest_version_ts`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "The workflow metadata table,used to record the basic metadata of workflow";
-- Create "workflow_reference" table
CREATE TABLE IF NOT EXISTS `workflow_reference` (
  `id` bigint unsigned NOT NULL COMMENT "workflow id",
  `referred_id` bigint unsigned NOT NULL COMMENT "the id of the workflow that is referred by other entities",
  `referring_id` bigint unsigned NOT NULL COMMENT "the entity id that refers this workflow",
  `refer_type` tinyint unsigned NOT NULL COMMENT "1 subworkflow 2 tool",
  `referring_biz_type` tinyint unsigned NOT NULL COMMENT "the biz type the referring entity belongs to: 1. workflow 2. agent",
  `created_at` bigint unsigned NOT NULL COMMENT "create time in millisecond",
  `status` tinyint unsigned NOT NULL COMMENT "whether this reference currently takes effect. 0: disabled 1: enabled",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  PRIMARY KEY (`id`),
  INDEX `idx_referred_id_referring_biz_type_status` (`referred_id`, `referring_biz_type`, `status`),
  INDEX `idx_referring_id_status` (`referring_id`, `status`),
  UNIQUE INDEX `uniq_referred_id_referring_id_refer_type` (`referred_id`, `referring_id`, `refer_type`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "The workflow association table,used to record the direct mutual reference relationship between workflows";
-- Create "workflow_snapshot" table
CREATE TABLE IF NOT EXISTS `workflow_snapshot` (
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id this snapshot belongs to",
  `commit_id` varchar(255) NOT NULL COMMENT "the commit id of the workflow draft",
  `canvas` mediumtext NULL COMMENT "frontend schema for this snapshot",
  `input_params` mediumtext NULL COMMENT "input parameter info",
  `output_params` mediumtext NULL COMMENT "output parameter info",
  `created_at` bigint unsigned NOT NULL COMMENT "Create Time in Milliseconds",
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID",
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uniq_workflow_id_commit_id` (`workflow_id`, `commit_id`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "snapshot for executed workflow draft";
-- Create "workflow_version" table
CREATE TABLE IF NOT EXISTS `workflow_version` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT "ID",
  `workflow_id` bigint unsigned NOT NULL COMMENT "workflow id",
  `version` varchar(50) NOT NULL COMMENT "Published version",
  `version_description` varchar(2000) NOT NULL COMMENT "Version Description",
  `canvas` mediumtext NULL COMMENT "Front end schema",
  `input_params` mediumtext NULL COMMENT "input params",
  `output_params` mediumtext NULL COMMENT "output params",
  `creator_id` bigint unsigned NOT NULL COMMENT "creator id",
  `created_at` bigint unsigned NOT NULL COMMENT "Create Time in Milliseconds",
  `deleted_at` datetime(3) NULL COMMENT "Delete Time",
  `commit_id` varchar(255) NOT NULL COMMENT "the commit id corresponding to this version",
  PRIMARY KEY (`id`),
  INDEX `idx_id_created_at` (`workflow_id`, `created_at`),
  UNIQUE INDEX `uniq_workflow_id_version` (`workflow_id`, `version`)
) CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT "Workflow Canvas Version Information Table, used to record canvas information for different versions";
