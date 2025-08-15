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
	"sort"

	"github.com/coze-dev/coze-studio/backend/api/model/corporation/common"
	corporationAPI "github.com/coze-dev/coze-studio/backend/api/model/corporation/corporation"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/entity"
	"github.com/coze-dev/coze-studio/backend/domain/corporation/service"
)

// GetOrganizationTree returns the organization tree structure
func (s *CorporationApplicationService) GetOrganizationTree(ctx context.Context, req *corporationAPI.GetOrganizationTreeRequest) (*corporationAPI.GetOrganizationTreeResponse, error) {
	resp := corporationAPI.NewGetOrganizationTreeResponse()
	resp.Code = 0
	resp.Msg = ""

	// Build query parameters for corporations
	var corpID *int64
	if req.IsSetCorpID() {
		id := req.GetCorpID()
		corpID = &id
	}

	includeDepartments := true
	if req.IsSetIncludeDepartments() {
		includeDepartments = req.GetIncludeDepartments()
	}

	depth := int32(0) // 0 means all levels
	if req.IsSetDepth() {
		depth = req.GetDepth()
	}

	includeEmployeeCount := false
	if req.IsSetIncludeEmployeeCount() {
		includeEmployeeCount = req.GetIncludeEmployeeCount()
	}

	// Get corporations
	corpTreeReq := &service.GetCorporationTreeRequest{
		RootID: corpID,
	}

	corpTreeResp, err := s.DomainCorporationSVC.GetCorporationTree(ctx, corpTreeReq)
	if err != nil {
		return nil, err
	}

	// Build tree nodes
	treeNodes := make([]*corporationAPI.CorporationTreeNode, 0)
	corpMap := make(map[int64]*corporationAPI.CorporationTreeNode)

	// First pass: create all corporation nodes
	for _, corp := range corpTreeResp.Corporations {
		node := s.buildCorporationTreeNode(corp)
		corpMap[corp.ID] = node
	}

	// Build corporation hierarchy
	for _, corp := range corpTreeResp.Corporations {
		node := corpMap[corp.ID]
		if corp.ParentID == nil || (corpID != nil && corp.ID == *corpID) {
			// Root node or specified root
			treeNodes = append(treeNodes, node)
		} else if parentNode, exists := corpMap[*corp.ParentID]; exists {
			parentNode.Children = append(parentNode.Children, node)
			parentNode.HasChildren = true
		}
	}

	// If include departments, add department nodes
	if includeDepartments {
		// Process each corporation to add its departments
		for _, corp := range corpTreeResp.Corporations {
			corpNode := corpMap[corp.ID]
			if err := s.addDepartmentNodes(ctx, corpNode, corp.ID, depth, 1); err != nil {
				return nil, err
			}
		}
	}

	// If include employee count, calculate counts
	if includeEmployeeCount {
		for _, node := range treeNodes {
			s.calculateEmployeeCount(ctx, node)
		}
	}

	// Sort children by node type: departments first, then corporations
	for _, node := range treeNodes {
		s.sortTreeNodeChildren(node)
	}

	resp.Data = treeNodes
	return resp, nil
}

// buildCorporationTreeNode creates a CorporationTreeNode from entity.Corporation
func (s *CorporationApplicationService) buildCorporationTreeNode(corp *entity.Corporation) *corporationAPI.CorporationTreeNode {
	node := &corporationAPI.CorporationTreeNode{
		ID:               corp.ID,
		ParentID:         corp.ParentID, // 树状结构关系 - 前端展示用的父节点ID
		BusinessParentID: corp.ParentID, // 业务层级关系 - 组织的上级组织
		Name:             corp.Name,
		CorpType:         convertEntityCorpTypeToCommon(corp.CorpType),
		Sort:             corp.Sort,
		NodeType:         "corp",
		Children:         make([]*corporationAPI.CorporationTreeNode, 0),
		HasChildren:      false,
		IsExpanded:       false,
		EmployeeCount:    0,
	}

	// 设置路径信息
	if corp.Name != "" {
		businessPath := corp.Name
		treePath := corp.Name

		// TODO: 如果有完整的路径信息，可以从entity中获取或构建
		node.BusinessPath = &businessPath
		node.TreePath = &treePath
	}

	return node
}

