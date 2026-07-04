package realtime

import "encoding/json"

type EventType string

const (
	EventUserJoined  EventType = "user_joined"
	EventUserLeft    EventType = "user_left"
	EventCursorMoved EventType = "cursor_moved"

	EventNodeAdded   EventType = "node_added"
	EventNodeUpdated EventType = "node_updated"
	EventNodeDeleted EventType = "node_deleted"

	EventEdgeAdded   EventType = "edge_added"
	EventEdgeDeleted EventType = "edge_deleted"

	EventCanvasSaved EventType = "canvas_saved"
)

type WSMessage struct {
	Type      EventType       `json:"type"`
	DiagramID uint            `json:"diagram_id"`
	UserID    uint            `json:"user_id"`
	UserName  string          `json:"user_name,omitempty"`
	Payload   json.RawMessage `json:"payload,omitempty"`
}

type ClientInfo struct {
	UserID   uint   `json:"user_id"`
	UserName string `json:"user_name"`
}
