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

import type { permission } from '@coze-studio/api-schema';

// Re-export user data type from API schema
export type UserData = permission.permission.UserData;

// Account list query parameters
export interface AccountListParams {
  keyword?: string;
  is_disabled?: number;
  page?: number;
  limit?: number;
}

// Pagination information
export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
}

// Account list state
export interface AccountListState {
  users: UserData[];
  loading: boolean;
  pagination: PaginationInfo;
}
