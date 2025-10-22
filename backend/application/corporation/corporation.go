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

package corporation

import (
	"context"

	"gorm.io/gorm"

	"github.com/coze-dev/coze-studio/backend/api/model/corporation/common"
	corporationAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/corporation"
	"github.com/coze-dev/coze-studio/backend/application/base/ctxutil"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/service"
	"github.com/coze-dev/coze-studio/backend/infra/idgen"
	"github.com/coze-dev/coze-studio/backend/infra/storage"
	"github.com/coze-dev/coze-studio/backend/pkg/errorx"
	"github.com/coze-dev/coze-studio/backend/pkg/lang/ptr"
	"github.com/coze-dev/coze-studio/backend/types/errno"
)

type CorporationApplicationService struct {
	DomainCorporationSVC service.Corporation
	DomainDepartmentSVC  service.Department
	DomainEmployeeSVC    service.Employee
	db                   *gorm.DB
	storage              storage.Storage
	idgen                idgen.IDGenerator
}

var CorporationSVC = &CorporationApplicationService{}

// Corporation methods
func (s *CorporationApplicationService) CreateCorporation(ctx context.Context, req *corporationAPI.CreateCorpRequest) (*corporationAPI.CreateCorpResponse, error) {
	if req == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "request cannot be nil"))
	}

	uid := ctxutil.GetUIDFromCtx(ctx)
	if uid == nil {
		return nil, errorx.New(errno.ErrCorporationInvalidParamCode, errorx.KV("msg", "session required"))
	}

	serviceReq := &service.CreateCorporationRequest{
		Name:       req.GetName(),
		ParentID:   getOptionalParentID(req),
		CorpType:   convertApiCorpTypeToEntity(req.GetCorpType()),
		Sort:       getOptionalSort(req),
		OutCorpID:  getOptionalOutCorpID(req),
		CorpSource: convertApiCorpSourceToEntity(req.GetCorpSource()),
		CreatorID:  ptr.From(uid),
	}

	var serviceResp *service.CreateCorporationResponse
	var err error

	err = s.db.Transaction(func(tx *gorm.DB) error {
		serviceResp, err = s.DomainCorporationSVC.CreateCorporation(ctx, serviceReq)
		return err
	})

	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewCreateCorpResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToCorporationData(serviceResp.Corporation)

	return resp, nil
}

