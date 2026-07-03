package models

import (
	"time"

	"gorm.io/datatypes"
)

type Node struct {
	ID        uint `json:"id" gorm:"primaryKey"`
	DiagramID uint `json:"diagram_id" gorm:"not null;index;uniqueIndex:idx_diagram_node"`

	ClientNodeID string `json:"client_node_id" gorm:"not null;uniqueIndex:idx_diagram_node"`

	Type  string `json:"type" gorm:"not null"`
	Label string `json:"label"`

	PositionX float64 `json:"position_x" gorm:"not null;default:0"`
	PositionY float64 `json:"position_y" gorm:"not null;default:0"`
	Width     float64 `json:"width" gorm:"not null;default:120"`
	Height    float64 `json:"height" gorm:"not null;default:60"`

	Style datatypes.JSON `json:"style,omitempty" gorm:"type:jsonb"`
	Data  datatypes.JSON `json:"data,omitempty" gorm:"type:jsonb"`

	Diagram Diagram `json:"diagram,omitempty" gorm:"foreignKey:DiagramID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
