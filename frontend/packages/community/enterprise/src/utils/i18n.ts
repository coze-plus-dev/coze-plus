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
 * I18n工具函数
 * 提供类型安全的多语言翻译
 */

import { I18n } from '@coze-arch/i18n';

import { type ENTERPRISE_I18N_KEYS } from '../locales/keys';

type EnterpriseI18nKey =
  (typeof ENTERPRISE_I18N_KEYS)[keyof typeof ENTERPRISE_I18N_KEYS];

/**
 * 企业模块专用的I18n翻译函数
 * @param key - 多语言key
 * @param options - 翻译选项
 * @returns 翻译后的文本
 */
export function t(
  key: EnterpriseI18nKey,
  options?: Record<string, unknown>,
): string {
  return I18n.t(key as any, options);
}

/**
 * 批量翻译
 * @param keys - 多语言key数组
 * @returns 翻译后的文本数组
 */
export function tBatch(keys: EnterpriseI18nKey[]): string[] {
  return keys.map(key => I18n.t(key as any));
}

/**
 * 带默认值的翻译
 * @param key - 多语言key
 * @param defaultValue - 默认值
 * @returns 翻译后的文本或默认值
 */
export function tWithDefault(
  key: EnterpriseI18nKey,
  defaultValue: string,
): string {
  try {
    const result = I18n.t(key as any);
    return result || defaultValue;
  } catch (error) {
    console.warn('Translation failed for key:', key, error);
    return defaultValue;
  }
}

// 重新导出原始的I18n以供其他用途
export { I18n };
