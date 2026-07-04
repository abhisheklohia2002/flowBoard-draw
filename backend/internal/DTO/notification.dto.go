package dto

type NotificationResponse struct {
	ID uint `json:"id"`

	Type string `json:"type"`

	Title   string `json:"title"`
	Message string `json:"message"`

	DiagramID uint `json:"diagram_id"`

	Actor NotificationActorResponse `json:"actor"`

	IsRead bool   `json:"is_read"`
	ReadAt string `json:"read_at,omitempty"`

	CreatedAt string `json:"created_at"`
}

type NotificationActorResponse struct {
	ID       uint   `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
}
