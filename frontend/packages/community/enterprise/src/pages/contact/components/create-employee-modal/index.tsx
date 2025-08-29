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

import { employee } from '@coze-studio/api-schema';
import {
  IconCozEye,
  IconCozEyeClose,
  IconCozCopy,
} from '@coze-arch/coze-design/icons';
import {
  Modal,
  Form,
  Input,
  Radio,
  RadioGroup,
  Button,
} from '@coze-arch/coze-design';

import { t } from '@/utils/i18n';
import { ENTERPRISE_I18N_KEYS } from '@/locales/keys';

import { useEmployeeCreation } from './hooks/use-employee-creation';
import { DepartmentSelector } from '../department-selector';

import styles from './index.module.less';

interface CreateEmployeeModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

// 导入hook的FormValues类型
interface FormValues {
  name: string;
  departments: employee.employee.EmployeeDepartmentInfo[];
  mobile: string;
  email: string;
  create_account: employee.employee.common.CreateAccountType;
  loginPassword: string;
}

// 表单字段组件
interface FormFieldProps {
  formValues: FormValues;
  handleFormChange: <K extends keyof FormValues>(
    field: K,
    value: FormValues[K],
  ) => void;
}

const NameAndMobileFields: FC<FormFieldProps> = ({
  formValues,
  handleFormChange,
}) => (
  <>
    <div className={`semi-form-field ${styles.formGridItem}`}>
      <label
        className="semi-form-field-label"
        style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
      >
        <span>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_EMPLOYEE_NAME)}
          <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </span>
      </label>
      <Input
        placeholder={t(
          ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_EMPLOYEE_NAME,
        )}
        value={formValues.name}
        onChange={value => handleFormChange('name', value)}
        maxLength={50}
        showClear
        suffix={
          <span style={{ color: 'var(--semi-color-text-2)', fontSize: 12 }}>
            {(formValues.name || '').length}/50
          </span>
        }
      />
    </div>
    <div className={`semi-form-field ${styles.formGridItem}`}>
      <label
        className="semi-form-field-label"
        style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
      >
        <span>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_MOBILE)}
          <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </span>
      </label>
      <Input
        placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_MOBILE)}
        value={formValues.mobile}
        onChange={value => handleFormChange('mobile', value)}
        maxLength={11}
        showClear
      />
    </div>
  </>
);

const DepartmentField: FC<FormFieldProps> = ({
  formValues,
  handleFormChange,
}) => (
  <div className={`semi-form-field ${styles.formGridItem} ${styles.fullWidth}`}>
    <label
      className="semi-form-field-label"
      style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
    >
      <span>
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_DEPARTMENT)}
        <span style={{ color: 'red', marginLeft: 4 }}>*</span>
      </span>
    </label>
    <DepartmentSelector
      value={formValues.departments}
      onChange={departments => handleFormChange('departments', departments)}
      placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_SELECT_DEPARTMENT)}
      multiple={true}
    />
  </div>
);

const EmailAndAccountFields: FC<FormFieldProps> = ({
  formValues,
  handleFormChange,
}) => (
  <>
    <div className={`semi-form-field ${styles.formGridItem}`}>
      <label
        className="semi-form-field-label"
        style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
      >
        <span>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_WORK_EMAIL)}
          {formValues.create_account ===
            employee.employee.common.CreateAccountType.CREATE_BY_EMAIL && (
            <span style={{ color: 'red', marginLeft: 4 }}>*</span>
          )}
        </span>
      </label>
      <Input
        placeholder={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_WORK_EMAIL)}
        value={formValues.email}
        onChange={value => handleFormChange('email', value)}
        maxLength={100}
        showClear
      />
    </div>
    <div
      className={`semi-form-field ${styles.formGridItem} ${styles.loginAccountSection}`}
    >
      <label
        className="semi-form-field-label"
        style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
      >
        {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_LOGIN_ACCOUNT)}
      </label>
      <RadioGroup
        value={formValues.create_account}
        onChange={e => handleFormChange('create_account', e.target.value)}
        className={styles.radioGroup}
      >
        <Radio
          value={employee.employee.common.CreateAccountType.CREATE_BY_EMAIL}
        >
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_LOGIN_WITH_WORK_EMAIL)}
        </Radio>
        <Radio value={employee.employee.common.CreateAccountType.NO_CREATE}>
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_NOT_CREATE_LOGIN_ACCOUNT)}
        </Radio>
      </RadioGroup>
    </div>
  </>
);

