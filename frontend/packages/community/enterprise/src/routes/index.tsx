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

import { Navigate, type RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const subMenu = lazy(() =>
  import('../components/enterprise-sub-menu').then(exps => ({
    default: exps.EnterpriseSubMenu,
  })),
);

const AddressBookPage = lazy(() => import('../pages/address-book'));
const RolePage = lazy(() => import('../pages/role'));
const AccountPage = lazy(() => import('../pages/account'));

export const enterpriseRouter: RouteObject = {
  path: 'enterprise',
  Component: null,
  loader: () => ({
    hasSider: true,
    requireAuth: true,
    subMenu,
    menuKey: 'enterprise', // 企业管理模块
  }),
  children: [
    {
      index: true,
      element: <Navigate to="address-book" replace />,
    },
    {
      path: 'address-book',
      element: <AddressBookPage />,
      loader: () => ({
        subMenuKey: 'address_book',
      }),
    },
    {
      path: 'role',
      element: <RolePage />,
      loader: () => ({
        subMenuKey: 'role',
      }),
    },
    {
      path: 'account',
      element: <AccountPage />,
      loader: () => ({
        subMenuKey: 'account',
      }),
    },
  ],
};
