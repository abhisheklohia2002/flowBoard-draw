package dto

type DiagramVersionResponse struct {
	ID            uint   `json:"id"`
	DiagramID     uint   `json:"diagram_id"`
	VersionNumber uint   `json:"version_number"`
	ChangeNote    string `json:"change_note"`
	CreatedAt     string `json:"created_at"`
}
