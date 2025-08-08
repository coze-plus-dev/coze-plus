/*
 * Copyright 2025 coze-dev Authors
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

package corporation

import (
	"gorm.io/gorm"

	corporationImpl "github.com/coze-dev/coze-studio/backend/domain/corporation/service"
	"github.com/coze-dev/coze-studio/backend/infra/contract/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/contract/storage"
)

type ServiceComponents struct {
	DB      *gorm.DB
	IDGen   idgen.IDGenerator
	Storage storage.Storage
}

func InitService(c *ServiceComponents) (*CorporationApplicationService, error) {
	// Initialize domain services
	corporationService := corporationImpl.NewCorporationSVC(&corporationImpl.CorporationSVCConfig{
		DB:    c.DB,
		IDGen: c.IDGen,
	})

	departmentService := corporationImpl.NewDepartmentSVC(&corporationImpl.DepartmentSVCConfig{
		DB:    c.DB,
		IDGen: c.IDGen,
	})

	employeeService := corporationImpl.NewEmployeeSVC(&corporationImpl.EmployeeSVCConfig{
		DB:      c.DB,
		IDGen:   c.IDGen,
		Storage: c.Storage,
	})

	// Set up the application service
	CorporationSVC.DomainCorporationSVC = corporationService
	CorporationSVC.DomainDepartmentSVC = departmentService
	CorporationSVC.DomainEmployeeSVC = employeeService
	CorporationSVC.db = c.DB
	CorporationSVC.storage = c.Storage

	return CorporationSVC, nil
}