package models

import (
	"time"

	"gorm.io/datatypes"
)

type Diagram struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	ProjectID uint   `json:"project_id" gorm:"not null;index"`
	Name      string `json:"name" gorm:"not null"`

	CanvasBackground string  `json:"canvas_background" gorm:"default:#ffffff"`
	ZoomLevel        float64 `json:"zoom_level" gorm:"not null;default:1"`
	PanX             float64 `json:"pan_x" gorm:"not null;default:0"`
	PanY             float64 `json:"pan_y" gorm:"not null;default:0"`

	Data datatypes.JSON `json:"data,omitempty" gorm:"type:jsonb"`

	Project  Project          `json:"project,omitempty" gorm:"foreignKey:ProjectID"`
	Nodes    []Node           `json:"nodes,omitempty" gorm:"foreignKey:DiagramID"`
	Edges    []Edge           `json:"edges,omitempty" gorm:"foreignKey:DiagramID"`
	Versions []DiagramVersion `json:"versions,omitempty" gorm:"foreignKey:DiagramID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}