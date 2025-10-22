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
 * 扩展I18n类型定义
 * 声明enterprise模块的多语言key
 */

import { ENTERPRISE_I18N_KEYS } from '../locales/keys';

declare module '@coze-arch/i18n' {
  interface I18nKeys extends Record<string, string> {
    // 将ENTERPRISE_I18N_KEYS的值类型添加到I18n可接受的key类型中
  }
}

// 导出类型以供使用
export type EnterpriseI18nKey = typeof ENTERPRISE_I18N_KEYS[keyof typeof ENTERPRISE_I18N_KEYS];