// Helper methods for tree building

func (s *CorporationApplicationService) addDepartmentNodes(ctx context.Context, corpNode *corporationAPI.CorporationTreeNode, corpID int64, maxDepth, currentDepth int32) error {
	if maxDepth > 0 && currentDepth > maxDepth {
		return nil
	}

	// Get departments for this corporation
	deptReq := &service.ListDepartmentsRequest{
		CorpID: &corpID,
		Limit:  1000, // Get all departments
		Page:   1,
	}

	deptResp, err := s.DomainDepartmentSVC.ListDepartments(ctx, deptReq)
	if err != nil {
		return err
	}

	// Create department nodes and add to corporation
	for _, dept := range deptResp.Departments {
		if dept.ParentDeptID == nil {
			// This is a root department under the corporation
			deptNode := s.buildDepartmentTreeNode(dept, corpID, corpNode.Name)

			// Add sub-departments recursively
			s.addSubDepartments(deptNode, dept.ID, deptResp.Departments, maxDepth, currentDepth+1)

			corpNode.Children = append(corpNode.Children, deptNode)
			corpNode.HasChildren = true
		}
	}

	return nil
}

// buildDepartmentTreeNode creates a CorporationTreeNode from entity.Department
func (s *CorporationApplicationService) buildDepartmentTreeNode(dept *entity.Department, corpID int64, corpName string) *corporationAPI.CorporationTreeNode {
	// Calculate correct tree level: root departments under corporation should be level 2
	// (level 1 is corporation itself)
	treeLevel := int32(2) // Default for root departments under corporation
	if dept.ParentDeptID != nil {
		// For sub-departments, calculate based on business path
		if dept.FullPath != "" {
			// Count slashes in FullPath to determine actual level
			slashCount := int32(0)
			for _, char := range dept.FullPath {
				if char == '/' {
					slashCount++
				}
			}
			treeLevel = slashCount + 1
		}
	}

	deptNode := &corporationAPI.CorporationTreeNode{
		ID:               dept.ID,
		ParentID:         &corpID,           // 树状结构关系 - 显示在企业下
		BusinessParentID: dept.ParentDeptID, // 业务层级关系 - 上级部门
		Name:             dept.Name,
		CorpType:         common.CorporationType_COMPANY, // 部门节点使用默认类型
		Sort:             dept.Sort,
		NodeType:         "dept",
		Children:         make([]*corporationAPI.CorporationTreeNode, 0),
		HasChildren:      false,
		IsExpanded:       false,
		EmployeeCount:    0,
		CorpID:           &corpID,    // 部门所属的组织ID
		DeptID:           &dept.ID,   // 部门的实际ID
		Level:            &treeLevel, // 使用计算的树层级
	}

	// 设置路径信息
	if dept.Name != "" && corpName != "" {
		businessPath := corpName + "/" + dept.Name
		treePath := corpName + "/" + dept.Name

		// 如果有完整路径，使用dept.FullPath
		if dept.FullPath != "" {
			businessPath = dept.FullPath
		}

		deptNode.BusinessPath = &businessPath
		deptNode.TreePath = &treePath
	}

	return deptNode
}

