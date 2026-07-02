package models

import (
	"time"

	"gorm.io/datatypes"
)

type DiagramVersion struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	DiagramID     uint           `json:"diagram_id" gorm:"not null;index"`
	CreatedByID   uint           `json:"created_by_id" gorm:"not null;index"`
	VersionNumber uint           `json:"version_number" gorm:"not null"`
	Snapshot      datatypes.JSON `json:"snapshot" gorm:"type:jsonb;not null"`
	ChangeNote    string         `json:"change_note"`

	Diagram   Diagram `json:"diagram,omitempty" gorm:"foreignKey:DiagramID"`
	CreatedBy User    `json:"created_by,omitempty" gorm:"foreignKey:CreatedByID"`

	CreatedAt time.Time `json:"created_at"`
}