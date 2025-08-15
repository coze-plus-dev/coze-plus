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
import { useNavigate } from 'react-router-dom';

import { I18n } from '@coze-arch/i18n';
import {
  IconCozTeamFill,
  IconCozRoleFill,
  IconCozPeople,
  IconCozPeopleFill,
} from '@coze-arch/coze-design/icons';

import { SubMenuItem } from '../sub-menu-item';
import { useEnterpriseRoute } from '../../hooks/use-enterprise-route';

const getMenuConfig = () => [
  {
    key: 'address_book',
    icon: <IconCozTeamFill />,
    activeIcon: <IconCozTeamFill />,
    title: I18n.t('navigation_organization_address_book'),
    path: '/enterprise/address-book',
  },
  {
    key: 'role',
    icon: <IconCozRoleFill />,
    activeIcon: <IconCozRoleFill />,
    title: I18n.t('navigation_organization_role_management'),
    path: '/enterprise/role',
  },
  {
    key: 'account',
    icon: <IconCozPeople />,
    activeIcon: <IconCozPeopleFill />,
    title: I18n.t('navigation_organization_account_management'),
    path: '/enterprise/account',
  },
];

export const EnterpriseSubMenu: FC = () => {
  const navigate = useNavigate();
  const { subMenuKey } = useEnterpriseRoute();
  const menuConfig = getMenuConfig();
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {menuConfig.map(item => (
        <SubMenuItem
          key={item.key}
          {...item}
          isActive={item.key === subMenuKey}
          onClick={() => {
            navigate(item.path);
          }}
        />
      ))}
    </div>
  );
};