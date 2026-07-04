package dto

type SearchUserResponse struct {
	ID       uint   `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type AddCollaboratorRequest struct {
	UserID uint   `json:"user_id" binding:"required"`
	Role   string `json:"role" binding:"required,oneof=editor viewer"`
}

type UpdateCollaboratorRoleRequest struct {
	Role string `json:"role" binding:"required,oneof=editor viewer"`
}

type CollaboratorUserResponse struct {
	ID       uint   `json:"id"`
	FullName string `json:"full_name"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type DiagramCollaboratorResponse struct {
	ID        uint                     `json:"id"`
	DiagramID uint                     `json:"diagram_id"`
	UserID    uint                     `json:"user_id"`
	Role      string                   `json:"role"`
	User      CollaboratorUserResponse `json:"user"`
}
