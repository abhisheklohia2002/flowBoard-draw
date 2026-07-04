package models

import "time"

type Notification struct {
	ID uint `json:"id" gorm:"primaryKey"`

	UserID uint `json:"user_id" gorm:"not null;index"`
	User   User `json:"user,omitempty" gorm:"foreignKey:UserID"`

	Type string `json:"type" gorm:"not null"`
	// collaboration_invite, collaboration_removed, role_updated

	Title   string `json:"title" gorm:"not null"`
	Message string `json:"message" gorm:"not null"`

	DiagramID *uint `json:"diagram_id,omitempty" gorm:"index"`
	ProjectID *uint `json:"project_id,omitempty" gorm:"index"`

	IsRead bool `json:"is_read" gorm:"not null;default:false"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
