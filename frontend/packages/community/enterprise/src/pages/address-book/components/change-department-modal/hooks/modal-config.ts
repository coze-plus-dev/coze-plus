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

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

export const getModalConfig = (isRestore: boolean, employeeName?: string) => ({
  title: isRestore
    ? `${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_EMPLOYEE_TITLE)} - ${employeeName || ''}`
    : `${t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_ACTION_CHANGE_DEPARTMENT)} - ${employeeName || ''}`,
  okText: isRestore
    ? t(ENTERPRISE_I18N_KEYS.ENTERPRISE_RESTORE_CONFIRM_OK_TEXT)
    : t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_SAVE),
  cancelText: t(
    ENTERPRISE_I18N_KEYS.ENTERPRISE_EDIT_ORGANIZATION_BUTTONS_CANCEL,
  ),
  departmentLabel: t(
    ENTERPRISE_I18N_KEYS.ENTERPRISE_MEMBER_DETAIL_SECTION_DEPARTMENT,
  ),
  departmentPlaceholder: t(
    ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE_FIELDS_DEPARTMENT_PLACEHOLDER,
  ),
  tip1: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CHANGE_DEPARTMENT_TIP_1),
  tip2: t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CHANGE_DEPARTMENT_TIP_2),
});
