package dto

import "time"

type NotificationResponse struct {
	ID        uint      `json:"id"`
	UserID    uint      `json:"user_id"`
	Type      string    `json:"type"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	DiagramID *uint     `json:"diagram_id,omitempty"`
	ProjectID *uint     `json:"project_id,omitempty"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}
