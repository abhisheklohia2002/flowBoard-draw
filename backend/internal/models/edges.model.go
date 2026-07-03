package models

import (
	"time"

	"gorm.io/datatypes"
)

type Edge struct {
	ID        uint `json:"id" gorm:"primaryKey"`
	DiagramID uint `json:"diagram_id" gorm:"not null;index;uniqueIndex:idx_diagram_edge"`

	ClientEdgeID string `json:"client_edge_id" gorm:"not null;uniqueIndex:idx_diagram_edge"`

	SourceNodeID string `json:"source_node_id" gorm:"not null"`
	TargetNodeID string `json:"target_node_id" gorm:"not null"`

	SourceHandle string `json:"source_handle"`
	TargetHandle string `json:"target_handle"`

	Label    string         `json:"label"`
	EdgeType string         `json:"edge_type" gorm:"not null;default:smoothstep"`
	Style    datatypes.JSON `json:"style,omitempty" gorm:"type:jsonb"`
	Data     datatypes.JSON `json:"data,omitempty" gorm:"type:jsonb"`

	Diagram Diagram `json:"diagram,omitempty" gorm:"foreignKey:DiagramID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