func (s *CorporationApplicationService) addSubDepartments(parentNode *corporationAPI.CorporationTreeNode, parentID int64, allDepts []*entity.Department, maxDepth, currentDepth int32) {
	if maxDepth > 0 && currentDepth > maxDepth {
		return
	}

	for _, dept := range allDepts {
		if dept.ParentDeptID != nil && *dept.ParentDeptID == parentID {
			// Calculate correct tree level based on parent level
			treeLevel := int32(2) // Default fallback
			if parentNode.Level != nil {
				treeLevel = *parentNode.Level + 1 // Child level = parent level + 1
			}

			deptNode := &corporationAPI.CorporationTreeNode{
				ID:               dept.ID,
				ParentID:         &parentID,         // 树状结构关系 - 显示在父部门下
				BusinessParentID: dept.ParentDeptID, // 业务层级关系 - 上级部门
				Name:             dept.Name,
				CorpType:         parentNode.CorpType,
				Sort:             dept.Sort,
				NodeType:         "dept",
				Children:         make([]*corporationAPI.CorporationTreeNode, 0),
				HasChildren:      false,
				IsExpanded:       false,
				EmployeeCount:    0,
				CorpID:           parentNode.CorpID, // 继承父节点的企业ID
				DeptID:           &dept.ID,          // 部门的实际ID
				Level:            &treeLevel,        // 使用计算的树层级
			}

			// 设置路径信息
			if dept.Name != "" {
				// 构建路径：如果父节点有路径，则在其基础上添加当前部门
				if parentNode.BusinessPath != nil {
					businessPath := *parentNode.BusinessPath + "/" + dept.Name
					deptNode.BusinessPath = &businessPath
				}
				if parentNode.TreePath != nil {
					treePath := *parentNode.TreePath + "/" + dept.Name
					deptNode.TreePath = &treePath
				}

				// 如果有完整路径，使用dept.FullPath作为业务路径
				if dept.FullPath != "" {
					businessPath := dept.FullPath
					deptNode.BusinessPath = &businessPath
				}
			}

			// Add sub-departments recursively
			s.addSubDepartments(deptNode, dept.ID, allDepts, maxDepth, currentDepth+1)

			parentNode.Children = append(parentNode.Children, deptNode)
			parentNode.HasChildren = true
		}
	}
}

func (s *CorporationApplicationService) calculateEmployeeCount(ctx context.Context, node *corporationAPI.CorporationTreeNode) int32 {
	count := int32(0)

	if node.NodeType == "dept" && node.DeptID != nil {
		// Get employee count for this department
		empReq := &service.ListEmployeesRequest{
			DeptID: node.DeptID,
			Limit:  1,
			Page:   1,
		}

		empResp, err := s.DomainEmployeeSVC.ListEmployees(ctx, empReq)
		if err == nil {
			count = int32(empResp.Total)
		}
	}

	// Add counts from children
	for _, child := range node.Children {
		count += s.calculateEmployeeCount(ctx, child)
	}

	node.EmployeeCount = count
	return count
}

// sortTreeNodeChildren recursively sorts children of a tree node
// Departments (dept) are sorted before corporations (corp)
func (s *CorporationApplicationService) sortTreeNodeChildren(node *corporationAPI.CorporationTreeNode) {
	if len(node.Children) == 0 {
		return
	}

	// Sort children: departments first, then corporations
	// Within same type, sort by sort field, then by name
	sort.Slice(node.Children, func(i, j int) bool {
		nodeI := node.Children[i]
		nodeJ := node.Children[j]

		// Primary sort: node type (dept < corp)
		if nodeI.NodeType != nodeJ.NodeType {
			if nodeI.NodeType == "dept" && nodeJ.NodeType == "corp" {
				return true // dept comes before corp
			}
			if nodeI.NodeType == "corp" && nodeJ.NodeType == "dept" {
				return false // corp comes after dept
			}
		}

		// Secondary sort: by sort field
		if nodeI.Sort != nodeJ.Sort {
			return nodeI.Sort < nodeJ.Sort
		}

		// Tertiary sort: by name
		return nodeI.Name < nodeJ.Name
	})

	// Recursively sort children of each child node
	for _, child := range node.Children {
		s.sortTreeNodeChildren(child)
	}
}