func (s *CorporationApplicationService) GetCorporationByID(ctx context.Context, req *corporationAPI.GetCorpRequest) (*corporationAPI.GetCorpResponse, error) {
	serviceResp, err := s.DomainCorporationSVC.GetCorporationByID(ctx, &service.GetCorporationByIDRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewGetCorpResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = convertEntityToCorporationData(serviceResp.Corporation)

	return resp, nil
}

func (s *CorporationApplicationService) UpdateCorporation(ctx context.Context, req *corporationAPI.UpdateCorpRequest) (*corporationAPI.UpdateCorpResponse, error) {
	serviceReq := &service.UpdateCorporationRequest{
		ID: req.GetID(),
	}

	if req.IsSetName() {
		name := req.GetName()
		serviceReq.Name = &name
	}
	if req.IsSetParentID() {
		parentID := req.GetParentID()
		serviceReq.ParentID = &parentID
	}
	if req.IsSetCorpType() {
		corpType := convertApiCorpTypeToEntity(req.GetCorpType())
		serviceReq.CorpType = &corpType
	}
	if req.IsSetSort() {
		sort := req.GetSort()
		serviceReq.Sort = &sort
	}
	if req.IsSetOutCorpID() {
		outCorpID := req.GetOutCorpID()
		serviceReq.OutCorpID = &outCorpID
	}
	if req.IsSetCorpSource() {
		corpSource := convertApiCorpSourceToEntity(req.GetCorpSource())
		serviceReq.CorpSource = &corpSource
	}

	err := s.DomainCorporationSVC.UpdateCorporation(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewUpdateCorpResponse()
	resp.Code = 0
	resp.Msg = ""

	return resp, nil
}

func (s *CorporationApplicationService) DeleteCorporation(ctx context.Context, req *corporationAPI.DeleteCorpRequest) (*corporationAPI.DeleteCorpResponse, error) {
	err := s.DomainCorporationSVC.DeleteCorporation(ctx, &service.DeleteCorporationRequest{
		ID: req.GetID(),
	})
	if err != nil {
		return nil, err
	}

	resp := corporationAPI.NewDeleteCorpResponse()
	resp.Code = 0
	resp.Msg = ""

	return resp, nil
}

func (s *CorporationApplicationService) ListCorporations(ctx context.Context, req *corporationAPI.ListCorpsRequest) (*corporationAPI.ListCorpsResponse, error) {
	serviceReq := &service.ListCorporationsRequest{
		Limit: int(req.GetPageSize()),
		Page:  int(req.GetPage()),
	}

	if req.IsSetParentID() {
		parentID := req.GetParentID()
		serviceReq.ParentID = &parentID
	}
	if req.IsSetCorpType() {
		corpType := convertApiCorpTypeToEntity(req.GetCorpType())
		serviceReq.CorpType = &corpType
	}
	if req.IsSetKeyword() {
		keyword := req.GetKeyword()
		serviceReq.Keyword = &keyword
	}

	serviceResp, err := s.DomainCorporationSVC.ListCorporations(ctx, serviceReq)
	if err != nil {
		return nil, err
	}

	corpData := make([]*corporationAPI.CorporationData, len(serviceResp.Corporations))
	for i, corp := range serviceResp.Corporations {
		corpData[i] = convertEntityToCorporationData(corp)
	}

	resp := corporationAPI.NewListCorpsResponse()
	resp.Code = 0
	resp.Msg = ""
	resp.Data = corpData
	resp.Total = serviceResp.Total

	return resp, nil
}

// Department and Employee methods are in separate files

// Helper conversion functions for corporation
func convertApiCorpTypeToEntity(apiType common.CorporationType) entity.CorporationType {
	switch apiType {
	case common.CorporationType_GROUP:
		return entity.CorporationTypeGroup
	case common.CorporationType_COMPANY:
		return entity.CorporationTypeCompany
	case common.CorporationType_BRANCH:
		return entity.CorporationTypeBranch
	default:
		return entity.CorporationTypeGroup
	}
}

func convertApiCorpSourceToEntity(apiSource common.DataSource) entity.CorporationSource {
	return entity.CorporationSource(apiSource)
}

func convertEntityCorpTypeToCommon(entityType entity.CorporationType) common.CorporationType {
	switch entityType {
	case entity.CorporationTypeGroup:
		return common.CorporationType_GROUP
	case entity.CorporationTypeCompany:
		return common.CorporationType_COMPANY
	case entity.CorporationTypeBranch:
		return common.CorporationType_BRANCH
	default:
		return common.CorporationType_GROUP
	}
}

func convertEntityToCorporationData(corp *entity.Corporation) *corporationAPI.CorporationData {
	if corp == nil {
		return nil
	}

	corpData := &corporationAPI.CorporationData{
		ID:        corp.ID,
		Name:      corp.Name,
		CorpType:  convertEntityCorpTypeToCommon(corp.CorpType),
		Sort:      corp.Sort,
		CreatorID: corp.CreatorID,
		CreatedAt: corp.CreatedAt,
		UpdatedAt: corp.UpdatedAt,
	}

	if corp.ParentID != nil {
		corpData.ParentID = corp.ParentID
	}
	if corp.OutCorpID != nil {
		corpData.OutCorpID = corp.OutCorpID
	}
	if corp.CorpSource != entity.CorporationSourceUnknown {
		corpSource := common.DataSource(corp.CorpSource)
		corpData.CorpSource = &corpSource
	}

	return corpData
}

// Helper functions for optional fields
func getOptionalParentID(req *corporationAPI.CreateCorpRequest) *int64 {
	if req.IsSetParentID() {
		parentID := req.GetParentID()
		return &parentID
	}
	return nil
}

func getOptionalSort(req *corporationAPI.CreateCorpRequest) int32 {
	if req.IsSetSort() {
		return req.GetSort()
	}
	return 0
}

func getOptionalOutCorpID(req *corporationAPI.CreateCorpRequest) *string {
	if req.IsSetOutCorpID() {
		outCorpID := req.GetOutCorpID()
		return &outCorpID
	}
	return nil
}

func getStringPtr(str string) *string {
	if str == "" {
		return nil
	}
	return &str
}