interface PasswordFieldProps extends FormFieldProps {
  passwordVisible: boolean;
  handleGeneratePassword: () => void;
  handleCopyPassword: () => void;
  togglePasswordVisibility: () => void;
}

const PasswordField: FC<PasswordFieldProps> = ({
  formValues,
  handleFormChange,
  passwordVisible,
  handleGeneratePassword,
  handleCopyPassword,
  togglePasswordVisibility,
}) => {
  if (
    formValues.create_account !==
    employee.employee.common.CreateAccountType.CREATE_BY_EMAIL
  ) {
    return null;
  }

  return (
    <div
      className={`semi-form-field ${styles.formGridItem} ${styles.fullWidth}`}
    >
      <div className={styles.passwordFieldHeader}>
        <label
          className="semi-form-field-label"
          style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}
        >
          <span>
            {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_LOGIN_PASSWORD)}
            <span style={{ color: 'red', marginLeft: 4 }}>*</span>
          </span>
        </label>
        <Button
          size="small"
          type="tertiary"
          onClick={handleGeneratePassword}
          className={styles.generatePasswordBtn}
        >
          {t(ENTERPRISE_I18N_KEYS.ENTERPRISE_GENERATE_RANDOM_PASSWORD)}
        </Button>
      </div>
      <div style={{ position: 'relative' }}>
        <Input
          type={passwordVisible ? 'text' : 'password'}
          placeholder={t(
            ENTERPRISE_I18N_KEYS.ENTERPRISE_PLEASE_INPUT_LOGIN_PASSWORD,
          )}
          value={formValues.loginPassword}
          onChange={value => handleFormChange('loginPassword', value)}
          maxLength={50}
          style={{ paddingRight: '60px' }}
        />
        <div
          className={styles.passwordControls}
          style={{
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div
            onClick={togglePasswordVisibility}
            style={{
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
            }}
          >
            {passwordVisible ? <IconCozEye /> : <IconCozEyeClose />}
          </div>
          <div
            onClick={handleCopyPassword}
            style={{
              cursor: formValues.loginPassword ? 'pointer' : 'not-allowed',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '20px',
              height: '20px',
              opacity: formValues.loginPassword ? 1 : 0.5,
            }}
          >
            <IconCozCopy />
          </div>
        </div>
      </div>
    </div>
  );
};

export const CreateEmployeeModal: FC<CreateEmployeeModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const {
    formValues,
    loading,
    passwordVisible,
    handleFormChange,
    handleSubmit,
    handleGeneratePassword,
    handleCopyPassword,
    togglePasswordVisibility,
  } = useEmployeeCreation({
    visible,
    onSuccess,
    onClose,
  });

  return (
    <Modal
      visible={visible}
      onOk={handleSubmit}
      onCancel={onClose}
      title={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE_EMPLOYEE)}
      okText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CREATE)}
      cancelText={t(ENTERPRISE_I18N_KEYS.ENTERPRISE_CANCEL)}
      confirmLoading={loading}
      width={600}
      centered
      className={styles.createEmployeeModal}
      maskClosable={false}
    >
      <Form layout="vertical" className={styles.form}>
        <div className={styles.formGrid}>
          <NameAndMobileFields
            formValues={formValues}
            handleFormChange={handleFormChange}
          />
          <DepartmentField
            formValues={formValues}
            handleFormChange={handleFormChange}
          />
          <EmailAndAccountFields
            formValues={formValues}
            handleFormChange={handleFormChange}
          />
          <PasswordField
            formValues={formValues}
            handleFormChange={handleFormChange}
            passwordVisible={passwordVisible}
            handleGeneratePassword={handleGeneratePassword}
            handleCopyPassword={handleCopyPassword}
            togglePasswordVisibility={togglePasswordVisibility}
          />
        </div>
      </Form>
    </Modal>
  );
};
