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

import { type FC, useState } from 'react';

import { CozeBrand } from '@coze-studio/components/coze-brand';
import { I18n } from '@coze-arch/i18n';

import { useLoginService } from './service';
import oauthLeftSlogan from './oauth-left-slogan.png';
import { LoginForm } from './components/LoginForm';
import { LanguageSelector } from './components/LanguageSelector';

export const LoginPage: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    I18n.language || 'zh-CN',
  );
  const [, forceUpdate] = useState({});

  const { login, loginLoading } = useLoginService({ email, password });
  const submitDisabled = !email || !password || hasError;

  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    setShowLanguageMenu(false);
    I18n.setLang(langCode, (err: unknown) => {
      if (!err) {
        forceUpdate({});
      }
    });
  };

  const handleLanguageToggle = () => {
    setShowLanguageMenu(!showLanguageMenu);
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleErrorChange = (error: boolean) => {
    setHasError(error);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 左侧宣传区域 */}
      <div className="w-3/5 md:w-5/8 lg:w-2/3 xl:w-3/5 bg-white flex flex-col relative">
        <div className="absolute top-6 left-6 z-10">
          <CozeBrand isOversea={IS_OVERSEA} />
        </div>
        <div className="flex-1 flex flex-col justify-center items-center px-16 py-20">
          <div className="flex justify-center items-center">
            <img
              src={oauthLeftSlogan}
              alt="slogan"
              className="w-full h-auto"
              style={{ maxWidth: '580px' }}
            />
          </div>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="w-2/5 md:w-3/8 lg:w-1/3 xl:w-2/5 min-w-[420px] max-w-[600px] bg-white flex flex-col justify-center px-8 md:px-12 lg:px-14 xl:px-18 py-4 lg:py-6 xl:py-8 relative overflow-y-auto">
        <LanguageSelector
          currentLanguage={currentLanguage}
          showLanguageMenu={showLanguageMenu}
          onLanguageToggle={handleLanguageToggle}
          onLanguageChange={handleLanguageChange}
        />

        <LoginForm
          email={email}
          password={password}
          showPassword={showPassword}
          hasError={hasError}
          loginLoading={loginLoading}
          submitDisabled={submitDisabled}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onPasswordToggle={handlePasswordToggle}
          onErrorChange={handleErrorChange}
          onLogin={login}
        />
      </div>
    </div>
  );
};
