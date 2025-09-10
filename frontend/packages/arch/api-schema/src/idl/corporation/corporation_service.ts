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

import * as corporation from './corporation';
export { corporation };
import { createAPI } from './../../api/config';
export const CreateCorporation = /*#__PURE__*/createAPI<corporation.CreateCorpRequest, corporation.CreateCorpResponse>({
  "url": "/api/v1/corporation/create",
  "method": "POST",
  "name": "CreateCorporation",
  "reqType": "corporation.CreateCorpRequest",
  "reqMapping": {
    "body": ["name", "corp_type", "parent_id", "sort", "out_corp_id", "corp_source"]
  },
  "resType": "corporation.CreateCorpResponse",
  "schemaRoot": "api://schemas/idl_corporation_corporation_service",
  "service": "corporation"
});
export const GetCorporation = /*#__PURE__*/createAPI<corporation.GetCorpRequest, corporation.GetCorpResponse>({
  "url": "/api/v1/corporation/:id",
  "method": "GET",
  "name": "GetCorporation",
  "reqType": "corporation.GetCorpRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "corporation.GetCorpResponse",
  "schemaRoot": "api://schemas/idl_corporation_corporation_service",
  "service": "corporation"
});
export const UpdateCorporation = /*#__PURE__*/createAPI<corporation.UpdateCorpRequest, corporation.UpdateCorpResponse>({
  "url": "/api/v1/corporation/:id",
  "method": "PUT",
  "name": "UpdateCorporation",
  "reqType": "corporation.UpdateCorpRequest",
  "reqMapping": {
    "path": ["id"],
    "body": ["name", "parent_id", "corp_type", "sort", "out_corp_id", "corp_source"]
  },
  "resType": "corporation.UpdateCorpResponse",
  "schemaRoot": "api://schemas/idl_corporation_corporation_service",
  "service": "corporation"
});
export const DeleteCorporation = /*#__PURE__*/createAPI<corporation.DeleteCorpRequest, corporation.DeleteCorpResponse>({
  "url": "/api/v1/corporation/:id",
  "method": "DELETE",
  "name": "DeleteCorporation",
  "reqType": "corporation.DeleteCorpRequest",
  "reqMapping": {
    "path": ["id"]
  },
  "resType": "corporation.DeleteCorpResponse",
  "schemaRoot": "api://schemas/idl_corporation_corporation_service",
  "service": "corporation"
});
export const ListCorporations = /*#__PURE__*/createAPI<corporation.ListCorpsRequest, corporation.ListCorpsResponse>({
  "url": "/api/v1/corporation/list",
  "method": "POST",
  "name": "ListCorporations",
  "reqType": "corporation.ListCorpsRequest",
  "reqMapping": {
    "body": ["keyword", "parent_id", "corp_type", "page", "page_size"]
  },
  "resType": "corporation.ListCorpsResponse",
  "schemaRoot": "api://schemas/idl_corporation_corporation_service",
  "service": "corporation"
});
export const GetOrganizationTree = /*#__PURE__*/createAPI<corporation.GetOrganizationTreeRequest, corporation.GetOrganizationTreeResponse>({
  "url": "/api/v1/organization/tree",
  "method": "POST",
  "name": "GetOrganizationTree",
  "reqType": "corporation.GetOrganizationTreeRequest",
  "reqMapping": {
    "body": ["corp_id", "include_departments", "depth", "include_employee_count"]
  },
  "resType": "corporation.GetOrganizationTreeResponse",
  "schemaRoot": "api://schemas/idl_corporation_corporation_service",
  "service": "corporation"
});