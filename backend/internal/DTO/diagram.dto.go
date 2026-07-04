package dto

import "gorm.io/datatypes"

type CreateDiagramRequest struct {
	Name string `json:"name" binding:"required,min=2,max=100"`
}

type UpdateDiagramRequest struct {
	Name             string         `json:"name"`
	Data             datatypes.JSON `json:"data"`
	CanvasBackground string         `json:"canvas_background"`
	ZoomLevel        float64        `json:"zoom_level"`
	PanX             float64        `json:"pan_x"`
	PanY             float64        `json:"pan_y"`
}

type DiagramResponse struct {
	ID               uint           `json:"id"`
	ProjectID        uint           `json:"project_id"`
	Name             string         `json:"name"`
	Data             datatypes.JSON `json:"data,omitempty"`
	CanvasBackground string         `json:"canvas_background"`
	ZoomLevel        float64        `json:"zoom_level"`
	PanX             float64        `json:"pan_x"`
	PanY             float64        `json:"pan_y"`
}

type SharedDiagramResponse struct {
	ID          uint   `json:"id"`
	ProjectID   uint   `json:"project_id"`
	ProjectName string `json:"project_name"`
	Name        string `json:"name"`

	OwnerID    uint   `json:"owner_id"`
	OwnerName  string `json:"owner_name"`
	OwnerEmail string `json:"owner_email"`

	CollaboratorRole string `json:"collaborator_role"`

	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}
