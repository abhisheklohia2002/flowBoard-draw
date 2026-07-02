package models

import "time"

type Project struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	UserID      uint   `json:"user_id" gorm:"not null;index"`
	Name        string `json:"name" gorm:"not null"`
	Description string `json:"description"`

	User     User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Diagrams []Diagram `json:"diagrams,omitempty" gorm:"foreignKey:ProjectID"`

	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}
