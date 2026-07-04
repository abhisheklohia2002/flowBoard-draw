package models

import "time"

type DiagramCollaborator struct {
	ID uint `json:"id" gorm:"primaryKey"`

	DiagramID uint `json:"diagram_id" gorm:"not null;index;uniqueIndex:idx_diagram_user"`
	UserID    uint `json:"user_id" gorm:"not null;index;uniqueIndex:idx_diagram_user"`

	Role string `json:"role" gorm:"not null;default:editor"`

	InvitedByID uint `json:"invited_by_id" gorm:"not null"`

	Diagram   Diagram `json:"diagram,omitempty" gorm:"foreignKey:DiagramID"`
	User      User    `json:"user,omitempty" gorm:"foreignKey:UserID"`
	InvitedBy User    `json:"invited_by,omitempty" gorm:"foreignKey:InvitedByID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
