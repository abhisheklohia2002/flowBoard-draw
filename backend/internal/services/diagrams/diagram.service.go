package diagrams

import (
	"encoding/json"
	"errors"
	dto "flowBoard/draw/internal/DTO"
	"flowBoard/draw/internal/models"
	repository "flowBoard/draw/internal/repository/diagram"
	"fmt"
	"strings"
	"time"

	"gorm.io/datatypes"
)

type DiagramService interface {
	CreateDiagram(projectID uint, req dto.CreateDiagramRequest) (*dto.DiagramResponse, error)
	GetProjectDiagrams(projectID uint) ([]dto.DiagramResponse, error)
	GetDiagram(id uint) (*dto.DiagramResponse, error)
	UpdateDiagram(id uint, req dto.UpdateDiagramRequest) (*dto.DiagramResponse, error)
	DeleteDiagram(id uint) error
	SaveCanvas(diagramID uint, userID uint, req dto.SaveCanvasRequest) (*dto.SaveCanvasResponse, error)
	GetCanvas(diagramID uint) (*dto.CanvasResponse, error)
	GetVersions(diagramID uint) ([]dto.DiagramVersionResponse, error)
	RestoreVersion(diagramID uint, versionID uint, userID uint) (*dto.SaveCanvasResponse, error)
}

type DiagramServiceImpl struct {
	repo repository.DiagramRepository
}

func NewDiagramService(repo repository.DiagramRepository) DiagramService {
	return &DiagramServiceImpl{repo: repo}
}

func (s *DiagramServiceImpl) CreateDiagram(projectID uint, req dto.CreateDiagramRequest) (*dto.DiagramResponse, error) {
	emptyCanvas := map[string]any{
		"nodes": []any{},
		"edges": []any{},
		"viewport": map[string]any{
			"x":    0,
			"y":    0,
			"zoom": 1,
		},
	}

	dataBytes, err := json.Marshal(emptyCanvas)
	if err != nil {
		return nil, err
	}

	diagram := models.Diagram{
		ProjectID:        projectID,
		Name:             strings.TrimSpace(req.Name),
		Data:             datatypes.JSON(dataBytes),
		CanvasBackground: "#ffffff",
		ZoomLevel:        1,
		PanX:             0,
		PanY:             0,
	}

	savedDiagram, err := s.repo.Create(&diagram)
	if err != nil {
		return nil, err
	}

	return mapDiagramToResponse(savedDiagram), nil
}

func (s *DiagramServiceImpl) GetProjectDiagrams(projectID uint) ([]dto.DiagramResponse, error) {
	diagrams, err := s.repo.FindByProjectID(projectID)
	if err != nil {
		return nil, err
	}

	response := make([]dto.DiagramResponse, 0, len(diagrams))

	for _, diagram := range diagrams {
		response = append(response, *mapDiagramToResponse(&diagram))
	}

	return response, nil
}

func (s *DiagramServiceImpl) GetDiagram(id uint) (*dto.DiagramResponse, error) {
	diagram, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	return mapDiagramToResponse(diagram), nil
}

func (s *DiagramServiceImpl) UpdateDiagram(id uint, req dto.UpdateDiagramRequest) (*dto.DiagramResponse, error) {
	diagram, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(req.Name) != "" {
		diagram.Name = strings.TrimSpace(req.Name)
	}

	if len(req.Data) > 0 {
		diagram.Data = req.Data
	}

	if req.CanvasBackground != "" {
		diagram.CanvasBackground = req.CanvasBackground
	}

	if req.ZoomLevel > 0 {
		diagram.ZoomLevel = req.ZoomLevel
	}

	diagram.PanX = req.PanX
	diagram.PanY = req.PanY

	updatedDiagram, err := s.repo.Update(diagram)
	if err != nil {
		return nil, err
	}

	return mapDiagramToResponse(updatedDiagram), nil
}

