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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';

interface LanguageSelectorProps {
  currentLanguage: string;
  showLanguageMenu: boolean;
  onLanguageToggle: () => void;
  onLanguageChange: (langCode: string) => void;
}

export const LanguageSelector: FC<LanguageSelectorProps> = ({
  currentLanguage,
  showLanguageMenu,
  onLanguageToggle,
  onLanguageChange,
}) => {
  const languages = [
    {
      code: 'zh-CN',
      name: I18n.t('login_page_language_chinese'),
      englishName: 'Chinese (Simplified)',
    },
    {
      code: 'en',
      name: I18n.t('login_page_language_english'),
      englishName: 'English',
    },
  ];
  const currentLang =
    languages.find(lang => lang.code === currentLanguage) || languages[0];

  return (
    <div className="absolute top-6 right-6 z-20">
      <div className="relative">
        <button
          className="text-sm text-gray-600 flex items-center gap-1 hover:text-gray-800 transition-colors duration-200"
          onClick={onLanguageToggle}
        >
          {currentLang.name}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {showLanguageMenu ? (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                onClick={() => onLanguageChange(lang.code)}
              >
                <div className="font-medium">{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.englishName}</div>
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};
