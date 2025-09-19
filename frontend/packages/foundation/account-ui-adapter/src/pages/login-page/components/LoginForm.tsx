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
import { Button, Form } from '@coze-arch/coze-design';

import faviconBase from '../favicon-base.png';

interface LoginFormProps {
  email: string;
  password: string;
  showPassword: boolean;
  hasError: boolean;
  loginLoading: boolean;
  submitDisabled: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onPasswordToggle: () => void;
  onErrorChange: (error: boolean) => void;
  onLogin: () => void;
}

export const LoginForm: FC<LoginFormProps> = ({
  email,
  password,
  showPassword,
  hasError,
  loginLoading,
  submitDisabled,
  onEmailChange,
  onPasswordChange,
  onPasswordToggle,
  onErrorChange,
  onLogin,
}) => (
  <div className="bg-white rounded-2xl shadow-lg px-8 lg:px-10 xl:px-16 py-6 lg:py-8 xl:py-12 mx-4">
    <div className="flex justify-center mb-4 lg:mb-6 xl:mb-8">
      <img
        src={faviconBase}
        alt="logo"
        className="w-14 h-14 lg:w-18 lg:h-18 xl:w-22 xl:h-22"
      />
    </div>
    <h2 className="text-base lg:text-lg xl:text-xl font-semibold text-gray-800 mb-4 lg:mb-6 xl:mb-8 text-center">
      {I18n.t('login_page_welcome_coze_plus')}
    </h2>
    <div className="[&_.semi-input-wrapper]:overflow-hidden [&_.semi-input-wrapper]:bg-gray-100 [&_.semi-input-wrapper]:border-0 [&_.semi-input-wrapper]:rounded-lg [&_.semi-input]:py-3 lg:[&_.semi-input]:py-3 xl:[&_.semi-input]:py-4 [&_.semi-input]:px-4 lg:[&_.semi-input]:px-4 xl:[&_.semi-input]:px-5 [&_.semi-input]:text-base">
      <Form
        onErrorChange={errors => onErrorChange(Object.keys(errors).length > 0)}
      >
        <div className="mb-3 lg:mb-4 xl:mb-5">
          <Form.Input
            data-testid="login.input.email"
            label={I18n.t('login_page_email_label')}
            labelPosition="top"
            type="email"
            field="email"
            rules={[
              {
                required: true,
                message: I18n.t('open_source_login_placeholder_email'),
              },
              {
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: I18n.t('open_source_login_placeholder_email'),
              },
            ]}
            onChange={onEmailChange}
            placeholder={I18n.t('open_source_login_placeholder_email')}
          />
        </div>
        <div className="mb-5 lg:mb-6 xl:mb-8 relative">
          <Form.Input
            data-testid="login.input.password"
            label={I18n.t('login_page_password_label')}
            labelPosition="top"
            rules={[
              {
                required: true,
                message: I18n.t('open_source_login_placeholder_password'),
              },
            ]}
            field="password"
            type={showPassword ? 'text' : 'password'}
            onChange={onPasswordChange}
            placeholder={I18n.t('open_source_login_placeholder_password')}
            suffix={
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
                onClick={onPasswordToggle}
              >
                {showPassword ? (
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </div>
            }
          />
        </div>
      </Form>
      <Button
        data-testid="login.button.login"
        className="w-full py-3 lg:py-3 xl:py-4 text-base lg:text-base xl:text-lg font-medium"
        disabled={submitDisabled}
        onClick={onLogin}
        loading={loginLoading}
        theme="solid"
        type="primary"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          border: 'none',
          borderRadius: '24px',
        }}
      >
        {I18n.t('login_button_text')}
      </Button>
    </div>
  </div>
);
