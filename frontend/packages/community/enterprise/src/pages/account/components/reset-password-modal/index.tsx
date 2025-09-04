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

import { type FC, useState, useEffect } from 'react';

import {
  Modal,
  Button,
  Input,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';
import type { UserData } from '../../types';

import { useResetPassword } from './hooks/use-reset-password';
import styles from './index.module.less';

interface ResetPasswordModalProps {
  visible: boolean;
  user: UserData | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ResetPasswordModal: FC<ResetPasswordModalProps> = ({
  visible,
  user,
  onClose,
  onSuccess,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const { resetPassword, loading } = useResetPassword({
    onSuccess: () => {
      onSuccess?.();
      handleClose();
    },
  });

  const handleClose = () => {
    setNewPassword('');
    setShowPassword(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (!user?.email || !newPassword.trim()) {
      return;
    }

    await resetPassword(user.email, newPassword);
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!visible) {
      setNewPassword('');
      setShowPassword(false);
    }
  }, [visible]);

  if (!user) {
    return null;
  }

  return (
    <Modal
      title={t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_TITLE)}
      visible={visible}
      onCancel={handleClose}
      width={480}
      className={styles.resetPasswordModal}
      footer={null}
    >
      <div className={styles.resetPasswordModal}>
        <div className={styles.formItem}>
          <label>{t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_EMAIL_LABEL)}</label>
          <Input
            value={user.email || ''}
            disabled
            className={styles.emailInput}
            onChange={undefined}
          />
        </div>

        <div className={styles.formItem}>
          <label>{t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_PASSWORD_LABEL)}</label>
          <Input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={setNewPassword}
            placeholder={t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_PASSWORD_PLACEHOLDER)}
            className={styles.passwordInput}
            autoComplete="new-password"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            data-lpignore="true"
            data-form-type="password"
            name="new-password-unique"
            suffix={
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{ cursor: 'pointer', padding: '4px' }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </span>
            }
          />
        </div>

        <div className={styles.footer}>
          <Button onClick={handleClose} disabled={loading}>
            {t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_CANCEL)}
          </Button>
          <Button
            type="primary"
            onClick={handleConfirm}
            loading={loading}
            disabled={!newPassword.trim()}
          >
            {t(ENTERPRISE_I18N_KEYS.RESET_PASSWORD_MODAL_CONFIRM)}
          </Button>
        </div>
      </div>
    </Modal>
  );
};