func (s *DiagramServiceImpl) DeleteDiagram(id uint) error {
	if id == 0 {
		return errors.New("diagram id is required")
	}

	return s.repo.Delete(id)
}

func mapDiagramToResponse(diagram *models.Diagram) *dto.DiagramResponse {
	return &dto.DiagramResponse{
		ID:               diagram.ID,
		ProjectID:        diagram.ProjectID,
		Name:             diagram.Name,
		Data:             diagram.Data,
		CanvasBackground: diagram.CanvasBackground,
		ZoomLevel:        diagram.ZoomLevel,
		PanX:             diagram.PanX,
		PanY:             diagram.PanY,
	}
}

func (s *DiagramServiceImpl) SaveCanvas(
	diagramID uint,
	userID uint,
	req dto.SaveCanvasRequest,
) (*dto.SaveCanvasResponse, error) {
	if diagramID == 0 {
		return nil, errors.New("diagram id is required")
	}

	if userID == 0 {
		return nil, errors.New("user id is required")
	}

	nodes := make([]models.Node, 0, len(req.Nodes))

	for _, n := range req.Nodes {
		width := n.Width
		if width == 0 {
			width = 120
		}

		height := n.Height
		if height == 0 {
			height = 60
		}

		label := extractLabelFromData(n.Data)

		nodes = append(nodes, models.Node{
			DiagramID:    diagramID,
			ClientNodeID: n.ID,
			Type:         n.Type,
			Label:        label,
			PositionX:    n.Position.X,
			PositionY:    n.Position.Y,
			Width:        width,
			Height:       height,
			Data:         n.Data,
			Style:        n.Style,
		})
	}

	edges := make([]models.Edge, 0, len(req.Edges))

	for _, e := range req.Edges {
		edgeType := e.Type
		if edgeType == "" {
			edgeType = "smoothstep"
		}

		edges = append(edges, models.Edge{
			DiagramID:    diagramID,
			ClientEdgeID: e.ID,
			SourceNodeID: e.Source,
			TargetNodeID: e.Target,
			SourceHandle: e.SourceHandle,
			TargetHandle: e.TargetHandle,
			Label:        e.Label,
			EdgeType:     edgeType,
			Data:         e.Data,
			Style:        e.Style,
		})
	}

	snapshotBytes, err := json.Marshal(req)
	if err != nil {
		return nil, err
	}

	versionNumber, err := s.repo.SaveCanvas(
		diagramID,
		userID,
		nodes,
		edges,
		req.Viewport,
		datatypes.JSON(snapshotBytes),
		strings.TrimSpace(req.ChangeNote),
	)
	if err != nil {
		return nil, err
	}

	return &dto.SaveCanvasResponse{
		DiagramID:     diagramID,
		NodeCount:     len(nodes),
		EdgeCount:     len(edges),
		VersionNumber: versionNumber,
	}, nil
}

func extractLabelFromData(data datatypes.JSON) string {
	if len(data) == 0 {
		return ""
	}

	var parsed map[string]any

	if err := json.Unmarshal(data, &parsed); err != nil {
		return ""
	}

	label, ok := parsed["label"].(string)
	if !ok {
		return ""
	}

	return label
}

