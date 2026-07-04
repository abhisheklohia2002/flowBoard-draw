package models

import "time"

type Notification struct {
	ID uint `json:"id" gorm:"primaryKey"`

	UserID uint `json:"user_id" gorm:"not null;index"`
	User   User `json:"user,omitempty" gorm:"foreignKey:UserID"`

	ActorID uint `json:"actor_id" gorm:"not null;index"`
	Actor   User `json:"actor,omitempty" gorm:"foreignKey:ActorID"`

	DiagramID uint    `json:"diagram_id" gorm:"index"`
	Diagram   Diagram `json:"diagram,omitempty" gorm:"foreignKey:DiagramID"`

	Type string `json:"type" gorm:"not null"` // collaboration_invite, collaborator_added, diagram_updated

	Title   string `json:"title" gorm:"not null"`
	Message string `json:"message" gorm:"not null"`

	ReadAt *time.Time `json:"read_at"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