func (s *DiagramServiceImpl) GetCanvas(diagramID uint) (*dto.CanvasResponse, error) {
	diagram, err := s.repo.FindCanvasByID(diagramID)
	if err != nil {
		return nil, err
	}

	nodes := make([]dto.CanvasNode, 0, len(diagram.Nodes))

	for _, n := range diagram.Nodes {
		nodes = append(nodes, dto.CanvasNode{
			ID:   n.ClientNodeID,
			Type: n.Type,
			Position: dto.CanvasPosition{
				X: n.PositionX,
				Y: n.PositionY,
			},
			Width:  n.Width,
			Height: n.Height,
			Data:   n.Data,
			Style:  n.Style,
		})
	}

	edges := make([]dto.CanvasEdge, 0, len(diagram.Edges))

	for _, e := range diagram.Edges {
		edges = append(edges, dto.CanvasEdge{
			ID:           e.ClientEdgeID,
			Source:       e.SourceNodeID,
			Target:       e.TargetNodeID,
			SourceHandle: e.SourceHandle,
			TargetHandle: e.TargetHandle,
			Type:         e.EdgeType,
			Label:        e.Label,
			Data:         e.Data,
			Style:        e.Style,
		})
	}

	return &dto.CanvasResponse{
		Diagram: dto.DiagramCanvasMeta{
			ID:        diagram.ID,
			ProjectID: diagram.ProjectID,
			Name:      diagram.Name,
		},
		Nodes: nodes,
		Edges: edges,
		Viewport: dto.CanvasViewport{
			X:    diagram.PanX,
			Y:    diagram.PanY,
			Zoom: diagram.ZoomLevel,
		},
	}, nil
}

func (s *DiagramServiceImpl) GetVersions(diagramID uint) ([]dto.DiagramVersionResponse, error) {
	versions, err := s.repo.FindVersionsByDiagramID(diagramID)
	if err != nil {
		return nil, err
	}

	response := make([]dto.DiagramVersionResponse, 0, len(versions))

	for _, version := range versions {
		response = append(response, dto.DiagramVersionResponse{
			ID:            version.ID,
			DiagramID:     version.DiagramID,
			VersionNumber: version.VersionNumber,
			ChangeNote:    version.ChangeNote,
			CreatedAt:     version.CreatedAt.Format(time.RFC3339),
		})
	}

	return response, nil
}

func (s *DiagramServiceImpl) RestoreVersion(
	diagramID uint,
	versionID uint,
	userID uint,
) (*dto.SaveCanvasResponse, error) {
	version, err := s.repo.FindVersionByID(diagramID, versionID)
	if err != nil {
		return nil, err
	}

	var snapshot dto.SaveCanvasRequest

	if err := json.Unmarshal(version.Snapshot, &snapshot); err != nil {
		return nil, err
	}

	nodes := make([]models.Node, 0, len(snapshot.Nodes))

	for _, n := range snapshot.Nodes {
		width := n.Width
		if width == 0 {
			width = 120
		}

		height := n.Height
		if height == 0 {
			height = 60
		}

		nodes = append(nodes, models.Node{
			DiagramID:    diagramID,
			ClientNodeID: n.ID,
			Type:         n.Type,
			Label:        extractLabelFromData(n.Data),
			PositionX:    n.Position.X,
			PositionY:    n.Position.Y,
			Width:        width,
			Height:       height,
			Data:         n.Data,
			Style:        n.Style,
		})
	}

	edges := make([]models.Edge, 0, len(snapshot.Edges))

	for _, e := range snapshot.Edges {
		edgeType := e.Type
		if edgeType == "" {
			edgeType = "smoothstep"
		}

		edges = append(edges, models.Edge{
			DiagramID:    diagramID,
			ClientEdgeID: e.ID,
			SourceNodeID: e.Source,
			TargetNodeID: e.Target,
			SourceHandle: e.SourceHandle,
			TargetHandle: e.TargetHandle,
			Label:        e.Label,
			EdgeType:     edgeType,
			Data:         e.Data,
			Style:        e.Style,
		})
	}

	changeNote := fmt.Sprintf("Restored from version %d", version.VersionNumber)

	newVersionNumber, err := s.repo.SaveCanvas(
		diagramID,
		userID,
		nodes,
		edges,
		snapshot.Viewport,
		version.Snapshot,
		changeNote,
	)
	if err != nil {
		return nil, err
	}

	return &dto.SaveCanvasResponse{
		DiagramID:     diagramID,
		NodeCount:     len(nodes),
		EdgeCount:     len(edges),
		VersionNumber: newVersionNumber,
	}, nil
}
